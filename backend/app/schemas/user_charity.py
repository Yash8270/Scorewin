from pydantic import BaseModel, Field
from typing import Optional


class UserCharityCreate(BaseModel):
    charity_id: int
    percentage: float = Field(default=10.0, ge=10.0, le=100.0)


class UserCharityResponse(BaseModel):
    id: int
    user_id: int
    charity_id: int
    percentage: float
    charity_name: Optional[str] = None
    charity_image: Optional[str] = None

    class Config:
        from_attributes = True


class UserCharityUpdate(BaseModel):
    charity_id: Optional[int] = None
    percentage: Optional[float] = Field(None, ge=10.0, le=100.0)
