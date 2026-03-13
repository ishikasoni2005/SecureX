from __future__ import annotations

from apps.fraud_detection.views import ProtectedAnalysisView

from .serializers import EcommerceScanSerializer
from .services.detector import get_ecommerce_detection_service


class EcommerceScanView(ProtectedAnalysisView):
    serializer_class = EcommerceScanSerializer
    service_error_message = (
        "SecureX could not analyze that storefront right now. Please try again shortly."
    )

    def handle_validated(self, validated_data: dict[str, str]) -> dict[str, object]:
        return get_ecommerce_detection_service().analyze(**validated_data).to_response()
