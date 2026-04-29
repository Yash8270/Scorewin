from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.score import ScoreCreate, ScoreResponse
from app.services.score_service import add_score, get_user_scores, delete_score
from app.utils.auth import get_current_user
from app.utils.permissions import require_active_subscription
from app.models.user import User
from typing import List

router = APIRouter(prefix="/api/scores", tags=["Scores"])


@router.post("/", response_model=ScoreResponse)
def create_score(data: ScoreCreate, db: Session = Depends(get_db), current_user: User = Depends(require_active_subscription)):
    return add_score(db, current_user.id, data.score, data.date)


@router.get("/my", response_model=List[ScoreResponse])
def my_scores(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_user_scores(db, current_user.id)


@router.delete("/{score_id}")
def remove_score(score_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_active_subscription)):
    delete_score(db, score_id, current_user.id)
    return {"message": "Score deleted"}
