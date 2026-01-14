# 🔐 SecureX — AI-Powered Real-Time Scam Detection

SecureX is a **web-based application** designed to detect **scam and fraudulent text messages** using **AI and NLP models**.  
The system analyzes user-provided text in real time and classifies it as **scam or non-scam**, helping users identify potentially harmful content.

This project was developed as part of an **AI-focused full-stack initiative** and later extended into an **IEEE research paper submission**.

---

## 🚀 Key Features

- 🔍 **Real-Time Scam Text Detection**  
  Analyzes text input and detects scam patterns using NLP-based classification models.

- 🤖 **AI & NLP Integration**  
  Uses machine learning and NLP techniques to identify phishing attempts, spam messages, and fraudulent content.

- ⚡ **Low-Latency Analysis**  
  Optimized frontend data flow and API handling to reduce perceived response latency by **~30%**.

- 📊 **Result Visualization**  
  Displays classification results clearly to help users understand scam likelihood.

- 🔒 **Privacy-Aware Design**  
  No permanent storage of analyzed text; requests are processed securely via APIs.

---

## 🧰 Tech Stack

| Layer        | Technologies |
|-------------|--------------|
| **Frontend** | React.js, Tailwind CSS |
| **Backend**  | Node.js, Express.js |
| **AI / NLP** | Python, NLP-based ML models |
| **Database** | MongoDB |
| **APIs**     | REST APIs |

---

## 🧠 Architecture Overview

User Input
↓
React Frontend
↓
REST API (Node.js + Express)
↓
AI / NLP Model (Python)
↓
Classification Result
↓
Frontend Visualization


---

## 🧩 Folder Structure

SecureX/
│
├── frontend/ # React.js frontend
├── backend/ # Express.js backend
├── ml/ # AI / NLP model scripts
├── README.md


---

## 🧠 My Role & Contributions

- Designed and implemented **responsive frontend interfaces** using React.js  
- Integrated frontend with **REST APIs** for ML-based text classification  
- Handled **async requests, edge cases, and error states**  
- Optimized client-side state management and data flow  
- Collaborated with backend developers to define **API contracts**

---

## 📘 Research Work

- SecureX formed the basis of a **research paper submitted to an IEEE-affiliated, Scopus-indexed international conference (INDIACom-2026)**  
- Focus area: **AI-powered real-time scam detection using NLP**

---

## 🧠 What I Learned

- Practical application of **NLP for scam detection**
- Frontend–backend integration in **AI-powered systems**
- Performance optimization in React applications
- Designing **clean, modular, and scalable** full-stack architecture
- Translating a project into a **research-oriented solution**

---

## 🧭 How to Run Locally

### Prerequisites
- Node.js
- Python
- MongoDB

### Steps

```bash
# Clone repository
git clone https://github.com/<your-username>/SecureX.git
cd SecureX

# Backend
cd backend
npm install
npm start

# Frontend
cd ../frontend
npm install
npm start
