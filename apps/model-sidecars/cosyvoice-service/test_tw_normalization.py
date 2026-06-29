import unittest

from tw_normalization import normalize_taiwan_healthcare_text


class TaiwanNormalizationTest(unittest.TestCase):
    def test_healthcare_terms_and_values(self):
        self.assertEqual(
            normalize_taiwan_healthcare_text("PHQ-9、API、HbA1c 6.5%、血壓 128/76、屏幕質量"),
            "P H Q 九、A P I、糖化血色素 6.5 %、血壓 128 比 76、螢幕品質",
        )

    def test_dates_fullwidth_pressure_and_taiwan_terms(self):
        self.assertEqual(
            normalize_taiwan_healthcare_text("2026-06-26 资料、身份证、hba1c 7.2%、血壓 128／76、asr 與 gpu"),
            "2026 年 06 月 26 日 資料、身分證、糖化血色素 7.2 %、血壓 128 比 76、A S R 與 G P U",
        )


if __name__ == "__main__":
    unittest.main()
