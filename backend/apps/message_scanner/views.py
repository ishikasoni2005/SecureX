from __future__ import annotations

from apps.fraud_detection.views import ProtectedAnalysisView

from .serializers import MessageScanSerializer
from .services.detector import get_message_detection_service


class MessageScanView(ProtectedAnalysisView):
    serializer_class = MessageScanSerializer
    service_error_message = (
        "SecureX could not analyze that message right now. Please try again shortly."
    )

    def handle_validated(self, validated_data: dict[str, str]) -> dict[str, object]:
        return get_message_detection_service().analyze(validated_data["text"]).to_response()
