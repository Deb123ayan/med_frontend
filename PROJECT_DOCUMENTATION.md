# 🏥 Health Insights - Advanced Medical AI System

## 📋 Project Overview
**Arogya AI** is a state-of-the-art AI-powered medical diagnostic support system aimed at assisting clinical decision-making. It integrates **tabular clinical data** with **medical imaging** (Multimodal AI) to provide accurate disease predictions, risk stratification, and professional medical reports.

The system features **clinical-grade explainability** (using SHAP values) to ensure transparency in AI predictions, making it suitable for professional medical environments.

---

## 🏗️ System Architecture

The project follows a modern full-stack architecture:

- **Frontend**: **React** (TypeScript) + **Vite** + **Tailwind CSS** for a responsive, high-performance user interface.
- **Backend**: **Django** + **Django REST Framework (DRF)** for API management and business logic.
- **ML Service**: Integrated Python machine learning pipeline using **Scikit-Learn**, **PyTorch**, and **TorchXRayVision**.
- **Database**: **SQLite** (Development) / **PostgreSQL** (Production).

---

## 🚀 Key Features

### 1. Multimodal Cancer Prediction
Combines patient clinical history (age, biomarkers, etc.) with medical imaging for enhanced accuracy.
- **Breast Cancer**: Histopathology analysis (EfficientNet-B0) + Clinical data.
- **Lung Cancer**: Chest X-ray/CT analysis (DenseNet-121) + Clinical data.
- **Skin Cancer**: Dermatoscopy analysis (EfficientNet-B3).
- **Brain Tumor**: MRI analysis (ResNet-50).
- **Colorectal & Prostate Cancer**: Advanced risk prediction models.

### 2. Clinical Explainability (XAI)
- **SHAP Values**: Visualizes which features contributed most to a specific prediction.
- **Bias Analysis**: Monitors predictions for demographic fairness (age, gender).
- **Confidence Metrics**: Provides uncertainty quantification for every result.

### 3. Professional Reporting
- Generates **radiology-style structured reports**.
- Classifies urgency (Routine, Semi-Urgent, Urgent).
- Provides evidence-based recommendations and follow-up plans.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Shadcn/ui
- **Language**: TypeScript

### Backend & ML
- **Framework**: Django 5.0, DRF 3.14
- **ML Core**: Scikit-Learn, Pandas, NumPy
- **Deep Learning**: PyTorch, TorchVision, Timm
- **Medical Imaging**: TorchXRayVision, Pydicom, MedMNIST
- **Explainability**: SHAP, Lime
- **Optimization**: Optuna, MLflow

---

## 📂 Project Structure

```bash
Health-Insights/
├── backend/                    # Django Backend & ML Service
│   ├── api/                    # REST API Endpoints
│   ├── ml_service/             # Core ML Logic
│   │   ├── core/               # Tabular Predictors
│   │   └── vision/             # Medical Image Models
│   ├── trained_models/         # Saved .joblib and .pth models
│   ├── manage.py               # Django Entry Point
│   └── requirements.txt        # python dependencies
├── frontend/                   # React Frontend
│   ├── client/
│   │   ├── src/
│   │   │   ├── pages/          # Application Pages (NewAssessment, etc.)
│   │   │   ├── components/     # Reusable UI Components
│   │   │   └── shared/         # Shared Types & Routes
│   ├── vite.config.ts          # Vite Config
│   └── package.json            # Node Dependencies
└── requirements_vision.txt     # Specialized Vision Dependencies
```

---

## ⚡ Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend Setup
```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install Core ML Dependencies
pip install -r requirements.txt

# Install Vision & Advanced AI Dependencies
pip install torch torchvision timm torchxrayvision pydicom opencv-python

# Run Migrations
python manage.py migrate

# Download/Train Models (Initial Setup)
python download_medical_models.py

# Start Server
python manage.py runserver
```

### 2. Frontend Setup
```bash
cd frontend

# Install Dependencies
npm install

# Start Development Server
npm run dev
```

### 3. Verification
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000/api/`
- **ML Service Status**: `http://localhost:8000/ml/health/`

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/predictions/predict/` | Generate a disease prediction (Data + Image) |
| `POST` | `/api/predictions/{id}/counterfactual/` | Run "What-If" analysis on a prediction |
| `GET` | `/ml/models/` | List all available active ML models |
| `POST` | `/ml/predict/batch/` | Run predictions on a batch of patients |

---

## 🔮 Future Roadmap
- integration with hospital PACS systems (DICOM).
- Expansion to 3D medical image analysis.
- Federated learning for privacy-preserving model updates.
- Real-time streaming analysis for vital signs.
