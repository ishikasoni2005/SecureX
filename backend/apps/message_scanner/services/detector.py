from __future__ import annotations

import re
from dataclasses import asdict, dataclass
from functools import lru_cache

from ai_models.text_model.predictor import get_text_predictor
from ai_models.text_model.preprocess import normalize_for_rules
from apps.link_analyzer.services.link_scanner import LinkScanner
from shared.utils.risk import clamp_probability, risk_level_from_score, score_from_probability
from shared.utils.signal_loader import get_signal_constants

from .sensitive_data_detector import SensitiveDataDetector


@dataclass(frozen=True)
class MessageScanResult:
    classification: str
    confidence: float
    fraud_probability: float
    risk_score: int
    risk_level: str
    explanation: list[str]
    warnings: list[str]
    masked_text: str
    sensitive_findings: list[dict[str, str]]
    link_findings: list[dict[str, object]]

    def to_response(self) -> dict[str, object]:
        return asdict(self)


@dataclass(frozen=True)
class KeywordAnalysis:
    score: int
    reasons: list[str]
    safe_reason: str | None = None


class MessageDetectionService:
    def __init__(self) -> None:
        self.constants = get_signal_constants()
        self.sensitive_data_detector = SensitiveDataDetector()
        self.link_scanner = LinkScanner()
        self.predictor = get_text_predictor()

    def analyze(self, text: str) -> MessageScanResult:
        sensitive_scan = self.sensitive_data_detector.scan(text)
        masked_text = sensitive_scan.masked_text

        keyword_analysis = self._analyze_keywords(masked_text)
        link_scan = self.link_scanner.scan(masked_text)
        model_prediction = self.predictor.predict(masked_text)

        fraud_probability = self._combine_probability(
            keyword_score=keyword_analysis.score,
            link_score=link_scan.total_score,
            model_probability=model_prediction.fraud_probability,
            link_has_high_risk=link_scan.has_high_risk_link,
            has_sensitive_data=bool(sensitive_scan.findings),
            has_credential_signal=any(
                reason == "Credential harvesting pattern detected"
                for reason in keyword_analysis.reasons
            ),
            has_reward_credential_signal=any(
                reason == "Reward bait requests sensitive codes"
                for reason in keyword_analysis.reasons
            ),
        )

        classification = "Scam" if fraud_probability >= 0.55 else "Not Scam"
        confidence = fraud_probability if classification == "Scam" else 1 - fraud_probability
        risk_score = score_from_probability(fraud_probability)
        risk_level = risk_level_from_score(risk_score)

        explanation = self._build_explanation(
            classification=classification,
            keyword_analysis=keyword_analysis,
            link_reasons=link_scan.reasons,
            model_reasons=model_prediction.reasons,
        )

        return MessageScanResult(
            classification=classification,
            confidence=round(confidence, 4),
            fraud_probability=fraud_probability,
            risk_score=risk_score,
            risk_level=risk_level,
            explanation=explanation,
            warnings=sensitive_scan.warnings,
            masked_text=masked_text,
            sensitive_findings=[finding.to_dict() for finding in sensitive_scan.findings],
            link_findings=link_scan.serialized_findings(),
        )

    def _analyze_keywords(self, text: str) -> KeywordAnalysis:
        normalized_text = normalize_for_rules(text)
        reasons: list[str] = []
        score = 0

        urgency_hits = self._match_phrases(normalized_text, self.constants["urgency_phrases"])
        action_hits = self._match_phrases(normalized_text, self.constants["request_actions"])
        credential_hits = self._match_phrases(normalized_text, self.constants["credential_keywords"])
        financial_hits = self._match_phrases(normalized_text, self.constants["financial_keywords"])
        reward_hits = self._match_phrases(normalized_text, self.constants["reward_keywords"])
        impersonation_hits = self._match_phrases(
            normalized_text,
            self.constants["impersonation_keywords"],
        )
        safety_hits = self._match_phrases(normalized_text, self.constants["safety_phrases"])

        if urgency_hits:
            reasons.append("Urgency phrase detected")
            score += 16

        if credential_hits and action_hits:
            reasons.append("Credential harvesting pattern detected")
            score += 20
        elif credential_hits and urgency_hits:
            reasons.append("Account verification language detected")
            score += 12

        if financial_hits and (action_hits or urgency_hits or reward_hits):
            reasons.append("Suspicious financial request detected")
            score += 18

        if reward_hits:
            reasons.append("Prize or reward bait language detected")
            score += 12

        if reward_hits and credential_hits and action_hits:
            reasons.append("Reward bait requests sensitive codes")
            score += 20

        if impersonation_hits and (action_hits or urgency_hits):
            reasons.append("Brand or authority impersonation cues detected")
            score += 10

        if re.search(r"\b(?:gift card|bitcoin|crypto|wire transfer|upi)\b", normalized_text) and action_hits:
            reasons.append("High-risk payment method request detected")
            score += 14

        safe_reason = None
        if safety_hits:
            score = max(0, score - 12)
            safe_reason = "Protective or informational language detected."

        return KeywordAnalysis(score=score, reasons=list(dict.fromkeys(reasons)), safe_reason=safe_reason)

    def _combine_probability(
        self,
        *,
        keyword_score: int,
        link_score: int,
        model_probability: float,
        link_has_high_risk: bool,
        has_sensitive_data: bool,
        has_credential_signal: bool,
        has_reward_credential_signal: bool,
    ) -> float:
        heuristic_probability = min(0.45, (keyword_score / 100) * 0.28 + (link_score / 100) * 0.34)
        combined_probability = model_probability * 0.72 + heuristic_probability

        if link_has_high_risk:
            combined_probability = max(combined_probability, 0.72)

        if has_sensitive_data and has_credential_signal:
            combined_probability = max(combined_probability, 0.68)

        if has_reward_credential_signal:
            combined_probability = max(combined_probability, 0.67)

        return clamp_probability(combined_probability)

    def _build_explanation(
        self,
        *,
        classification: str,
        keyword_analysis: KeywordAnalysis,
        link_reasons: list[str],
        model_reasons: list[str],
    ) -> list[str]:
        reasons = keyword_analysis.reasons + link_reasons

        if classification == "Scam":
            reasons.extend(model_reasons[:1])
        else:
            if keyword_analysis.safe_reason:
                reasons.append(keyword_analysis.safe_reason)
            reasons.extend(model_reasons[:1])
            if not link_reasons:
                reasons.append("No suspicious links detected.")

        return list(dict.fromkeys(reasons))[:5]

    def _match_phrases(self, text: str, phrases: list[str]) -> list[str]:
        hits: list[str] = []
        for phrase in phrases:
            if self._contains_phrase(text, phrase):
                hits.append(phrase)
        return hits

    def _contains_phrase(self, text: str, phrase: str) -> bool:
        if re.fullmatch(r"[a-z0-9]+", phrase):
            return re.search(rf"\b{re.escape(phrase)}\b", text) is not None
        return phrase in text


@lru_cache(maxsize=1)
def get_message_detection_service() -> MessageDetectionService:
    return MessageDetectionService()
