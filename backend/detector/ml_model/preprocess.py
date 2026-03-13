from __future__ import annotations

import re

from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS


URL_RE = re.compile(r"https?://\S+|www\.\S+")
EMAIL_RE = re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b")
PHONE_RE = re.compile(r"\b(?:\+?\d[\d\s().-]{7,}\d)\b")
NUMBER_RE = re.compile(r"\b\d+\b")
TOKEN_RE = re.compile(r"[a-zA-Z']+")


class MessagePreprocessor:
    def __init__(self) -> None:
        self.stemmer = PorterStemmer()
        # Keep negations because they carry useful meaning for safety messages.
        self.stop_words = set(ENGLISH_STOP_WORDS) - {"no", "not", "nor"}

    def normalize(self, text: str) -> str:
        normalized = text.lower()
        normalized = URL_RE.sub(" urltoken ", normalized)
        normalized = EMAIL_RE.sub(" emailtoken ", normalized)
        normalized = PHONE_RE.sub(" phonetoken ", normalized)
        normalized = NUMBER_RE.sub(" numbertoken ", normalized)
        return normalized

    def tokenize(self, text: str) -> list[str]:
        normalized = self.normalize(text)
        tokens = []
        for token in TOKEN_RE.findall(normalized):
            if token in self.stop_words:
                continue
            tokens.append(self.stemmer.stem(token))
        return tokens

    def __call__(self, text: str) -> str:
        return " ".join(self.tokenize(text))


preprocessor = MessagePreprocessor()


def preprocess_text(text: str) -> str:
    return preprocessor(text)
