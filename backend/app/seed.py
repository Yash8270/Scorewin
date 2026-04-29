"""
ScoreWin Seed Script
Run: python -m app.seed
Creates admin user, sample users, subscriptions, scores, and charity assignments.
NOTE: Run schema.sql on TiDB first to create tables + charities.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta, timezone, date
from app.db import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.subscription import Subscription, SubscriptionStatus, PlanType
from app.models.score import Score
from app.models.charity import Charity
from app.models.user_charity import UserCharity
from app.utils.auth import hash_password
import random


def seed():
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).first():
            print("Database already has users. Skipping seed.")
            return

        now = datetime.now(timezone.utc)

        # --- Admin User ---
        admin = User(
            name="Admin",
            email="admin@scorewin.com",
            hashed_password=hash_password("Admin@123"),
            role=UserRole.admin
        )
        db.add(admin)

        # --- Sample Users ---
        users_data = [
            ("Alice Johnson", "alice@example.com", "User@123"),
            ("Bob Smith", "bob@example.com", "User@123"),
            ("Charlie Brown", "charlie@example.com", "User@123"),
            ("Diana Prince", "diana@example.com", "User@123"),
            ("Ethan Hunt", "ethan@example.com", "User@123"),
        ]
        users = []
        for name, email, pwd in users_data:
            u = User(name=name, email=email, hashed_password=hash_password(pwd), role=UserRole.user)
            db.add(u)
            users.append(u)

        db.commit()
        for u in users:
            db.refresh(u)
        db.refresh(admin)

        # --- Subscriptions ---
        for u in users:
            sub = Subscription(
                user_id=u.id, plan=PlanType.monthly, status=SubscriptionStatus.active,
                amount=9.99, start_date=now, end_date=now + timedelta(days=30)
            )
            db.add(sub)

        # --- Charities: create only if not already seeded via SQL ---
        charities = db.query(Charity).all()
        if not charities:
            charities_data = [
                ("Green Earth Foundation", "Dedicated to environmental conservation and sustainable development across the globe.", "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400"),
                ("Children's Hope Alliance", "Providing education, healthcare, and a brighter future for underprivileged children worldwide.", "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400"),
                ("Sports for All", "Making sports accessible to communities everywhere, regardless of background or ability.", "https://images.unsplash.com/photo-1461896836934-ber7fc633b7d?w=400"),
            ]
            for name, desc, img in charities_data:
                c = Charity(name=name, description=desc, image_url=img)
                db.add(c)
            db.commit()
            charities = db.query(Charity).all()

        # --- User Charity Assignments ---
        for i, u in enumerate(users):
            uc = UserCharity(
                user_id=u.id,
                charity_id=charities[i % len(charities)].id,
                percentage=10.0 + (i * 2)
            )
            db.add(uc)

        # --- Scores (5 per user) ---
        for u in users:
            for j in range(5):
                s = Score(
                    user_id=u.id,
                    score=random.randint(1, 45),
                    date=date.today() - timedelta(days=j)
                )
                db.add(s)

        db.commit()
        print("=" * 50)
        print("Seed completed successfully!")
        print("=" * 50)
        print(f"Admin:  admin@scorewin.com / Admin@123")
        print(f"Users:  alice/bob/charlie/diana/ethan@example.com / User@123")
        print(f"Each user has: subscription + 5 scores + charity")
        print("=" * 50)

    except Exception as e:
        db.rollback()
        print(f"Seed error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
