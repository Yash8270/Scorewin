from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timedelta, timezone
from app.models.subscription import Subscription, SubscriptionStatus, PlanType
from app.models.charity import Charity
from app.models.user_charity import UserCharity
from app.config.settings import settings


def create_subscription(db: Session, user_id: int, plan: str) -> Subscription:
    """Create a new subscription for a user."""
    # Check for existing active subscription
    now = datetime.now(timezone.utc)
    existing = db.query(Subscription).filter(
        Subscription.user_id == user_id,
        Subscription.status == SubscriptionStatus.active,
        Subscription.end_date >= now
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has an active subscription"
        )

    # Calculate dates and amount
    start_date = now
    if plan == PlanType.monthly:
        end_date = start_date + timedelta(days=30)
        amount = settings.MONTHLY_PLAN_PRICE
    elif plan == PlanType.quarterly:
        end_date = start_date + timedelta(days=90)
        amount = settings.QUARTERLY_PLAN_PRICE
    elif plan == PlanType.biannual:
        end_date = start_date + timedelta(days=180)
        amount = settings.BIANNUAL_PLAN_PRICE
    else:
        end_date = start_date + timedelta(days=365)
        amount = settings.YEARLY_PLAN_PRICE

    subscription = Subscription(
        user_id=user_id,
        plan=plan,
        status=SubscriptionStatus.active,
        amount=amount,
        start_date=start_date,
        end_date=end_date
    )
    db.add(subscription)

    # Enforce mandatory charity selection
    user_charity = db.query(UserCharity).filter(UserCharity.user_id == user_id).first()
    if not user_charity:
        default_charity = db.query(Charity).first()
        if default_charity:
            new_uc = UserCharity(
                user_id=user_id,
                charity_id=default_charity.id,
                percentage=10.0
            )
            db.add(new_uc)

    db.commit()
    db.refresh(subscription)
    return subscription


def extend_subscription(db: Session, user_id: int, plan: str) -> Subscription:
    """Extend an active subscription."""
    now = datetime.now(timezone.utc)
    sub = db.query(Subscription).filter(
        Subscription.user_id == user_id,
        Subscription.status == SubscriptionStatus.active,
        Subscription.end_date >= now
    ).first()

    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found to extend"
        )

    if plan == PlanType.monthly:
        additional_days = 30
        amount = settings.MONTHLY_PLAN_PRICE
    elif plan == PlanType.quarterly:
        additional_days = 90
        amount = settings.QUARTERLY_PLAN_PRICE
    elif plan == PlanType.biannual:
        additional_days = 180
        amount = settings.BIANNUAL_PLAN_PRICE
    else:
        additional_days = 365
        amount = settings.YEARLY_PLAN_PRICE

    sub.end_date = sub.end_date + timedelta(days=additional_days)
    sub.amount += amount
    sub.plan = plan  # Update to latest purchased plan tier
    db.commit()
    db.refresh(sub)
    return sub


def get_user_subscription(db: Session, user_id: int) -> Subscription:
    """Get the active subscription for a user."""
    now = datetime.now(timezone.utc)
    sub = db.query(Subscription).filter(
        Subscription.user_id == user_id,
        Subscription.status == SubscriptionStatus.active,
        Subscription.end_date >= now
    ).order_by(Subscription.end_date.desc()).first()
    return sub


def get_all_subscriptions(db: Session, skip: int = 0, limit: int = 100):
    """Get all subscriptions."""
    return db.query(Subscription).offset(skip).limit(limit).all()


def cancel_subscription(db: Session, subscription_id: int, user_id: int) -> Subscription:
    """Cancel a subscription."""
    sub = db.query(Subscription).filter(
        Subscription.id == subscription_id,
        Subscription.user_id == user_id
    ).first()

    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")

    if sub.status == SubscriptionStatus.cancelled:
        raise HTTPException(status_code=400, detail="Subscription already cancelled")

    sub.status = SubscriptionStatus.cancelled
    db.commit()
    db.refresh(sub)
    return sub


def renew_subscription(db: Session, user_id: int, plan: str) -> Subscription:
    """Renew or create a new subscription."""
    # Mark any existing active subs as inactive
    now = datetime.now(timezone.utc)
    existing_subs = db.query(Subscription).filter(
        Subscription.user_id == user_id,
        Subscription.status == SubscriptionStatus.active
    ).all()

    for sub in existing_subs:
        sub.status = SubscriptionStatus.inactive

    db.commit()

    # Create fresh subscription
    return create_subscription(db, user_id, plan)


def get_active_subscription_count(db: Session) -> int:
    """Get total active subscriptions."""
    now = datetime.now(timezone.utc)
    return db.query(Subscription).filter(
        Subscription.status == SubscriptionStatus.active,
        Subscription.end_date >= now
    ).count()


def get_total_subscription_revenue(db: Session) -> float:
    """Get total revenue from active subscriptions (for prize pool calculation)."""
    now = datetime.now(timezone.utc)
    result = db.query(Subscription).filter(
        Subscription.status == SubscriptionStatus.active,
        Subscription.end_date >= now
    ).all()
    return sum(s.amount for s in result)
