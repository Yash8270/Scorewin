from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base
import enum


class PlanType(str, enum.Enum):
    monthly = "monthly"
    quarterly = "quarterly"
    biannual = "biannual"
    yearly = "yearly"


class SubscriptionStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    cancelled = "cancelled"


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    plan = Column(SAEnum(PlanType), nullable=False)
    status = Column(SAEnum(SubscriptionStatus), default=SubscriptionStatus.active, nullable=False)
    amount = Column(Float, nullable=False)
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    end_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="subscriptions")
