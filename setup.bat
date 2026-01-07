@echo off
echo Setting up Smart Library Management System...
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
echo.
echo Setup Complete! 
echo Default Admin: admin / admin123
pause
