import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from app import app, detected_keyword, should_emit_wake


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


if __name__ == "__main__":
    unittest.main()
