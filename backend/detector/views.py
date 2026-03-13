import logging

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .ml_model.predictor import get_predictor
from .serializers import ScamDetectionSerializer


logger = logging.getLogger(__name__)


class ScamDetectionAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = ScamDetectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            result = get_predictor().predict(serializer.validated_data["text"])
        except Exception:
            logger.exception("Scam detection failed")
            return Response(
                {
                    "detail": (
                        "SecureX could not analyze the message right now. "
                        "Please try again shortly."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "classification": result.classification,
                "confidence": result.confidence,
                "explanation": result.explanation,
            },
            status=status.HTTP_200_OK,
        )
