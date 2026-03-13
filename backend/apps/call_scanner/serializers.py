from rest_framework import serializers


class CallScanSerializer(serializers.Serializer):
    transcript = serializers.CharField(
        max_length=12000,
        required=False,
        allow_blank=True,
        trim_whitespace=True,
    )
    audio_base64 = serializers.CharField(
        max_length=5000000,
        required=False,
        allow_blank=True,
        trim_whitespace=True,
    )
    caller_context = serializers.CharField(
        max_length=500,
        required=False,
        allow_blank=True,
        trim_whitespace=True,
    )

    def validate(self, attrs):
        transcript = (attrs.get("transcript") or "").strip()
        audio_base64 = (attrs.get("audio_base64") or "").strip()
        if not transcript and not audio_base64:
            raise serializers.ValidationError(
                "Provide either a call transcript or a supported audio clip."
            )
        if transcript and len(transcript) < 10 and not audio_base64:
            raise serializers.ValidationError(
                "Please provide a longer call transcript for analysis."
            )
        attrs["transcript"] = transcript
        attrs["audio_base64"] = audio_base64
        attrs["caller_context"] = (attrs.get("caller_context") or "").strip()
        return attrs
