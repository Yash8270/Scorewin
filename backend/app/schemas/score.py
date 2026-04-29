from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class ScoreCreate(BaseModel):
    score: int = Field(..., ge=1, le=45)
    date: date


class ScoreResponse(BaseModel):
    id: int
    user_id: int
    score: int
    date: date
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
