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

`A_original` and `B_segment` run in deterministic or live mode. `C_token` and
`D_hybrid` stay source-blocked in the current local BreezyVoice runtime because
the upstream API returns completed WAV output only; see
`docs/evidence/2026-06-26-breezyvoice-streaming-2x2-live-experiment-log.md`.
