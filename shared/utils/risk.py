from __future__ import annotations


def clamp_probability(value: float) -> float:
    return round(max(0.0, min(0.99, value)), 4)


def score_from_probability(value: float) -> int:
    return int(round(clamp_probability(value) * 100))


def risk_level_from_score(score: int) -> str:
    if score >= 75:
        return "High"
    if score >= 45:
        return "Medium"
    return "Low"
