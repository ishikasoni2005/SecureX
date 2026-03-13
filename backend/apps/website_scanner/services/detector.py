from __future__ import annotations

import re
from dataclasses import asdict, dataclass
from functools import lru_cache
from html import unescape
from urllib.parse import urlparse

from ai_models.phishing_model.heuristics import analyze_website
from ai_models.text_model.predictor import get_text_predictor
from apps.link_analyzer.services.link_scanner import LinkScanner
from shared.utils.risk import clamp_probability, risk_level_from_score, score_from_probability


TAG_RE = re.compile(r"<[^>]+>")


@dataclass(frozen=True)
class WebsiteScanResult:
    classification: str
    confidence: float
    fraud_probability: float
    risk_score: int
    risk_level: str
    website_risk: str
    explanation: list[str]
    warnings: list[str]
    scanned_url: str
    ssl_status: str
    link_findings: list[dict[str, object]]

    def to_response(self) -> dict[str, object]:
        return asdict(self)


class WebsiteDetectionService:
    def __init__(self) -> None:
        self.link_scanner = LinkScanner()
        self.predictor = get_text_predictor()

    def analyze(
        self,
        *,
        url: str,
        html_content: str = "",
        page_text: str = "",
    ) -> WebsiteScanResult:
        normalized_page_text = self._strip_html(html_content)
        combined_text = " ".join(
            item for item in [page_text, normalized_page_text] if item
        ).strip()[:5000]

        link_scan = self.link_scanner.scan(url)
        heuristic_result = analyze_website(
            url=url,
            html_content=html_content[:20000],
            page_text=combined_text,
        )
        model_prediction = self.predictor.predict(f"{url} {combined_text}".strip() or url)

        fraud_probability = clamp_probability(
            model_prediction.fraud_probability * 0.58
            + (link_scan.total_score / 100) * 0.28
            + (heuristic_result.score / 100) * 0.32
        )

        if link_scan.has_high_risk_link and heuristic_result.score >= 30:
            fraud_probability = max(fraud_probability, 0.78)

        classification = "Fraud Risk" if fraud_probability >= 0.55 else "Likely Safe"
        confidence = fraud_probability if classification == "Fraud Risk" else 1 - fraud_probability
        risk_score = score_from_probability(fraud_probability)
        risk_level = risk_level_from_score(risk_score)
        explanation = list(
            dict.fromkeys(
                heuristic_result.reasons + link_scan.reasons + model_prediction.reasons[:1]
            )
        )[:5]

        if not explanation:
            explanation = ["No major phishing indicators were detected in the supplied URL."]

        return WebsiteScanResult(
            classification=classification,
            confidence=round(confidence, 4),
            fraud_probability=fraud_probability,
            risk_score=risk_score,
            risk_level=risk_level,
            website_risk=risk_level,
            explanation=explanation,
            warnings=[],
            scanned_url=url,
            ssl_status="HTTPS present" if urlparse(url).scheme.lower() == "https" else "HTTPS missing",
            link_findings=link_scan.serialized_findings(),
        )

    def _strip_html(self, html_content: str) -> str:
        return re.sub(r"\s+", " ", TAG_RE.sub(" ", unescape(html_content or ""))).strip()


@lru_cache(maxsize=1)
def get_website_detection_service() -> WebsiteDetectionService:
    return WebsiteDetectionService()
