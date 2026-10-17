from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import ContactMessage, Subscriber, ContactActivity
from ..schemas import (
    ContactCreate, ContactResponse, ContactStatusUpdate,
    SubscriberCreate, SubscriberResponse,
    ActivityCreate, ActivityResponse, ActivityStats,
)
from ..auth import get_current_admin, get_current_editor

router = APIRouter(tags=["Contact & Newsletter"])


# ============================================================
# MESSAGES
# ============================================================

@router.post("/contact", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def submit_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    db_msg = ContactMessage(**contact.model_dump())
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg


@router.get("/contact", response_model=List[ContactResponse])
def get_contact_messages(db: Session = Depends(get_db)):
    return db.query(ContactMessage).order_by(ContactMessage.id.desc()).all()

@router.patch("/admin/contact/{msg_id}/status", response_model=ContactResponse)
def update_contact_status(
    msg_id: int,
    payload: ContactStatusUpdate,
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_editor),
):
    allowed = {"pending", "read", "replied", "resolved"}
    st = (payload.status or "").strip().lower()
    if st not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Allowed: {', '.join(sorted(allowed))}",
        )

    msg = db.query(ContactMessage).filter(ContactMessage.id == msg_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    msg.status = st
    msg.is_read = (st != "pending")     # keep old field in sync
    db.commit()
    db.refresh(msg)
    return msg
# ============================================================
# NEWSLETTER
# ============================================================

@router.post("/newsletter", response_model=SubscriberResponse, status_code=status.HTTP_201_CREATED)
def subscribe_newsletter(sub: SubscriberCreate, db: Session = Depends(get_db)):
    existing = db.query(Subscriber).filter(Subscriber.email == sub.email).first()
    if existing:
        return existing
    db_sub = Subscriber(email=sub.email)
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    return db_sub


# ============================================================
# ACTIVITY TRACKING
# ============================================================

@router.post("/contact/track", status_code=status.HTTP_201_CREATED)
def track_activity(payload: ActivityCreate, request: Request, db: Session = Depends(get_db)):
    """Track a call/email/whatsapp click."""
    allowed = {"call", "email", "whatsapp"}
    atype = (payload.activity_type or "").strip().lower()
    if atype not in allowed:
        raise HTTPException(status_code=400, detail="Invalid activity type")

    # Grab client IP (works behind proxies too)
    ip = None
    try:
        fwd = request.headers.get("x-forwarded-for")
        if fwd:
            ip = fwd.split(",")[0].strip()
        else:
            ip = request.client.host if request.client else None
    except Exception:
        ip = None

    # Truncate user-agent to 255 chars
    ua = payload.user_agent or request.headers.get("user-agent") or ""
    ua = ua[:255]

    row = ContactActivity(
        activity_type=atype,
        page_url=(payload.page_url or "")[:500] or None,
        session_id=(payload.session_id or "")[:100] or None,
        ip_address=(ip or "")[:45] or None,
        user_agent=ua or None,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"ok": True, "id": row.id}


@router.get("/admin/contact/activities", response_model=List[ActivityResponse])
def list_activities(
    type: Optional[str] = Query(None),
    range: Optional[str] = Query("30d"),
    limit: int = Query(200, ge=1, le=1000),
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_admin),
):
    """List recent activity with optional filters."""
    q = db.query(ContactActivity)

    if type:
        q = q.filter(ContactActivity.activity_type == type.lower())

    if range and range != "all":
        days = {"7d": 7, "30d": 30, "90d": 90, "1y": 365}.get(range)
        if days:
            since = datetime.utcnow() - timedelta(days=days)
            q = q.filter(ContactActivity.created_at >= since)

    return q.order_by(ContactActivity.id.desc()).limit(limit).all()


@router.get("/admin/contact/activities/stats", response_model=ActivityStats)
def activity_stats(
    db: Session = Depends(get_db),
    current: dict = Depends(get_current_admin),
):
    """Return counts for today + all time."""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    def count_type(atype, since=None):
        q = db.query(func.count(ContactActivity.id)).filter(ContactActivity.activity_type == atype)
        if since:
            q = q.filter(ContactActivity.created_at >= since)
        return q.scalar() or 0

    return {
        "today_call": count_type("call", today_start),
        "today_email": count_type("email", today_start),
        "today_whatsapp": count_type("whatsapp", today_start),
        "total_call": count_type("call"),
        "total_email": count_type("email"),
        "total_whatsapp": count_type("whatsapp"),
    }