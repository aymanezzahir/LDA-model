# LDA - model

LDA is a topic discovery app that classifies tech articles and shows how topics trend over time. It pairs a FastAPI backend (LDA topic model + trend analytics) with a React Router frontend for search, trends, and topic stats.

## Features
- URL analysis + topic prediction for supported article sources (Dev.to, GitHub Resources, TechCrunch, and common tech blogs)
- Topic distribution and confidence scores
- Emerging topic detection and time-series trends
- Simple React UI for search and trend views

## Tech stack
- Backend: FastAPI, Pandas, NumPy, scikit-learn (LDA model), Selenium + BeautifulSoup (scraping)
- Frontend: React Router + Vite, TypeScript, Tailwind CSS

## Project layout
```
.
├── frontend/                # React Router UI
├── python/                  # FastAPI + ML model + data
│   ├── api.py               # API endpoints
│   ├── src/make_model.py    # LDA inference + trend helpers
│   ├── functions/           # URL parsing + scraping
│   ├── data/                # raw + processed datasets
│   └── models/              # pickled LDA + vectorizer
└── README.md
```

## Quickstart

### 1) Backend (FastAPI)
```bash
cd python
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

### 2) Frontend (React Router)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

## API
Base URL: `http://localhost:8000`

### Health
```bash
curl http://localhost:8000/health
```

### Predict topic from URL
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"url":"https://dev.to/..."}'
```

Response includes `primary_topic`, `secondary_topic`, confidence scores, keywords, and a full topic distribution.

### Trends
```bash
curl "http://localhost:8000/trends/series?freq=W"
curl "http://localhost:8000/trends/topics?freq=W&window=4"
```

### Topic details
```bash
curl "http://localhost:8000/topics/3/articles?n=5"
```

## Scraping requirements (for URL prediction)
URL-based prediction uses Selenium + Firefox in headless mode. Make sure you have:
- Firefox installed
- `geckodriver` available in your `PATH`
- Python packages `selenium` and `beautifulsoup4`

If scraping fails or the platform is unsupported, the API returns `prediction: null`.

## Notebooks
Exploration and model building live in `python/notebooks/`:
- data scraping
- cleaning/EDA
- LDA topic modeling

## Data & models
- Processed data: `python/data/processed/articles_with_topics.csv`
- LDA model + vectorizer: `python/models/`

## Notes
- The backend expects the processed dataset to be present.
- If you retrain the model, update the pickles in `python/models/`.
