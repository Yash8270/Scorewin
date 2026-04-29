from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SubscriptionCreate(BaseModel):
    plan: str = Field(..., pattern="^(monthly|quarterly|biannual|yearly)$")


class SubscriptionResponse(BaseModel):
    id: int
    user_id: int
    plan: str
    status: str
    amount: float
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SubscriptionUpdate(BaseModel):
    plan: Optional[str] = Field(None, pattern="^(monthly|quarterly|biannual|yearly)$")
    status: Optional[str] = Field(None, pattern="^(active|inactive|cancelled)$")
