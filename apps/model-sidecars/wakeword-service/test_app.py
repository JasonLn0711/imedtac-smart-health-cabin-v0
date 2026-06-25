import unittest

from fastapi.testclient import TestClient

from app import app


class WakewordServiceTest(unittest.TestCase):
    def test_health_status_and_event_stream(self):
        client = TestClient(app)

        self.assertEqual(client.get("/healthz").json()["service"], "wakeword-service")
        self.assertEqual(client.get("/status").json()["provider"], "openwakeword")

        with client.websocket_connect("/events") as websocket:
            self.assertEqual(websocket.receive_json()["type"], "wake.status")
            event = client.post("/simulate-wake", json={"score": 0.82}).json()
            self.assertEqual(event["type"], "wake.detected")
            self.assertEqual(websocket.receive_json()["type"], "wake.detected")


if __name__ == "__main__":
    unittest.main()
