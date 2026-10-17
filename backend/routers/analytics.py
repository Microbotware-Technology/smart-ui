"""
Analytics endpoints — deep insights for donations.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Optional

from ..database import get_db
from ..models import Donation, Cause


router = APIRouter(prefix="/admin/analytics", tags=["Analytics"])

COMPLETED_STATUSES = ["Completed", "completed", "Success", "success", "PAID", "Paid"]


# ------------------------------------------------------------
# HELPERS
# ------------------------------------------------------------
def _parse_range(range_key, start_str, end_str):
    """Return (start, end) datetimes based on preset or custom range."""
    now = datetime.utcnow()
    end = now

    if range_key == "7d":
        start = now - timedelta(days=7)
    elif range_key == "30d":
        start = now - timedelta(days=30)
    elif range_key == "90d":
        start = now - timedelta(days=90)
    elif range_key == "1y":
        start = now - timedelta(days=365)
    elif range_key == "custom" and start_str and end_str:
        try:
            start = datetime.fromisoformat(start_str)
            end = datetime.fromisoformat(end_str)

            if start > end:
                start, end = end, start

            if end > now:
                end = now

            if start > now:
                start = now

            two_years_ago = now - timedelta(days=730)
            if start < two_years_ago:
                start = two_years_ago

        except Exception:
            start = now - timedelta(days=30)
            end = now
    else:
        start = now - timedelta(days=30)

    return start, end


def _status_filter(status):
    """Return a list of matching statuses for a given filter."""
    if not status:
        return None
    s = status.lower()
    if s == "completed":
        return COMPLETED_STATUSES
    if s == "failed":
        return ["Failed", "failed", "Cancelled", "cancelled", "FAILED"]
    if s == "pending":
        return ["Pending", "pending", "PENDING"]
    return None


# ------------------------------------------------------------
# 1. SUMMARY — KPI cards
# ------------------------------------------------------------
@router.get("/summary")
def get_summary(
    range: str = "30d",
    start: Optional[str] = None,
    end: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    start_dt, end_dt = _parse_range(range, start, end)

    q = db.query(Donation).filter(
        Donation.created_at >= start_dt,
        Donation.created_at <= end_dt,
    )
    st = _status_filter(status)
    if st:
        q = q.filter(Donation.status.in_(st))

    donations = q.all()

    # All-matching amount (ignores completed filter)
    filtered_amount = sum(float(d.amount or 0) for d in donations)

    completed = [
        d for d in donations
        if (d.status or "").lower() in ("completed", "success", "paid")
    ]
    total_raised = sum(float(d.amount or 0) for d in completed)
    total_count = len(donations)
    avg_amount = total_raised / len(completed) if completed else 0.0
    filtered_avg = (filtered_amount / len(donations)) if donations else 0.0

    donor_keys = set()
    for d in donations:
        key = d.email or d.phone or d.donor_name or ""
        if key:
            donor_keys.add(key.lower())
    unique_donors = len(donor_keys)

    highest = max((float(d.amount or 0) for d in completed), default=0.0)
    success_rate = (len(completed) / total_count * 100) if total_count else 0.0

    # This month vs Last month
    now = datetime.utcnow()
    this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_month_end = this_month_start - timedelta(seconds=1)
    last_month_start = last_month_end.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    this_month = db.query(func.sum(Donation.amount)).filter(
        Donation.created_at >= this_month_start,
        Donation.status.in_(COMPLETED_STATUSES),
    ).scalar() or 0.0

    last_month = db.query(func.sum(Donation.amount)).filter(
        Donation.created_at >= last_month_start,
        Donation.created_at <= last_month_end,
        Donation.status.in_(COMPLETED_STATUSES),
    ).scalar() or 0.0

    change_pct = 0.0
    if last_month > 0:
        change_pct = ((this_month - last_month) / last_month) * 100

    # ---------- Top donors list (respects active status filter) ----------
    donor_map = defaultdict(lambda: {"total": 0.0, "count": 0, "name": "", "email": ""})
    for d in donations:                    
        key = (d.email or d.phone or d.donor_name or "").lower()
        if not key:
            continue
        donor_map[key]["total"] += float(d.amount or 0)
        donor_map[key]["count"] += 1
        if not donor_map[key]["name"]:
            donor_map[key]["name"] = d.donor_name or "Anonymous"
        if not donor_map[key]["email"] and d.email:
            donor_map[key]["email"] = d.email

    top_donors = sorted(
        [
            {
                "name": v["name"],
                "email": v["email"],
                "total": round(v["total"], 2),
                "count": v["count"],
            }
            for v in donor_map.values()
        ],
        key=lambda x: x["total"],
        reverse=True,
    )[:20]

    # ---------- Highest donation details ----------
    highest_record = None
    if completed:
        hd = max(completed, key=lambda d: float(d.amount or 0))
        highest_record = {
            "id": hd.id,
            "transaction_id": hd.transaction_id,
            "donor_name": hd.donor_name,
            "email": hd.email,
            "phone": hd.phone,
            "country_code": hd.country_code,
            "amount": float(hd.amount or 0),
            "payment_method": hd.payment_method,
            "cause_id": hd.cause_id,
            "status": hd.status,
            "created_at": hd.created_at.isoformat() if hd.created_at else None,
        }

    return {
        "total_raised": round(total_raised, 2),
        "total_count": total_count,
        "filtered_amount": round(filtered_amount, 2),
        "filtered_avg": round(filtered_avg, 2),
        "avg_amount": round(avg_amount, 2),
        "unique_donors": unique_donors,
        "highest_donation": round(highest, 2),
        "highest_details": highest_record,
        "success_rate": round(success_rate, 1),
        "this_month": round(this_month, 2),
        "last_month": round(last_month, 2),
        "change_pct": round(change_pct, 1),
        "top_donors": top_donors,
        "top_donors_count": len(donor_map),
    }


# ------------------------------------------------------------
# 2. TREND — time series
# ------------------------------------------------------------
@router.get("/trend")
def get_trend(
    range: str = "30d",
    start: Optional[str] = None,
    end: Optional[str] = None,
    db: Session = Depends(get_db),
):
    start_dt, end_dt = _parse_range(range, start, end)
    days = max((end_dt - start_dt).days, 1)

    if days <= 31:
        granularity = "day"
    elif days <= 120:
        granularity = "week"
    else:
        granularity = "month"

    donations = db.query(Donation).filter(
        Donation.created_at >= start_dt,
        Donation.created_at <= end_dt,
        Donation.status.in_(COMPLETED_STATUSES),
    ).all()

    buckets = defaultdict(lambda: {"amount": 0.0, "count": 0})
    for d in donations:
        if not d.created_at:
            continue
        if granularity == "day":
            key = d.created_at.strftime("%Y-%m-%d")
        elif granularity == "week":
            week_start = d.created_at - timedelta(days=d.created_at.weekday())
            key = week_start.strftime("%Y-%m-%d")
        else:
            key = d.created_at.strftime("%Y-%m")
        buckets[key]["amount"] += float(d.amount or 0)
        buckets[key]["count"] += 1

    labels, amounts, counts = [], [], []

    if granularity == "day":
        cursor = start_dt.replace(hour=0, minute=0, second=0, microsecond=0)
        end_c = end_dt.replace(hour=0, minute=0, second=0, microsecond=0)
        while cursor <= end_c:
            key = cursor.strftime("%Y-%m-%d")
            labels.append(cursor.strftime("%d %b"))
            amounts.append(round(buckets[key]["amount"], 2))
            counts.append(buckets[key]["count"])
            cursor += timedelta(days=1)
    elif granularity == "week":
        cursor = start_dt - timedelta(days=start_dt.weekday())
        while cursor <= end_dt:
            key = cursor.strftime("%Y-%m-%d")
            labels.append("Wk " + cursor.strftime("%d %b"))
            amounts.append(round(buckets[key]["amount"], 2))
            counts.append(buckets[key]["count"])
            cursor += timedelta(days=7)
    else:
        cursor = start_dt.replace(day=1)
        while cursor <= end_dt:
            key = cursor.strftime("%Y-%m")
            labels.append(cursor.strftime("%b %Y"))
            amounts.append(round(buckets[key]["amount"], 2))
            counts.append(buckets[key]["count"])
            if cursor.month == 12:
                cursor = cursor.replace(year=cursor.year + 1, month=1)
            else:
                cursor = cursor.replace(month=cursor.month + 1)

    return {
        "granularity": granularity,
        "labels": labels,
        "amounts": amounts,
        "counts": counts,
    }


# ------------------------------------------------------------
# 3. STATUS BREAKDOWN
# ------------------------------------------------------------
@router.get("/status")
def get_status_breakdown(
    range: str = "30d",
    start: Optional[str] = None,
    end: Optional[str] = None,
    db: Session = Depends(get_db),
):
    start_dt, end_dt = _parse_range(range, start, end)

    donations = db.query(Donation).filter(
        Donation.created_at >= start_dt,
        Donation.created_at <= end_dt,
    ).all()

    bd = {"completed": 0, "pending": 0, "failed": 0}
    for d in donations:
        s = (d.status or "Pending").lower()
        if "complet" in s or "success" in s or "paid" in s:
            bd["completed"] += 1
        elif "fail" in s or "cancel" in s:
            bd["failed"] += 1
        else:
            bd["pending"] += 1

    return bd


# ------------------------------------------------------------
# 4. TOP CAUSES
# ------------------------------------------------------------
@router.get("/top-causes")
def get_top_causes(
    range: str = "30d",
    start: Optional[str] = None,
    end: Optional[str] = None,
    limit: int = 5,
    db: Session = Depends(get_db),
):
    start_dt, end_dt = _parse_range(range, start, end)
    limit = max(1, min(limit, 20))

    donations = db.query(Donation).filter(
        Donation.created_at >= start_dt,
        Donation.created_at <= end_dt,
        Donation.status.in_(COMPLETED_STATUSES),
        Donation.cause_id.isnot(None),
    ).all()

    agg = defaultdict(lambda: {"amount": 0.0, "count": 0})
    for d in donations:
        if not d.cause_id:
            continue
        agg[d.cause_id]["amount"] += float(d.amount or 0)
        agg[d.cause_id]["count"] += 1

    ids = list(agg.keys())
    causes_map = {}
    if ids:
        for c in db.query(Cause).filter(Cause.id.in_(ids)).all():
            causes_map[c.id] = c.title

    items = []
    for cid, data in agg.items():
        items.append({
            "cause_id": cid,
            "title": causes_map.get(cid, "Cause #" + str(cid)),
            "amount": round(data["amount"], 2),
            "count": data["count"],
        })

    items.sort(key=lambda x: x["amount"], reverse=True)
    return items[:limit]


# ------------------------------------------------------------
# 5. YEAR-OVER-YEAR (rolling 12 months)
# ------------------------------------------------------------
@router.get("/yoy")
def get_yoy(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Build 12 rolling months (oldest first)
    rolling_months = []
    cursor = current_month_start
    for _ in range(12):
        rolling_months.insert(0, cursor)
        if cursor.month == 1:
            cursor = cursor.replace(year=cursor.year - 1, month=12)
        else:
            cursor = cursor.replace(month=cursor.month - 1)

    # Last-year equivalent of each month
    last_year_months = [m.replace(year=m.year - 1) for m in rolling_months]

    earliest = min(last_year_months[0], rolling_months[0])

    donations = db.query(Donation).filter(
        Donation.created_at >= earliest,
        Donation.status.in_(COMPLETED_STATUSES),
    ).all()

    monthly_map = defaultdict(float)
    for d in donations:
        if not d.created_at:
            continue
        key = d.created_at.strftime("%Y-%m")
        monthly_map[key] += float(d.amount or 0)

    labels, this_data, last_data = [], [], []
    for mc, ml in zip(rolling_months, last_year_months):
        labels.append(mc.strftime("%b %y"))
        this_data.append(round(monthly_map.get(mc.strftime("%Y-%m"), 0), 2))
        last_data.append(round(monthly_map.get(ml.strftime("%Y-%m"), 0), 2))

    return {
        "labels": labels,
        "this_year": this_data,
        "last_year": last_data,
        "this_year_label": "Rolling 12M",
        "last_year_label": "Previous 12M",
    }


# ------------------------------------------------------------
# 6. DONATIONS TABLE (paginated)
# ------------------------------------------------------------
@router.get("/donations")
def get_donations_list(
    range: str = "30d",
    start: Optional[str] = None,
    end: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 25,
    db: Session = Depends(get_db),
):
    start_dt, end_dt = _parse_range(range, start, end)
    page = max(1, page)
    limit = max(1, min(limit, 200))

    q = db.query(Donation).filter(
        Donation.created_at >= start_dt,
        Donation.created_at <= end_dt,
    )
    st = _status_filter(status)
    if st:
        q = q.filter(Donation.status.in_(st))

    total = q.count()
    rows = q.order_by(Donation.id.desc()).offset((page - 1) * limit).limit(limit).all()

    items = []
    for d in rows:
        items.append({
            "id": d.id,
            "transaction_id": d.transaction_id,
            "donor_name": d.donor_name,
            "email": d.email,
            "phone": d.phone,
            "country_code": d.country_code,
            "amount": float(d.amount or 0),
            "currency": d.currency or "INR",
            "payment_method": d.payment_method,
            "cause_id": d.cause_id,
            "status": d.status,
            "created_at": d.created_at,
        })

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
        "items": items,
    }