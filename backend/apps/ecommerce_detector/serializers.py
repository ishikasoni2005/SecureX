from rest_framework import serializers


class EcommerceScanSerializer(serializers.Serializer):
    url = serializers.URLField(max_length=2048)
    html_content = serializers.CharField(
        max_length=50000,
        required=False,
        allow_blank=True,
        trim_whitespace=True,
    )
    pricing_text = serializers.CharField(
        max_length=5000,
        required=False,
        allow_blank=True,
        trim_whitespace=True,
    )
    payment_text = serializers.CharField(
        max_length=5000,
        required=False,
        allow_blank=True,
        trim_whitespace=True,
    )
    merchant_name = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
        trim_whitespace=True,
    )
