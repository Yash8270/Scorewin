from sqlalchemy import Column, Integer, String, Float, DateTime, Enum as SAEnum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base
import enum


class DrawType(str, enum.Enum):
    random = "random"
    algorithm = "algorithm"


class DrawStatus(str, enum.Enum):
    simulated = "simulated"
    published = "published"


class Draw(Base):
    __tablename__ = "draws"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    month = Column(String(7), nullable=False, index=True)  # YYYY-MM
    numbers = Column(Text, nullable=False)  # JSON array of 5 numbers
    draw_type = Column(SAEnum(DrawType), nullable=False)
    status = Column(SAEnum(DrawStatus), default=DrawStatus.simulated, nullable=False)
    prize_pool = Column(Float, default=0.0)
    jackpot_rollover = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    winners = relationship("Winner", back_populates="draw", cascade="all, delete-orphan")
