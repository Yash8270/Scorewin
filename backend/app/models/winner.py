from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base
import enum


class WinnerStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    paid = "paid"


class Winner(Base):
    __tablename__ = "winners"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    draw_id = Column(Integer, ForeignKey("draws.id", ondelete="CASCADE"), nullable=False, index=True)
    match_type = Column(Integer, nullable=False)  # 3, 4, or 5
    amount = Column(Float, default=0.0)
    status = Column(SAEnum(WinnerStatus), default=WinnerStatus.pending, nullable=False)
    proof_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="winners")
    draw = relationship("Draw", back_populates="winners")
