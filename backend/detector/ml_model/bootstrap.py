from __future__ import annotations

import pickle
from datetime import datetime, timezone
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from .preprocess import preprocess_text


MODEL_PATH = Path(__file__).with_name("model.pkl")


TRAINING_SAMPLES: list[tuple[str, int]] = [
    ("Urgent: your bank account has been frozen. Verify your login here now.", 1),
    ("Congratulations! You won a free iPhone. Claim your prize today.", 1),
    ("Final warning: pay your tax penalty immediately to avoid arrest.", 1),
    ("Click this secure link to confirm your payroll password before noon.", 1),
    ("Your package is waiting, but customs fees must be paid with a gift card.", 1),
    ("Account suspended. Update your credit card details to restore access.", 1),
    ("Your Netflix password expired. Log in now to keep streaming.", 1),
    ("We detected unusual activity. Enter your OTP to secure your wallet.", 1),
    ("Your CEO needs you to buy six gift cards and send the codes right away.", 1),
    ("You have an unpaid toll. Avoid extra charges by paying from this link.", 1),
    ("Claim your lottery winnings now by sharing your bank account number.", 1),
    ("Your mailbox storage is full. Re-enter your email password to unlock it.", 1),
    ("Bitcoin investment doubled overnight. Deposit today for guaranteed profit.", 1),
    ("Confirm your social security number to release your pending benefit.", 1),
    ("Act immediately or your WhatsApp account will be disabled permanently.", 1),
    ("A hacker accessed your account. Reset it here and confirm your recovery phrase.", 1),
    ("The payment failed. Reply with your debit card PIN to process again.", 1),
    ("Police complaint filed against you. Call now to settle the case.", 1),
    ("Winner selected! Pay the registration fee to collect your cash reward.", 1),
    ("Remote job approved. Send your ID and banking password for onboarding.", 1),
    ("Need help with the sprint demo deck before tomorrow's leadership review?", 0),
    ("Dinner is at 8 pm. Let me know if you want me to order something extra.", 0),
    ("The bank OTP for your card payment is 482913. Do not share this code.", 0),
    ("Your electricity bill for February was paid successfully. Receipt attached.", 0),
    ("Can we move the design critique to Friday afternoon instead?", 0),
    ("Team reminder: submit expense reports before the end of the week.", 0),
    ("Your Amazon order has shipped and will arrive on Tuesday.", 0),
    ("Please review the updated incident response checklist when you have time.", 0),
    ("The dentist appointment is confirmed for 10:30 AM on Monday.", 0),
    ("Your GitHub sign-in code is 719204. Enter it only in the GitHub app.", 0),
    ("Thanks for the interview today. We will follow up with next steps soon.", 0),
    ("Parking slot B14 is reserved for your visitor from 2 PM onward.", 0),
    ("Lunch with the client is booked at 1 PM near the office.", 0),
    ("Weekly backup completed successfully with no critical alerts.", 0),
    ("Your ride to the airport is arriving in 4 minutes.", 0),
    ("The server maintenance window starts tonight at 11 PM UTC.", 0),
    ("Mom asked if you can pick up groceries on your way back home.", 0),
    ("Reminder: never share your banking PIN or password with anyone.", 0),
    ("The meeting link for today's security workshop is in the calendar invite.", 0),
    ("We received your support request and assigned ticket SX-2048.", 0),
]


def build_pipeline() -> Pipeline:
    return Pipeline(
        steps=[
            (
                "vectorizer",
                TfidfVectorizer(
                    preprocessor=preprocess_text,
                    lowercase=False,
                    ngram_range=(1, 2),
                    sublinear_tf=True,
                    max_features=4000,
                ),
            ),
            (
                "classifier",
                LogisticRegression(
                    max_iter=3000,
                    solver="liblinear",
                    class_weight="balanced",
                    random_state=42,
                ),
            ),
        ]
    )


def train_model() -> Pipeline:
    texts = [text for text, _label in TRAINING_SAMPLES]
    labels = [label for _text, label in TRAINING_SAMPLES]
    pipeline = build_pipeline()
    pipeline.fit(texts, labels)
    return pipeline


def ensure_model_artifact(
    model_path: Path = MODEL_PATH,
    force_retrain: bool = False,
) -> Path:
    if model_path.exists() and not force_retrain:
        return model_path

    artifact = {
        "model": train_model(),
        "metadata": {
            "name": "SecureX Scam Detector",
            "version": "1.0.0",
            "trained_at": datetime.now(timezone.utc).isoformat(),
            "samples": len(TRAINING_SAMPLES),
        },
    }

    model_path.parent.mkdir(parents=True, exist_ok=True)
    with model_path.open("wb") as file_pointer:
        pickle.dump(artifact, file_pointer)

    return model_path
