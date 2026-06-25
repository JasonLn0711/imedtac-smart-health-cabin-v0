import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from app import app, best_prediction, should_emit_wake


class WakewordServiceTest(unittest.TestCase):
    def test_health_status_and_event_stream(self):
        with patch.dict(os.environ, {"WAKE_WORD_MODE": "mock", "WAKE_WORD_PROVIDER": "porcupine"}, clear=False):
            client = TestClient(app)

            self.assertEqual(client.get("/healthz").json()["service"], "wakeword-service")
            status = client.get("/status").json()
            self.assertEqual(status["provider"], "porcupine")
            self.assertEqual(status["phrase"], "小慧你好")
            for field in ["mode", "ready", "listening", "threshold", "cooldown_ms", "mic_index", "model", "last_event", "last_error"]:
                self.assertIn(field, status)

            with client.websocket_connect("/events") as websocket:
                self.assertEqual(websocket.receive_json()["type"], "wake.status")
                event = client.post("/simulate-wake", json={"score": 0.82}).json()
                self.assertEqual(event["type"], "wake.detected")
                self.assertEqual(event["phrase"], "小慧你好")
                self.assertEqual(websocket.receive_json()["type"], "wake.detected")

    def test_porcupine_live_requires_key_and_models(self):
        with patch.dict(os.environ, {"WAKE_WORD_MODE": "live", "WAKE_WORD_PROVIDER": "porcupine"}, clear=False):
            os.environ.pop("PICOVOICE_ACCESS_KEY", None)
            os.environ.pop("PORCUPINE_ACCESS_KEY", None)
            os.environ.pop("PORCUPINE_KEYWORD_PATH", None)
            os.environ.pop("PORCUPINE_MODEL_PATH", None)
            status = TestClient(app).get("/status").json()

        self.assertEqual(status["provider"], "porcupine")
        self.assertFalse(status["ready"])
        self.assertEqual(status["error_code"], "PICOVOICE_ACCESS_KEY")
        self.assertIn("PORCUPINE_KEYWORD_PATH", status["missing_config"])

    def test_threshold_and_cooldown_gate(self):
        self.assertFalse(should_emit_wake(0.64, 0.65, 1000, None, 2000))
        self.assertTrue(should_emit_wake(0.65, 0.65, 1000, None, 2000))
        self.assertFalse(should_emit_wake(0.82, 0.65, 2500, 1000, 2000))
        self.assertTrue(should_emit_wake(0.82, 0.65, 3000, 1000, 2000))

    def test_best_prediction_selects_highest_score(self):
        model, score = best_prediction({"hey_cabin": 0.42, "smart_health": 0.83})

        self.assertEqual(model, "smart_health")
        self.assertEqual(score, 0.83)


if __name__ == "__main__":
    unittest.main()
