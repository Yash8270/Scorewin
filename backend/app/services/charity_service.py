from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.charity import Charity
from app.models.user_charity import UserCharity


def create_charity(db: Session, name: str, description: str = None, image_url: str = None) -> Charity:
    charity = Charity(name=name, description=description, image_url=image_url)
    db.add(charity)
    db.commit()
    db.refresh(charity)
    return charity


def get_all_charities(db: Session):
    return db.query(Charity).all()


def get_charity_by_id(db: Session, charity_id: int):
    charity = db.query(Charity).filter(Charity.id == charity_id).first()
    if not charity:
        raise HTTPException(status_code=404, detail="Charity not found")
    return charity


def update_charity(db: Session, charity_id: int, update_data: dict) -> Charity:
    charity = get_charity_by_id(db, charity_id)
    for key, value in update_data.items():
        if value is not None:
            setattr(charity, key, value)
    db.commit()
    db.refresh(charity)
    return charity


def delete_charity(db: Session, charity_id: int):
    charity = get_charity_by_id(db, charity_id)
    db.delete(charity)
    db.commit()


def assign_user_charity(db: Session, user_id: int, charity_id: int, percentage: float = 10.0):
    get_charity_by_id(db, charity_id)
    if percentage < 10.0:
        raise HTTPException(status_code=400, detail="Minimum charity contribution is 10%")
    existing = db.query(UserCharity).filter(UserCharity.user_id == user_id).first()
    if existing:
        existing.charity_id = charity_id
        existing.percentage = percentage
    else:
        existing = UserCharity(user_id=user_id, charity_id=charity_id, percentage=percentage)
        db.add(existing)
    db.commit()
    db.refresh(existing)
    return existing


def get_user_charity(db: Session, user_id: int):
    uc = db.query(UserCharity).filter(UserCharity.user_id == user_id).first()
    if not uc:
        return None
    charity = db.query(Charity).filter(Charity.id == uc.charity_id).first()
    return {"id": uc.id, "user_id": uc.user_id, "charity_id": uc.charity_id, "percentage": uc.percentage, "charity_name": charity.name if charity else None, "charity_image": charity.image_url if charity else None}


def get_total_charity_contributions(db: Session) -> float:
    from app.models.subscription import Subscription, SubscriptionStatus
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    active_subs = db.query(Subscription).filter(Subscription.status == SubscriptionStatus.active, Subscription.end_date >= now).all()
    total = 0.0
    for sub in active_subs:
        uc = db.query(UserCharity).filter(UserCharity.user_id == sub.user_id).first()
        pct = uc.percentage if uc else 10.0
        total += sub.amount * (pct / 100.0)
    return round(total, 2)
