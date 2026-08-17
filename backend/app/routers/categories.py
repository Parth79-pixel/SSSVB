from typing import List

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.core.dependencies import SessionDep, CurrentUserDep
from app.models.category import Category
from app.schemas.category import CategoryRead, CategoryCreate

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=List[CategoryRead])
def list_categories(session: SessionDep, current_user: CurrentUserDep):
    categories = session.exec(select(Category)).all()
    return categories


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryCreate, session: SessionDep, current_user: CurrentUserDep):
    existing = session.exec(
        select(Category).where(Category.category_name == payload.category_name)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists.")

    category = Category(category_name=payload.category_name)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category