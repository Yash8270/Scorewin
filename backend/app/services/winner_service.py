import cloudinary
import cloudinary.uploader
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
from app.models.winner import Winner, WinnerStatus
from app.config.settings import settings

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)


def get_user_winnings(db: Session, user_id: int):
    winners = db.query(Winner).filter(Winner.user_id == user_id).order_by(Winner.created_at.desc()).all()
    return winners


def get_all_winners(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Winner).order_by(Winner.created_at.desc()).offset(skip).limit(limit).all()


async def upload_proof(db: Session, winner_id: int, user_id: int, file: UploadFile) -> Winner:
    winner = db.query(Winner).filter(Winner.id == winner_id, Winner.user_id == user_id).first()
    if not winner:
        raise HTTPException(status_code=404, detail="Winner record not found")

    # Upload to Cloudinary
    try:
        content = await file.read()
        result = cloudinary.uploader.upload(
            content,
            folder="scorewin/proofs",
            public_id=f"winner_{winner_id}_user_{user_id}",
            overwrite=True,
            resource_type="image"
        )
        proof_url = result.get("secure_url")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

    winner.proof_url = proof_url
    db.commit()
    db.refresh(winner)
    return winner


def verify_winner(db: Session, winner_id: int, new_status: str) -> Winner:
    winner = db.query(Winner).filter(Winner.id == winner_id).first()
    if not winner:
        raise HTTPException(status_code=404, detail="Winner not found")
    winner.status = new_status
    db.commit()
    db.refresh(winner)
    return winner
