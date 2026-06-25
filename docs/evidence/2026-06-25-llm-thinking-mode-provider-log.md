---
id: smart-health-cabin-llm-thinking-mode-provider-log-2026-06-25
title: "LLM Thinking-Mode Provider Experiment Log"
date: 2026-06-25
topic: smart-health-cabin
type: evidence-log
status: accepted
---

# LLM Thinking-Mode Provider Experiment Log

This log records the live local checks used to explain why Gemma 4 E4B returned
empty visible guidance content through OpenAI-compatible Ollama and vLLM, and
why native Ollama with `think:false` is the current preferred LLM path.

## Runtime State

Working directory:

```text
/home/jnclaw/every_on_git_jnclaw/phd-life-system/imedtac-smart-health-cabin-v0
```

Timestamp:

```text
2026-06-25T18:05:55+08:00
```

Measurement environment:

| Layer | Value |
| --- | --- |
| OS | Ubuntu 24.04.4 LTS (`noble`) |
| Kernel | Linux `6.17.0-35-generic` x86_64 |
| CPU | Intel Core i9-14900HX, 32 logical CPUs, 24 cores / 32 threads |
| RAM | 62 GiB total; 42 GiB available at measurement time |
| GPU | NVIDIA GeForce RTX 4090 Laptop GPU |
| GPU memory | 16,376 MiB total |
| NVIDIA driver | 580.159.03 |
| CUDA runtime reported by `nvidia-smi` | 13.0 |
| GPU process state during LLM measurement | Ollama `llama-server` using about 4,522 MiB VRAM; ASR sidecar using about 2,234 MiB VRAM; Xorg using about 4 MiB VRAM |
| Node.js | v22.23.1 |
| pnpm / package manager | pnpm 9.15.0 through Corepack |
| npm | 10.9.8 |
| Python | 3.12.3 |
| Ollama | 0.30.7 |
| Ollama model | `gemma4:e4b` |
| Ollama model digest | `c6eb396dbd5992bbe3f5cdb947e8bbc0ee413d7c17e2beaae69f5d569cf982eb` |
| Ollama model format / quantization | GGUF, `Q4_K_M` |
| Ollama model parameter size | 8.0B |
| Ollama context length | 4096 |
| Ollama model VRAM size | 3,281,644,419 bytes |
| ASR sidecar health | `service=asr`, `engine=faster-whisper`, `sourceModel=MediaTek-Research/Breeze-ASR-26`, model path `../../models/breeze-asr-26-ct2-int8`, loaded `true` |
| ASR Python packages | `torch==2.11.0+cu128`, `ctranslate2==4.8.0`, `faster-whisper==1.2.1`, `transformers==5.10.2` |
| vLLM comparison environment | `vllm==0.22.1`, `torch==2.11.0`, `transformers==5.11.0` |
| Docker | Docker 29.1.3, Docker Compose v2.30.3 |
| Repo package stack | TypeScript 5.7.x, Vite 6.0.x, Vitest 2.1.x, Playwright 1.49.1 |

Environment command evidence:

```text
nvidia-smi -> Driver Version: 580.159.03, CUDA Version: 13.0
nvidia-smi -> NVIDIA GeForce RTX 4090 Laptop GPU, 6784MiB / 16376MiB used during loaded Ollama/ASR state
lsb_release -a -> Ubuntu 24.04.4 LTS
lscpu -> Intel(R) Core(TM) i9-14900HX, CPU(s): 32
free -h -> Mem total 62Gi
ollama --version -> 0.30.7
curl /api/version -> {"version":"0.30.7"}
node --version -> v22.23.1
corepack pnpm --version -> 9.15.0
python3 --version -> Python 3.12.3
```

Ollama model list:

```json
{"object":"list","data":[{"id":"gemma4:e4b","object":"model","created":1782373361,"owned_by":"library"},{"id":"gemma4:e2b","object":"model","created":1781045301,"owned_by":"library"}]}
```

Ollama loaded-model status after the tests:

```json
{"models":[{"name":"gemma4:e4b","model":"gemma4:e4b","size":3281644419,"digest":"c6eb396dbd5992bbe3f5cdb947e8bbc0ee413d7c17e2beaae69f5d569cf982eb","details":{"parent_model":"","format":"gguf","family":"gemma4","families":["gemma4"],"parameter_size":"8.0B","quantization_level":"Q4_K_M"},"expires_at":"2026-06-25T18:08:30.229704189+08:00","size_vram":3281644419,"context_length":4096}]}
```

GPU status after loading Ollama Gemma 4 E4B:

```text
NVIDIA GeForce RTX 4090 Laptop GPU, 6786 MiB, 16376 MiB, 0 %
```

## Backend Prompt Shape

The API server sent one system message and one user message to the LLM guidance
provider.

System message:

```text
你是 Smart Health Cabin 的問卷語音導引。只用繁體中文，回答一句，協助使用者理解題目與選項。不得診斷、不得改變問卷分數、不得替使用者作答。
```

PHQ-9 guidance user message:

```text
請依照過去兩週的狀況回答：「做事時提不起勁或沒有樂趣」。選項是：完全沒有、幾天、一半以上的天數、幾乎每天。
```

Original OpenAI-compatible request cap:

```json
{"stream":false,"temperature":0.2,"max_tokens":80}
```

The `80` output-token cap came from
`apps/api-server/src/services/questionnaireService.ts`, where guidance was
designed as a one-sentence response.

## Prior vLLM And Ollama OpenAI-Compatible Comparison

Same prompt, same short guidance task:

| Provider path | Runs | Status | Latency | Visible content |
| --- | ---: | --- | --- | --- |
| vLLM `/v1/chat/completions` | 3 | `200` | `1725ms`, `1557ms`, `1589ms` | empty string |
| Ollama `/v1/chat/completions` | 3 | `200` | `1194ms`, `1177ms`, `1184ms` | empty string |

Short control prompt:

```text
請只回答 OK
```

Result:

```text
Ollama OpenAI-compatible, native /api/generate, and native /api/chat returned OK in about 314-354ms.
```

Interpretation:

```text
The service was reachable, the model could emit visible text, and the empty PHQ-9 guidance result was prompt / generation-mode specific.
```

## OpenAI-Compatible Ollama Reproduction

Test cases used `http://localhost:11434/v1/chat/completions`, model
`gemma4:e4b`, `temperature=0.2`, and the same PHQ-9 guidance content unless
stated otherwise.

```text
## exact 200 3958ms
content: ""
finish_reason: "length"
usage: {"prompt_tokens":96,"completion_tokens":80,"total_tokens":176}

## simple-system 200 1203ms
content: ""
finish_reason: "length"
usage: {"prompt_tokens":60,"completion_tokens":80,"total_tokens":140}

## user-only 200 1186ms
content: ""
finish_reason: "length"
usage: {"prompt_tokens":52,"completion_tokens":80,"total_tokens":132}

## explicit-output 200 1202ms
content: ""
finish_reason: "length"
usage: {"prompt_tokens":68,"completion_tokens":80,"total_tokens":148}

## short-ok-system 200 321ms
content: "OK"
finish_reason: "stop"
usage: {"prompt_tokens":22,"completion_tokens":2,"total_tokens":24}
```

Finding:

```text
The PHQ-9 guidance variants consumed all 80 completion tokens and stopped by length before emitting visible assistant content. A short OK prompt produced normal visible content.
```

## Native Ollama Reproduction

Native endpoints exposed the missing clue: Gemma 4 E4B was producing
thinking-mode output before final answer content.

```text
## api-chat-exact 200 1225ms
message.content: ""
message.thinking: non-empty hidden reasoning text
done_reason: "length"
prompt_eval_count: 96
eval_count: 80

## api-generate-exact 200 1236ms
response: ""
done_reason: "length"
prompt_eval_count: 97
eval_count: 80

## api-generate-raw 200 350ms
response: ""
done_reason: "stop"
prompt_eval_count: 45
eval_count: 1

## api-chat-ok 200 307ms
message.content: "OK"
done_reason: "stop"
prompt_eval_count: 20
eval_count: 2
```

The full hidden-thinking text was not preserved in this durable project log.
The required engineering fact is the field shape: `message.thinking` was
non-empty, `message.content` was empty, and `done_reason` was `length` after
exactly `80` generated tokens.

## Fix-Oriented Comparison

The same PHQ-9 guidance prompt was tested with two minimal changes: disabling
thinking on native Ollama and increasing the OpenAI-compatible output budget.

```text
## native-think-false 200 709ms
content: "請問您在過去兩週內，「做事時提不起勁或沒有樂趣」的情況，最接近哪一個描述呢？"
finish: "stop"
eval_count: 29

## native-256 200 3207ms
content: ""
thinking: non-empty hidden reasoning text
finish: "length"
eval_count: 256

## openai-think-false 200 1213ms
content: ""
finish: "length"
usage: {"prompt_tokens":96,"completion_tokens":80,"total_tokens":176}

## openai-512 200 5893ms
content: "請您回想過去兩週，根據自己實際缺乏動力或興趣的頻率，選擇最符合您狀況的選項。"
finish: "stop"
usage: {"prompt_tokens":96,"completion_tokens":479,"total_tokens":575}
```

Findings:

- Native Ollama `/api/chat` with `think:false` produced usable Traditional
  Chinese guidance in `29` generated tokens.
- Native Ollama with thinking still enabled could consume `256` generated
  tokens without visible content.
- Ollama's OpenAI-compatible shim did not honor the non-standard `think:false`
  field.
- Raising OpenAI-compatible `max_tokens` to `512` produced visible text, but it
  needed `479` completion tokens and was slower.

## Token-Budget Optimization Sweep

The follow-up sweep tested native Ollama with thinking mode enabled across
multiple `num_predict` budgets, plus OpenAI-compatible large-budget requests.
The same system prompt, same PHQ-9 user prompt, same local `gemma4:e4b` model,
same GPU workstation, and `temperature=0.2` were used.

Success criteria:

- HTTP status is `200`.
- Visible assistant content is non-empty and contains Traditional Chinese.
- Completion stops by `stop`, not by `length`.
- Output remains a short questionnaire-guidance sentence.
- Latency is acceptable for kiosk voice guidance.

Native Ollama `think:false` baseline:

| Run | num_predict | status | latency_ms | done_reason | eval_count | visible_content_chars | visible content |
| --- | ---: | ---: | ---: | --- | ---: | ---: | --- |
| 1 | 80 | 200 | 631 | stop | 31 | 38 | 請問您在過去兩週內，「做事時提不起勁或沒有樂趣」的頻率，最接近哪一個描述呢？ |
| 2 | 80 | 200 | 892 | stop | 54 | 82 | 請問您在過去兩週內，「做事時提不起勁或沒有樂趣」的情況，大概持續了多久呢？您可以從「完全沒有」、「幾天」、「一半以上的天數」，或是「幾乎每天」中選擇最符合您的狀況。 |
| 3 | 80 | 200 | 647 | stop | 31 | 38 | 請問您在過去兩週內，「做事時提不起勁或沒有樂趣」的頻率，最接近哪一個描述呢？ |

Native Ollama `think:true` budget sweep:

| num_predict | status | latency_ms | done_reason | eval_count | thinking_chars | visible_content_chars | visible content |
| ---: | ---: | ---: | --- | ---: | ---: | ---: | --- |
| 80 | 200 | 1203 | length | 80 | 274 | 0 | empty |
| 128 | 200 | 1756 | length | 128 | 451 | 0 | empty |
| 192 | 200 | 2480 | length | 192 | 751 | 0 | empty |
| 256 | 200 | 3215 | length | 256 | 959 | 0 | empty |
| 384 | 200 | 4776 | length | 384 | 1297 | 0 | empty |
| 512 | 200 | 5970 | stop | 488 | 1530 | 39 | 請回想過去兩週，選擇最能代表您「做事時提不起勁或沒有樂趣」天數頻率的選項即可。 |
| 640 | 200 | 5887 | stop | 478 | 1716 | 33 | 請您回想過去兩週的狀況，選擇最符合您缺乏動力或樂趣頻率的時間範圍。 |
| 768 | 200 | 6475 | stop | 517 | 1772 | 38 | 請您回想過去兩週的實際感受，選擇最能代表您「提不起勁或沒有樂趣」頻率的選項。 |
| 1024 | 200 | 6412 | stop | 518 | 1710 | 38 | 這個問題是在詢問您在「過去兩週」這段時間裡，缺乏動力或興趣的發生的頻率程度。 |
| 1536 | 200 | 5844 | stop | 470 | 1643 | 35 | 請您回想過去兩週的時間，選擇最符合您「提不起勁或沒有樂趣」的頻率選項。 |

OpenAI-compatible Ollama budget sweep:

| max_tokens | status | latency_ms | finish_reason | completion_tokens | visible_content_chars | visible content |
| ---: | ---: | ---: | --- | ---: | ---: | --- |
| 80 | 200 | 1230 | length | 80 | 0 | empty |
| 256 | 200 | 3318 | length | 256 | 0 | empty |
| 512 | 200 | 5393 | stop | 426 | 32 | 這個問題是在詢問您過去兩週內，感到提不起勁或沒有樂趣的頻率程度。 |
| 768 | 200 | 6331 | stop | 508 | 46 | 請您回想過去兩週的實際狀況，選擇最能代表「做事時提不起勁或沒有樂趣」這個狀態發生的頻率選項。 |
| 1024 | 200 | 5528 | stop | 441 | 32 | 這道題詢問的是在過去兩週內，您感到提不起勁或沒有樂趣的頻率程度。 |
| 1536 | 200 | 5972 | stop | 480 | 36 | 請您回想過去兩週，這種「提不起勁或沒有樂趣」的感受，是持續了多久的時間。 |

OpenAI-compatible `think:false` field check:

| max_tokens | status | latency_ms | finish_reason | completion_tokens | visible_content_chars | visible content |
| ---: | ---: | ---: | --- | ---: | ---: | --- |
| 80 | 200 | 1246 | length | 80 | 0 | empty |
| 512 | 200 | 5525 | stop | 444 | 36 | 請回想過去兩週，您在「提不起勁或沒有樂趣」的狀況，最接近哪一個時間頻率。 |

Finding:

```text
The OpenAI-compatible Ollama shim did not honor the non-standard think:false field. It behaved like thinking mode stayed enabled and needed a large output budget before visible content appeared.
```

## Thinking-Mode Stability Test

Because `512` was the first successful thinking-mode budget in the sweep, it
was retested against `768` with five runs each.

Native Ollama `think:true`, `num_predict=512`:

| Run | status | latency_ms | done_reason | eval_count | thinking_chars | visible_content_chars | visible content |
| ---: | ---: | ---: | --- | ---: | ---: | ---: | --- |
| 1 | 200 | 6263 | length | 512 | 1831 | 21 | 請您回想過去兩週，評估「做事提不起勁或沒有 |
| 2 | 200 | 5801 | stop | 475 | 1728 | 38 | 請根據您過去兩週的感受，選擇最符合「提不起勁或沒有樂趣」這個狀態發生的頻率。 |
| 3 | 200 | 5905 | stop | 480 | 1566 | 36 | 這題是在了解您「過去兩週」這段時間內，感到提不起勁或沒有樂趣的頻率程度。 |
| 4 | 200 | 6243 | stop | 508 | 1752 | 35 | 請回想過去兩週的時間，選擇最能代表您「提不起勁或沒有樂趣」的發生頻率。 |
| 5 | 200 | 5571 | stop | 451 | 1457 | 36 | 請回想過去兩週，哪一個選項最能描述您「做事時提不起勁或沒有樂趣」的頻率？ |

Native Ollama `think:true`, `num_predict=768`:

| Run | status | latency_ms | done_reason | eval_count | thinking_chars | visible_content_chars | visible content |
| ---: | ---: | ---: | --- | ---: | ---: | ---: | --- |
| 1 | 200 | 6519 | stop | 528 | 1745 | 37 | 請您回想過去兩週的狀況，選擇一個最能代表「提不起勁或沒有樂趣」頻率的選項。 |
| 2 | 200 | 6831 | stop | 553 | 1980 | 40 | 請根據您過去兩週的實際感受，選擇最符合您「做事時提不起勁或沒有樂趣」頻率的選項。 |
| 3 | 200 | 5963 | stop | 477 | 1626 | 40 | 請根據您過去兩週的實際感受，從選項中選擇最符合「提不起勁或沒有樂趣」發生的頻率。 |
| 4 | 200 | 6089 | stop | 491 | 1589 | 44 | 請根據您過去兩週的實際感受，選擇一個最能代表「做事時提不起勁或沒有樂趣」發生頻率的選項。 |
| 5 | 200 | 5731 | stop | 463 | 1673 | 33 | 請您回想過去兩週，缺乏動力或興趣的頻率，並選擇最符合您狀況的選項。 |

Finding:

```text
512 is the first budget that can produce visible content, but it is not stable: 1 of 5 stability runs stopped by length and visibly truncated the answer. 768 completed 5 of 5 runs with stop and complete Traditional Chinese content.
```

## First-Principles Analysis

The LLM slot in this product is not responsible for diagnosis, score
calculation, answer selection, or safety escalation. Those are deterministic
backend responsibilities. The LLM only rewrites a SurveyJS-derived question
guidance sentence into a short user-facing utterance.

From first principles, this task needs:

- bounded output;
- low latency;
- no hidden clinical decision-making;
- no answer inference;
- predictable fallback;
- GPU-only local execution;
- repeatable operator settings.

Thinking mode adds value when the model must solve a multi-step reasoning
problem. This guidance task is not that kind of problem. It already receives the
question text and choices from the trusted questionnaire runtime. The model does
not need to infer a score, classify a risk level, or decide a next clinical
action.

Industry pain points visible in this experiment:

- Hidden reasoning consumes the same output-token budget as visible response,
  causing empty content or truncated final answers.
- OpenAI-compatible shims may not expose provider-specific controls such as
  `think:false`.
- A health check using `Reply OK only` can pass while the real product prompt
  fails, because the prompt shape is different.
- Larger token budgets can hide the symptom but increase latency and cost.
- Local model names, chat templates, and reasoning controls differ by runtime,
  so provider compatibility must be tested with the actual product prompt.
- Clinical-adjacent workflows should not place scoring, safety, or answer
  mapping inside free-form LLM generation.

Practical controls:

- Keep deterministic questionnaire scoring and safety handling outside the LLM.
- Validate provider readiness with representative prompts, not only tiny OK
  probes.
- Keep a deterministic Traditional Chinese guidance fallback.
- Use native provider APIs when provider-specific controls matter.
- Treat token budgets as per-task operating parameters, not global defaults.
- Record `finish_reason`, visible content, token usage, latency, and runtime
  mode for every live acceptance experiment.

## Token Recommendation

Current optimal setting for the Smart Health Cabin questionnaire-guidance path:

```text
OLLAMA_THINK=false
LLM_MAX_TOKENS=80
```

Reason:

```text
This produced complete Traditional Chinese guidance in 3 of 3 baseline runs, with 31-54 generated tokens and 631-892ms latency. It avoids hidden-reasoning budget loss and keeps the voice interaction responsive.
```

If a future experiment explicitly requires thinking mode:

```text
OLLAMA_THINK=true
LLM_MAX_TOKENS=768
```

Reason:

```text
512 is too close to the observed completion length and failed 1 of 5 stability runs by truncating visible content. 768 completed 5 of 5 stability runs and gives about 200-300 tokens of headroom over the observed 463-553 generated-token range.
```

## Explanation

Thinking-capable Gemma runtimes can generate an internal thinking channel before
the final visible assistant content. The provider counts both channels against
the same output-token budget. With `max_tokens=80`, Gemma 4 E4B spent the full
budget in thinking mode, then stopped with `finish_reason=length` before the
assistant `content` field received final text.

The `80` cap was not a model limit. It was the application request value chosen
for a one-sentence guidance task. That value is reasonable only when the model
emits directly to visible content. It is too small when thinking mode is enabled
and hidden reasoning tokens share the same completion budget.

## Runtime Decision

Current preferred path:

```text
LLM_PROVIDER=ollama_native
LLM_BASE_URL=http://localhost:11434
LLM_MODEL=gemma4:e4b
OLLAMA_THINK=false
LLM_MAX_TOKENS=80
```

Native Ollama request shape:

```json
{
  "model": "gemma4:e4b",
  "messages": [
    {"role": "system", "content": "你是 Smart Health Cabin 的問卷語音導引。只用繁體中文，回答一句，協助使用者理解題目與選項。不得診斷、不得改變問卷分數、不得替使用者作答。"},
    {"role": "user", "content": "請依照過去兩週的狀況回答：「做事時提不起勁或沒有樂趣」。選項是：完全沒有、幾天、一半以上的天數、幾乎每天。"}
  ],
  "stream": false,
  "think": false,
  "options": {"temperature": 0.2, "num_predict": 80}
}
```

Research-only thinking-mode request shape:

```json
{
  "model": "gemma4:e4b",
  "messages": [
    {"role": "system", "content": "你是 Smart Health Cabin 的問卷語音導引。只用繁體中文，回答一句，協助使用者理解題目與選項。不得診斷、不得改變問卷分數、不得替使用者作答。"},
    {"role": "user", "content": "請依照過去兩週的狀況回答：「做事時提不起勁或沒有樂趣」。選項是：完全沒有、幾天、一半以上的天數、幾乎每天。"}
  ],
  "stream": false,
  "think": true,
  "options": {"temperature": 0.2, "num_predict": 768}
}
```

Scope control:

```text
The deterministic Traditional Chinese guidance fallback remains active. If live model output is empty, non-Chinese, or otherwise unusable, the API uses the SurveyJS-derived deterministic guidance sentence instead.
```
