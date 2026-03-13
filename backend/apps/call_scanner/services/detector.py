from __future__ import annotations

import re
from dataclasses import asdict, dataclass
from functools import lru_cache

from ai_models.voice_model.transcriber import VoiceTranscriber
from apps.message_scanner.services.detector import get_message_detection_service
from shared.utils.risk import clamp_probability, risk_level_from_score, score_from_probability


OTP_CALL_RE = re.compile(r"\b(otp|verification code|passcode|security code)\b", re.IGNORECASE)
IMPERSONATION_RE = re.compile(
    r"\b(bank|police|government|income tax|support team|card department|customs)\b",
    re.IGNORECASE,
)
PRESSURE_RE = re.compile(
    r"\b(do not hang up|stay on the line|immediately|right now|urgent|limited time)\b",
    re.IGNORECASE,
)
REMOTE_ACCESS_RE = re.compile(
    r"\b(install|download|screen share|remote access|anydesk|teamviewer)\b",
    re.IGNORECASE,
)
PAYMENT_RE = re.compile(
    r"\b(transfer|wire|gift card|crypto|bitcoin|upi|bank account|card number|cvv)\b",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class CallScanResult:
    classification: str
    confidence: float
    fraud_probability: float
    risk_score: int
    risk_level: str
    explanation: list[str]
    warnings: list[str]
    transcript: str
    transcript_source: str
    masked_text: str
    sensitive_findings: list[dict[str, str]]

    def to_response(self) -> dict[str, object]:
        return asdict(self)


class CallDetectionService:
    def __init__(self) -> None:
        self.transcriber = VoiceTranscriber()
        self.message_service = get_message_detection_service()

    def analyze(
        self,
        *,
        transcript: str = "",
        audio_base64: str = "",
        caller_context: str = "",
    ) -> CallScanResult:
        warnings: list[str] = []
        transcript_source = "provided-transcript"
        effective_transcript = transcript.strip()

        if not effective_transcript and audio_base64.strip():
            transcription = self.transcriber.transcribe(audio_base64)
            warnings.extend(transcription.warnings)
            effective_transcript = transcription.transcript.strip()
            transcript_source = f"audio:{transcription.engine}"

        if not effective_transcript:
            raise ValueError(
                "SecureX could not derive a usable transcript. Provide a transcript or configure the audio engine."
            )

        base_result = self.message_service.analyze(effective_transcript)
        call_score, call_reasons = self._analyze_call_signals(
            f"{caller_context} {effective_transcript}".strip()
        )

        fraud_probability = clamp_probability(
            base_result.fraud_probability + min(0.24, (call_score / 100) * 0.24)
        )

        if any(reason == "OTP request detected during live call" for reason in call_reasons):
            fraud_probability = max(fraud_probability, 0.76)
        if (
            any(reason == "Bank or authority impersonation detected in call" for reason in call_reasons)
            and any("payment" in reason.lower() for reason in call_reasons)
        ):
            fraud_probability = max(fraud_probability, 0.82)

        classification = "Scam" if fraud_probability >= 0.55 else "Not Scam"
        confidence = fraud_probability if classification == "Scam" else 1 - fraud_probability
        risk_score = score_from_probability(fraud_probability)
        risk_level = risk_level_from_score(risk_score)
        explanation = list(dict.fromkeys(call_reasons + base_result.explanation))[:5]

        return CallScanResult(
            classification=classification,
            confidence=round(confidence, 4),
            fraud_probability=fraud_probability,
            risk_score=risk_score,
            risk_level=risk_level,
            explanation=explanation,
            warnings=list(dict.fromkeys(warnings + base_result.warnings)),
            transcript=effective_transcript,
            transcript_source=transcript_source,
            masked_text=base_result.masked_text,
            sensitive_findings=base_result.sensitive_findings,
        )

    def _analyze_call_signals(self, transcript: str) -> tuple[int, list[str]]:
        score = 0
        reasons: list[str] = []

        if OTP_CALL_RE.search(transcript):
            reasons.append("OTP request detected during live call")
            score += 18

        if IMPERSONATION_RE.search(transcript):
            reasons.append("Bank or authority impersonation detected in call")
            score += 16

        if PRESSURE_RE.search(transcript):
            reasons.append("Caller uses urgency or line-holding pressure")
            score += 12

        if REMOTE_ACCESS_RE.search(transcript):
            reasons.append("Remote access or screen-sharing pressure detected")
            score += 16

        if PAYMENT_RE.search(transcript):
            reasons.append("Financial transfer or card request detected during call")
            score += 16

        return min(score, 55), list(dict.fromkeys(reasons))


@lru_cache(maxsize=1)
def get_call_detection_service() -> CallDetectionService:
    return CallDetectionService()
