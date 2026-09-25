# Jeeva Herbs Realtime Store

React + Django + FastAPI + Redis + OpenAI customer-support chatbot.

Backend:
- Django owns products, FAQs, orders and admin panel.
- FastAPI exposes customer APIs, checkout, order tracking, AI chat and WebSocket.
- Redis carries realtime product/order events from Django to FastAPI.
- React is the customer storefront.

Run backend:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
python manage.py makemigrations store
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_data
docker run --name jeeva-redis -p 6379:6379 -d redis:7
python manage.py runserver 8000
```

In another terminal:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn fastapi_app.main:app --reload --port 9000
```

Frontend:
```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

Store: http://localhost:5173
Admin: http://localhost:8000/admin/
API docs: http://localhost:9000/docs

Put OPENAI_API_KEY in backend/.env for the AI chatbot. The chatbot uses live products and FAQs as context and is instructed not to diagnose or make disease-treatment claims.
