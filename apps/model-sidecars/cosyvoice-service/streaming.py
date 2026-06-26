import time
from typing import Any


def event(name: str, **fields: Any) -> dict[str, Any]:
    return {
        "event": name,
        "t_monotonic_ns": time.monotonic_ns(),
        **fields,
    }


def pcm16_duration_ms(byte_count: int, sample_rate: int) -> float:
    if sample_rate <= 0:
        return 0.0
    return round((byte_count / 2) / sample_rate * 1000, 3)
