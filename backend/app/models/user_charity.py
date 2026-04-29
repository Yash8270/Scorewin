from sqlalchemy import Column, Integer, Float, ForeignKey, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship
from app.db import Base


class UserCharity(Base):
    __tablename__ = "user_charity"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    charity_id = Column(Integer, ForeignKey("charities.id", ondelete="CASCADE"), nullable=False, index=True)
    percentage = Column(Float, default=10.0, nullable=False)

    # Relationships
    user = relationship("User", back_populates="user_charity")
    charity = relationship("Charity")

    __table_args__ = (
        UniqueConstraint("user_id", name="uq_user_charity"),
        CheckConstraint("percentage >= 10", name="ck_min_charity_pct"),
    )
