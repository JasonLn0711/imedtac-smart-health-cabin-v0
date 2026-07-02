import os
import unittest

from provider import (
    COSYVOICE3_PROMPT_PREFIX,
    DEFAULT_PROMPT_TEXT,
    OFFICIAL_ZERO_SHOT_PROMPT_AUDIO_TEXT,
    ProviderConfig,
    prompt_audio_text,
)


class PromptConfigTest(unittest.TestCase):
    def test_default_prompt_text_matches_official_zero_shot_audio_text(self):
        self.assertEqual(prompt_audio_text(DEFAULT_PROMPT_TEXT), OFFICIAL_ZERO_SHOT_PROMPT_AUDIO_TEXT)

    def test_official_zero_shot_prompt_rejects_mismatched_text(self):
        config = ProviderConfig(
            prompt_wav="/tmp/zero_shot_prompt.wav",
            prompt_text=f"{COSYVOICE3_PROMPT_PREFIX}您好，我是慧誠智醫健康互動助理。",
        )
        self.assertFalse(config.prompt_text_ready)

    def test_official_zero_shot_prompt_accepts_official_text(self):
        config = ProviderConfig(prompt_wav="/tmp/zero_shot_prompt.wav", prompt_text=DEFAULT_PROMPT_TEXT)
        self.assertTrue(config.prompt_text_ready)

    def test_custom_prompt_requires_explicit_prompt_text_env(self):
        old_value = os.environ.pop("COSYVOICE3_PROMPT_TEXT", None)
        try:
            config = ProviderConfig(
                prompt_wav="/tmp/taiwan-healthcare-prompt.wav",
                prompt_text=f"{COSYVOICE3_PROMPT_PREFIX}您好，我是慧誠智醫健康互動助理。",
            )
            self.assertFalse(config.prompt_text_ready)

            os.environ["COSYVOICE3_PROMPT_TEXT"] = config.prompt_text
            self.assertTrue(config.prompt_text_ready)
        finally:
            if old_value is None:
                os.environ.pop("COSYVOICE3_PROMPT_TEXT", None)
            else:
                os.environ["COSYVOICE3_PROMPT_TEXT"] = old_value


if __name__ == "__main__":
    unittest.main()
