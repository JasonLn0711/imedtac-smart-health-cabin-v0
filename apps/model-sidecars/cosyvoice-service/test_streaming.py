import unittest

from streaming import event, pcm16_duration_ms


class StreamingMetadataTest(unittest.TestCase):
    def test_pcm16_duration_ms(self):
        self.assertEqual(pcm16_duration_ms(48000, 24000), 1000.0)

    def test_event_has_monotonic_time(self):
        payload = event("audio_chunk", chunk_index=0)
        self.assertEqual(payload["event"], "audio_chunk")
        self.assertIsInstance(payload["t_monotonic_ns"], int)


if __name__ == "__main__":
    unittest.main()
