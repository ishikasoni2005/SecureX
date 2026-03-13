#!/usr/bin/env python3
import os
import sys
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))


def main() -> None:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "securex.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Install backend dependencies first."
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
