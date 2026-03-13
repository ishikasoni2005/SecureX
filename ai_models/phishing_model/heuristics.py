from __future__ import annotations

import re
from dataclasses import dataclass
from urllib.parse import urlparse


LOGIN_FORM_RE = re.compile(
    r"(<input[^>]+type=['\"]password['\"]|sign in|login|verify your account|account recovery)",
    re.IGNORECASE | re.DOTALL,
)
SENSITIVE_FORM_RE = re.compile(
    r"(password|otp|cvv|card number|account number|routing number|pin)",
    re.IGNORECASE,
)
URGENT_WEB_RE = re.compile(
    r"(urgent|verify now|confirm now|account suspended|payment failed|limited time)",
    re.IGNORECASE,
)
CHECKOUT_RE = re.compile(r"(checkout|buy now|place order|cart|payment gateway)", re.IGNORECASE)
PAYMENT_RISK_RE = re.compile(
    r"(gift card|crypto|bitcoin|wire transfer|upi only|bank transfer only|no refunds)",
    re.IGNORECASE,
)
IDENTITY_RE = re.compile(
    r"(about us|contact us|privacy policy|terms|refund policy|gst|registered office|support@)",
    re.IGNORECASE,
)
PRICE_RISK_RE = re.compile(r"(\d{2,3})\s*%\s*off", re.IGNORECASE)
SUSPICIOUS_DOWNLOAD_RE = re.compile(r"\.(?:zip|rar|exe|apk)(?:$|\?)", re.IGNORECASE)


@dataclass(frozen=True)
class HeuristicResult:
    score: int
    reasons: list[str]


def analyze_website(
    *,
    url: str,
    html_content: str = "",
    page_text: str = "",
) -> HeuristicResult:
    parsed = urlparse(url)
    combined_page = f"{html_content} {page_text}".strip()
    reasons: list[str] = []
    score = 0

    if parsed.scheme.lower() != "https":
        reasons.append("Website does not enforce HTTPS")
        score += 18

    if "@" in url:
        reasons.append("URL contains obfuscated redirect-style syntax")
        score += 12

    if SUSPICIOUS_DOWNLOAD_RE.search(parsed.path or ""):
        reasons.append("Suspicious download payload path detected")
        score += 12

    if LOGIN_FORM_RE.search(combined_page):
        reasons.append("Phishing login form detected")
        score += 24

    if SENSITIVE_FORM_RE.search(combined_page) and URGENT_WEB_RE.search(combined_page):
        reasons.append("Page requests sensitive credentials with urgent language")
        score += 18

    if URGENT_WEB_RE.search(combined_page):
        reasons.append("Urgent account-recovery language detected")
        score += 12

    if combined_page and not IDENTITY_RE.search(combined_page):
        reasons.append("Business identity or policy details are missing")
        score += 10

    return HeuristicResult(score=min(score, 70), reasons=_unique(reasons))


def analyze_ecommerce(
    *,
    url: str,
    html_content: str = "",
    pricing_text: str = "",
    payment_text: str = "",
    merchant_name: str = "",
) -> HeuristicResult:
    combined_content = " ".join(
        item for item in [html_content, pricing_text, payment_text, merchant_name] if item
    )
    reasons: list[str] = []
    score = 0

    if CHECKOUT_RE.search(combined_content):
        score += 4

    match = PRICE_RISK_RE.search(combined_content)
    if match and int(match.group(1)) >= 70:
        reasons.append("Suspicious deep-discount pricing detected")
        score += 20

    if PAYMENT_RISK_RE.search(combined_content):
        reasons.append("High-risk payment method requested")
        score += 24

    if combined_content and not IDENTITY_RE.search(combined_content) and not merchant_name.strip():
        reasons.append("Merchant identity is missing or unverifiable")
        score += 18

    if CHECKOUT_RE.search(combined_content) and SENSITIVE_FORM_RE.search(combined_content):
        reasons.append("Checkout flow asks for unusually sensitive information")
        score += 14

    if "cod unavailable" in combined_content.lower() or "no cash on delivery" in combined_content.lower():
        reasons.append("Checkout restricts safer payment options")
        score += 10

    if urlparse(url).scheme.lower() != "https":
        reasons.append("Storefront does not enforce HTTPS")
        score += 14

    return HeuristicResult(score=min(score, 75), reasons=_unique(reasons))


def _unique(items: list[str]) -> list[str]:
    return list(dict.fromkeys(items))
