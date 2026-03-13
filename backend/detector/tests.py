from rest_framework import status
from rest_framework.test import APITestCase


class ScamDetectionApiTests(APITestCase):
    def test_detect_endpoint_flags_scam_like_content(self) -> None:
        response = self.client.post(
            "/api/detect/",
            {
                "text": "Urgent: verify your bank login now or your account will be suspended.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["classification"], "Scam")
        self.assertIn("confidence", response.data)
        self.assertIn("explanation", response.data)

    def test_detect_endpoint_rejects_short_messages(self) -> None:
        response = self.client.post("/api/detect/", {"text": "Hi"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("text", response.data)
