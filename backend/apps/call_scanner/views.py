from __future__ import annotations

from apps.fraud_detection.views import ProtectedAnalysisView

from .serializers import CallScanSerializer
from .services.detector import get_call_detection_service


class CallScanView(ProtectedAnalysisView):
    serializer_class = CallScanSerializer
    service_error_message = (
        "SecureX could not analyze that call right now. Please try again shortly."
    )

    def handle_validated(self, validated_data: dict[str, str]) -> dict[str, object]:
        return get_call_detection_service().analyze(**validated_data).to_response()
