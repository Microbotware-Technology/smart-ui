from typing import List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import (
    verify_credentials, create_token, get_current_admin,
    get_current_super_admin, change_admin_password, VALID_ROLES,
)
from ..database import get_db
from ..models import Admin
from ..schemas import AdminCreate, AdminUpdateRole, AdminResetPassword, AdminResponse
from ..security import hash_password


router = APIRouter(prefix="/admin", tags=["Admin Auth"])


# ============================================================
# AUTH
# ============================================================

@router.post("/login")
def admin_login(payload: dict, db: Session = Depends(get_db)):
    username = (payload or {}).get("username", "").strip()
    password = (payload or {}).get("password", "")

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password required")

    admin = verify_credentials(username, password, db)
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_token(admin.username)
    return {
        "ok": True,
        "token": token,
        "username": admin.username,
        "role": admin.role or "viewer",
        "expires_in": 24 * 3600,
    }


@router.get("/me")
def admin_me(admin: dict = Depends(get_current_admin)):
    return {"ok": True, "username": admin.get("sub"), "role": admin.get("role")}


@router.post("/logout")
def admin_logout(admin: dict = Depends(get_current_admin)):
    return {"ok": True}


@router.post("/change-password")
def admin_change_password(
    payload: dict,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    old_password = (payload or {}).get("old_password", "")
    new_password = (payload or {}).get("new_password", "")

    if not old_password or not new_password:
        raise HTTPException(status_code=400, detail="old_password and new_password required")
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    username = admin.get("sub")
    ok = change_admin_password(username, old_password, new_password, db)
    if not ok:
        raise HTTPException(status_code=400, detail="Old password is incorrect")

    return {"ok": True, "message": "Password updated"}


# ============================================================
# ADMIN MANAGEMENT (Super Admin only)
# ============================================================

@router.get("/admins", response_model=List[AdminResponse])
def list_admins(
    _: dict = Depends(get_current_super_admin),
    db: Session = Depends(get_db),
):
    return db.query(Admin).order_by(Admin.id.asc()).all()


@router.post("/admins", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
def create_admin(
    payload: AdminCreate,
    current: dict = Depends(get_current_super_admin),
    db: Session = Depends(get_db),
):
    username = (payload.username or "").strip()
    password = payload.password or ""
    role = (payload.role or "viewer").strip().lower()

    if len(username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")

    if db.query(Admin).filter(Admin.username == username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    admin = Admin(
        username=username,
        password_hash=hash_password(password),
        role=role,
        is_active=True,
        created_at=datetime.utcnow(),
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


@router.patch("/admins/{admin_id}/role", response_model=AdminResponse)
def update_admin_role(
    admin_id: int,
    payload: AdminUpdateRole,
    current: dict = Depends(get_current_super_admin),
    db: Session = Depends(get_db),
):
    new_role = (payload.role or "").strip().lower()
    if new_role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")

    target = db.query(Admin).filter(Admin.id == admin_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Admin not found")

    # Prevent demoting the last super_admin
    if target.role == "super_admin" and new_role != "super_admin":
        super_count = db.query(Admin).filter(Admin.role == "super_admin", Admin.is_active == True).count()
        if super_count <= 1:
            raise HTTPException(status_code=400, detail="Cannot demote the last Super Admin")

    target.role = new_role
    db.commit()
    db.refresh(target)
    return target


@router.post("/admins/{admin_id}/reset-password")
def reset_admin_password(
    admin_id: int,
    payload: AdminResetPassword,
    current: dict = Depends(get_current_super_admin),
    db: Session = Depends(get_db),
):
    new_password = payload.new_password or ""
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    target = db.query(Admin).filter(Admin.id == admin_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Admin not found")

    target.password_hash = hash_password(new_password)
    db.commit()
    return {"ok": True, "message": f"Password reset for {target.username}"}


@router.post("/admins/{admin_id}/toggle-active", response_model=AdminResponse)
def toggle_admin_active(
    admin_id: int,
    current: dict = Depends(get_current_super_admin),
    db: Session = Depends(get_db),
):
    target = db.query(Admin).filter(Admin.id == admin_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Admin not found")

    if target.username == current.get("sub"):
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")

    if target.role == "super_admin" and target.is_active:
        super_count = db.query(Admin).filter(Admin.role == "super_admin", Admin.is_active == True).count()
        if super_count <= 1:
            raise HTTPException(status_code=400, detail="Cannot deactivate the last Super Admin")

    target.is_active = not target.is_active
    db.commit()
    db.refresh(target)
    return target


@router.delete("/admins/{admin_id}")
def delete_admin(
    admin_id: int,
    current: dict = Depends(get_current_super_admin),
    db: Session = Depends(get_db),
):
    target = db.query(Admin).filter(Admin.id == admin_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Admin not found")

    if target.username == current.get("sub"):
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    if target.role == "super_admin":
        super_count = db.query(Admin).filter(Admin.role == "super_admin", Admin.is_active == True).count()
        if super_count <= 1:
            raise HTTPException(status_code=400, detail="Cannot delete the last Super Admin")

    db.delete(target)
    db.commit()
    return {"ok": True}