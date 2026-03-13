from rest_framework import serializers


class WebsiteScanSerializer(serializers.Serializer):
    url = serializers.URLField(max_length=2048)
    html_content = serializers.CharField(
        max_length=50000,
        required=False,
        allow_blank=True,
        trim_whitespace=True,
    )
    page_text = serializers.CharField(
        max_length=10000,
        required=False,
        allow_blank=True,
        trim_whitespace=True,
    )
