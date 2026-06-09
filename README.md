# 🔐 SecureX — Real-Time Fraud Detection System

A **privacy-first fraud detection platform** built with Django and Django REST Framework. Analyzes SMS messages, call transcripts, suspicious URLs, and e-commerce storefronts for fraud signals — entirely in-memory with zero data retention for submitted payloads.

Sensitive data is masked before model inference. Every scanner returns an explainable risk decision.

---

## 🔍 What SecureX Detects

| Scanner | Input |
|---------|-------|
| Message Scanner | SMS / text messages |
| Call Scanner | Call transcripts or mono WAV audio |
| Website Scanner | Suspicious URLs and phishing pages |
| E-commerce Scanner | Storefronts and checkout flows |

---

## ✨ Features

- In-memory analysis pipeline — zero payload persistence
- Sensitive data masking before inference (OTPs, card numbers, Aadhaar, passwords)
- Shared TF-IDF + Logistic Regression NLP model across all four scanners
- Speech-to-text transcription for WAV audio via Vosk
- Explainable risk output: classification, confidence, fraud probability, risk score, explanation
- CSRF protection + rate limiting (100 req/IP/hour via `django-ratelimit`)
- Secure headers: HSTS, `X-Frame-Options`, `nosniff`
- No authentication required — fully anonymous usage

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Django, Django REST Framework |
| NLP / ML | scikit-learn (TF-IDF + Logistic Regression), NLP pattern matching |
| Speech-to-Text | Vosk (optional, mono WAV audio) |
| Database | MySQL |
| Security | `django-ratelimit`, CSRF, secure cookie config |

---

## 📂 Project Structure

```text
SecureX/
├── ai_models/
│   ├── phishing_model/
│   │   └── heuristics.py
│   ├── text_model/
│   │   ├── bootstrap.py       # Trains TF-IDF + Logistic Regression → model.pkl
│   │   ├── predictor.py       # Lazy-loads pipeline, returns fraud probability + explanation
│   │   └── preprocess.py
│   └── voice_model/
│       └── transcriber.py     # Vosk WAV transcription
│
├── backend/
│   ├── securex/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── fraud_detection/          # ProtectedAnalysisView routing
│   │   ├── message_scanner/
│   │   │   └── services/
│   │   │       ├── detector.py
│   │   │       └── sensitive_data_detector.py
│   │   ├── call_scanner/
│   │   │   └── services/detector.py
│   │   ├── website_scanner/
│   │   │   └── services/detector.py
│   │   ├── ecommerce_detector/
│   │   │   └── services/detector.py
│   │   └── link_analyzer/
│   │       └── services/link_scanner.py
│   ├── detector/                     # Legacy routes (still active)
│   │   └── management/commands/train_detector_model.py
│   └── manage.py
│
└── shared/
    ├── constants/scam_signals.json
    └── utils/
        ├── risk.py
        └── signal_loader.py
```

---

## ⚙️ How It Works

### Request Flow

1. Client sends request to a scanner endpoint
2. `ProtectedAnalysisView` validates input via DRF serializers, enforces CSRF, applies rate limiting
3. Target module runs in-memory analysis — no request body logged
4. Response returned with: `classification`, `confidence`, `fraud_probability`, `risk_score`, `risk_level`, `explanation`, module metadata

### ML Model

Shared across all four scanners (`ai_models/text_model/`):
- `bootstrap.py` trains scikit-learn TF-IDF + Logistic Regression → persists `model.pkl`
- `predictor.py` lazy-loads the pipeline, returns fraud probability + weighted-term explanation

---

## 🧠 Detection Pipelines

### Message Scanner
Sensitive data masking → keyword fraud rules → link extraction + phishing heuristics → NLP prediction → combined score

### Call Scanner
Transcript input or WAV transcription (Vosk) → message pipeline → call-specific heuristics:
OTP theft, authority impersonation, urgency pressure, remote-access requests, financial transfer demands

### Website Scanner
URL and domain risk → HTTPS check → phishing-form and urgency heuristics → NLP scoring on page text or HTML

### E-commerce Scanner
Suspicious discounts → risky payment methods → missing merchant identity → unusual checkout data requests → website scanner signals

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/csrf/` | Bootstrap CSRF cookie |
| GET | `/api/platform-overview/` | Platform stats |
| POST | `/api/message-scan/` | Scan SMS / text message |
| POST | `/api/call-scan/` | Analyze transcript or WAV audio |
| POST | `/api/url-scan/` | Scan URL / phishing page |
| POST | `/api/ecommerce-scan/` | Analyze storefront / checkout |
| POST | `/api/detect/` | Legacy — maps to message scanner |
| POST | `/api/detect-scam/` | Legacy — maps to message scanner |

---

## 📊 Example Responses

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
  "warnings": ["Sensitive data detected: possible OTP or verification code."]
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

---

## ⚙️ Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py train_detector_model
python manage.py runserver
```

Runs at `http://127.0.0.1:8000`

### Environment Variables

Copy `backend/.env.example` and configure:

```env
DJANGO_SECRET_KEY=
DJANGO_DEBUG=
DJANGO_ALLOWED_HOSTS=
DJANGO_CORS_ALLOWED_ORIGINS=
DJANGO_CSRF_TRUSTED_ORIGINS=
DJANGO_SECURE_SSL_REDIRECT=
SECUREX_VOSK_MODEL_PATH=     # optional — WAV audio transcription
```

---

## ✅ Verification

```bash
./.venv/bin/python manage.py check
./.venv/bin/python manage.py train_detector_model
./.venv/bin/python manage.py test detector
```

---

## 🔒 Privacy Guarantees

- Zero retention for analysis payloads
- In-memory masking: credit card numbers, bank account numbers, OTPs, Aadhaar, passwords
- Fully anonymous — no authentication required
- CSRF enforced on all state-changing endpoints
- Rate limited: 100 requests/IP/hour
