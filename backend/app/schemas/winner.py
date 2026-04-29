from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class WinnerResponse(BaseModel):
    id: int
    user_id: int
    draw_id: int
    match_type: int
    amount: float
    status: str
    proof_url: Optional[str] = None
    created_at: Optional[datetime] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    draw_month: Optional[str] = None

    class Config:
        from_attributes = True


class WinnerVerify(BaseModel):
    status: str = Field(..., pattern="^(approved|rejected|paid)$")
