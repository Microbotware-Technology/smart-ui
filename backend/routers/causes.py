from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Cause
from ..schemas import CauseCreate, CauseResponse

router = APIRouter(prefix="/causes", tags=["Causes"])

@router.get("", response_model=List[CauseResponse])
def get_causes(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Cause)
    if category:
        query = query.filter(Cause.category == category)
    if featured is not None:
        query = query.filter(Cause.is_featured == featured)
    return query.order_by(Cause.id.desc()).all()

@router.get("/{cause_id}", response_model=CauseResponse)
def get_cause(cause_id: int, db: Session = Depends(get_db)):
    cause = db.query(Cause).filter(Cause.id == cause_id).first()
    if not cause:
        raise HTTPException(status_code=404, detail="Cause not found")
    return cause

@router.post("", response_model=CauseResponse, status_code=status.HTTP_201_CREATED)
def create_cause(cause: CauseCreate, db: Session = Depends(get_db)):
    target_val = cause.goal_amount or cause.target_amount or 10000.0
    db_cause = Cause(
        title=cause.title,
        slug=cause.title.lower().replace(" ", "-"),
        category=cause.category,
        description=cause.description,
        target_amount=target_val,
        raised_amount=cause.raised_amount or 0.0,
        image_url=cause.image_url or "assets/images/cause/img-1.jpg",
        is_featured=cause.is_featured or False
    )
    db.add(db_cause)
    db.commit()
    db.refresh(db_cause)
    return db_cause


@router.delete("/{cause_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cause(cause_id: int, db: Session = Depends(get_db)):
    cause = db.query(Cause).filter(Cause.id == cause_id).first()
    if not cause:
        raise HTTPException(status_code=404, detail="Cause not found")
    db.delete(cause)
    db.commit()
    return None
