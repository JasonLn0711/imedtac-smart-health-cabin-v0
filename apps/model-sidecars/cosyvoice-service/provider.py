import base64
import io
import json
import os
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from tw_normalization import normalize_taiwan_healthcare_text, split_tts_sentences


PROVIDER = "cosyvoice3_streaming"
DEFAULT_MODEL = "FunAudioLLM/Fun-CosyVoice3-0.5B-2512"
COSYVOICE3_PROMPT_PREFIX = "You are a helpful assistant.<|endofprompt|>"
OFFICIAL_ZERO_SHOT_PROMPT_AUDIO_TEXT = "希望你以后能够做的比我还好呦。"
DEFAULT_PROMPT_TEXT = f"{COSYVOICE3_PROMPT_PREFIX}{OFFICIAL_ZERO_SHOT_PROMPT_AUDIO_TEXT}"


class ProviderUnavailable(RuntimeError):
    pass


def _env(name: str, fallback: str = "") -> str:
    return os.getenv(name, fallback)


def _join(base_url: str, path: str) -> str:
    return f"{base_url.rstrip('/')}{path if path.startswith('/') else f'/{path}'}"


@dataclass(frozen=True)
class ProviderConfig:
    provider: str = PROVIDER
    model: str = _env("COSYVOICE3_MODEL_ID", DEFAULT_MODEL)
    base_url: str = _env("COSYVOICE3_BACKEND_URL")
    stream_ws_url: str = _env("COSYVOICE3_STREAMING_BACKEND_WS")
    repo_path: str = _env("COSYVOICE3_REPO_PATH")
    model_dir: str = _env("COSYVOICE3_MODEL_DIR")
    prompt_wav: str = _env("COSYVOICE3_PROMPT_WAV")
    prompt_text: str = _env("COSYVOICE3_PROMPT_TEXT", DEFAULT_PROMPT_TEXT)
    prompt_profile: str = _env("COSYVOICE3_TW_PROMPT_PROFILE", "default_tw_healthcare")
    mode: str = _env("COSYVOICE3_PROVIDER_MODE", "unavailable")

    @property
    def local_paths_ready(self) -> bool:
        return bool(self.repo_path and self.model_dir and self.prompt_wav) and all(
            Path(path).exists() for path in [self.repo_path, self.model_dir, self.prompt_wav]
        )

    @property
    def local_ready(self) -> bool:
        return self.local_paths_ready and self.prompt_text_ready

    @property
    def ready(self) -> bool:
        return self.mode == "live" and (bool(self.base_url) or self.local_ready)

    @property
    def streaming_ready(self) -> bool:
        return self.mode == "live" and (bool(self.stream_ws_url) or self.local_ready)

    @property
    def prompt_audio_text(self) -> str:
        return prompt_audio_text(self.prompt_text)

    @property
    def prompt_text_ready(self) -> bool:
        if not self.prompt_wav:
            return False
        if Path(self.prompt_wav).name == "zero_shot_prompt.wav":
            return self.prompt_audio_text == OFFICIAL_ZERO_SHOT_PROMPT_AUDIO_TEXT
        return bool(os.getenv("COSYVOICE3_PROMPT_TEXT") and self.prompt_audio_text)


class CosyVoiceProvider:
    def __init__(self, config: ProviderConfig | None = None):
        self.config = config or ProviderConfig()
        self._local_model = None

    def status(self) -> dict[str, Any]:
        blocker = None
        if not self.config.ready:
            blocker = "Configure COSYVOICE3_BACKEND_URL, or COSYVOICE3_REPO_PATH + COSYVOICE3_MODEL_DIR + COSYVOICE3_PROMPT_WAV"
        if self.config.local_paths_ready and not self.config.prompt_text_ready:
            blocker = (
                "COSYVOICE3_PROMPT_TEXT must exactly match COSYVOICE3_PROMPT_WAV. "
                "Use the official zero_shot_prompt text for zero_shot_prompt.wav, or set matching text for custom prompt audio."
            )
        return {
            "provider": self.config.provider,
            "model": self.config.model,
            "mode": "live" if self.config.ready else "unavailable",
            "ready": self.config.ready,
            "streaming": self.config.streaming_ready,
            "audio_transport": "ws_pcm16",
            "compute_backend": _env("COSYVOICE3_COMPUTE_BACKEND", _env("TTS_COMPUTE_BACKEND", "unknown")),
            "fallback_provider": _env("TTS_FALLBACK_PROVIDER", "breezyvoice_default"),
            "prompt_wav": self.config.prompt_wav,
            "prompt_text_ready": self.config.prompt_text_ready,
            "local_paths_ready": self.config.local_paths_ready,
            "blocker_reason": blocker,
        }

    def normalize(self, text: str) -> str:
        return normalize_taiwan_healthcare_text(text)

    def split_sentences(self, text: str) -> list[str]:
        return split_tts_sentences(text)

    def synthesize(self, text: str, voice_id: str, response_format: str = "wav") -> dict[str, Any]:
        if not self.config.ready:
            raise ProviderUnavailable("CosyVoice3 backend is not configured")
        if self.config.local_ready and not self.config.base_url:
            return self._synthesize_local(text)
        normalized = self.normalize(text)
        payload = {
            "model": self.config.model,
            "text": normalized,
            "input": normalized,
            "voice_id": voice_id,
            "prompt_profile": self.config.prompt_profile,
            "response_format": response_format,
            "stream": False,
        }
        request = urllib.request.Request(
            _join(self.config.base_url, _env("COSYVOICE3_BACKEND_SPEECH_PATH", "/v1/audio/speech")),
            data=json.dumps(payload).encode("utf-8"),
            headers={"content-type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=float(_env("COSYVOICE3_REQUEST_TIMEOUT_SEC", "60"))) as response:
                content_type = response.headers.get("content-type", "")
                body = response.read()
        except urllib.error.URLError as exc:
            raise ProviderUnavailable(f"CosyVoice3 backend unavailable: {exc}") from exc

        if "application/json" in content_type:
            data = json.loads(body.decode("utf-8"))
            audio_base64 = data.get("audio_base64")
            if not audio_base64:
                raise ProviderUnavailable("CosyVoice3 backend JSON did not include audio_base64")
            return {"audio_base64": audio_base64, "mime_type": data.get("mime_type", "audio/wav")}

        return {"audio_base64": base64.b64encode(body).decode("ascii"), "mime_type": "audio/wav"}

    def _load_local_model(self):
        if self._local_model is not None:
            return self._local_model
        repo_path = Path(self.config.repo_path)
        sys.path.insert(0, str(repo_path))
        sys.path.insert(0, str(repo_path / "third_party" / "Matcha-TTS"))
        try:
            from cosyvoice.cli.cosyvoice import AutoModel
        except Exception as exc:
            raise ProviderUnavailable(f"CosyVoice import failed: {exc}") from exc
        try:
            self._local_model = AutoModel(
                model_dir=self.config.model_dir,
                fp16=_env("COSYVOICE3_FP16", "true").lower() != "false",
            )
        except Exception as exc:
            raise ProviderUnavailable(f"CosyVoice3 model load failed: {exc}") from exc
        return self._local_model

    def _synthesize_local(self, text: str) -> dict[str, Any]:
        model = self._load_local_model()
        try:
            output = next(
                model.inference_zero_shot(
                    self.normalize(text),
                    self.config.prompt_text,
                    self.config.prompt_wav,
                    stream=False,
                )
            )
            return {"audio_base64": _tensor_to_wav_base64(output["tts_speech"], model.sample_rate), "mime_type": "audio/wav"}
        except Exception as exc:
            raise ProviderUnavailable(f"CosyVoice3 local synthesis failed: {exc}") from exc

    def stream_local_pcm_chunks(self, text: str):
        model = self._load_local_model()
        try:
            for sentence in self.split_sentences(text):
                for output in model.inference_zero_shot(
                    sentence,
                    self.config.prompt_text,
                    self.config.prompt_wav,
                    stream=True,
                ):
                    yield _tensor_to_pcm16(output["tts_speech"]), model.sample_rate
        except Exception as exc:
            raise ProviderUnavailable(f"CosyVoice3 local streaming failed: {exc}") from exc


def _tensor_to_wav_base64(tensor: Any, sample_rate: int) -> str:
    try:
        import torchaudio
    except Exception as exc:
        raise ProviderUnavailable(f"torchaudio unavailable: {exc}") from exc
    buffer = io.BytesIO()
    torchaudio.save(buffer, tensor.cpu(), sample_rate, format="wav")
    return base64.b64encode(buffer.getvalue()).decode("ascii")


def _tensor_to_pcm16(tensor: Any) -> bytes:
    values = tensor.detach().cpu().clamp(-1, 1).flatten()
    pcm = (values * 32767).to(dtype=__import__("torch").int16).numpy()
    return pcm.tobytes()


def prompt_audio_text(text: str) -> str:
    value = text.strip()
    if "<|endofprompt|>" in value:
        value = value.split("<|endofprompt|>", 1)[1]
    return value.strip()


provider = CosyVoiceProvider()
