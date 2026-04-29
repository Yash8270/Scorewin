from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.charity import CharityCreate, CharityResponse, CharityUpdate
from app.schemas.user_charity import UserCharityCreate, UserCharityUpdate
from app.services.charity_service import create_charity, get_all_charities, update_charity, delete_charity, assign_user_charity, get_user_charity
from app.utils.auth import get_current_user
from app.utils.permissions import require_admin
from app.models.user import User
from typing import List

router = APIRouter(prefix="/api/charities", tags=["Charities"])


# --- User's own charity (must be BEFORE /{charity_id} routes) ---

@router.get("/my")
def my_charity(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = get_user_charity(db, current_user.id)
    if result is None:
        return JSONResponse(content=None, status_code=200)
    return result


@router.post("/my")
def set_my_charity(data: UserCharityCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return assign_user_charity(db, current_user.id, data.charity_id, data.percentage)


@router.put("/my")
def update_my_charity(data: UserCharityUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    uc = get_user_charity(db, current_user.id)
    if not uc:
        raise HTTPException(status_code=404, detail="No charity selected")
    charity_id = data.charity_id if data.charity_id is not None else uc["charity_id"]
    percentage = data.percentage if data.percentage is not None else uc["percentage"]
    assign_user_charity(db, current_user.id, charity_id, percentage)
    return get_user_charity(db, current_user.id)


# --- Public + Admin CRUD ---

@router.get("/", response_model=List[CharityResponse])
def list_charities(db: Session = Depends(get_db)):
    return get_all_charities(db)


@router.post("/", response_model=CharityResponse)
def add_charity(data: CharityCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return create_charity(db, data.name, data.description, data.image_url)


@router.put("/{charity_id}", response_model=CharityResponse)
def edit_charity(charity_id: int, data: CharityUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return update_charity(db, charity_id, data.model_dump(exclude_unset=True))


@router.delete("/{charity_id}")
def remove_charity(charity_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    delete_charity(db, charity_id)
    return {"message": "Charity deleted"}
