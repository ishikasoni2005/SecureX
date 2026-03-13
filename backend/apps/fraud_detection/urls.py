from django.urls import path

from apps.call_scanner.views import CallScanView
from apps.ecommerce_detector.views import EcommerceScanView
from apps.message_scanner.views import MessageScanView
from apps.website_scanner.views import WebsiteScanView

from .views import CsrfCookieView, PlatformOverviewView


urlpatterns = [
    path("csrf/", CsrfCookieView.as_view(), name="csrf"),
    path("platform-overview/", PlatformOverviewView.as_view(), name="platform-overview"),
    path("detect/", MessageScanView.as_view(), name="detect"),
    path("detect-scam/", MessageScanView.as_view(), name="detect-scam"),
    path("message-scan/", MessageScanView.as_view(), name="message-scan"),
    path("call-scan/", CallScanView.as_view(), name="call-scan"),
    path("url-scan/", WebsiteScanView.as_view(), name="url-scan"),
    path("ecommerce-scan/", EcommerceScanView.as_view(), name="ecommerce-scan"),
]
