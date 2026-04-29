from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.services.auth_service import get_all_users, get_user_by_id, update_user, delete_user
from app.utils.auth import get_current_user
from app.utils.permissions import require_admin
from app.models.user import User
from typing import List

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/", response_model=List[UserResponse])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return get_all_users(db, skip, limit)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return get_user_by_id(db, user_id)


@router.put("/{user_id}", response_model=UserResponse)
def update(user_id: int, data: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id != user_id and current_user.role.value != "admin":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized")
    return update_user(db, user_id, data.model_dump(exclude_unset=True))


@router.delete("/{user_id}")
def remove(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    delete_user(db, user_id)
    return {"message": "User deleted"}
