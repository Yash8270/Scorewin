from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class DrawCreate(BaseModel):
    draw_type: str = Field(..., pattern="^(random|algorithm)$")


class DrawResponse(BaseModel):
    id: int
    month: str
    numbers: str  # JSON string of array
    draw_type: str
    status: str
    prize_pool: float
    jackpot_rollover: float
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DrawResultResponse(BaseModel):
    draw: DrawResponse
    winners: List[dict] = []


class DrawSimulateResponse(BaseModel):
    numbers: List[int]
    draw_type: str
    prize_pool: float
    potential_winners: List[dict] = []
    jackpot_rollover: float
