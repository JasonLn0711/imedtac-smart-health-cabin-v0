import re
import unicodedata


TERM_REPLACEMENTS = {
    "資料": "资料",
    "資訊": "信息",
    "品質": "质量",
    "螢幕": "屏幕",
    "身分證": "身份证",
    "身份證": "身份证",
    "影片": "视频",
    "程式": "程序",
    "心跳": "心率",
    "憂鬱": "抑郁",
    "健康檢測": "健康检测",
    "問卷填答": "问卷填答",
    "檢測結果": "检测结果",
    "現場人員": "现场人员",
    "協助確認": "协助确认",
    "人員覆核": "人员复核",
}

ACRONYM_READINGS = {
    "PHQ-9": "P H Q 九",
    "ASR": "A S R",
    "LLM": "L L M",
    "TTS": "T T S",
    "API": "A P I",
    "GPU": "G P U",
    "QR Code": "Q R Code",
    "QRCode": "Q R Code",
    "HbA1c": "糖化血色素",
}

FALLBACK_TW_TO_CN = str.maketrans(
    {
        "臺": "台",
        "醫": "医",
        "檢": "检",
        "測": "测",
        "結": "结",
        "果": "果",
        "現": "现",
        "場": "场",
        "員": "员",
        "協": "协",
        "確": "确",
        "認": "认",
        "問": "问",
        "數": "数",
        "據": "据",
        "資": "资",
        "訊": "讯",
        "質": "质",
        "螢": "萤",
        "幕": "幕",
        "聲": "声",
        "語": "语",
        "幾": "几",
        "過": "过",
        "這": "这",
        "會": "会",
        "請": "请",
        "讓": "让",
        "與": "与",
        "為": "为",
        "體": "体",
        "壓": "压",
        "齡": "龄",
        "憂": "忧",
        "鬱": "郁",
        "寫": "写",
        "錄": "录",
        "觸": "触",
        "控": "控",
        "輸": "输",
        "剛": "刚",
        "聽": "听",
        "說": "说",
        "廣": "广",
        "開": "开",
        "關": "关",
        "題": "题",
        "號": "号",
        "選": "选",
        "項": "项",
        "應": "应",
        "狀": "状",
        "況": "况",
    }
)

SENTENCE_END_RE = re.compile(r"([。！？!?；;])")
MARKDOWN_RE = re.compile(r"(```.*?```|`[^`]*`|[*_#>\[\]()]+)", re.DOTALL)


def to_simplified(text: str) -> str:
    try:
        from opencc import OpenCC

        return OpenCC("tw2s").convert(text)
    except Exception:
        value = text
        for source, target in TERM_REPLACEMENTS.items():
            value = value.replace(source, target)
        return value.translate(FALLBACK_TW_TO_CN)


def clean_tts_text(text: str) -> str:
    value = unicodedata.normalize("NFKC", text)
    value = MARKDOWN_RE.sub("", value)
    value = "".join(
        char
        for char in value
        if unicodedata.category(char) not in {"So", "Cs"} and (char.isprintable() or char.isspace())
    )
    value = re.sub(r"[~^=|<>]+", " ", value)
    return " ".join(value.strip().split())


def normalize_taiwan_healthcare_text(text: str) -> str:
    value = to_simplified(clean_tts_text(text))
    for source, target in ACRONYM_READINGS.items():
        value = re.sub(re.escape(source), target, value, flags=re.IGNORECASE)
    value = re.sub(r"(\d{4})[-/](\d{1,2})[-/](\d{1,2})", r"\1 年 \2 月 \3 日", value)
    value = re.sub(r"(\d{2,3})\s*[/／]\s*(\d{2,3})", r"\1 比 \2", value)
    value = re.sub(r"(\d+(?:\.\d+)?)%", r"\1 %", value)
    return value


def split_tts_sentences(text: str, max_chars: int = 60) -> list[str]:
    normalized = normalize_taiwan_healthcare_text(text)
    parts = SENTENCE_END_RE.split(normalized)
    sentences: list[str] = []
    for index in range(0, len(parts), 2):
        sentence = (parts[index] + (parts[index + 1] if index + 1 < len(parts) else "")).strip()
        if not sentence:
            continue
        while len(sentence) > max_chars:
            sentences.append(sentence[:max_chars].strip())
            sentence = sentence[max_chars:].strip()
        if sentence:
            sentences.append(sentence)
    return sentences or ([normalized] if normalized else [])


if __name__ == "__main__":
    assert normalize_taiwan_healthcare_text("PHQ-9 與 HbA1c 6.5%，血壓 128/76") == (
        "P H Q 九 与 糖化血色素 6.5 %,血压 128 比 76"
    )
    assert split_tts_sentences("請確認。幾乎每天？") == ["请确认。", "几乎每天?"]
