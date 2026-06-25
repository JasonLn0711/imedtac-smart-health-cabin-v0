# Wakeword sherpa-onnx KWS Goal Prompt

Use this prompt to install and verify the Smart Health Cabin wakeword model.

```text
請在 imedtac-smart-health-cabin-v0 完成 Smart Health Cabin wakeword live setup。

目標：
- Wake word provider 必須是 sherpa-onnx。
- Wake word model 必須是 sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20。
- Wake phrase 必須是「你好小慧」。
- 不使用 Porcupine、Picovoice AccessKey、Porcupine .ppn/.pv、openWakeWord，或任何其他 wakeword model。
- Wakeword 只作為 local activation gate；不得寫入問卷答案，不得宣稱 ASR、診斷、治療、HIS、或 production audio retention。
- Tap-to-start 必須保持 fallback。

請先確認工作區：
cd /home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0
git status --short --branch

請安裝模型到本機 ignored 路徑：
mkdir -p .local/models .local/models/wakeword .local/tmp
cd .local/tmp
wget https://github.com/k2-fsa/sherpa-onnx/releases/download/kws-models/sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20.tar.bz2
tar xf sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20.tar.bz2
rm sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20.tar.bz2
rm -rf ../models/sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20
mv sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20 ../models/
cd ../..

請建立 Python runtime：
python3 -m venv .local/wakeword-venv
.local/wakeword-venv/bin/python -m pip install -r apps/model-sidecars/wakeword-service/requirements.txt

請產生「你好小慧」keyword token file：
printf '你好小慧 @你好小慧\n' > .local/models/wakeword/ni-hao-xiao-hui.raw.txt
.local/wakeword-venv/bin/sherpa-onnx-cli text2token \
  --tokens .local/models/sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20/tokens.txt \
  --tokens-type phone+ppinyin \
  --lexicon .local/models/sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20/en.phone \
  .local/models/wakeword/ni-hao-xiao-hui.raw.txt \
  .local/models/wakeword/ni-hao-xiao-hui.keywords.txt

請確認 keyword token file 內容是：
n ǐ h ǎo x iǎo h uì @你好小慧

請啟動 wakeword sidecar：
cd apps/model-sidecars/wakeword-service
WAKE_WORD_ENABLED=true \
WAKE_WORD_MODE=live \
WAKE_WORD_PROVIDER=sherpa-onnx \
WAKE_WORD_PHRASE=你好小慧 \
WAKE_WORD_SERVICE_URL=http://localhost:8013 \
SHERPA_ONNX_KWS_MODEL_DIR=.local/models/sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20 \
SHERPA_ONNX_KWS_KEYWORDS=.local/models/wakeword/ni-hao-xiao-hui.keywords.txt \
SHERPA_ONNX_KWS_NUM_THREADS=2 \
SHERPA_ONNX_KWS_PROVIDER=cpu \
WAKE_WORD_THRESHOLD=0.65 \
WAKE_WORD_COOLDOWN_MS=2000 \
WAKE_WORD_LOCAL_ONLY=true \
../../../.local/wakeword-venv/bin/python -m uvicorn app:app --host 127.0.0.1 --port 8013

請在另一個 terminal 驗證：
cd /home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0
WAKE_WORD_SERVICE_URL=http://localhost:8013 \
WAKE_WORD_LIVE_WAIT_MS=15000 \
corepack pnpm smoke:wakeword:live

請在 smoke 等待期間對麥克風清楚說：「你好小慧」。

完成條件：
- /status 回報 provider=sherpa-onnx。
- /status 回報 phrase=你好小慧。
- /status 回報 mode=live、ready=true、listening=true、last_error=null。
- smoke:wakeword:live 收到真實 wake.detected event。
- event.provider=sherpa-onnx。
- event.phrase=你好小慧。
- 若 live 無法完成，請回報 curl -fsS http://localhost:8013/status 的完整錯誤欄位，以及麥克風 device 檢查結果。
```
