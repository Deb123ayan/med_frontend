@echo off
echo 🏥 Health Insights - Quick Start
echo ================================

echo.
echo Choose your option:
echo 1. Start Django only (with built React)
echo 2. Start Django + Vite (development mode)
echo 3. Build React and start Django
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo 🚀 Starting Django server...
    cd backend
    python manage.py runserver
) else if "%choice%"=="2" (
    echo.
    echo 🔥 Starting development servers...
    echo Django will start on http://127.0.0.1:8000
    echo Vite will start on http://127.0.0.1:5173
    echo.
    start /b cmd /c "cd backend && python manage.py runserver"
    timeout /t 3 /nobreak >nul
    npm run dev
) else if "%choice%"=="3" (
    echo.
    echo 🔨 Building React frontend...
    npm run build
    if %errorlevel%==0 (
        echo ✅ Build completed!
        echo 🚀 Starting Django server...
        cd backend
        python manage.py runserver
    ) else (
        echo ❌ Build failed!
        pause
    )
) else (
    echo ❌ Invalid choice!
    pause
)

pause