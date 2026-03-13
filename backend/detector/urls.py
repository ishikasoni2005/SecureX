from django.urls import path

from .views import ScamDetectionAPIView


app_name = "detector"

urlpatterns = [
    path("detect/", ScamDetectionAPIView.as_view(), name="detect"),
    path("detect-scam/", ScamDetectionAPIView.as_view(), name="detect-scam"),
]
