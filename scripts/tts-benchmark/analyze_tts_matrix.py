#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any

from tts_benchmark_lib import VARIANTS, iso_local, iso_utc, read_jsonl, repo_root_from_script, summarize


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Analyze a BreezyVoice 2x2 TTS benchmark run.")
    parser.add_argument("--run-dir", required=True)
    parser.add_argument("--report", default="")
    parser.add_argument("--evidence", default="")
    return parser.parse_args()


def metric(rows: list[dict[str, Any]], name: str) -> list[float]:
    values = []
    for row in rows:
        value = row.get("metrics", {}).get(name)
        if isinstance(value, (int, float)):
            values.append(float(value))
    return values


def quality_metric(rows: list[dict[str, Any]], name: str) -> list[float]:
    values = []
    for row in rows:
        value = row.get("quality_metrics", {}).get(name)
        if isinstance(value, (int, float)):
            values.append(float(value))
    return values


def by_variant(rows: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        grouped[row["variant"]].append(row)
    return grouped


def failure_rate(rows: list[dict[str, Any]]) -> float:
    if not rows:
        return 1.0
    return sum(1 for row in rows if row["status"] != "ok") / len(rows)


def hard_gate(variant: str, rows: list[dict[str, Any]]) -> tuple[str, str]:
    if not VARIANTS[variant]["enabled"]:
        return "source_blocked", VARIANTS[variant].get("disabled_reason", "capability flag is disabled")
    if not rows:
        return "not_evaluated", "no rows"
    failed = failure_rate(rows)
    ttfa_p95 = summarize(metric(rows, "ttfa_client_ms"))["p95"]
    rtf_p95 = summarize(metric(rows, "rtf"))["p95"]
    if failed > 0.005:
        return "fail", f"failure_rate={failed:.3f}"
    if ttfa_p95 is not None and ttfa_p95 > 1500:
        return "fail", f"P95 TTFA client {ttfa_p95}ms > 1500ms"
    if rtf_p95 is not None and rtf_p95 > 1.0:
        return "fail", f"RTF p95 {rtf_p95} > 1.0"
    return "pass", "passes deterministic/live measured gates available in this run"


def weighted_score(variant: str, rows: list[dict[str, Any]], baseline_rows: list[dict[str, Any]]) -> float | None:
    if not rows or not VARIANTS[variant]["enabled"]:
        return None
    ttfa = summarize(metric(rows, "ttfa_client_ms"))["p95"] or 0
    total = summarize(metric(rows, "total_synthesis_ms"))["p95"] or 0
    rtf = summarize(metric(rows, "rtf"))["p95"] or 0
    baseline_ttfa = summarize(metric(baseline_rows, "ttfa_client_ms"))["p95"] or ttfa or 1
    ttfa_score = max(0, min(1, baseline_ttfa / max(ttfa, 1)))
    latency_score = max(0, min(1, 1000 / max(total, 1)))
    rtf_score = max(0, min(1, 1 / max(rtf, 0.001)))
    robustness = max(0, 1 - failure_rate(rows))
    audio_quality = 1.0 if all(row["status"] == "ok" for row in rows) else 0.5
    resource_efficiency = 0.8
    maintainability = 1.0 if variant == "A_original" else 0.75
    return round(
        0.30 * ttfa_score
        + 0.20 * latency_score
        + 0.15 * rtf_score
        + 0.15 * audio_quality
        + 0.10 * robustness
        + 0.05 * resource_efficiency
        + 0.05 * maintainability,
        3,
    )


def markdown_table(headers: list[str], rows: list[list[Any]]) -> str:
    lines = ["| " + " | ".join(headers) + " |", "| " + " | ".join("---" for _ in headers) + " |"]
    for row in rows:
        lines.append("| " + " | ".join("" if item is None else str(item) for item in row) + " |")
    return "\n".join(lines)


def write_report(path: Path, title: str, body: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(f"# {title}\n\n{body.rstrip()}\n", encoding="utf-8")


def main() -> None:
    args = parse_args()
    repo_root = repo_root_from_script(Path(__file__))
    run_dir = (repo_root / args.run_dir).resolve()
    rows = read_jsonl(run_dir / "logs" / "request_summary.jsonl")
    grouped = by_variant(rows)
    reports = run_dir / "reports"
    run_meta_path = run_dir / "run_metadata.json"
    run_meta = json.loads(run_meta_path.read_text(encoding="utf-8")) if run_meta_path.exists() else {}
    mode = run_meta.get("mode", "unknown")
    variants = list(dict.fromkeys([*run_meta.get("variants", []), *VARIANTS.keys()]))

    summary_rows = []
    gate_rows = []
    score_rows = []
    quality_rows = []
    streaming_rows = []
    baseline_rows = grouped.get("A_original", [])
    for variant in variants:
        variant_rows = grouped.get(variant, [])
        ttfa = summarize(metric(variant_rows, "ttfa_client_ms"))
        total = summarize(metric(variant_rows, "total_synthesis_ms"))
        rtf = summarize(metric(variant_rows, "rtf"))
        gate, reason = hard_gate(variant, variant_rows)
        score = weighted_score(variant, variant_rows, baseline_rows)
        failure_display = "" if not VARIANTS[variant]["enabled"] or not variant_rows else f"{failure_rate(variant_rows):.3f}"
        summary_rows.append([variant, ttfa["p50"], ttfa["p95"], total["p95"], rtf["p95"], failure_display, gate])
        gate_rows.append([variant, gate, reason])
        score_rows.append([variant, score, VARIANTS[variant]["expected_role"]])
        if not VARIANTS[variant]["enabled"]:
            quality_rows.append([variant, None, None, None, None, None])
            streaming_rows.append([variant, None, None, None, None, None])
        else:
            quality_rows.append(
                [
                    variant,
                    summarize(metric(variant_rows, "duration_sec"))["p50"],
                    max(metric(variant_rows, "clipping_ratio") or [None]),
                    summarize(metric(variant_rows, "silence_ratio"))["mean"],
                    summarize(quality_metric(variant_rows, "keyword_recall"))["mean"],
                    summarize(quality_metric(variant_rows, "number_recall"))["mean"],
                ]
            )
            streaming_rows.append(
                [
                    variant,
                    summarize(metric(variant_rows, "chunk_count"))["p95"],
                    summarize(metric(variant_rows, "chunk_jitter_p95_ms"))["p95"],
                    summarize(metric(variant_rows, "max_silence_gap_between_chunks_ms"))["p95"],
                    sum(metric(variant_rows, "buffer_underrun_count")),
                    summarize(metric(variant_rows, "first_audible_500ms_ms"))["p95"],
                ]
            )

    latency_body = markdown_table(["Variant", "TTFA p50", "TTFA p95", "Total p95", "RTF p95", "Failure rate", "Gate"], summary_rows)
    quality_body = markdown_table(
        ["Variant", "Duration p50", "Clipping max", "Silence mean", "Keyword recall mean", "Number recall mean"],
        quality_rows,
    )
    streaming_body = markdown_table(
        ["Variant", "Chunk count p95", "Chunk jitter p95", "Max gap p95", "Underruns", "FirstAudible500 p95"],
        streaming_rows,
    )
    write_report(reports / "latency_report.md", "Latency Report", latency_body)
    write_report(
        reports / "quality_report.md",
        "Quality Report",
        quality_body
        + "\n\nDeterministic smoke mode validates file shape, routing, and audio container metrics only. Live MOS, CER/WER, and pronunciation checks require a live BreezyVoice run plus listener or ASR scoring.",
    )
    write_report(
        reports / "dialogue_fluency_report.md",
        "Dialogue Fluency Report",
        streaming_body
        + "\n\nControlled dialogue manifests are generated. This smoke run measures TTS-only synthesis; browser playback and dialogue scheduling remain the next validation layer.",
    )
    write_report(
        reports / "failure_analysis.md",
        "Failure Analysis",
        markdown_table(["Variant", "Gate", "Reason"], gate_rows),
    )
    write_report(
        reports / "human_eval_report.md",
        "Human Evaluation Report",
        "Human listener packets are represented in `manifest/human_eval_manifest.jsonl`. No listener ratings were collected in this automated smoke run.",
    )

    passing_scores = [(row[0], row[1]) for row in score_rows if row[1] is not None and any(g[0] == row[0] and g[1] == "pass" for g in gate_rows)]
    if mode == "deterministic":
        default_text = "No production default change from deterministic smoke."
    elif passing_scores:
        best_variant = max(passing_scores, key=lambda row: row[1])
        default_text = f"{best_variant[0]} is the recommended live default from this run."
    else:
        default_text = "No live variant qualifies as a new production default in this run. Keep A_original as the operational completed-WAV fallback; B_segment is the latency-improvement candidate for the next optimization pass."
    if mode == "deterministic" and grouped.get("B_segment"):
        default_text += " B_segment is the MVP live A/B candidate."
    blocker_rows = [
        [key, value.get("disabled_reason", ""), value.get("next_patch", "")]
        for key, value in VARIANTS.items()
        if not value["enabled"]
    ]
    blocker_body = markdown_table(["Variant", "Source-level blocker", "Next patch"], blocker_rows)
    final_body = "\n\n".join(
        [
            "## Executive Summary\n\n" + default_text,
            "## Experiment Window\n\n"
            + f"Local started_at: `{run_meta.get('local_started_at')}`\n\nUTC started_at: `{run_meta.get('utc_started_at')}`\n\nAnalyzed at: `{iso_local()}` / `{iso_utc()}`",
            "## Environment And Hardware\n\nSee `manifest/environment.yaml`.",
            "## Variant Matrix\n\n" + latency_body,
            "## Latency Distribution\n\n" + latency_body,
            "## Audio Quality\n\nAutomated container metrics were computed. Live quality scoring remains gated until live audio is generated.",
            "## Automated Quality Metrics\n\n" + quality_body,
            "## Taiwan zh-TW Pronunciation And Code-Switching\n\nManifest rows include PHQ-9, Smart Cabin measurement, kiosk FAQ, and Taiwan zh-TW stress samples.",
            "## Dialogue Fluency\n\nDialogue manifests are present; browser playback timing was not part of this TTS-only smoke.",
            "## Streaming Metrics\n\n" + streaming_body,
            "## Stability And Resource Use\n\nNo OOM or timeout was observed in rows marked `ok`; GPU utilization, process snapshots, and listening-port snapshots are captured in environment metadata when available.",
            "## Factorial Effects\n\nC_token and D_hybrid stay source-blocked until BreezyVoice exposes chunk-level token/audio streaming.",
            "## Source-Level Blockers\n\n" + blocker_body,
            "## Hard-Gate Decision\n\n" + markdown_table(["Variant", "Decision", "Reason"], gate_rows),
            "## Weighted Score\n\n" + markdown_table(["Variant", "Score", "Expected role"], score_rows),
            "## Recommended Default Mode\n\n" + default_text,
            "## Recommended Fallback Mode\n\nA_original remains the fallback because it matches the existing completed-WAV BreezyVoice path.",
            "## Implementation Tasks For Next Sprint\n\nOptimize B_segment TTFA first, then patch BreezyVoice upstream for a real C_token inference_stream path before rerunning C/D.",
        ]
    )
    final_path = Path(args.report) if args.report else reports / "final_decision.md"
    if not final_path.is_absolute():
        final_path = repo_root / final_path
    write_report(final_path, "Final Decision - BreezyVoice Streaming 2x2 Experiment", final_body)

    evidence_path = Path(args.evidence) if args.evidence else repo_root / "docs" / "evidence" / f"{datetime.now().date()}-breezyvoice-streaming-2x2-experiment-log.md"
    if not evidence_path.is_absolute():
        evidence_path = repo_root / evidence_path
    evidence_body = "\n\n".join(
        [
            "## Experiment Name And Purpose\n\nBreezyVoice Streaming 2x2 live pilot for Smart Health Cabin Avatar TTS latency architecture.",
            "## Date And Time\n\n" + f"Local started_at: `{run_meta.get('local_started_at')}`\n\nUTC started_at: `{run_meta.get('utc_started_at')}`\n\nLocal analyzed_at: `{iso_local()}`\n\nUTC analyzed_at: `{iso_utc()}`",
            "## Repo And Runtime\n\n" + f"Run directory: `{run_dir.relative_to(repo_root)}`\n\nCommand: `{run_meta.get('command')}`\n\nMode: `{mode}`",
            "## Provider Configuration And Services\n\nSee `manifest/environment.yaml` and `manifest/model_manifest.yaml` for hardware, GPU, service URL, process, and port snapshots.",
            "## Sample And Repeat Counts\n\n"
            + f"Main rows: `{len(rows)}`\n\nRequested variants: `{', '.join(run_meta.get('variants', []))}`\n\nRepeats: `{run_meta.get('repeats')}`\n\nWarmup: `{run_meta.get('warmup')}`",
            "## Variant Registry\n\n" + markdown_table(["Variant", "Segment", "Token", "Enabled", "Role"], [[key, value["segment_streaming"], value["token_streaming"], value["enabled"], value["expected_role"]] for key, value in VARIANTS.items()]),
            "## Result Summary\n\n" + latency_body,
            "## Hard Gates\n\n" + markdown_table(["Variant", "Decision", "Reason"], gate_rows),
            "## Source-Level Blockers\n\n" + blocker_body,
            "## Weighted Score\n\n" + markdown_table(["Variant", "Score", "Expected role"], score_rows),
            "## Recommended Default And Fallback\n\n" + default_text + "\n\nA_original remains fallback.",
            "## Scope Controls\n\nThis run uses synthetic/repo-owned text only. Raw patient audio and private data are outside the benchmark path. The production TTS sidecar endpoint remains unchanged.",
            "## Next Validation Action\n\nOptimize B_segment TTFA and implement the upstream C_token inference_stream patch path before rerunning C/D.",
        ]
    )
    write_report(evidence_path, "BreezyVoice Streaming 2x2 Experiment Log", evidence_body)
    print(f"wrote reports to {reports.relative_to(repo_root)}")
    print(f"wrote final decision to {final_path.relative_to(repo_root)}")
    print(f"wrote evidence to {evidence_path.relative_to(repo_root)}")


if __name__ == "__main__":
    main()
