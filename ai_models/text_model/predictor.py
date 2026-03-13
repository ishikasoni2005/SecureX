from __future__ import annotations

import pickle
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from ai_models.text_model.bootstrap import ensure_model_artifact


MODEL_PATH = Path(__file__).resolve().with_name("model.pkl")


@dataclass(frozen=True)
class ModelPrediction:
    fraud_probability: float
    reasons: list[str]


class FraudTextPredictor:
    def __init__(self, model_path: Path = MODEL_PATH) -> None:
        self.model_path = model_path
        self._pipeline = None

    @property
    def pipeline(self):
        if self._pipeline is None:
            self._pipeline = self._load_pipeline()
        return self._pipeline

    def _load_pipeline(self):
        ensure_model_artifact(self.model_path)
        try:
            with self.model_path.open("rb") as file_pointer:
                artifact = pickle.load(file_pointer)
        except Exception:
            ensure_model_artifact(self.model_path, force_retrain=True)
            with self.model_path.open("rb") as file_pointer:
                artifact = pickle.load(file_pointer)

        if isinstance(artifact, dict) and "model" in artifact:
            return artifact["model"]
        return artifact

    def predict(self, text: str) -> ModelPrediction:
        probabilities = self.pipeline.predict_proba([text])[0]
        classifier = self.pipeline.named_steps["classifier"]
        class_labels = list(classifier.classes_)
        fraud_index = class_labels.index(1)
        fraud_probability = float(probabilities[fraud_index])

        vectorizer = self.pipeline.named_steps["vectorizer"]
        transformed = vectorizer.transform([text])
        feature_names = vectorizer.get_feature_names_out()
        active_feature_indexes = transformed.nonzero()[1]

        contributions: list[tuple[str, float]] = []
        for feature_index in active_feature_indexes:
            contribution = transformed[0, feature_index] * classifier.coef_[0][feature_index]
            contributions.append((feature_names[feature_index], float(contribution)))

        return ModelPrediction(
            fraud_probability=round(fraud_probability, 4),
            reasons=self._build_reasons(
                fraud_probability=fraud_probability,
                contributions=contributions,
            ),
        )

    def _build_reasons(
        self,
        *,
        fraud_probability: float,
        contributions: list[tuple[str, float]],
    ) -> list[str]:
        if fraud_probability >= 0.5:
            ranked = sorted(
                (item for item in contributions if item[1] > 0),
                key=lambda item: item[1],
                reverse=True,
            )
            top_terms = [term for term, _score in ranked[:3]]
            if top_terms:
                return [
                    "ML model detected fraud-linked language patterns.",
                    f"Model highlighted risky terms such as {', '.join(top_terms)}.",
                ]
            return ["ML model detected fraud-linked language patterns."]

        ranked = sorted(
            (item for item in contributions if item[1] < 0),
            key=lambda item: item[1],
        )
        top_terms = [term for term, _score in ranked[:3]]
        if top_terms:
            return [
                "ML model found mostly benign patterns.",
                f"Lower-risk language cues included {', '.join(top_terms)}.",
            ]
        return ["ML model found mostly benign patterns."]


@lru_cache(maxsize=1)
def get_text_predictor() -> FraudTextPredictor:
    return FraudTextPredictor()
