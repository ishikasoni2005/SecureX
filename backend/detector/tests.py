from __future__ import annotations

import json

from django.test import Client, TestCase
from rest_framework import status


class ScamDetectionApiTests(TestCase):
    def setUp(self) -> None:
        self.client = Client(enforce_csrf_checks=True)
        csrf_response = self.client.get("/api/csrf/")
        self.csrf_token = csrf_response.cookies["csrftoken"].value

    def post_detect(self, text: str):
        return self.client.post(
            "/api/detect/",
            data=json.dumps({"text": text}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

    def test_detect_endpoint_flags_scam_like_content(self) -> None:
        response = self.post_detect(
            "Urgent: verify your bank login now or your account will be suspended."
        )
        payload = response.json()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(payload["classification"], "Scam")
        self.assertIn("confidence", payload)
        self.assertIn("risk_level", payload)
        self.assertIsInstance(payload["explanation"], list)
        self.assertIn("fraud_probability", payload)

    def test_detect_endpoint_warns_on_sensitive_data_and_masks_it(self) -> None:
        response = self.post_detect(
            (
                "Your OTP is 482913 and the account number is 123456789012. "
                "Do not share it."
            )
        )
        payload = response.json()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(payload["warnings"])
        self.assertIn("******", payload["masked_text"])
        self.assertTrue(payload["sensitive_findings"])

    def test_detect_endpoint_requires_csrf_token(self) -> None:
        client = Client(enforce_csrf_checks=True)
        response = client.post(
            "/api/detect/",
            data=json.dumps({"text": "Please verify your account now."}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_detect_endpoint_rejects_short_messages(self) -> None:
        response = self.post_detect("Hi")
        payload = response.json()

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("text", payload)

    def test_message_scan_endpoint_matches_existing_detector_contract(self) -> None:
        response = self.client.post(
            "/api/message-scan/",
            data=json.dumps({"text": "Claim your prize now by sending your OTP."}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )
        payload = response.json()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(payload["classification"], "Scam")
        self.assertIn("link_findings", payload)

    def test_call_scan_endpoint_accepts_transcript(self) -> None:
        response = self.client.post(
            "/api/call-scan/",
            data=json.dumps(
                {
                    "transcript": (
                        "This is your bank. Do not hang up and read me the OTP right now "
                        "to secure your account."
                    )
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )
        payload = response.json()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(payload["classification"], "Scam")
        self.assertEqual(payload["risk_level"], "High")
        self.assertEqual(payload["transcript_source"], "provided-transcript")

    def test_url_scan_endpoint_flags_phishing_signals(self) -> None:
        response = self.client.post(
            "/api/url-scan/",
            data=json.dumps(
                {
                    "url": "http://secure-paypal-verify-login.xyz/login",
                    "html_content": "<form><input type='password' /></form><p>Verify now</p>",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )
        payload = response.json()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(payload["website_risk"], "High")
        self.assertIn("Phishing login form detected", payload["explanation"])

    def test_ecommerce_scan_endpoint_flags_fake_store_patterns(self) -> None:
        response = self.client.post(
            "/api/ecommerce-scan/",
            data=json.dumps(
                {
                    "url": "http://flash-deals-payments.top/checkout",
                    "pricing_text": "90% OFF on all products today",
                    "payment_text": "Pay only with crypto or gift card",
                    "html_content": "<div>Checkout now</div>",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )
        payload = response.json()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(payload["classification"], "Fraudulent Store")
        self.assertEqual(payload["risk_level"], "High")
