from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.winner import WinnerResponse, WinnerVerify
from app.services.winner_service import get_user_winnings, get_all_winners, upload_proof, verify_winner
from app.utils.auth import get_current_user
from app.utils.permissions import require_admin
from app.models.user import User
from app.models.winner import Winner
from typing import List

router = APIRouter(prefix="/api/winners", tags=["Winners"])


@router.get("/my", response_model=List[WinnerResponse])
def my_winnings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_user_winnings(db, current_user.id)


@router.post("/{winner_id}/upload-proof", response_model=WinnerResponse)
async def upload(winner_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await upload_proof(db, winner_id, current_user.id, file)


@router.get("/", response_model=List[WinnerResponse])
def list_all_winners(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    winners = get_all_winners(db, skip, limit)
    result = []
    for w in winners:
        wr = WinnerResponse.model_validate(w)
        wr.user_name = w.user.name if w.user else None
        wr.user_email = w.user.email if w.user else None
        wr.draw_month = w.draw.month if w.draw else None
        result.append(wr)
    return result


@router.put("/{winner_id}/verify", response_model=WinnerResponse)
def verify(winner_id: int, data: WinnerVerify, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return verify_winner(db, winner_id, data.status)
