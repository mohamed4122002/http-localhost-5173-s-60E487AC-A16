# Questioner 🚀
### Token-Based Survey Qualification System

A high-performance survey platform built with **FastAPI**, **MongoDB**, and **React**. It features a specialized two-layer qualification process designed for deep screening before participants reach the final survey.

![Screening Flow](https://img.shields.io/badge/Survey-Screening-blueviolet?style=for-the-badge&logo=react)
![Backend](https://img.shields.io/badge/API-FastAPI-green?style=for-the-badge&logo=fastapi)
![Database](https://img.shields.io/badge/Database-MongoDB-darkgreen?style=for-the-badge&logo=mongodb)

---

## ✨ Features

- **Layer 1: Screening**: Interactive, high-UX demographic questions (Name, Phone, Age, Area, etc.).
- **Smart Validation**: International phone flags, international city autocomplete, and MCQ-based logic.
- **Respondent Persistence**: Automatically stores and updates participant data in a centralized database.
- **Layer 2: Evaluation**: Seamless handover to Google Forms for complex questionnaire handling.
- **Admin Dashboard**: Real-time analytics, token management, and version-controlled survey blueprints.
- **Schema Versioning**: Every change to a survey blueprint is versioned, allowing instant rollbacks.

## 🛠 Tech Stack

- **Frontend**: React, Vite, Framer Motion, Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI (Python 3.10+), Pydantic v2, Motor (Async MongoDB).
- **Database**: MongoDB (Atlas or Local).
- **Integration**: Google Apps Script for webhook-based completion tracking.

## 📁 Project Structure

- `backend/`: FastAPI application, logic layer, and database models.
- `frontend/`: React application with high-fidelity UI/UX componentry.
- `scripts/`: Diagnostic, test, and administrative utility scripts.
- `docs/`: Architecture diagrams, ERDs, and setup documentation.
- `google-apps-script.js`: Completion tracking logic for Google Forms.

## 🚀 Quick Start

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/your-repo/questioner.git
cd questioner

# Setup virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB credentials
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Run Everything
- **API**: `uvicorn backend.main:app --reload`
- **Frontend**: `http://localhost:5173`
- **Swagger Docs**: `http://localhost:8000/docs`

## 📊 Usage Lifecycle

1. **Design**: Admin creates a Survey Blueprint in the dashboard.
2. **Issue**: Admin generates secure tokens for specific campaigns.
3. **Screen**: Participant enters the screening portal. Data is saved to the `respondents` collection.
4. **Evaluate**: Qualified participants are handed over to Layer 2 (Google Forms).
5. **Analyze**: Results are synced back via webhooks for real-time reporting.

---
© 2026 Questioner Team. Built for speed and data quality.
