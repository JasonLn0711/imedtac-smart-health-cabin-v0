import re


TERM_REPLACEMENTS = {
    "信息": "資訊",
    "質量": "品質",
    "屏幕": "螢幕",
    "身份證": "身分證",
    "心跳": "心率",
    "抑郁": "憂鬱",
}

ACRONYM_READINGS = {
    "PHQ-9": "P H Q 九",
    "ASR": "A S R",
    "LLM": "L L M",
    "TTS": "T T S",
    "API": "A P I",
    "GPU": "G P U",
    "HbA1c": "糖化血色素",
}


def normalize_taiwan_healthcare_text(text: str) -> str:
    value = " ".join(text.strip().split())
    for source, target in TERM_REPLACEMENTS.items():
        value = value.replace(source, target)
    for source, target in ACRONYM_READINGS.items():
        value = value.replace(source, target)
    value = re.sub(r"(\d{2,3})/(\d{2,3})", r"\1 比 \2", value)
    value = re.sub(r"(\d+(?:\.\d+)?)%", r"\1 %", value)
    value = re.sub(r"(\d{4}) 年 (\d{1,2}) 月 (\d{1,2}) 日", r"\1 年 \2 月 \3 日", value)
    return value


if __name__ == "__main__":
    assert normalize_taiwan_healthcare_text("PHQ-9 與 HbA1c 6.5%，血壓 128/76") == (
        "P H Q 九 與 糖化血色素 6.5 %，血壓 128 比 76"
    )
