from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Volunteer
from ..schemas import VolunteerCreate, VolunteerResponse, VolunteerStatusUpdate

router = APIRouter(prefix="/volunteers", tags=["Volunteers"])

@router.get("", response_model=List[VolunteerResponse])
def get_volunteers(db: Session = Depends(get_db)):
    return db.query(Volunteer).order_by(Volunteer.id.desc()).all()

@router.post("", response_model=VolunteerResponse, status_code=status.HTTP_201_CREATED)
def apply_volunteer(volunteer: VolunteerCreate, db: Session = Depends(get_db)):
    db_volunteer = Volunteer(**volunteer.model_dump())
    db.add(db_volunteer)
    db.commit()
    db.refresh(db_volunteer)
    return db_volunteer

@router.patch("/{volunteer_id}/status", response_model=VolunteerResponse)
def update_volunteer_status(volunteer_id: int, payload: VolunteerStatusUpdate, db: Session = Depends(get_db)):
    vol = db.query(Volunteer).filter(Volunteer.id == volunteer_id).first()
    if not vol:
        raise HTTPException(status_code=404, detail="Volunteer record not found")
    if payload.status not in {"Pending", "Approved", "Rejected"}:
        raise HTTPException(status_code=400, detail="Invalid volunteer status")
    vol.status = payload.status
    db.commit()
    db.refresh(vol)
    return vol
