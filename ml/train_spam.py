import argparse
import os
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from sklearn.utils.class_weight import compute_class_weight
from langdetect import detect
import joblib


def detect_language(text):
    try:
        return detect(text)
    except Exception:
        return 'unk'


def load_dataset(path):
    df = pd.read_csv(path)
    # Expect columns: text, label. Optional: lang
    if 'text' not in df.columns or 'label' not in df.columns:
        raise ValueError('Dataset must contain columns: text,label')
    if 'lang' not in df.columns:
        df['lang'] = df['text'].astype(str).apply(detect_language)
    return df


def build_pipeline():
    # Char n-grams are strong for multilingual spam detection
    vectorizer = TfidfVectorizer(
        analyzer='char',
        ngram_range=(3, 5),
        min_df=3,
        max_features=200000,
        lowercase=True
    )
    clf = LinearSVC(C=1.0)
    return Pipeline([
        ('tfidf', vectorizer),
        ('clf', clf)
    ])


def main(args):
    df = load_dataset(args.data)
    # Map labels to binary: spam=1 ham=0 (case-insensitive)
    df['y'] = df['label'].astype(str).str.lower().map({'spam': 1, 'ham': 0})
    if df['y'].isna().any():
        raise ValueError('Labels must be "spam" or "ham"')

    X = df['text'].astype(str)
    y = df['y'].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipeline = build_pipeline()

    # Handle imbalance
    class_weights = compute_class_weight(
        class_weight='balanced', classes=[0, 1], y=y_train
    )
    class_weight_dict = {0: class_weights[0], 1: class_weights[1]}

    # LinearSVC does not take class_weight in fit_params directly via Pipeline; set on estimator
    pipeline.named_steps['clf'].class_weight = class_weight_dict

    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    print(classification_report(y_test, y_pred, digits=4))

    os.makedirs(os.path.dirname(args.model), exist_ok=True) if os.path.dirname(args.model) else None
    joblib.dump(pipeline, args.model)
    print(f"Saved model to {args.model}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', type=str, required=True, help='Path to spam.csv with columns text,label[,lang]')
    parser.add_argument('--model', type=str, default='spam_model.joblib', help='Output model path')
    args = parser.parse_args()
    main(args)


