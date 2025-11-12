import argparse
import os
import pandas as pd
import joblib
from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support, confusion_matrix


def load_dataset(path):
    df = pd.read_csv(path)
    if 'text' not in df.columns or 'label' not in df.columns:
        raise ValueError('Dataset must contain columns: text,label')
    y_true = df['label'].astype(str).str.lower().map({'spam': 1, 'ham': 0})
    if y_true.isna().any():
        raise ValueError('Labels must be "spam" or "ham"')
    X = df['text'].astype(str).tolist()
    y = y_true.astype(int).tolist()
    return X, y


def main(args):
    if not os.path.exists(args.model):
        raise FileNotFoundError(f"Model not found at {args.model}")
    model = joblib.load(args.model)

    X, y_true = load_dataset(args.data)
    y_pred = model.predict(X)

    acc = accuracy_score(y_true, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='binary', zero_division=0)
    cm = confusion_matrix(y_true, y_pred).tolist()

    print("=== Metrics ===")
    print(f"accuracy: {acc:.4f}")
    print(f"precision: {precision:.4f}")
    print(f"recall: {recall:.4f}")
    print(f"f1: {f1:.4f}")
    print("confusion_matrix [ [tn, fp], [fn, tp] ]:")
    print(cm)
    print("\nclassification_report:\n")
    print(classification_report(y_true, y_pred, digits=4, target_names=['ham', 'spam']))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', type=str, required=True, help='Path to CSV with columns text,label')
    parser.add_argument('--model', type=str, default='ml/spam_model.joblib', help='Path to trained model .joblib')
    args = parser.parse_args()
    main(args)
