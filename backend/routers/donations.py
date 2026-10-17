import os
import uuid
import time
import socket
from pathlib import Path
from typing import List, Optional
import io
from PIL import Image
import hmac
import hashlib 
import json
from datetime import datetime as _dt

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import razorpay

from ..database import get_db
from ..models import Donation, Cause
from ..schemas import DonationCreate, DonationResponse

# ---- Force IPv4 (fixes Windows Razorpay timeouts) ----
_orig_getaddrinfo = socket.getaddrinfo
def _ipv4_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    return _orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = _ipv4_getaddrinfo

# Load .env from backend/ directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

router = APIRouter(prefix="/donations", tags=["Donations"])

# ---------------- Razorpay client ----------------
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
# Set 15s timeout to prevent hanging requests
razorpay_client.session.timeout =  (10, 15)

# ---------------- Photo upload dir ----------------
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

#  Compression settings
MAX_WIDTH = 1920
MAX_HEIGHT = 1920
JPEG_QUALITY = 85
THUMB_SIZE = 300


def compress_image(file_bytes: bytes) -> bytes:
    """Compress + resize image. Returns JPEG bytes."""
    img = Image.open(io.BytesIO(file_bytes))

    # Handle transparency → convert to RGB (JPEG format ku venum)
    if img.mode in ("RGBA", "P", "LA"):
        bg = Image.new("RGB", img.size, (255, 255, 255))
        mask = img.split()[-1] if img.mode in ("RGBA", "LA") else None
        bg.paste(img, mask=mask)
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")

    # Resize if too large
    if img.width > MAX_WIDTH or img.height > MAX_HEIGHT:
        img.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.LANCZOS)

    # Compress
    output = io.BytesIO()
    img.save(output, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    return output.getvalue()


def make_thumbnail(file_bytes: bytes, size: int = THUMB_SIZE) -> bytes:
    """Small thumbnail for list views."""
    img = Image.open(io.BytesIO(file_bytes))

    if img.mode in ("RGBA", "P", "LA"):
        bg = Image.new("RGB", img.size, (255, 255, 255))
        mask = img.split()[-1] if img.mode in ("RGBA", "LA") else None
        bg.paste(img, mask=mask)
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")

    img.thumbnail((size, size), Image.LANCZOS)

    output = io.BytesIO()
    img.save(output, format="JPEG", quality=75, optimize=True)
    return output.getvalue()

# ============================================================
# 0. UPLOAD PHOTOS  →  POST /api/donations/upload-photos
# ============================================================
@router.post("/upload-photos")
async def upload_photos(files: List[UploadFile] = File(...)):
    """
    Accepts up to 3 image files (jpg/jpeg/png, max 15MB each).
    Compresses + resizes automatically + creates thumbnails.
    Returns: { urls: [...], thumbnails: [...], savings: [...] }
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    if len(files) > 30:
        raise HTTPException(status_code=400, detail="Maximum 30 photos per request")

    ALLOWED = {"image/jpeg", "image/jpg", "image/png"}
    MAX_MB = 15
    urls = []
    thumbnails = []
    savings = []

    for f in files:
        if f.content_type not in ALLOWED:
            raise HTTPException(status_code=400, detail=f"Invalid type: {f.content_type}")

        content = await f.read()
        if len(content) > MAX_MB * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"{f.filename} exceeds {MAX_MB} MB")

        # 👇 COMPRESS
        try:
            compressed = compress_image(content)
            thumb = make_thumbnail(content)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"{f.filename}: invalid image ({e})")

        # Save with unique name
        stem = uuid.uuid4().hex
        fname = f"{stem}.jpg"           # always JPEG after compression
        thumb_name = f"thumb_{stem}.jpg"

        (UPLOAD_DIR / fname).write_bytes(compressed)
        (UPLOAD_DIR / thumb_name).write_bytes(thumb)

        urls.append(f"/uploads/{fname}")
        thumbnails.append(f"/uploads/{thumb_name}")

        # Log savings
        orig_kb = len(content) // 1024
        comp_kb = len(compressed) // 1024
        saving_pct = int((1 - len(compressed) / len(content)) * 100) if content else 0
        savings.append({
            "original_kb": orig_kb,
            "compressed_kb": comp_kb,
            "saving_percent": saving_pct,
        })

    return {
        "urls": urls,
        "thumbnails": thumbnails,
        "savings": savings,
    }


# ============================================================
# 1. CREATE RAZORPAY ORDER  →  POST /api/donations/create-order
# ============================================================
@router.post("/create-order")
def create_order(payload: dict):
    """
    Frontend sends: { amount: 5150, currency: 'INR', receipt: 'don_xxx' }
    Returns: { order_id, key_id, amount, currency }
    """
    try:
        amount_inr = float(payload.get("amount", 0))
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid amount")

    if amount_inr <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")

    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env"
        )

    receipt = payload.get("receipt") or f"don_{int(time.time())}"

    try:
        order = razorpay_client.order.create({
            "amount": int(round(amount_inr * 100)),   # rupees → paise
            "currency": payload.get("currency", "INR"),
            "receipt": receipt,
            "payment_capture": 1
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Razorpay order failed: {str(e)}")

    return {
        "order_id": order["id"],
        "key_id": RAZORPAY_KEY_ID,
        "amount": order["amount"],          # in paise (frontend-க்கு தேவை இல்ல)
        "currency": order["currency"]
    }


# ============================================================
# 2. VERIFY PAYMENT (optional)  →  POST /api/donations/verify
# ============================================================
@router.post("/verify")
def verify_payment(payload: dict):
    """
    payload: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
    """
    try:
        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": payload["razorpay_order_id"],
            "razorpay_payment_id": payload["razorpay_payment_id"],
            "razorpay_signature": payload["razorpay_signature"]
        })
        return {"status": "verified"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Signature verification failed: {str(e)}")

# ============================================================
# 2b. VERIFY + COMPLETE  →  POST /api/donations/verify-payment
# ============================================================
@router.post("/verify-payment")
def verify_and_complete(payload: dict, db: Session = Depends(get_db)):
    """
    Called by Razorpay Checkout handler after successful payment.
    1. Verify signature (HMAC)
    2. Update the pre-created Pending donation → Completed
    """
    donation_id  = payload.get("donation_id")
    order_id     = payload.get("razorpay_order_id")
    payment_id   = payload.get("razorpay_payment_id")
    signature    = payload.get("razorpay_signature")

    if not all([donation_id, order_id, payment_id, signature]):
        raise HTTPException(status_code=400, detail="Missing required fields")

    # 1) Verify signature via Razorpay SDK
    try:
        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Signature verification failed: {e}")

    # 2) Find the donation
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    # 3) Idempotency — already completed?
    if (donation.status or "").lower() == "completed":
        return {"ok": True, "status": "Completed", "note": "already verified"}

    # 4) Update status
    donation.status = "Completed"
    # Store Razorpay refs separately — DO NOT overwrite transaction_id
    donation.razorpay_payment_id = payment_id
    donation.razorpay_order_id = order_id

    # 5) Cause total-ஐ increment (if cause_id present)
    if donation.cause_id:
        cause = db.query(Cause).filter(Cause.id == donation.cause_id).first()
        if cause:
            cause.raised_amount = (cause.raised_amount or 0.0) + (donation.amount or 0.0)

    db.commit()
    db.refresh(donation)

    return {
        "ok": True,
        "id": donation.id,
        "status": donation.status,
        "transaction_id": donation.transaction_id,
    }

# ============================================================
# 3. GET ALL DONATIONS  →  GET /api/donations
# ============================================================
@router.get("", response_model=List[DonationResponse])
def get_donations(limit: int = 20, db: Session = Depends(get_db)):
    return db.query(Donation).order_by(Donation.id.desc()).limit(limit).all()


# ============================================================
# 4. CREATE DONATION (after payment)  →  POST /api/donations
# ============================================================
@router.post("", response_model=DonationResponse, status_code=status.HTTP_201_CREATED)
def process_donation(donation: DonationCreate, db: Session = Depends(get_db)):
    if donation.amount <= 0:
        raise HTTPException(status_code=400, detail="Donation amount must be greater than zero")
    if donation.cause_id and not db.query(Cause).filter(Cause.id == donation.cause_id).first():
        raise HTTPException(status_code=404, detail="Cause not found")

    # ------------------------------------------------------------
    # Determine status based on Razorpay signature verification
    # ------------------------------------------------------------
    donation_status = "Pending"

    if donation.razorpay_order_id and donation.razorpay_payment_id and donation.razorpay_signature:
        # All 3 fields present → verify with Razorpay
        try:
            razorpay_client.utility.verify_payment_signature({
                "razorpay_order_id": donation.razorpay_order_id,
                "razorpay_payment_id": donation.razorpay_payment_id,
                "razorpay_signature": donation.razorpay_signature
            })
            donation_status = "Completed"
        except Exception as e:
            # Signature invalid → reject, do NOT save
            raise HTTPException(
                status_code=400,
                detail=f"Payment signature verification failed: {str(e)}"
            )
    elif donation.razorpay_payment_id and not donation.razorpay_signature:
        # Payment ID without signature → suspicious, reject
        raise HTTPException(
            status_code=400,
            detail="Missing razorpay_signature for payment verification"
        )
    # else: no razorpay fields at all → manual/pending entry

    tx_id = donation.transaction_id or f"TXN-{uuid.uuid4().hex[:10].upper()}"

    # -------- Normalize extended fields --------
    def _safe_json(v):
        if v is None:
            return None
        if isinstance(v, (list, dict)):
            return v
        try:
            return json.loads(v)
        except Exception:
            return None

    def _safe_date(v):
        if not v:
            return None
        try:
            return _dt.strptime(str(v), "%Y-%m-%d").date()
        except Exception:
            return None

    db_donation = Donation(
        donor_name=donation.donor_name,
        email=donation.email,
        phone=donation.phone,
        country_code=donation.country_code,
        instagram=donation.instagram,
        occasion=donation.occasion,
        label_name=donation.label_name or donation.label,
        service_date=donation.service_date or donation.date,
        special_requests=donation.special_requests,
        items_json=donation.items_json,
        photos_json=donation.photos_json,
        currency=donation.currency or "INR",
        amount=donation.amount,
        payment_method=donation.payment_method or "Razorpay",
        cause_id=donation.cause_id,
        status=donation_status,
        transaction_id=tx_id,
        # Extended fields
        state=donation.state,
        city=donation.city,
        banner_name=donation.banner_name,
        cake_name=donation.cake_name,
        occasion_date=_safe_date(donation.occasion_date),
        cake_qty=donation.cake_qty,
        cake_shape=donation.cake_shape,
        parcel_photo=donation.parcel_photo,
        print_size=donation.print_size,
        print_photo=donation.print_photo,
        print_photos_json=_safe_json(donation.print_photos_json),
        banner_photos_json=_safe_json(donation.banner_photos_json),
        cake_photo=donation.cake_photo,
        extra_items_json=_safe_json(donation.extra_items_json),
    )
    db.add(db_donation)

    # Only increment cause raised_amount for verified/completed donations
    if donation.cause_id and donation_status == "Completed":
        cause = db.query(Cause).filter(Cause.id == donation.cause_id).first()
        cause.raised_amount = (cause.raised_amount or 0.0) + donation.amount

    db.commit()
    db.refresh(db_donation)
    return db_donation

# ============================================================
# 5. UPDATE DONATION STATUS  →  POST /api/donations/{id}/status
# ============================================================
from pydantic import BaseModel

class StatusUpdatePayload(BaseModel):
    status: str


@router.post("/{donation_id}/status")
def update_donation_status(
    donation_id: int,
    payload: StatusUpdatePayload,
    db: Session = Depends(get_db),
):
    """
    Manually update donation status (admin action).

    Allowed transitions:
      Pending    → Completed / Failed
      Failed     → Completed
      Completed  → (locked — use direct DB query if needed)
    """
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    new_raw = (payload.status or "").strip().lower()
    new_norm = {
        "completed": "Completed",
        "failed": "Failed",
        "pending": "Pending",
    }.get(new_raw)

    if not new_norm:
        raise HTTPException(status_code=400, detail="Invalid status value")

    current_raw = (donation.status or "Pending").strip().lower()
    current_norm = {
        "completed": "Completed",
        "failed": "Failed",
        "pending": "Pending",
    }.get(current_raw, "Pending")

    # No-op
    if new_norm == current_norm:
        return {"ok": True, "status": donation.status, "message": "Already " + current_norm}

    # Locked state check — Completed cannot be reverted via API
    if current_norm == "Completed":
        raise HTTPException(
            status_code=400,
            detail="Completed donations are locked. Use a direct DB query to override.",
        )

    # Only these transitions allowed
    allowed = {
        "Pending": {"Completed", "Failed"},
        "Failed":  {"Completed"},
    }
    if new_norm not in allowed.get(current_norm, set()):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot change status from {current_norm} to {new_norm}.",
        )

    # Apply
    donation.status = new_norm

    # When a donation becomes Completed → add to cause total
    if new_norm == "Completed" and donation.cause_id:
        cause = db.query(Cause).filter(Cause.id == donation.cause_id).first()
        if cause:
            cause.raised_amount = (cause.raised_amount or 0.0) + (donation.amount or 0.0)

    db.commit()
    db.refresh(donation)

    return {
        "ok": True,
        "id": donation.id,
        "previous_status": current_norm,
        "status": donation.status,
    }