# SecureX

SecureX is a full-stack AI-powered web application that detects scam and phishing-style text
messages in real time. Users paste a message into the React frontend, the Django API runs a
scikit-learn NLP classifier, and the app returns:

- `classification`
- `confidence`
- `explanation`

The system is privacy-focused by design: message text is processed in memory only and is not
stored in SQLite.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios
- Backend: Django, Django REST Framework, django-cors-headers
- AI / NLP: scikit-learn, nltk, pickle
- Database: SQLite

## Project Structure

```text
SecureX/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── securex/
│   └── detector/
│       ├── views.py
│       ├── urls.py
│       ├── serializers.py
│       └── ml_model/
│           ├── bootstrap.py
│           ├── preprocess.py
│           └── predictor.py
└── frontend/
    ├── package.json
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── services/
    └── tailwind.config.js
```

## API

### `POST /api/detect/`

Request:

```json
{
  "text": "Your bank account will be suspended unless you verify it now."
}
```

Response:

```json
{
  "classification": "Scam",
  "confidence": 0.8734,
  "explanation": "SecureX found scam-like signals in the language..."
}
```

`POST /api/detect-scam/` is also available as an alias.

## Backend Setup

1. Create and activate a virtual environment:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Apply migrations:

```bash
python manage.py migrate
```

4. Generate the bundled ML artifact:

```bash
python manage.py train_detector_model
```

5. Run the API:

```bash
python manage.py runserver
```

The backend runs at `http://127.0.0.1:8000`.

## Frontend Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the development server:

```bash
npm run dev
```

The frontend runs at `http://127.0.0.1:5173`.

## Environment Variables

### Backend

Use `backend/.env.example` as a reference:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `DJANGO_CORS_ALLOWED_ORIGINS`

### Frontend

Use `frontend/.env.example`:

- `VITE_API_BASE_URL`

## ML Model Notes

- `preprocess.py` normalizes URLs, emails, phone numbers, and stems tokens with `nltk`.
- `bootstrap.py` trains a lightweight `TfidfVectorizer + LogisticRegression` pipeline.
- `predictor.py` loads `model.pkl` via `pickle`, scores scam probability, and generates a
  short explanation from feature contributions.

If `model.pkl` is missing, SecureX can automatically generate it on first use after the Python
dependencies are installed.

## Production Notes

- Disable `DJANGO_DEBUG` in production.
- Replace `DJANGO_SECRET_KEY` with a strong unique secret.
- Set strict `DJANGO_ALLOWED_HOSTS` and `DJANGO_CORS_ALLOWED_ORIGINS`.
- Serve the React build through your preferred static hosting or reverse proxy.
- Run `python manage.py collectstatic` if you later add backend-served static assets.
