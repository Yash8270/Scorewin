from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db import get_db
from app.utils.permissions import require_admin
from app.models.user import User, UserRole
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.draw import Draw, DrawStatus
from app.models.winner import Winner
from app.services.charity_service import get_total_charity_contributions
from app.services.subscription_service import get_total_subscription_revenue
from datetime import datetime, timezone

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    now = datetime.now(timezone.utc)
    total_users = db.query(User).count()
    active_subs = db.query(Subscription).filter(
        Subscription.status == SubscriptionStatus.active,
        Subscription.end_date >= now
    ).count()
    total_revenue = get_total_subscription_revenue(db)
    total_charity = get_total_charity_contributions(db)
    total_draws = db.query(Draw).count()
    published_draws = db.query(Draw).filter(Draw.status == DrawStatus.published).count()
    total_winners = db.query(Winner).count()

    paid_winners = db.query(Winner).filter(Winner.status == "paid").all()
    prize_sum = sum(w.amount for w in paid_winners)

    return {
        "total_users": total_users,
        "active_subscriptions": active_subs,
        "total_revenue": round(total_revenue, 2),
        "total_charity_contributions": total_charity,
        "prize_pool": round(total_revenue - total_charity, 2),
        "total_draws": total_draws,
        "published_draws": published_draws,
        "total_winners": total_winners,
        "total_prize_paid": round(prize_sum, 2)
    }


@router.get("/users")
def admin_list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    users = db.query(User).offset(skip).limit(limit).all()
    result = []
    for u in users:
        now = datetime.now(timezone.utc)
        active_sub = db.query(Subscription).filter(
            Subscription.user_id == u.id,
            Subscription.status == SubscriptionStatus.active,
            Subscription.end_date >= now
        ).first()
        result.append({
            "id": u.id, "name": u.name, "email": u.email, "role": u.role.value,
            "created_at": str(u.created_at),
            "has_active_subscription": active_sub is not None,
            "subscription_plan": active_sub.plan.value if active_sub else None,
            "subscription_end": str(active_sub.end_date) if active_sub else None
        })
    return result


class RoleUpdate(BaseModel):
    role: str


@router.put("/users/{user_id}/role")
def change_role(user_id: int, data: RoleUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    user.role = data.role
    db.commit()
    return {"message": f"User role updated to {data.role}"}
