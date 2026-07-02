import unittest

from tw_normalization import normalize_taiwan_healthcare_text, split_tts_sentences


class TaiwanNormalizationTest(unittest.TestCase):
    def test_healthcare_terms_and_values(self):
        self.assertEqual(
            normalize_taiwan_healthcare_text("PHQ-9、API、HbA1c 6.5%、血壓 128/76、屏幕質量"),
            "P H Q 九、A P I、糖化血色素 6.5 %、血压 128 比 76、屏幕质量",
        )

    def test_dates_fullwidth_pressure_and_taiwan_terms(self):
        self.assertEqual(
            normalize_taiwan_healthcare_text("2026-06-26 资料、身份证、hba1c 7.2%、血壓 128／76、asr 與 gpu"),
            "2026 年 06 月 26 日 资料、身份证、糖化血色素 7.2 %、血压 128 比 76、A S R 与 G P U",
        )

    def test_tts_cleanup_simplified_and_sentence_split(self):
        self.assertEqual(
            normalize_taiwan_healthcare_text("**請確認** 😊\n現場人員會協助確認。QR Code 可查看檢測結果。"),
            "请确认 现场人员会协助确认。Q R Code 可查看检测结果。",
        )
        self.assertEqual(
            split_tts_sentences("請確認。幾乎每天？現場人員會協助確認。"),
            ["请确认。", "几乎每天?", "现场人员会协助确认。"],
        )


if __name__ == "__main__":
    unittest.main()
