import base64
import unittest
from types import SimpleNamespace
from unittest.mock import patch

from fastapi.testclient import TestClient

import app as asr_app


class FakeModel:
    def transcribe(self, *_args, **_kwargs):
        return [
            SimpleNamespace(
                text=" 幾天",
                start=0.0,
                end=0.8,
                avg_logprob=-0.1,
                no_speech_prob=0.01,
                compression_ratio=1.1,
            )
        ], SimpleNamespace(language="zh")


class AsrServiceTest(unittest.TestCase):
    def test_transcribe_returns_safety_metadata_without_fake_nbest(self):
        client = TestClient(asr_app.app)
        with patch.object(asr_app, "load_model", return_value=FakeModel()):
            response = client.post(
                "/v1/asr/transcribe",
                json={
                    "audio_base64": base64.b64encode(b"fake wav").decode(),
                    "audio_format": "wav",
                    "hotwords": ["幾天", "完全沒有"],
                },
            )

        payload = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload["transcript"], "幾天")
        self.assertFalse(payload["hotwords_applied"])
        self.assertFalse(payload["n_best_available"])
        self.assertEqual(payload["n_best_transcripts"][0]["rank"], 1)
        self.assertEqual(payload["hotwords_requested"], ["幾天", "完全沒有"])
        self.assertEqual(payload["segments"][0]["start_ms"], 0)


if __name__ == "__main__":
    unittest.main()
