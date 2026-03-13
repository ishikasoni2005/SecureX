# 🔐 SecureX — AI-Powered Real-Time Scam Detection

SecureX is an **AI-powered web application** designed to detect **scam and fraudulent text messages** in real time using **Natural Language Processing (NLP) models**.  

The system analyzes user-provided text and classifies it as **Scam or Safe**, helping users quickly identify potentially harmful content such as phishing attempts and spam messages.

This project was developed as part of an **AI-focused full-stack initiative** and later extended into an **IEEE research paper submission**.

---

# 🚀 Features

### 🔍 Real-Time Scam Detection
Analyzes user input text and detects potential scam patterns using machine learning models.

### 🤖 AI & NLP Integration
Uses **NLP-based classification models** to identify phishing attempts, spam, and fraudulent messages.

### ⚡ Fast Response Time
Optimized API communication and frontend state handling to deliver **low-latency predictions**.

### 📊 Result Visualization
Displays prediction results clearly with **classification labels and confidence scores**.

### 🔒 Privacy-Focused Design
User input is processed **in memory only** and is not stored permanently in the database.

---

# 🧰 Tech Stack

| Layer | Technologies |
|------|-------------|
| **Frontend** | React.js, Tailwind CSS |
| **Backend** | Django, Django REST Framework |
| **AI / NLP** | Python, Scikit-learn, NLP preprocessing |
| **Database** | SQLite / PostgreSQL |
| **API Communication** | REST APIs |

---

# 🧠 System Architecture


User Input
↓
React Frontend
↓
Django REST API
↓
Text Preprocessing
↓
NLP / ML Model Prediction
↓
Scam Classification
↓
Response Sent to Frontend
↓
Result Visualization


---

# 📂 Project Structure



SecureX/
│
├── frontend/ # React.js application
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── services/
│ │ └── App.jsx
│ └── package.json
│
├── backend/ # Django backend
│ ├── manage.py
│ ├── securex/
│ └── detector/
│ ├── views.py
│ ├── urls.py
│ └── ml_model/
│ ├── model.pkl
│ ├── preprocess.py
│ └── predictor.py
│
├── requirements.txt
└── README.md



---

# 🧠 My Contributions

- Developed **responsive frontend interfaces** using React.js  
- Integrated **React frontend with Django REST APIs**  
- Implemented **async API communication and error handling**  
- Optimized frontend state management for faster response  
- Collaborated on **API design and ML model integration**

---

# 📘 Research Contribution

SecureX formed the basis of a **research paper submitted to an IEEE-affiliated, Scopus-indexed international conference (INDIACom-2026)**.

**Research Focus:**  
AI-powered **real-time scam detection using NLP techniques**.

---

# 🧠 Key Learnings

- Applying **Natural Language Processing for scam detection**
- Building **AI-powered full-stack applications**
- Integrating **React frontend with Django REST backend**
- Designing **scalable and modular architectures**
- Translating practical software projects into **research-oriented solutions**

---

# ⚙️ Installation & Setup

## Prerequisites

- Python 3.9+
- Node.js
- npm
- pip
- virtualenv

---

# 1️⃣ Clone Repository

```bash
git clone https://github.com/<your-username>/SecureX.git
cd SecureX



2️⃣ Backend Setup (Django)
cd backend

python -m venv venv
source venv/bin/activate

pip install -r requirements.txt

python manage.py migrate
python manage.py runserver
Backend runs at:
http://127.0.0.1:8000
3️⃣ Frontend Setup (React)
cd frontend

npm install
npm start
Frontend runs at:
http://localhost:3000
📡 API Endpoint
Detect Scam
POST
/api/detect/
Request
{
"text": "Your bank account has been suspended. Click here to verify."
}
Response
{
"classification": "Scam",
"confidence": 0.92
}
🔮 Future Improvements
Email and SMS scam detection support
Real-time browser extension integration
Continuous model training with new scam datasets
Deployment using Docker and cloud platforms
User feedback system to improve model accuracy
