# 🏥 Health Insights - Development Setup

## Running Frontend and Backend Separately

### 🔧 Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- Dependencies installed:
  ```bash
  pip install -r requirements.txt
  npm install
  ```

### 🚀 Step 1: Start Django Backend (Terminal 1)

```bash
# Navigate to project directory
cd Health-Insights

# Start Django API server
python manage.py runserver
```

**Django Backend will run on:** http://127.0.0.1:8000

**Available endpoints:**
- API: http://127.0.0.1:8000/api/
- Admin: http://127.0.0.1:8000/admin/ (admin/admin123)
- Patients: http://127.0.0.1:8000/api/patients/
- Predictions: http://127.0.0.1:8000/api/predictions/

### ⚡ Step 2: Start React Frontend (Terminal 2)

```bash
# In the same project directory (new terminal)
cd Health-Insights

# Start Vite development server
npm run dev
```

**React Frontend will run on:** http://127.0.0.1:5173

### 🔄 How It Works

1. **Django Backend (Port 8000)**: Serves the REST API and handles all data/ML operations
2. **Vite Frontend (Port 5173)**: Serves the React app with hot reload
3. **Proxy Configuration**: Vite automatically forwards `/api/*` requests to Django

### 🧪 Testing the Setup

1. **Test Backend API:**
   ```bash
   python test_api.py
   ```

2. **Test Frontend:** 
   - Visit http://127.0.0.1:5173
   - The React app should load and be able to call the Django API

3. **Test Admin Panel:**
   - Visit http://127.0.0.1:8000/admin/
   - Login with: admin/admin123

### 🛠️ Development Workflow

- **Frontend Changes**: Edit files in `client/src/` - changes auto-reload in browser
- **Backend Changes**: Edit Django files - Django auto-reloads the server
- **API Changes**: Modify `api/views.py`, `api/models.py` etc.
- **Database Changes**: Run `python manage.py makemigrations` then `python manage.py migrate`

### 📁 Project Structure

```
Health-Insights/
├── client/                 # React frontend
│   ├── src/               # React source code
│   ├── dist/              # Built frontend (for production)
│   └── index.html         # HTML template
├── api/                   # Django API app
├── ml_service/            # ML prediction service
├── health_insights/       # Django project settings
├── templates/             # Django templates
├── manage.py              # Django management
├── requirements.txt       # Python dependencies
└── package.json           # Node.js dependencies
```

### 🚨 Troubleshooting

**If frontend can't reach backend:**
- Ensure Django is running on port 8000
- Check CORS settings in `health_insights/settings.py`
- Verify proxy config in `vite.config.ts`

**If you get database errors:**
- Run: `python manage.py migrate`
- Create sample data: `python create_sample_data.py`

**If you get import errors:**
- Reinstall dependencies: `pip install -r requirements.txt`
- For frontend: `npm install`