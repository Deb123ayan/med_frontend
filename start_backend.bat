@echo off
title Health Insights - Django Backend
echo 🏥 Health Insights - Django Backend Server
echo ========================================
echo.
echo Starting Django API server on http://127.0.0.1:8000
echo.
echo Available endpoints:
echo   - API: http://127.0.0.1:8000/api/
echo   - Admin: http://127.0.0.1:8000/admin/ (admin/admin123)
echo.
echo Press Ctrl+C to stop the server
echo.

cd backend
python manage.py runserver

echo.
echo Django server stopped.
pause