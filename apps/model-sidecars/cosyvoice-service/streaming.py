import time
from typing import Any


def event(name: str, **fields: Any) -> dict[str, Any]:
    return {
        "event": name,
        "t_monotonic_ns": time.monotonic_ns(),
        **fields,
    }
