from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Donation, Cause, Volunteer, ContactMessage, Order
from ..schemas import DashboardStats, DonationResponse, VolunteerResponse, ContactResponse
from datetime import datetime, timedelta
from collections import defaultdict

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])


# Shared helper: which statuses count as "completed"
COMPLETED_STATUSES = ["Completed", "completed", "Success", "success", "PAID", "Paid"]


@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Only count COMPLETED donations in all metrics
    completed_filter = Donation.status.in_(COMPLETED_STATUSES)

    total_donations = db.query(func.sum(Donation.amount)).filter(completed_filter).scalar() or 0.0
    donations_count = db.query(Donation).filter(completed_filter).count()
    active_causes = db.query(Cause).count()
    volunteers_count = db.query(Volunteer).count()
    pending_volunteers = db.query(Volunteer).filter(Volunteer.status == "Pending").count()
    unread_messages = db.query(ContactMessage).filter(ContactMessage.is_read == False).count()
    total_orders = db.query(Order).count()

    # Recent donations — completed only
    recent_donations = (
        db.query(Donation)
        .filter(completed_filter)
        .order_by(Donation.id.desc())
        .limit(5)
        .all()
    )

    recent_volunteers = db.query(Volunteer).order_by(Volunteer.id.desc()).limit(5).all()
    recent_messages = db.query(ContactMessage).order_by(ContactMessage.id.desc()).limit(5).all()

    formatted_volunteers = []
    for v in recent_volunteers:
        formatted_volunteers.append({
            "id": v.id,
            "name": v.full_name,
            "full_name": v.full_name,
            "email": v.email,
            "phone": v.phone,
            "occupation": v.occupation,
            "skills": v.skills,
            "status": v.status,
            "created_at": v.created_at,
        })

    formatted_donations = []
    for d in recent_donations:
        formatted_donations.append({
            "id": d.id,
            "transaction_id": d.transaction_id,
            "donor_name": d.donor_name,
            "email": d.email,
            "amount": d.amount,
            "payment_method": d.payment_method,
            "cause_id": d.cause_id,
            "status": d.status,
            "created_at": d.created_at,
        })

    return {
        "metrics": {
            "total_raised": total_donations,
            "donations_count": donations_count,
            "active_causes": active_causes,
            "total_volunteers": volunteers_count,
            "pending_volunteers": pending_volunteers,
            "unread_messages": unread_messages,
            "total_orders": total_orders,
        },
        "total_donations": total_donations,
        "donations_count": donations_count,
        "active_causes": active_causes,
        "volunteers_count": volunteers_count,
        "pending_volunteers": pending_volunteers,
        "unread_messages": unread_messages,
        "total_orders": total_orders,
        "recent_donations": formatted_donations,
        "recent_volunteers": formatted_volunteers,
        "recent_messages": [ContactResponse.model_validate(m) for m in recent_messages],
    }


@router.get("/charts")
def get_charts_data(months: int = 12, db: Session = Depends(get_db)):
    """
    Return monthly stats for dashboard charts.
    - months: 3, 6, or 12 (max 24)
    - Only completed donations counted in trend
    - Status breakdown covers ALL donations
    """
    # Clamp months to reasonable range
    months = max(1, min(months, 24))

    today = datetime.utcnow()
    current_month_start = today.replace(day=1)

    # Build list of the N months INCLUDING current month, oldest first
    months_list = []
    cursor = current_month_start
    for _ in range(months):
        months_list.insert(0, cursor)
        # Step back one month
        if cursor.month == 1:
            cursor = cursor.replace(year=cursor.year - 1, month=12)
        else:
            cursor = cursor.replace(month=cursor.month - 1)

    # Fetch completed donations from the earliest month onward
    start_date = months_list[0]

    donations = (
        db.query(Donation)
        .filter(
            Donation.created_at >= start_date,
            Donation.status.in_(COMPLETED_STATUSES),
        )
        .all()
    )

    # Bucket by "YYYY-MM"
    monthly = defaultdict(lambda: {"amount": 0.0, "count": 0})
    for d in donations:
        if not d.created_at:
            continue
        key = d.created_at.strftime("%Y-%m")
        monthly[key]["amount"] += float(d.amount or 0)
        monthly[key]["count"] += 1

    # Prepare arrays for the chart
    labels = []
    amounts = []
    counts = []
    for m in months_list:
        key = m.strftime("%Y-%m")
        labels.append(m.strftime("%b %Y"))   # e.g. "Sep 2026"
        amounts.append(round(monthly[key]["amount"], 2))
        counts.append(monthly[key]["count"])

    # ---------- Status breakdown (ALL donations) ----------
    all_donations = db.query(Donation).all()
    breakdown = {"completed": 0, "pending": 0, "failed": 0}
    for d in all_donations:
        s = (d.status or "Pending").lower()
        if "complet" in s or "success" in s:
            breakdown["completed"] += 1
        elif "fail" in s or "cancel" in s:
            breakdown["failed"] += 1
        else:
            breakdown["pending"] += 1

    return {
        "monthly": {
            "labels": labels,
            "amounts": amounts,
            "counts": counts,
        },
        "status_breakdown": breakdown,
    }