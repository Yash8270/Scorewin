from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import date
from app.models.score import Score


MAX_SCORES_PER_USER = 5


def add_score(db: Session, user_id: int, score_value: int, score_date: date) -> Score:
    """
    Add a score for a user.
    - Validates score range (1-45)
    - Ensures unique date per user
    - Enforces 5-score cap by auto-deleting oldest
    """
    # Validate score range
    if score_value < 1 or score_value > 45:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Score must be between 1 and 45"
        )

    # Check for duplicate date
    existing = db.query(Score).filter(
        Score.user_id == user_id,
        Score.date == score_date
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A score already exists for {score_date}"
        )

    # Check score count and enforce cap
    user_scores = db.query(Score).filter(
        Score.user_id == user_id
    ).order_by(Score.date.asc()).all()

    if len(user_scores) >= MAX_SCORES_PER_USER:
        # Delete the oldest score(s) to make room
        scores_to_delete = len(user_scores) - MAX_SCORES_PER_USER + 1
        for i in range(scores_to_delete):
            db.delete(user_scores[i])

    # Add new score
    new_score = Score(
        user_id=user_id,
        score=score_value,
        date=score_date
    )
    db.add(new_score)
    db.commit()
    db.refresh(new_score)
    return new_score


def get_user_scores(db: Session, user_id: int) -> list:
    """Get all scores for a user in reverse chronological order."""
    return db.query(Score).filter(
        Score.user_id == user_id
    ).order_by(Score.date.desc()).all()


def delete_score(db: Session, score_id: int, user_id: int):
    """Delete a specific score."""
    score = db.query(Score).filter(
        Score.id == score_id,
        Score.user_id == user_id
    ).first()

    if not score:
        raise HTTPException(status_code=404, detail="Score not found")

    db.delete(score)
    db.commit()


def get_latest_scores_for_user(db: Session, user_id: int, limit: int = 5) -> list:
    """Get the latest N scores for a user (used for draw matching)."""
    scores = db.query(Score).filter(
        Score.user_id == user_id
    ).order_by(Score.date.desc()).limit(limit).all()
    return [s.score for s in scores]
