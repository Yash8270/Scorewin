# ScoreWin — Play. Win. Make an Impact. ⚡

A full-stack SaaS platform combining golf score tracking, gamified monthly prize draws, subscription-based access, and integrated charity contributions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React 18, React Router, Axios, Recharts, React Icons |
| Backend | Python FastAPI, SQLAlchemy ORM |
| Database | MySQL (TiDB Cloud compatible) |
| Auth | JWT (python-jose + passlib bcrypt) |

## Quick Start

### Prerequisites
- **Python 3.10+** with pip
- **Node.js 18+** with npm
- **MySQL 8+** or TiDB Cloud account

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure database
# Edit .env file with your MySQL/TiDB credentials:
# DATABASE_URL=mysql+pymysql://user:pass@host:port/scorewin

# Create database (run in MySQL)
# CREATE DATABASE scorewin;

# Run seed script (creates tables + sample data)
python -m app.seed

# Start the server
uvicorn app.main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend available at: `http://localhost:5173`

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@scorewin.com | Admin@123 |
| User | alice@example.com | User@123 |
| User | bob@example.com | User@123 |
| User | charlie@example.com | User@123 |
| User | diana@example.com | User@123 |
| User | ethan@example.com | User@123 |

## Project Structure

```
ScoreWin/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, routers
│   │   ├── db.py            # SQLAlchemy engine & session
│   │   ├── seed.py          # Database seeding script
│   │   ├── config/          # Settings from .env
│   │   ├── models/          # SQLAlchemy ORM models (7 tables)
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── routes/          # API endpoints (8 routers)
│   │   ├── services/        # Business logic layer
│   │   └── utils/           # Auth, permissions helpers
│   ├── uploads/             # Winner proof uploads
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/           # 12 page components
│   │   ├── components/      # Reusable UI components
│   │   ├── services/        # API service modules
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # Auth context provider
│   │   └── styles/          # CSS design system
│   ├── package.json
│   └── .env
└── README.md
```

## Core Features

### Score System
- Enter scores 1–45 with unique dates
- Auto-manages latest 5 scores (oldest auto-deleted)
- Reverse chronological display

### Draw Engine
- **Random mode**: 5 unique random numbers (1–45)
- **Algorithm mode**: Weighted by user score frequency
- **Matching**: 5-match (40% jackpot), 4-match (35%), 3-match (25%)
- Jackpot rolls over if no 5-match winner
- Simulation mode for admin preview

### Subscriptions
- Monthly ($9.99) and Yearly ($99.99) plans
- Active subscription required for scores + draws

### Charity System
- Min 10% contribution from subscription
- User-selectable charity with adjustable percentage

## API Endpoints

| Prefix | Description |
|--------|-------------|
| `/api/auth` | Register, Login, Get current user |
| `/api/users` | User CRUD (admin) |
| `/api/subscriptions` | Create, view, cancel, renew |
| `/api/scores` | Add, list, delete scores |
| `/api/draws` | Run, simulate, publish draws |
| `/api/charities` | CRUD + user selection |
| `/api/winners` | Winnings, proof upload, verification |
| `/api/admin` | Analytics, user management |

## Environment Variables

### Backend (.env)
```
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/scorewin
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
MONTHLY_PLAN_PRICE=9.99
YEARLY_PLAN_PRICE=99.99
MIN_CHARITY_PERCENTAGE=10
UPLOAD_DIR=uploads
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
```
