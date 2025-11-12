import argparse
import os
import random
import re
from typing import List

import pandas as pd
from langdetect import detect


def detect_language_safe(text: str) -> str:
    try:
        return detect(text)
    except Exception:
        return 'unk'


def normalize_text(t: str) -> str:
    # Lowercase, collapse whitespace, remove surrounding punctuation noise
    t = (t or '').strip().lower()
    t = re.sub(r"\s+", " ", t)
    return t


def load_csv(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    if 'text' not in df.columns or 'label' not in df.columns:
        raise ValueError(f'{path} must contain columns: text,label')
    # Normalize labels to {ham, spam}
    df['label'] = df['label'].astype(str).str.lower().map({'ham': 'ham', 'spam': 'spam'})
    if df['label'].isna().any():
        raise ValueError(f'{path} has labels outside of {"ham","spam"}')
    df['text'] = df['text'].astype(str)
    if 'lang' not in df.columns:
        df['lang'] = df['text'].apply(detect_language_safe)
    return df[['text', 'label', 'lang']]


LEET_MAP = str.maketrans({'a':'@','e':'3','i':'1','o':'0','s':'$'})
EMOJIS = ['🙂','😉','✅','🔥','💰','💥','📣','🚀','🤑','✨']
PUNCT = ['!!!','!!','!?','...']


def augment_text_basic(text: str) -> List[str]:
    augments = []
    if len(text) < 6:
        return augments
    # leetspeak variant
    aug_leet = text.translate(LEET_MAP)
    if aug_leet != text:
        augments.append(aug_leet)
    # punctuation emphasis
    aug_punct = text + ' ' + random.choice(PUNCT)
    augments.append(aug_punct)
    # emoji tail
    aug_emoji = text + ' ' + random.choice(EMOJIS)
    augments.append(aug_emoji)
    # whitespace jitter
    aug_ws = re.sub(r" ", lambda _: '  ' if random.random() < 0.3 else ' ', text)
    augments.append(aug_ws)
    return augments


def balance_downsample(df: pd.DataFrame, seed: int) -> pd.DataFrame:
    counts = df['label'].value_counts()
    if counts.empty:
        return df
    min_count = counts.min()
    parts = [g.sample(n=min_count, random_state=seed) for _, g in df.groupby('label')]
    return pd.concat(parts, ignore_index=True).sample(frac=1.0, random_state=seed)


def balance_upsample(df: pd.DataFrame, seed: int) -> pd.DataFrame:
    counts = df['label'].value_counts()
    if counts.empty:
        return df
    max_count = counts.max()
    parts = []
    for label, g in df.groupby('label'):
        if len(g) == max_count:
            parts.append(g)
        else:
            reps = max_count // len(g)
            rem = max_count % len(g)
            parts.append(pd.concat([g] * reps + [g.sample(rem, random_state=seed)], ignore_index=True))
    return pd.concat(parts, ignore_index=True).sample(frac=1.0, random_state=seed)


def main(args):
    random.seed(args.seed)

    # Load and concat
    frames = [load_csv(p) for p in args.inputs]
    df = pd.concat(frames, ignore_index=True)

    # Filter by char length
    if args.min_chars or args.max_chars:
        df['len'] = df['text'].str.len()
        if args.min_chars:
            df = df[df['len'] >= args.min_chars]
        if args.max_chars:
            df = df[df['len'] <= args.max_chars]
        df = df.drop(columns=['len'])

    # Deduplicate by normalized text
    df['norm'] = df['text'].apply(normalize_text)
    df = df.drop_duplicates(subset=['norm']).drop(columns=['norm']).reset_index(drop=True)

    # Optional augmentation (applied only to minority or to all based on flag)
    if args.augment > 0:
        rows = []
        if args.augment_minority:
            counts = df['label'].value_counts()
            if not counts.empty:
                minority = counts.idxmin()
                source_df = df[df['label'] == minority]
            else:
                source_df = df
        else:
            source_df = df
        for _, r in source_df.iterrows():
            variants = augment_text_basic(r['text'])
            random.shuffle(variants)
            for v in variants[: args.augment]:
                rows.append({'text': v, 'label': r['label'], 'lang': r['lang']})
        if rows:
            df = pd.concat([df, pd.DataFrame(rows)], ignore_index=True)

    # Class balancing
    if args.balance == 'downsample':
        df = balance_downsample(df, args.seed)
    elif args.balance == 'upsample':
        df = balance_upsample(df, args.seed)

    # Shuffle and write
    df = df.sample(frac=1.0, random_state=args.seed).reset_index(drop=True)
    os.makedirs(os.path.dirname(args.output), exist_ok=True) if os.path.dirname(args.output) else None
    df.to_csv(args.output, index=False)
    print(f"Wrote {len(df)} rows to {args.output}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Prepare spam dataset (merge, dedup, augment, balance)')
    parser.add_argument('--inputs', nargs='+', required=True, help='Input CSVs (text,label[,lang])')
    parser.add_argument('--output', required=True, help='Output CSV path')
    parser.add_argument('--augment', type=int, default=0, help='Num augmentations per source row (0=off)')
    parser.add_argument('--augment-minority', action='store_true', help='Augment only minority class')
    parser.add_argument('--balance', choices=['none', 'downsample', 'upsample'], default='none')
    parser.add_argument('--min-chars', type=int, default=0)
    parser.add_argument('--max-chars', type=int, default=0)
    parser.add_argument('--seed', type=int, default=42)
    args = parser.parse_args()
    main(args)
