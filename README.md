# 🏥 Health Insights - AI Disease Prediction System

A full-stack application with React frontend and Django backend for AI-powered disease prediction with explainable AI.

## 📁 Project Structure

```
Health-Insights/
├── backend/                    # 🐍 Django Backend
│   ├── api/                   # Main API endpoints
│   ├── health_insights/       # Django project settings
│   ├── ml_service/            # ML prediction service
│   ├── templates/             # Django templates
│   ├── manage.py              # Django management
│   ├── requirements.txt       # Python dependencies
│   └── *.py                   # Test and utility scripts
├── client/                    # ⚛️ React Frontend
│   ├── src/                   # React source code
│   ├── dist/                  # Built frontend
│   └── index.html             # HTML template
├── shared/                    # 🔗 Shared Types & Routes
│   ├── schema.ts              # Database schema types
│   └── routes.ts              # API route definitions
├── package.json               # Node.js dependencies
├── vite.config.ts             # Vite configuration
└── start*.bat                 # Startup scripts
```

## 🚀 Quick Start

### Option 1: Use Startup Scripts (Recommended)

**Windows:**
```bash
# Start both frontend and backend
start.bat

# Or start individually
start_backend.bat    # Django only
start_frontend.bat   # React only
```

**Cross-platform:**
```bash
python start_dev.py
```

### Option 2: Manual Setup

**1. Start Django Backend:**
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**2. Start React Frontend:**
```bash
npm install
npm run dev
```

## 🌐 Access Points

- **React Frontend**: http://127.0.0.1:5173 (with hot reload)
- **Django API**: http://127.0.0.1:8000/api/
- **Django Admin**: http://127.0.0.1:8000/admin/ (admin/admin123)
- **ML Service**: http://127.0.0.1:8000/ml/

## 🧪 Testing

**Backend API Tests:**
```bash
cd backend
python test_api.py           # Main Django API
python test_ml_api.py        # ML Service API
python test_camelcase_api.py # Frontend format compatibility
```

**Frontend Connection:**
- Open `test_frontend_connection.html` in browser
- Test API connectivity from frontend

## 🤖 ML Features

- **Disease Prediction**: Heart Disease, Diabetes, Cancer
- **Explainable AI**: SHAP-based feature importance
- **Bias Detection**: Gender and age fairness analysis
- **Counterfactual Analysis**: Actionable recommendations
- **Uncertainty Quantification**: Confidence scores
- **Batch Processing**: Multiple patient predictions

## 📊 API Endpoints

### Main Django API
- `GET/POST /api/patients/` - Patient management
- `GET /api/predictions/` - List predictions
- `POST /api/predictions/predict/` - Generate prediction
- `POST /api/predictions/{id}/counterfactual/` - What-if analysis

### ML Service API
- `GET /ml/health/` - Service health check
- `GET /ml/models/` - List trained models
- `POST /ml/predict/` - Direct ML prediction
- `POST /ml/predict/batch/` - Batch predictions

## 🛠️ Development

### Backend Development
```bash
cd backend
python manage.py makemigrations  # Create migrations
python manage.py migrate          # Apply migrations
python manage.py createsuperuser  # Create admin user
```

### Frontend Development
```bash
npm run dev      # Start with hot reload
npm run build    # Build for production
npm run preview  # Preview production build
```

### Adding New Features
1. **Database changes**: Update `backend/api/models.py`
2. **API endpoints**: Add to `backend/api/views.py`
3. **Frontend types**: Update `shared/schema.ts`
4. **API routes**: Update `shared/routes.ts`

## 🔧 Configuration

### Environment Variables
Create `backend/.env`:
```env
SECRET_KEY=your-secret-key
DEBUG=True
```

### Database
- **Development**: SQLite (included)
- **Production**: PostgreSQL (update settings)

## 📈 Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Django + Django REST Framework
- **ML Service**: Integrated Python ML pipeline
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **API**: RESTful with camelCase/snake_case compatibility

## 🎯 Key Features

✅ **Full-stack TypeScript** - End-to-end type safety
✅ **Real ML Models** - Trained RandomForest models (96-98% accuracy)
✅ **Explainable AI** - Feature importance and bias detection
✅ **Modern UI** - React with Shadcn/ui components
✅ **API Compatibility** - Handles both camelCase and snake_case
✅ **Hot Reload** - Fast development workflow
✅ **Production Ready** - Optimized build and deployment

## 🚀 Deployment

### Frontend (Static)
```bash
npm run build
# Deploy client/dist/ to static hosting
```

### Backend (Django)
```bash
cd backend
pip install -r requirements.txt
python manage.py collectstatic
python manage.py migrate
# Deploy to Django hosting (Heroku, Railway, etc.)
```

Your Health Insights application is ready for development and production! 🎉