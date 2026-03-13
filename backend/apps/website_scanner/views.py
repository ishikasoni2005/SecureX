from __future__ import annotations

from apps.fraud_detection.views import ProtectedAnalysisView

from .serializers import WebsiteScanSerializer
from .services.detector import get_website_detection_service


class WebsiteScanView(ProtectedAnalysisView):
    serializer_class = WebsiteScanSerializer
    service_error_message = (
        "SecureX could not analyze that website right now. Please try again shortly."
    )

    def handle_validated(self, validated_data: dict[str, str]) -> dict[str, object]:
        return get_website_detection_service().analyze(**validated_data).to_response()
