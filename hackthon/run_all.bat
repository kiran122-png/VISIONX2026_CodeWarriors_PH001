@echo off
echo ===================================================
echo 🌱 Starting JanRakshak AI Servers
echo ===================================================

echo [1/2] Starting Backend API (Flask) in a new window...
start "JanRakshak Backend" cmd /k "cd backend && call ..\.venv\Scripts\activate && python app_utf8_clean.py"

echo [2/2] Starting Frontend (React/Vite) in a new window...
start "JanRakshak Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers are launching! 
echo 🌐 Frontend will be available at: http://localhost:5176
echo ⚙️  Backend API will be running at: http://localhost:5000
echo.
pause
