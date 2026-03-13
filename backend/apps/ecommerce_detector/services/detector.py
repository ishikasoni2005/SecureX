from __future__ import annotations

from dataclasses import asdict, dataclass
from functools import lru_cache

from ai_models.phishing_model.heuristics import analyze_ecommerce, analyze_website
from ai_models.text_model.predictor import get_text_predictor
from apps.link_analyzer.services.link_scanner import LinkScanner
from shared.utils.risk import clamp_probability, risk_level_from_score, score_from_probability


@dataclass(frozen=True)
class EcommerceScanResult:
    classification: str
    confidence: float
    fraud_probability: float
    risk_score: int
    risk_level: str
    explanation: list[str]
    warnings: list[str]
    storefront_url: str
    merchant_name: str
    link_findings: list[dict[str, object]]

    def to_response(self) -> dict[str, object]:
        return asdict(self)


class EcommerceDetectionService:
    def __init__(self) -> None:
        self.link_scanner = LinkScanner()
        self.predictor = get_text_predictor()

    def analyze(
        self,
        *,
        url: str,
        html_content: str = "",
        pricing_text: str = "",
        payment_text: str = "",
        merchant_name: str = "",
    ) -> EcommerceScanResult:
        website_heuristics = analyze_website(url=url, html_content=html_content)
        ecommerce_heuristics = analyze_ecommerce(
            url=url,
            html_content=html_content,
            pricing_text=pricing_text,
            payment_text=payment_text,
            merchant_name=merchant_name,
        )
        link_scan = self.link_scanner.scan(url)
        model_prediction = self.predictor.predict(
            " ".join(
                item for item in [url, merchant_name, pricing_text, payment_text, html_content[:2500]] if item
            )
        )

        fraud_probability = clamp_probability(
            model_prediction.fraud_probability * 0.46
            + (link_scan.total_score / 100) * 0.2
            + (website_heuristics.score / 100) * 0.18
            + (ecommerce_heuristics.score / 100) * 0.3
        )

        has_high_risk_payment = "High-risk payment method requested" in ecommerce_heuristics.reasons
        has_deep_discount = "Suspicious deep-discount pricing detected" in ecommerce_heuristics.reasons

        if has_high_risk_payment and has_deep_discount:
            fraud_probability = max(fraud_probability, 0.82)
        elif has_high_risk_payment or has_deep_discount:
            fraud_probability = max(fraud_probability, 0.76)

        classification = "Fraudulent Store" if fraud_probability >= 0.55 else "Likely Legitimate"
        confidence = fraud_probability if classification == "Fraudulent Store" else 1 - fraud_probability
        risk_score = score_from_probability(fraud_probability)
        risk_level = risk_level_from_score(risk_score)
        explanation = list(
            dict.fromkeys(
                ecommerce_heuristics.reasons
                + website_heuristics.reasons
                + link_scan.reasons
                + model_prediction.reasons[:1]
            )
        )[:5]

        if not explanation:
            explanation = ["No major fake-store indicators were detected in the supplied data."]

        return EcommerceScanResult(
            classification=classification,
            confidence=round(confidence, 4),
            fraud_probability=fraud_probability,
            risk_score=risk_score,
            risk_level=risk_level,
            explanation=explanation,
            warnings=[],
            storefront_url=url,
            merchant_name=merchant_name,
            link_findings=link_scan.serialized_findings(),
        )


@lru_cache(maxsize=1)
def get_ecommerce_detection_service() -> EcommerceDetectionService:
    return EcommerceDetectionService()
