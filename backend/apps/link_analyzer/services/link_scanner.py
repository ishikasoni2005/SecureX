from __future__ import annotations

import re
from dataclasses import asdict, dataclass
from ipaddress import ip_address
from urllib.parse import urlparse

import tldextract

from shared.utils.signal_loader import get_signal_constants


URL_RE = re.compile(
    r"(?:(?:https?://|www\.)[^\s]+|\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?:/[^\s]*)?)",
    re.IGNORECASE,
)
ACTION_PATH_RE = re.compile(
    r"(?:login|verify|update|reset|secure|claim|reward|wallet|bank|signin|checkout)",
    re.IGNORECASE,
)
EXTRACTOR = tldextract.TLDExtract(suffix_list_urls=(), cache_dir=None)
TRUSTED_BRAND_DOMAINS = {
    "amazon.com",
    "apple.com",
    "github.com",
    "google.com",
    "microsoft.com",
    "netflix.com",
    "paypal.com",
    "whatsapp.com",
}


@dataclass(frozen=True)
class LinkFinding:
    url: str
    domain: str
    reasons: list[str]
    score: int

    def to_dict(self) -> dict[str, object]:
        return asdict(self)


@dataclass(frozen=True)
class LinkScanResult:
    findings: list[LinkFinding]
    reasons: list[str]
    total_score: int

    @property
    def has_high_risk_link(self) -> bool:
        return any(finding.score >= 25 for finding in self.findings)

    def serialized_findings(self) -> list[dict[str, object]]:
        return [finding.to_dict() for finding in self.findings]


class LinkScanner:
    def __init__(self) -> None:
        constants = get_signal_constants()
        self.shortener_domains = set(constants["shortener_domains"])
        self.suspicious_domains = set(constants["suspicious_domains"])
        self.suspicious_tlds = set(constants["suspicious_tlds"])
        self.phishing_brands = set(constants["phishing_brands"])

    def scan(self, text: str) -> LinkScanResult:
        findings: list[LinkFinding] = []
        for candidate in self.extract_candidates(text):
            finding = self._analyze_candidate(candidate)
            if finding is not None:
                findings.append(finding)

        reasons: list[str] = []
        for finding in findings:
            reasons.extend(finding.reasons)

        return LinkScanResult(
            findings=findings,
            reasons=list(dict.fromkeys(reasons)),
            total_score=min(sum(finding.score for finding in findings), 40),
        )

    def extract_candidates(self, text: str) -> list[str]:
        candidates: list[str] = []
        for match in URL_RE.finditer(text):
            candidate = match.group(0).rstrip(".,)")
            if "@" in candidate and not candidate.startswith(("http://", "https://", "www.")):
                continue
            candidates.append(candidate)
        return list(dict.fromkeys(candidates))

    def _analyze_candidate(self, candidate: str) -> LinkFinding | None:
        normalized_candidate = candidate if "://" in candidate else f"http://{candidate}"
        parsed = urlparse(normalized_candidate)
        host = (parsed.hostname or "").lower()
        if not host:
            return None

        extraction = EXTRACTOR(host)
        registered_domain = ".".join(
            part for part in [extraction.domain, extraction.suffix] if part
        )
        reasons: list[str] = []
        score = 0

        if host in self.shortener_domains or registered_domain in self.shortener_domains:
            reasons.append("Shortened URL detected")
            score += 28

        if host in self.suspicious_domains or registered_domain in self.suspicious_domains:
            reasons.append("Suspicious domain pattern detected")
            score += 24

        if extraction.suffix in self.suspicious_tlds:
            reasons.append(f"Suspicious top-level domain detected (.{extraction.suffix})")
            score += 15

        if "xn--" in host:
            reasons.append("Punycode domain detected")
            score += 18

        if self._is_ip_address(host):
            reasons.append("Raw IP address used instead of a trusted domain")
            score += 18

        if host.count(".") >= 3:
            reasons.append("Excessive subdomain depth detected")
            score += 8

        if host.count("-") >= 3:
            reasons.append("Deceptive hyphenated domain pattern detected")
            score += 8

        if self._looks_like_brand_impersonation(host=host, registered_domain=registered_domain):
            reasons.append("Brand impersonation pattern detected in link")
            score += 18

        if ACTION_PATH_RE.search(parsed.path or ""):
            reasons.append("Phishing-style action path detected")
            score += 10

        if not reasons:
            return None

        return LinkFinding(
            url=candidate,
            domain=registered_domain or host,
            reasons=list(dict.fromkeys(reasons)),
            score=min(score, 35),
        )

    def _is_ip_address(self, host: str) -> bool:
        try:
            ip_address(host)
            return True
        except ValueError:
            return False

    def _looks_like_brand_impersonation(self, *, host: str, registered_domain: str) -> bool:
        for brand in self.phishing_brands:
            if brand not in host:
                continue
            if registered_domain in TRUSTED_BRAND_DOMAINS:
                return False
            return True
        return False
