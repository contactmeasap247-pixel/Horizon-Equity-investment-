# Horizon Equity

> Your Gateway to Financial Freedom

Full-stack educational crypto investment platform built with FastAPI + Next.js.

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (for PostgreSQL + Redis)

### Start Database Services
```bash
docker-compose up -d postgres redis
```

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs

### Default Admin
- Email: admin@horizonequity.com
- Password: Admin@123

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI + SQLAlchemy + PostgreSQL |
| Frontend | Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui |
| Cache | Redis |
| Tasks | Celery |
| Deploy | Render (backend) + Vercel (frontend) |
