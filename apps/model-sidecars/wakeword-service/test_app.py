import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from app import app, detected_keyword, mic_selection_mode, requested_mic_index, select_active_mic_index, should_emit_wake


class FakeArray:
    def __init__(self, values):
        self.values = values

    def flatten(self):
        return self.values


class FakeSoundDevice:
    def __init__(self):
        self.current_device = None

    def query_devices(self):
        return [
            {"name": "output-only", "max_input_channels": 0},
            {"name": "silent-input", "max_input_channels": 2},
            {"name": "active-input", "max_input_channels": 2},
            {"name": "busy-input", "max_input_channels": 2},
        ]

    def rec(self, _frames, samplerate, channels, dtype, device):
        self.current_device = device
        if device == 3:
            raise RuntimeError("device busy")
        if device == 2:
            return FakeArray([0.0, 0.05, -0.05])
        return FakeArray([0.0, 0.0, 0.0])

    def wait(self):
        return None


class FakeNumpy:
    @staticmethod
    def square(values):
        return [value * value for value in values]

    @staticmethod
    def mean(values):
        return sum(values) / len(values)

    @staticmethod
    def sqrt(value):
        return value**0.5

    @staticmethod
    def abs(values):
        return [abs(value) for value in values]

    @staticmethod
    def max(values):
        return max(values)


class WakewordServiceTest(unittest.TestCase):
    def test_health_status_and_event_stream(self):
        with patch.dict(os.environ, {"WAKE_WORD_MODE": "mock", "WAKE_WORD_PROVIDER": "sherpa-onnx"}, clear=False):
            client = TestClient(app)

            self.assertEqual(client.get("/healthz").json()["service"], "wakeword-service")
            status = client.get("/status").json()
            self.assertEqual(status["provider"], "sherpa-onnx")
            self.assertEqual(status["phrase"], "你好小慧")
            for field in ["mode", "ready", "listening", "threshold", "cooldown_ms", "mic_index", "model", "last_event", "last_error"]:
                self.assertIn(field, status)

            with client.websocket_connect("/events") as websocket:
                self.assertEqual(websocket.receive_json()["type"], "wake.status")
                event = client.post("/simulate-wake", json={"score": 0.82}).json()
                self.assertEqual(event["type"], "wake.detected")
                self.assertEqual(event["phrase"], "你好小慧")
                self.assertEqual(websocket.receive_json()["type"], "wake.detected")

    def test_sherpa_live_requires_model_files(self):
        with patch.dict(os.environ, {
            "WAKE_WORD_MODE": "live",
            "WAKE_WORD_PROVIDER": "sherpa-onnx",
            "SHERPA_ONNX_KWS_ENCODER": ".local/models/missing/encoder.onnx",
            "SHERPA_ONNX_KWS_DECODER": ".local/models/missing/decoder.onnx",
            "SHERPA_ONNX_KWS_JOINER": ".local/models/missing/joiner.onnx",
            "SHERPA_ONNX_KWS_TOKENS": ".local/models/missing/tokens.txt",
            "SHERPA_ONNX_KWS_KEYWORDS": ".local/models/missing/keywords.txt",
        }, clear=False):
            status = TestClient(app).get("/status").json()

        self.assertEqual(status["provider"], "sherpa-onnx")
        self.assertFalse(status["ready"])
        self.assertIn("SHERPA_ONNX_KWS_ENCODER_NOT_FOUND", status["missing_config"])
        self.assertIn("SHERPA_ONNX_KWS_KEYWORDS_NOT_FOUND", status["missing_config"])

    def test_threshold_and_cooldown_gate(self):
        self.assertFalse(should_emit_wake(0.64, 0.65, 1000, None, 2000))
        self.assertTrue(should_emit_wake(0.65, 0.65, 1000, None, 2000))
        self.assertFalse(should_emit_wake(0.82, 0.65, 2500, 1000, 2000))
        self.assertTrue(should_emit_wake(0.82, 0.65, 3000, 1000, 2000))

    def test_detected_keyword_accepts_plain_text(self):
        self.assertEqual(detected_keyword("你好小慧"), "你好小慧")

    def test_detected_keyword_accepts_json_result(self):
        self.assertEqual(detected_keyword('{"keyword": "你好小慧"}'), "你好小慧")

    def test_mic_index_defaults_to_auto_and_allows_manual_override(self):
        with patch.dict(os.environ, {"WAKE_WORD_DEVICE_INDEX": "auto"}, clear=False):
            self.assertIsNone(requested_mic_index())
            self.assertEqual(mic_selection_mode(), "auto")

        with patch.dict(os.environ, {"WAKE_WORD_DEVICE_INDEX": "12"}, clear=False):
            self.assertEqual(requested_mic_index(), 12)
            self.assertEqual(mic_selection_mode(), "manual")

    def test_select_active_mic_index_skips_silent_and_busy_devices(self):
        selected, probe = select_active_mic_index(FakeSoundDevice(), FakeNumpy())

        self.assertEqual(selected, 2)
        self.assertEqual(probe["selected_name"], "active-input")
        self.assertEqual(probe["candidates"][0]["usable"], False)
        self.assertEqual(probe["candidates"][1]["usable"], True)
        self.assertEqual(probe["candidates"][2]["usable"], False)


if __name__ == "__main__":
    unittest.main()
