from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.subscription import SubscriptionCreate, SubscriptionResponse
from app.services.subscription_service import create_subscription, get_user_subscription, cancel_subscription, renew_subscription, get_all_subscriptions, extend_subscription
from app.utils.auth import get_current_user
from app.utils.permissions import require_admin
from app.models.user import User
from typing import List, Optional

router = APIRouter(prefix="/api/subscriptions", tags=["Subscriptions"])


@router.post("/", response_model=SubscriptionResponse)
def subscribe(data: SubscriptionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_subscription(db, current_user.id, data.plan)


@router.get("/my", response_model=Optional[SubscriptionResponse])
def my_subscription(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sub = get_user_subscription(db, current_user.id)
    return sub


@router.post("/extend", response_model=SubscriptionResponse)
def extend(data: SubscriptionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return extend_subscription(db, current_user.id, data.plan)


@router.post("/renew", response_model=SubscriptionResponse)
def renew(data: SubscriptionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return renew_subscription(db, current_user.id, data.plan)


@router.post("/{sub_id}/cancel", response_model=SubscriptionResponse)
def cancel(sub_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return cancel_subscription(db, sub_id, current_user.id)


@router.get("/", response_model=List[SubscriptionResponse])
def list_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return get_all_subscriptions(db, skip, limit)
