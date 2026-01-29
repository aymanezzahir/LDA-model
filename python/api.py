# api.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from functions.UTJ import UTJ

# Import your ML/trends functions
from src.make_model import predict_topic, emerging_topics, topic_trends, top_articles
from functions.getArticleBody import getArticleBody

app = FastAPI(title="Topic Prediction API", version="1.0.0")

# CORS (React dev servers)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Schemas
# -----------------------------
class PredictRequest(BaseModel):
    url: str = Field(..., min_length=1, max_length=20000)
    # optional: allow direct text for debugging (you can remove later)
    text: str | None = Field(default=None, max_length=200000)


# -----------------------------
# Health
# -----------------------------
@app.get("/health")
def health():
    return {"status": "ok"}


# -----------------------------
# Predict
# -----------------------------
@app.post("/predict")
def predict(req: PredictRequest):
    """
    Predict topic from:
    - url: validate/parse with UTJ
    - text: optional direct text prediction (recommended for debugging)
    """
    analysis = UTJ(req.url)
    text_content = getArticleBody(analysis)
    if not analysis.get("valid"):
        raise HTTPException(status_code=400, detail=analysis.get("error", "Invalid URL"))

    # If client provides text, run prediction immediately
    # (Later you can replace this by scraping the URL and passing scraped text)
    if text_content:
        try:
            pred = predict_topic(text_content)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        pred = None

    return {
      
        "prediction": pred,
    }


# -----------------------------
# Trends: emerging topics
# -----------------------------
@app.get("/trends/topics")
def trends_topics(freq: str = "W", window: int = 4):
    try:
        return {"freq": freq, "window": window, "items": emerging_topics(freq=freq, window=window)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# -----------------------------
# Trends: topic series (counts/share)
# -----------------------------
@app.get("/trends/series")
def trends_series(freq: str = "W"):
    try:
        return {"freq": freq, **topic_trends(freq=freq)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# -----------------------------
# Topic details: recent articles
# -----------------------------
@app.get("/topics/{topic_id}/articles")
def topic_articles(topic_id: int, n: int = 5):
    try:
        return {"topic": topic_id, "items": top_articles(topic_id=topic_id, n=n)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
