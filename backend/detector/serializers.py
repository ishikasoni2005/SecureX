from rest_framework import serializers


class ScamDetectionSerializer(serializers.Serializer):
    text = serializers.CharField(
        max_length=5000,
        trim_whitespace=True,
        allow_blank=False,
        help_text="The message text to classify.",
    )

    def validate_text(self, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 5:
            raise serializers.ValidationError(
                "Please provide a longer message so SecureX can analyze it."
            )
        return cleaned
