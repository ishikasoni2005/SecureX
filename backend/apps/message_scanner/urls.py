from django.urls import path

from .views import MessageScanView


urlpatterns = [
    path("detect/", MessageScanView.as_view(), name="detect"),
    path("detect-scam/", MessageScanView.as_view(), name="detect-scam"),
    path("message-scan/", MessageScanView.as_view(), name="message-scan"),
]
