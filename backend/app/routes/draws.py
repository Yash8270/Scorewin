from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.draw import DrawCreate, DrawResponse, DrawSimulateResponse
from app.services.draw_service import run_draw, simulate_draw, publish_draw, get_all_draws, get_draw_by_id, get_draw_results
from app.utils.permissions import require_admin
from app.utils.auth import get_current_user
from app.models.user import User
from typing import List

router = APIRouter(prefix="/api/draws", tags=["Draws"])


@router.post("/run", response_model=DrawResponse)
def execute_draw(data: DrawCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return run_draw(db, data.draw_type)


@router.post("/simulate", response_model=DrawSimulateResponse)
def sim_draw(data: DrawCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return simulate_draw(db, data.draw_type)


@router.post("/{draw_id}/publish", response_model=DrawResponse)
def pub_draw(draw_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return publish_draw(db, draw_id)


@router.get("/", response_model=List[DrawResponse])
def list_draws(skip: int = 0, limit: int = 50, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return get_all_draws(db, skip, limit)


@router.get("/{draw_id}")
def get_draw(draw_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return get_draw_by_id(db, draw_id)


@router.get("/{draw_id}/results")
def draw_results(draw_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return get_draw_results(db, draw_id)
