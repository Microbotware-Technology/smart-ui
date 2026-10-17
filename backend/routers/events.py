from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Event, EventRegistration
from ..schemas import EventCreate, EventResponse, EventRegistrationCreate, EventRegistrationResponse

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("", response_model=List[EventResponse])
def get_events(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.id.desc()).all()

@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    db_event = Event(**event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.post("/{event_id}/register")
def register_event(event_id: int, registration: EventRegistrationCreate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.registered_count >= event.capacity:
        raise HTTPException(status_code=400, detail="Event is fully booked")

    existing = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id,
        EventRegistration.email == registration.email
    ).first()
    if existing:
        return {
            "message": "Already registered for event",
            "registered_count": event.registered_count,
            "registration": existing,
        }

    db_registration = EventRegistration(
        event_id=event_id,
        name=registration.name,
        email=registration.email,
    )
    event.registered_count += 1
    db.add(db_registration)
    db.commit()
    db.refresh(db_registration)
    return {
        "message": "Successfully registered for event",
        "registered_count": event.registered_count,
        "registration": db_registration,
    }

@router.get("/{event_id}/registrations", response_model=List[EventRegistrationResponse])
def get_event_registrations(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id
    ).order_by(EventRegistration.id.desc()).all()
