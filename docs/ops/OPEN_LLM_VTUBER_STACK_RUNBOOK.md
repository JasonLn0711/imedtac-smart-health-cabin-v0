---
id: open-llm-vtuber-stack-runbook
title: "Open-LLM-VTuber Stack Runbook"
date: 2026-07-02
topic: smart-health-cabin
type: ops-runbook
status: active-mainline-design
---

# Open-LLM-VTuber Stack Runbook

This runbook starts the isolated Open-LLM-VTuber lab stack and the Smart Health
Cabin bridge. It does not switch kiosk to this stack. Use the design contract
before modifying UI, ASR, TTS, or Live2D behavior.

Canonical design files:

```text
docs/open-llm-vtuber/README.md
docs/open-llm-vtuber/CONTRACT.md
docs/open-llm-vtuber/SDD.md
docs/open-llm-vtuber/FRONTEND_UI_SPEC.md
docs/open-llm-vtuber/ASR_TTS_TAIWAN_SPEC.md
docs/open-llm-vtuber/LIVE2D_CHARACTER_BACKGROUND_SPEC.md
```

## Upstream Checkout

```bash
git clone --filter=blob:none https://github.com/Open-LLM-VTuber/Open-LLM-VTuber.git .local/Open-LLM-VTuber
git -C .local/Open-LLM-VTuber checkout 992309c0aa19845960228f880013d4685fde93b5
git -C .local/Open-LLM-VTuber submodule update --init --recursive --depth 1
```

Expected frontend submodule:

```text
06a659b114fff788cf0daaa86e484576db4975bf frontend
```

## Lab Config

Create `.local/Open-LLM-VTuber/conf.yaml` from
`.local/Open-LLM-VTuber/config_templates/conf.default.yaml`, then set:

```yaml
system_config:
  host: '127.0.0.1'
  port: 12393

character_config:
  character_name: 'Smart Health Cabin Lab Avatar'
  human_name: '現場測試者'
  persona_prompt: |
    你是慧誠智醫健康量測站的第二套語音互動實驗 Avatar。
    請一律使用臺灣繁體中文回覆，語氣正向、主動、可信任、邊界清楚。
    你的任務是協助健康檢測、問卷填答、檢測結果說明與現場人員覆核流程。
    請避免診斷、治療建議與誇大醫療宣稱；需要確認時，請引導現場人員協助確認。

  agent_config:
    agent_settings:
      basic_memory_agent:
        llm_provider: 'ollama_llm'
        use_mcpp: False
    llm_configs:
      ollama_llm:
        base_url: 'http://localhost:11434/v1'
        model: 'gemma4:e4b'
        keep_alive: -1
        unload_at_exit: False

  asr_config:
    asr_model: 'sherpa_onnx_asr'

  tts_config:
    tts_model: 'edge_tts'
    edge_tts:
      voice: 'zh-TW-HsiaoChenNeural'
```

## Start Upstream

```bash
cd .local/Open-LLM-VTuber
uv sync
uv run run_server.py --verbose
```

The first run downloads the Sherpa SenseVoice model into `.local/Open-LLM-VTuber/models`.
When ready, the server listens on:

```text
http://127.0.0.1:12393
ws://127.0.0.1:12393/client-ws
```

## Start Bridge

```bash
cd apps/model-sidecars/open-llm-vtuber-bridge
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
OPEN_LLM_VTUBER_WS_URL=ws://127.0.0.1:12393/client-ws \
python3 -m uvicorn server:app --host 127.0.0.1 --port 8022
```

Check:

```bash
curl -fsS http://127.0.0.1:8022/healthz
```

Minimal turn:

```bash
curl -fsS http://127.0.0.1:8022/v1/turn \
  -H 'content-type: application/json' \
  -d '{"text":"請用一句話介紹健康量測站。"}'
```

## UI / Language Rules

- Product UI and displayed Avatar text must be Taiwan Traditional Chinese.
- Simplified Chinese may be used only as an internal TTS normalization input
  when the selected TTS engine requires it.
- Do not edit `.local/Open-LLM-VTuber/frontend` as the only durable UI source.
  The product UI should live in a tracked Smart Health Cabin app and speak the
  `/client-ws` contract.
- Do not advance a TTS provider as the default if listener review identifies a
  China-accent voice.
