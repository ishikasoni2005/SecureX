import os
import sys
from pathlib import Path

from django.core.asgi import get_asgi_application


ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "securex.settings")

application = get_asgi_application()
