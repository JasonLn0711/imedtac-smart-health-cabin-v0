import unittest

from fastapi.testclient import TestClient

from app import app, best_prediction, should_emit_wake


class WakewordServiceTest(unittest.TestCase):
    def test_health_status_and_event_stream(self):
        client = TestClient(app)

        self.assertEqual(client.get("/healthz").json()["service"], "wakeword-service")
        status = client.get("/status").json()
        self.assertEqual(status["provider"], "openwakeword")
        for field in ["mode", "ready", "listening", "threshold", "cooldown_ms", "mic_index", "model", "last_event", "last_error"]:
            self.assertIn(field, status)

        with client.websocket_connect("/events") as websocket:
            self.assertEqual(websocket.receive_json()["type"], "wake.status")
            event = client.post("/simulate-wake", json={"score": 0.82}).json()
            self.assertEqual(event["type"], "wake.detected")
            self.assertEqual(websocket.receive_json()["type"], "wake.detected")

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
