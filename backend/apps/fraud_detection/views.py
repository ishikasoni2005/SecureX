from __future__ import annotations

import json
import logging

from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from django_ratelimit.decorators import ratelimit


logger = logging.getLogger(__name__)


@method_decorator(csrf_protect, name="dispatch")
class ProtectedAnalysisView(View):
    http_method_names = ["post", "options"]
    serializer_class = None
    service_error_message = (
        "SecureX could not process that request right now. Please try again shortly."
    )

    def post(self, request, *args, **kwargs):
        if getattr(request, "limited", False):
            return JsonResponse(
                {"detail": "Rate limit exceeded. Please try again later."},
                status=429,
            )

        try:
            payload = json.loads(request.body.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"detail": "Invalid JSON payload."}, status=400)

        serializer = self.serializer_class(data=payload)
        if not serializer.is_valid():
            return JsonResponse(serializer.errors, status=400)

        try:
            response_payload = self.handle_validated(serializer.validated_data)
        except ValueError as exc:
            return JsonResponse({"detail": str(exc)}, status=400)
        except Exception:
            logger.exception("SecureX analysis request failed")
            return JsonResponse({"detail": self.service_error_message}, status=500)

        return JsonResponse(response_payload, status=200)

    @method_decorator(ratelimit(key="ip", rate="100/h", method="POST", block=False))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def handle_validated(self, validated_data: dict[str, object]) -> dict[str, object]:
        raise NotImplementedError


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfCookieView(View):
    http_method_names = ["get"]

    def get(self, request, *args, **kwargs):
        return JsonResponse(
            {
                "detail": "CSRF cookie set.",
                "privacy": "SecureX processes submitted content in memory only and never stores analysis payloads.",
            },
            status=200,
        )


class PlatformOverviewView(View):
    http_method_names = ["get"]

    def get(self, request, *args, **kwargs):
        return JsonResponse(
            {
                "name": "SecureX Fraud Platform",
                "modules": [
                    "message_scan",
                    "call_scan",
                    "url_scan",
                    "ecommerce_scan",
                ],
                "privacy": [
                    "Zero data retention",
                    "Sensitive-data masking before AI inference",
                    "Anonymous analysis without accounts",
                ],
            },
            status=200,
        )
