import unittest

from tw_normalization import normalize_taiwan_healthcare_text


class TaiwanNormalizationTest(unittest.TestCase):
    def test_healthcare_terms_and_values(self):
        self.assertEqual(
            normalize_taiwan_healthcare_text("PHQ-9、API、HbA1c 6.5%、血壓 128/76、屏幕質量"),
            "P H Q 九、A P I、糖化血色素 6.5 %、血壓 128 比 76、螢幕品質",
        )


if __name__ == "__main__":
    unittest.main()
