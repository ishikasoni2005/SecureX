# SecureX

SecureX is a privacy-first fraud detection platform built with React and Django. It keeps the
original scam-message detector working, then expands the same in-memory analysis pipeline across:

- SMS and text messages
- call transcripts and optional WAV audio
- suspicious URLs and phishing pages
- e-commerce storefronts and checkout flows

SecureX never stores submitted analysis payloads in SQLite. Sensitive data is masked before model
inference, and every scanner returns an explainable risk decision.

## How SecureX Works Today

### Request flow

1. The React frontend bootstraps a CSRF cookie with `GET /api/csrf/`.
2. The user submits a scanner form from one of the pages:
   - `/message-scan`
   - `/call-scan`
   - `/website-scan`
   - `/dashboard` for storefront analysis
3. Axios sends a JSON request to the Django API.
4. Django routes the request through `ProtectedAnalysisView`, which:
   - validates JSON input with DRF serializers
   - enforces CSRF
   - rate limits clients to `100` requests per IP per hour
   - returns JSON errors without logging request-body content
5. The target module runs in-memory analysis and returns:
   - `classification`
   - `confidence`
   - `fraud_probability`
   - `risk_score`
   - `risk_level`
   - `explanation`
   - module-specific metadata such as masked text, link findings, transcript source, or SSL status

### ML model usage

- The shared text model lives under `ai_models/text_model/`.
- `bootstrap.py` trains a scikit-learn TF-IDF + logistic regression pipeline and persists
  `model.pkl`.
- `predictor.py` lazy-loads the pickled pipeline and returns both a fraud probability and a short
  explanation from weighted terms.
- The model is reused by:
  - message scanning
  - call transcript analysis
  - website text scoring
  - e-commerce text scoring

### Frontend-backend interaction

- `frontend/src/services/api.js` centralizes Axios calls and CSRF bootstrapping.
- `frontend/src/hooks/useScanner.js` standardizes loading, result, and error handling.
- Each page submits only the fields needed for its module and renders the shared
  `FraudScoreCard` result component.
- The browser never needs user accounts or authentication for fraud analysis.

### API endpoints

- `GET /api/csrf/`
- `GET /api/platform-overview/`
- `POST /api/detect/`
- `POST /api/detect-scam/`
- `POST /api/message-scan/`
- `POST /api/call-scan/`
- `POST /api/url-scan/`
- `POST /api/ecommerce-scan/`

The legacy `POST /api/detect/` and `POST /api/detect-scam/` routes still work and now map to the
new message-scanning module.

## Repository Architecture Map

```text
SecureX/
├── ai_models/
│   ├── phishing_model/
│   │   └── heuristics.py
│   ├── text_model/
│   │   ├── bootstrap.py
│   │   ├── predictor.py
│   │   └── preprocess.py
│   └── voice_model/
│       └── transcriber.py
├── backend/
│   ├── manage.py
│   ├── securex/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── fraud_detection/
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   ├── message_scanner/
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── services/
│   │   │       ├── detector.py
│   │   │       └── sensitive_data_detector.py
│   │   ├── call_scanner/
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── services/detector.py
│   │   ├── website_scanner/
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── services/detector.py
│   │   ├── ecommerce_detector/
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── services/detector.py
│   │   └── link_analyzer/
│   │       └── services/link_scanner.py
│   └── detector/
│       ├── tests.py
│       ├── urls.py
│       ├── views.py
│       └── management/commands/train_detector_model.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Analyzer.jsx
│   │   │   ├── ExplanationPanel.jsx
│   │   │   ├── FraudScoreCard.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ResultCard.jsx
│   │   │   ├── RiskIndicator.jsx
│   │   │   ├── dashboard/ModuleCard.jsx
│   │   │   └── scanners/
│   │   │       ├── AudioAnalyzer.jsx
│   │   │       └── URLAnalyzer.jsx
│   │   ├── hooks/
│   │   │   ├── useScanner.js
│   │   │   └── useTheme.js
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── MessageScanner.jsx
│   │   │   ├── Detect.jsx
│   │   │   ├── CallAnalyzer.jsx
│   │   │   ├── WebsiteScanner.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/api.js
│   │   ├── styles/theme.css
│   │   └── utils/
│   │       ├── encryption.js
│   │       └── validators.js
│   └── package.json
└── shared/
    ├── constants/scam_signals.json
    └── utils/
        ├── risk.py
        └── signal_loader.py
```

## Audit Summary

### Tight coupling found before the refactor

- The old `detector` app combined API transport, heuristics, privacy handling, and model loading in
  one place.
- Message-only logic was hard to reuse for calls, websites, and storefronts.
- The frontend had a single detector page and a result card tied to one response shape.
- Historical repo debris from earlier Node and CRA variants created a noisy git state and broken
  workflow references.

### Files removed from the active app

- `.github/workflows/deploy.yml`
- `.github/workflows/docker-build.yml`
- `frontend/src/components/TextAnalyzer.jsx`
- `backend/detector/serializers.py`
- `backend/detector/models.py`
- `backend/detector/services/`
- `backend/detector/ml_model/`

Historical deleted folders such as `securex-backend/`, `securex-frontend/`, and `ml/` are older
tracked artifacts from previous project variants. They are not part of the active architecture.

### Generated or local-only artifacts ignored

- `backend/.venv/`
- `backend/db.sqlite3`
- `ai_models/text_model/model.pkl`
- `frontend/dist/`
- `node_modules/`
- `__pycache__/`

## Fraud Detection Modules

### Message fraud detection

Pipeline:

1. sensitive-data detection and masking
2. keyword-based fraud rules
3. link extraction and phishing-link heuristics
4. scikit-learn NLP prediction
5. combined fraud score and explanation output

### Call fraud detection

Pipeline:
1. use the provided transcript, or optionally transcribe mono WAV audio with Vosk
2. run the shared message-detection pipeline
3. add call-specific heuristics for:
   - OTP theft
   - bank or authority impersonation
   - urgency / line-holding pressure
   - remote-access pressure
   - financial transfer requests

### Website fraud detection

Pipeline:

1. URL and domain-risk analysis
2. HTTPS presence check
3. phishing-form and urgent-language heuristics
4. shared NLP scoring on supplied page text or HTML snippet

### E-commerce fraud detection

Checks for:

- suspicious deep discounts
- risky payment methods
- missing merchant identity
- unusual checkout data requests
- website fraud signals inherited from the website scanner

## Privacy and Security Improvements

- zero data retention for fraud-analysis payloads
- in-memory masking of:
  - credit card numbers
  - bank account numbers
  - OTP / verification codes
  - Aadhaar numbers
  - passwords
- anonymous usage with no authentication required
- CSRF protection for browser requests
- `100` requests per IP per hour with `django-ratelimit`
- secure cookies and HTTPS redirect support outside debug mode
- stricter headers such as HSTS, `X-Frame-Options`, and `nosniff`

## Example Responses

### `POST /api/message-scan/`

```json
{
  "classification": "Scam",
  "confidence": 0.91,
  "fraud_probability": 0.91,
  "risk_score": 91,
  "risk_level": "High",
  "explanation": [
    "Urgency phrase detected",
    "Credential harvesting pattern detected",
    "ML model detected fraud-linked language patterns."
  ],
  "warnings": [
    "Sensitive data detected: possible OTP or verification code."
  ]
}
```

### `POST /api/url-scan/`

```json
{
  "classification": "Fraud Risk",
  "confidence": 0.84,
  "fraud_probability": 0.84,
  "risk_score": 84,
  "risk_level": "High",
  "website_risk": "High",
  "explanation": [
    "Phishing login form detected",
    "Website does not enforce HTTPS",
    "Brand impersonation pattern detected in link"
  ]
}
```

## Local Development

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py train_detector_model
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://127.0.0.1:5173`.

## Environment Variables

### Backend

Use `backend/.env.example` as a reference:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `DJANGO_CORS_ALLOWED_ORIGINS`
- `DJANGO_CSRF_TRUSTED_ORIGINS`
- `DJANGO_SECURE_SSL_REDIRECT`
- `SECUREX_VOSK_MODEL_PATH` for optional local call-audio transcription

### Database
-MongoDB


### Frontend

Use `frontend/.env.example`:

- `VITE_API_BASE_URL`

## Verification

These checks were run locally after the refactor:

```bash
cd backend
./.venv/bin/python manage.py check
./.venv/bin/python manage.py train_detector_model
./.venv/bin/python manage.py test detector

cd ../frontend
npm run build
```
