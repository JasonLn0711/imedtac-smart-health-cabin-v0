#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

from tts_benchmark_lib import (
    build_dialogue_manifest,
    build_human_eval_manifest,
    build_tts_manifest,
    repo_root_from_script,
    write_jsonl,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate Smart Health Cabin TTS benchmark manifests.")
    parser.add_argument("--domain-profiles", default="phq9_zh_tw,smart_cabin_measurement,kiosk_faq")
    parser.add_argument("--output", default="experiments/manifests/tts_eval_manifest.jsonl")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    repo_root = repo_root_from_script(Path(__file__))
    output = repo_root / args.output
    profiles = [item.strip() for item in args.domain_profiles.split(",") if item.strip()]
    tts_rows = build_tts_manifest(repo_root, profiles)
    write_jsonl(output, tts_rows)
    write_jsonl(output.with_name("dialogue_manifest.jsonl"), build_dialogue_manifest())
    write_jsonl(output.with_name("human_eval_manifest.jsonl"), build_human_eval_manifest(tts_rows))
    print(f"wrote {len(tts_rows)} TTS rows to {output.relative_to(repo_root)}")
    print(f"wrote dialogue and human-eval manifests to {output.parent.relative_to(repo_root)}")


if __name__ == "__main__":
    main()
