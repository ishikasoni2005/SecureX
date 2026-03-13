from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path


SIGNAL_PATH = Path(__file__).resolve().parent.parent / "constants" / "scam_signals.json"


@lru_cache(maxsize=1)
def get_signal_constants() -> dict[str, list[str]]:
    with SIGNAL_PATH.open("r", encoding="utf-8") as file_pointer:
        return json.load(file_pointer)
