# BreezyVoice TTS Benchmark

Stdlib-only benchmark utilities for the Smart Health Cabin BreezyVoice 2x2
streaming experiment.

```bash
python3 scripts/tts-benchmark/generate_manifest.py \
  --domain-profiles phq9_zh_tw,smart_cabin_measurement,kiosk_faq \
  --output experiments/manifests/tts_eval_manifest.jsonl

python3 scripts/tts-benchmark/run_tts_matrix.py \
  --manifest experiments/manifests/tts_eval_manifest.jsonl \
  --variants A_original,B_segment \
  --repeats 1 \
  --warmup 1 \
  --randomize true \
  --mode deterministic \
  --output experiments/smoke_tts_streaming

python3 scripts/tts-benchmark/analyze_tts_matrix.py \
  --run-dir experiments/smoke_tts_streaming \
  --report experiments/smoke_tts_streaming/reports/final_decision.md
```

Live A/B pilot:

```bash
TTS_SERVICE_URL=http://localhost:8012 \
BREEZYVOICE_BASE_URL=http://localhost:9003/v1 \
BREEZYVOICE_MODEL=MediaTek-Research/BreezyVoice \
python3 scripts/tts-benchmark/run_tts_matrix.py \
  --manifest experiments/manifests/tts_eval_manifest.jsonl \
  --variants A_original,B_segment,C_token,D_hybrid \
  --repeats 1 \
  --warmup 1 \
  --randomize true \
  --mode live \
  --limit 5 \
  --output experiments/live_tts_streaming_pilot
```

`A_original` and `B_segment` run in deterministic or live mode. In the previous
unpatched local BreezyVoice runtime, `C_token` and `D_hybrid` stayed
source-blocked because the upstream API returned completed WAV output only; see
`docs/evidence/2026-06-26-breezyvoice-streaming-2x2-live-experiment-log.md`.

True C/D runtime probe after applying the BreezyVoice runtime patch:

```bash
/home/jnclaw/every_on_git_jnclaw/BreezyVoice/.venv/bin/python \
  scripts/tts-benchmark/streaming_runtime_probe.py \
  --breezyvoice-root /home/jnclaw/every_on_git_jnclaw/BreezyVoice \
  --model-path MediaTek-Research/BreezyVoice \
  --token-hop-len 25 \
  --output experiments/strict_breezyvoice_streaming_runtime_probe_v2
```

The probe writes `streaming_validity_report.md` and proves whether `C_token` and
`D_hybrid` emit real speech-token and PCM chunk events before running the full
ABCD benchmark.

Strict BreezyVoice ABCD matrix pilot:

```bash
/home/jnclaw/every_on_git_jnclaw/BreezyVoice/.venv/bin/python \
  scripts/tts-benchmark/run_true_streaming_matrix.py \
  --manifest experiments/manifests/tts_eval_manifest.jsonl \
  --breezyvoice-root /home/jnclaw/every_on_git_jnclaw/BreezyVoice \
  --model-path MediaTek-Research/BreezyVoice \
  --token-hop-len 25 \
  --limit 1 \
  --repeats 1 \
  --seed 20260626 \
  --output experiments/strict_breezyvoice_abcd_matrix_pilot
```

The pilot proves same-run A/B/C/D routing. It intentionally does not create a
production `final_decision.md` unless the minimum matrix size is reached.

Minimum strict BreezyVoice ABCD matrix gate:

```bash
/home/jnclaw/every_on_git_jnclaw/BreezyVoice/.venv/bin/python \
  scripts/tts-benchmark/run_true_streaming_matrix.py \
  --manifest experiments/manifests/tts_eval_manifest.jsonl \
  --breezyvoice-root /home/jnclaw/every_on_git_jnclaw/BreezyVoice \
  --model-path MediaTek-Research/BreezyVoice \
  --token-hop-len 25 \
  --limit 12 \
  --repeats 3 \
  --seed 20260626 \
  --output experiments/strict_breezyvoice_abcd_matrix_minimum
```

This is the first run size that may create final experiment reports. Smaller
runs are routing or validity pilots only.

Completed minimum matrix evidence is preserved under
`experiments/strict_breezyvoice_abcd_matrix_minimum/` and summarized in
`docs/evidence/2026-06-26-breezyvoice-true-streaming-runtime-unblock-log.md`.
