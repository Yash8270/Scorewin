from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import engine, Base, SessionLocal
from app.models import *  # noqa — ensures all models are registered
from app.routes import auth, users, subscriptions, scores, draws, charities, winners, admin

app = FastAPI(
    title="ScoreWin API",
    description="Play. Win. Make an Impact.",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(subscriptions.router)
app.include_router(scores.router)
app.include_router(draws.router)
app.include_router(charities.router)
app.include_router(winners.router)
app.include_router(admin.router)


@app.on_event("startup")
def on_startup():
    """Auto-seed admin user and sample charities if database is empty."""
    from app.models.user import User, UserRole
    from app.models.charity import Charity
    from app.utils.auth import hash_password

    db = SessionLocal()
    try:
        # Create admin if no users exist
        if db.query(User).count() == 0:
            admin_user = User(
                name="Admin",
                email="admin@scorewin.com",
                hashed_password=hash_password("Admin@123"),
                role=UserRole.admin
            )
            db.add(admin_user)
            db.commit()
            print("✅ Admin user created: admin@scorewin.com / Admin@123")

        # Create charities if none exist
        if db.query(Charity).count() == 0:
            charities = [
                Charity(
                    name="Green Earth Foundation",
                    description="Dedicated to environmental conservation and sustainable development across the globe.",
                    image_url="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400"
                ),
                Charity(
                    name="Children's Hope Alliance",
                    description="Providing education, healthcare, and a brighter future for underprivileged children worldwide.",
                    image_url="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400"
                ),
                Charity(
                    name="Sports for All",
                    description="Making sports accessible to communities everywhere, regardless of background or ability.",
                    image_url="https://images.unsplash.com/photo-1461896836934-ber7fc633b7d?w=400"
                ),
            ]
            db.add_all(charities)
            db.commit()
            print("✅ 3 sample charities created")
    except Exception as e:
        db.rollback()
        print(f"⚠️ Startup seed skipped: {e}")
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "ScoreWin API — Play. Win. Make an Impact.", "docs": "/docs"}
