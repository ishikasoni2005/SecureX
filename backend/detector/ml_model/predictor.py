from __future__ import annotations

import pickle
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from .bootstrap import ensure_model_artifact


MODEL_PATH = Path(__file__).with_name("model.pkl")


@dataclass(frozen=True)
class PredictionResult:
    classification: str
    confidence: float
    explanation: str


class ScamPredictor:
    def __init__(self, model_path: Path = MODEL_PATH) -> None:
        self.model_path = model_path
        self._pipeline = None

    def _load_pipeline(self):
        ensure_model_artifact(self.model_path)
        with self.model_path.open("rb") as file_pointer:
            artifact = pickle.load(file_pointer)

        if isinstance(artifact, dict) and "model" in artifact:
            return artifact["model"]
        return artifact

    @property
    def pipeline(self):
        if self._pipeline is None:
            self._pipeline = self._load_pipeline()
        return self._pipeline

    def predict(self, text: str) -> PredictionResult:
        probabilities = self.pipeline.predict_proba([text])[0]
        classifier = self.pipeline.named_steps["classifier"]
        class_labels = list(classifier.classes_)
        scam_index = class_labels.index(1)

        scam_probability = float(probabilities[scam_index])
        classification = "Scam" if scam_probability >= 0.5 else "Not Scam"
        confidence = scam_probability if classification == "Scam" else 1 - scam_probability
        explanation = self._build_explanation(text=text, scam_probability=scam_probability)

        return PredictionResult(
            classification=classification,
            confidence=round(confidence, 4),
            explanation=explanation,
        )

    def _build_explanation(self, text: str, scam_probability: float) -> str:
        vectorizer = self.pipeline.named_steps["vectorizer"]
        classifier = self.pipeline.named_steps["classifier"]
        transformed = vectorizer.transform([text])
        feature_names = vectorizer.get_feature_names_out()
        active_feature_indexes = transformed.nonzero()[1]

        scored_features = []
        for feature_index in active_feature_indexes:
            contribution = transformed[0, feature_index] * classifier.coef_[0][feature_index]
            scored_features.append((feature_names[feature_index], float(contribution)))

        if scam_probability >= 0.5:
            ranked = sorted(
                (item for item in scored_features if item[1] > 0),
                key=lambda item: item[1],
                reverse=True,
            )
            top_terms = [term for term, _score in ranked[:3]]
            if top_terms:
                joined_terms = ", ".join(top_terms)
                return (
                    "SecureX found scam-like signals in the language, especially around "
                    f"{joined_terms}. The message also matches patterns commonly used in "
                    "urgent phishing or impersonation attacks."
                )
            return (
                "SecureX found suspicious urgency and social-engineering patterns that are "
                "commonly associated with phishing and scam campaigns."
            )

        ranked = sorted(
            (item for item in scored_features if item[1] < 0),
            key=lambda item: item[1],
        )
        top_terms = [term for term, _score in ranked[:3]]
        if top_terms:
            joined_terms = ", ".join(top_terms)
            return (
                "SecureX found more legitimate conversational patterns, including "
                f"{joined_terms}, and fewer cues linked to credential theft, payment fraud, "
                "or artificial urgency."
            )

        return (
            "SecureX did not find strong scam indicators in the message. It appears closer "
            "to everyday communication than to phishing language."
        )


@lru_cache(maxsize=1)
def get_predictor() -> ScamPredictor:
    return ScamPredictor()
