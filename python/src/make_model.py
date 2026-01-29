# ===============================
# make_model.py (SAFE PATHS)
# ===============================

import pickle
import numpy as np
import pandas as pd
from pathlib import Path

# -------------------------------
# BASE PATHS (ABSOLUTE)
# -------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent   # project/python/
MODELS_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"

# -------------------------------
# LOAD MODELS (ONCE)
# -------------------------------
with open(MODELS_DIR / "lda_model.pkl", "rb") as f:
    lda_model = pickle.load(f)

with open(MODELS_DIR / "vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

FEATURE_NAMES = vectorizer.get_feature_names_out()

# -------------------------------
# 1) PREDICT TOPIC
# -------------------------------
def predict_topic(text: str, top_words: int = 10) -> dict:
    if not text or len(text.split()) < 80:
        raise ValueError("Text too short for reliable prediction")

    X = vectorizer.transform([text])
    topic_probs = lda_model.transform(X)[0]

    top2 = topic_probs.argsort()[-2:][::-1]

    topic_word_weights = lda_model.components_[top2[0]]
    top_indices = topic_word_weights.argsort()[-top_words:][::-1]
    keywords = [FEATURE_NAMES[i] for i in top_indices]

    return {
        "primary_topic": int(top2[0]),
        "primary_confidence": round(float(topic_probs[top2[0]]), 4),
        "secondary_topic": int(top2[1]),
        "secondary_confidence": round(float(topic_probs[top2[1]]), 4),
        "keywords": keywords,
        "topic_distribution": {
            f"topic_{i}": round(float(p), 4)
            for i, p in enumerate(topic_probs)
        }
    }

# -------------------------------
# 2) LOAD DATASET FOR TRENDS
# -------------------------------
DF = pd.read_csv(DATA_DIR / "processed" / "articles_with_topics.csv")
DF["published_at"] = pd.to_datetime(DF["published_at"], errors="coerce")

# -------------------------------
# 3) TOPIC TRENDS OVER TIME
# -------------------------------
def topic_trends(freq: str = "W") -> dict:
    d = DF.dropna(subset=["published_at", "dominant_topic"]).copy()
    d["time_bin"] = d["published_at"].dt.to_period(freq).astype(str)

    counts = (
        d.groupby(["time_bin", "dominant_topic"])
        .size()
        .unstack(fill_value=0)
        .sort_index()
    )

    share = counts.div(counts.sum(axis=1), axis=0)

    return {
        "counts": counts.to_dict(),
        "share": share.round(4).to_dict()
    }

# -------------------------------
# 4) EMERGING TOPICS
# -------------------------------
def emerging_topics(freq: str = "W", window: int = 4) -> list[dict]:
    d = DF.dropna(subset=["published_at", "dominant_topic"]).copy()
    d["time_bin"] = d["published_at"].dt.to_period(freq).astype(str)

    counts = (
        d.groupby(["time_bin", "dominant_topic"])
        .size()
        .unstack(fill_value=0)
        .sort_index()
    )

    if len(counts) < 2 * window:
        return []

    recent = counts.tail(window).sum()
    prev = counts.tail(2 * window).head(window).sum()

    growth = (recent + 1) / (prev + 1)

    return sorted(
        [
            {
                "topic": int(t),
                "recent": int(recent[t]),
                "previous": int(prev[t]),
                "growth_ratio": round(float(growth[t]), 3),
            }
            for t in counts.columns
        ],
        key=lambda x: x["growth_ratio"],
        reverse=True,
    )

# -------------------------------
# 5) TOP ARTICLES FOR A TOPIC
# -------------------------------
def top_articles(topic_id: int, n: int = 5) -> list[dict]:
    d = DF[DF["dominant_topic"] == topic_id].sort_values(
        "published_at", ascending=False
    ).head(n)

    return [
        {
            "title": r["title"],
            "url": r["url"],
            "published_at": (
                r["published_at"].isoformat()
                if pd.notna(r["published_at"]) else None
            ),
            "confidence": float(r.get("topic_confidence", 0.0)),
        }
        for _, r in d.iterrows()
    ]
# ===============================
# make_model.py (SAFE PATHS)
# ===============================

import pickle
import numpy as np
import pandas as pd
from pathlib import Path

# -------------------------------
# BASE PATHS (ABSOLUTE)
# -------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent   # project/python/
MODELS_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"

# -------------------------------
# LOAD MODELS (ONCE)
# -------------------------------
with open(MODELS_DIR / "lda_model.pkl", "rb") as f:
    lda_model = pickle.load(f)

with open(MODELS_DIR / "vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

FEATURE_NAMES = vectorizer.get_feature_names_out()

# -------------------------------
# 1) PREDICT TOPIC
# -------------------------------
def predict_topic(text: str, top_words: int = 10) -> dict:
    if not text or len(text.split()) < 80:
        raise ValueError("Text too short for reliable prediction")

    X = vectorizer.transform([text])
    topic_probs = lda_model.transform(X)[0]

    top2 = topic_probs.argsort()[-2:][::-1]

    topic_word_weights = lda_model.components_[top2[0]]
    top_indices = topic_word_weights.argsort()[-top_words:][::-1]
    keywords = [FEATURE_NAMES[i] for i in top_indices]

    return {
        "primary_topic": int(top2[0]),
        "primary_confidence": round(float(topic_probs[top2[0]]), 4),
        "secondary_topic": int(top2[1]),
        "secondary_confidence": round(float(topic_probs[top2[1]]), 4),
        "keywords": keywords,
        "topic_distribution": {
            f"topic_{i}": round(float(p), 4)
            for i, p in enumerate(topic_probs)
        }
    }

# -------------------------------
# 2) LOAD DATASET FOR TRENDS
# -------------------------------
DF = pd.read_csv(DATA_DIR / "processed" / "articles_with_topics.csv")
DF["published_at"] = pd.to_datetime(DF["published_at"], errors="coerce")

def topic_trends(freq: str = "W") -> dict:
    d = DF.copy()

    # FORCE datetime conversion (critical)
    d["published_at"] = pd.to_datetime(d["published_at"], errors="coerce")

    # Drop invalid rows
    d = d.dropna(subset=["published_at", "dominant_topic"])

    if d.empty:
        return {"counts": {}, "share": {}}

    d["time_bin"] = d["published_at"].dt.to_period(freq).astype(str)

    counts = (
        d.groupby(["time_bin", "dominant_topic"])
         .size()
         .unstack(fill_value=0)
         .sort_index()
    )

    share = counts.div(counts.sum(axis=1), axis=0)

    return {
        "counts": counts.to_dict(),
        "share": share.round(4).to_dict()
    }

# -------------------------------
# 4) EMERGING TOPICS
# -------------------------------
def emerging_topics(freq: str = "W", window: int = 4) -> list[dict]:
    d = DF.dropna(subset=["published_at", "dominant_topic"]).copy()
    d["time_bin"] = d["published_at"].dt.to_period(freq).astype(str)

    counts = (
        d.groupby(["time_bin", "dominant_topic"])
        .size()
        .unstack(fill_value=0)
        .sort_index()
    )

    if len(counts) < 2 * window:
        return []

    recent = counts.tail(window).sum()
    prev = counts.tail(2 * window).head(window).sum()

    growth = (recent + 1) / (prev + 1)

    return sorted(
        [
            {
                "topic": int(t),
                "recent": int(recent[t]),
                "previous": int(prev[t]),
                "growth_ratio": round(float(growth[t]), 3),
            }
            for t in counts.columns
        ],
        key=lambda x: x["growth_ratio"],
        reverse=True,
    )

# -------------------------------
# 5) TOP ARTICLES FOR A TOPIC
# -------------------------------
def top_articles(topic_id: int, n: int = 5) -> list[dict]:
    d = DF[DF["dominant_topic"] == topic_id].sort_values(
        "published_at", ascending=False
    ).head(n)

    return [
        {
            "title": r["title"],
            "url": r["url"],
            "published_at": (
                r["published_at"].isoformat()
                if pd.notna(r["published_at"]) else None
            ),
            "confidence": float(r.get("topic_confidence", 0.0)),
        }
        for _, r in d.iterrows()
    ]
