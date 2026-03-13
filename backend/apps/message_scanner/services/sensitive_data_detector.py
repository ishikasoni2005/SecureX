from __future__ import annotations

import re
from dataclasses import asdict, dataclass


CARD_RE = re.compile(r"\b(?:\d[ -]?){13,19}\b")
AADHAAR_RE = re.compile(r"\b\d{4}[ -]?\d{4}[ -]?\d{4}\b")
BANK_ACCOUNT_RE = re.compile(
    r"(?i)(?:bank(?:\s+account)?|a/c|acct|account(?:\s+number)?)\D{0,12}(\d[\d -]{6,20}\d)"
)
OTP_RE = re.compile(
    r"(?i)(?:otp|one time password|one-time password|verification code|passcode|security code)"
    r"\D{0,10}(\d{4,8})"
)
PASSWORD_RE = re.compile(
    r"(?i)\b(?:password|passcode|pwd)\b\s*(?:is|:|=)?\s*([^\s,;]+)"
)


@dataclass(frozen=True)
class SensitiveFinding:
    type: str
    masked_value: str
    warning: str

    def to_dict(self) -> dict[str, str]:
        return asdict(self)


@dataclass(frozen=True)
class SensitiveScanResult:
    masked_text: str
    warnings: list[str]
    findings: list[SensitiveFinding]


@dataclass(frozen=True)
class Replacement:
    start: int
    end: int
    replacement: str
    finding: SensitiveFinding


class SensitiveDataDetector:
    def scan(self, text: str) -> SensitiveScanResult:
        replacements: list[Replacement] = []

        for match in CARD_RE.finditer(text):
            digits = re.sub(r"\D", "", match.group(0))
            if 13 <= len(digits) <= 19 and self._passes_luhn(digits):
                self._append_replacement(
                    replacements,
                    Replacement(
                        start=match.start(),
                        end=match.end(),
                        replacement=self._mask_preserving_format(match.group(0), keep_last=4),
                        finding=SensitiveFinding(
                            type="Credit Card",
                            masked_value=self._mask_digits(digits, keep_last=4, grouped=True),
                            warning="Sensitive data detected: possible credit card number.",
                        ),
                    ),
                )

        for match in AADHAAR_RE.finditer(text):
            if self._overlaps_existing(replacements, match.start(), match.end()):
                continue
            digits = re.sub(r"\D", "", match.group(0))
            if len(digits) == 12:
                self._append_replacement(
                    replacements,
                    Replacement(
                        start=match.start(),
                        end=match.end(),
                        replacement=self._mask_digits(digits, keep_last=4, grouped=True),
                        finding=SensitiveFinding(
                            type="Aadhaar",
                            masked_value=self._mask_digits(digits, keep_last=4, grouped=True),
                            warning="Sensitive data detected: possible Aadhaar number.",
                        ),
                    ),
                )

        for match in BANK_ACCOUNT_RE.finditer(text):
            account_value = match.group(1)
            start = match.start(1)
            end = match.end(1)
            digits = re.sub(r"\D", "", account_value)
            if 8 <= len(digits) <= 18 and not self._overlaps_existing(replacements, start, end):
                self._append_replacement(
                    replacements,
                    Replacement(
                        start=start,
                        end=end,
                        replacement=self._mask_preserving_format(account_value, keep_last=4),
                        finding=SensitiveFinding(
                            type="Bank Account",
                            masked_value=self._mask_digits(digits, keep_last=4),
                            warning="Sensitive data detected: possible bank account number.",
                        ),
                    ),
                )

        for match in OTP_RE.finditer(text):
            code = match.group(1)
            start = match.start(1)
            end = match.end(1)
            if not self._overlaps_existing(replacements, start, end):
                self._append_replacement(
                    replacements,
                    Replacement(
                        start=start,
                        end=end,
                        replacement="*" * len(code),
                        finding=SensitiveFinding(
                            type="OTP Code",
                            masked_value="*" * len(code),
                            warning="Sensitive data detected: possible OTP or verification code.",
                        ),
                    ),
                )

        for match in PASSWORD_RE.finditer(text):
            password_value = match.group(1)
            start = match.start(1)
            end = match.end(1)
            if not self._overlaps_existing(replacements, start, end):
                self._append_replacement(
                    replacements,
                    Replacement(
                        start=start,
                        end=end,
                        replacement="*" * max(8, len(password_value)),
                        finding=SensitiveFinding(
                            type="Password",
                            masked_value="********",
                            warning="Sensitive data detected: possible password or passcode.",
                        ),
                    ),
                )

        masked_text = self._apply_replacements(text=text, replacements=replacements)
        findings = [replacement.finding for replacement in replacements]
        warnings = list(dict.fromkeys(finding.warning for finding in findings))
        return SensitiveScanResult(masked_text=masked_text, warnings=warnings, findings=findings)

    def _append_replacement(
        self,
        replacements: list[Replacement],
        replacement: Replacement,
    ) -> None:
        if self._overlaps_existing(replacements, replacement.start, replacement.end):
            return
        replacements.append(replacement)

    def _overlaps_existing(
        self,
        replacements: list[Replacement],
        start: int,
        end: int,
    ) -> bool:
        return any(not (end <= item.start or start >= item.end) for item in replacements)

    def _apply_replacements(self, text: str, replacements: list[Replacement]) -> str:
        if not replacements:
            return text

        masked_chunks: list[str] = []
        last_index = 0
        for replacement in sorted(replacements, key=lambda item: item.start):
            masked_chunks.append(text[last_index:replacement.start])
            masked_chunks.append(replacement.replacement)
            last_index = replacement.end
        masked_chunks.append(text[last_index:])
        return "".join(masked_chunks)

    def _passes_luhn(self, digits: str) -> bool:
        checksum = 0
        parity = len(digits) % 2
        for index, digit in enumerate(digits):
            current = int(digit)
            if index % 2 == parity:
                current *= 2
                if current > 9:
                    current -= 9
            checksum += current
        return checksum % 10 == 0

    def _mask_preserving_format(self, value: str, keep_last: int = 4) -> str:
        digits = [character for character in value if character.isdigit()]
        digits_to_mask = max(0, len(digits) - keep_last)
        masked_value: list[str] = []

        for character in value:
            if character.isdigit() and digits_to_mask > 0:
                masked_value.append("*")
                digits_to_mask -= 1
            else:
                masked_value.append(character)

        return "".join(masked_value)

    def _mask_digits(
        self,
        digits: str,
        keep_last: int = 4,
        grouped: bool = False,
    ) -> str:
        visible = digits[-keep_last:] if keep_last else ""
        hidden = "*" * max(0, len(digits) - keep_last)
        masked = f"{hidden}{visible}"
        if grouped:
            return " ".join(masked[index:index + 4] for index in range(0, len(masked), 4))
        return masked
