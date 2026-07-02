# Open-LLM-VTuber Bridge

Minimal Smart Health Cabin bridge for the isolated Open-LLM-VTuber lab stack.

Pinned upstream:

```text
repo: https://github.com/Open-LLM-VTuber/Open-LLM-VTuber
commit: 992309c0aa19845960228f880013d4685fde93b5
frontend submodule: 06a659b114fff788cf0daaa86e484576db4975bf
```

The upstream checkout lives under ignored `.local/Open-LLM-VTuber`. Keep its
Python environment separate from existing ASR, CosyVoice, and BreezyVoice
sidecars.

Run upstream first:

```bash
cd .local/Open-LLM-VTuber
uv sync
uv run run_server.py --verbose
```

Run the bridge:

```bash
cd apps/model-sidecars/open-llm-vtuber-bridge
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
OPEN_LLM_VTUBER_WS_URL=ws://127.0.0.1:12393/client-ws \
python3 -m uvicorn server:app --host 127.0.0.1 --port 8022
```

Minimal turn:

```bash
curl -fsS http://127.0.0.1:8022/v1/turn \
  -H 'content-type: application/json' \
  -d '{"text":"請用一句話介紹健康量測站。"}'
```

The bridge returns display text and audio segments from Open-LLM-VTuber. It does
not switch kiosk to this stack. UI-facing text remains Traditional Chinese; any
provider-internal preprocessing stays behind the bridge.
