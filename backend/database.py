import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from .config import settings

# ---------- Engine ----------
if settings.DB_TYPE == "mysql":
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
        pool_recycle=3600,
        pool_size=50,          # base pool (was 5)
        max_overflow=50,       # extra burst (was 10)
        pool_timeout=30,       # wait 30s for a connection
        echo=False,
    )
else:
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def ensure_sqlite_schema():
    """
    Add missing columns to existing tables.
    Works for both SQLite and MySQL via SQLAlchemy Inspector.
    """
    from sqlalchemy import inspect

    inspector = inspect(engine)

    # ---------- admins.role ----------
    if "admins" in inspector.get_table_names():
        admin_cols = {c["name"] for c in inspector.get_columns("admins")}
        if "role" not in admin_cols:
            with engine.begin() as conn:
                conn.exec_driver_sql(
                    "ALTER TABLE admins ADD COLUMN role VARCHAR(20) DEFAULT 'super_admin'"
                )
                conn.exec_driver_sql(
                    "UPDATE admins SET role = 'super_admin' WHERE role IS NULL OR role = ''"
                )

    # ---------- contact_messages.status ----------
    if "contact_messages" in inspector.get_table_names():
        cm_cols = {c["name"] for c in inspector.get_columns("contact_messages")}
        if "status" not in cm_cols:
            with engine.begin() as conn:
                conn.exec_driver_sql(
                    "ALTER TABLE contact_messages ADD COLUMN status VARCHAR(20) DEFAULT 'pending'"
                )
                conn.exec_driver_sql(
                    "UPDATE contact_messages SET status = CASE "
                    "WHEN is_read = 1 THEN 'read' ELSE 'pending' END "
                    "WHERE status IS NULL OR status = ''"
                )

    # ============================================================
    # DONATIONS — Razorpay columns (works for BOTH MySQL & SQLite)
    # ============================================================
    if "donations" in inspector.get_table_names():
        don_cols = {c["name"] for c in inspector.get_columns("donations")}
        with engine.begin() as conn:
            if "razorpay_payment_id" not in don_cols:
                conn.exec_driver_sql(
                    "ALTER TABLE donations ADD COLUMN razorpay_payment_id VARCHAR(100)"
                )
            if "razorpay_order_id" not in don_cols:
                conn.exec_driver_sql(
                    "ALTER TABLE donations ADD COLUMN razorpay_order_id VARCHAR(100)"
                )
    # ============================================================
    # DONATIONS — Extended donor / print / cake / photo columns
    # (works for BOTH MySQL & SQLite)
    # ============================================================
    if "donations" in inspector.get_table_names():
        don_cols = {c["name"] for c in inspector.get_columns("donations")}
        json_type = "JSON" if settings.DB_TYPE == "mysql" else "TEXT"
        extended = {
            "state":              "VARCHAR(100)",
            "city":               "VARCHAR(100)",
            "banner_name":        "VARCHAR(255)",
            "cake_name":          "VARCHAR(255)",
            "occasion_date":      "DATE",
            "cake_qty":           "INTEGER",
            "cake_shape":         "VARCHAR(50)",
            "parcel_photo":       "VARCHAR(500)",
            "print_photo":        "VARCHAR(500)",
            "print_photos_json":  json_type,
            "print_size":         "VARCHAR(20)",
            "banner_photos_json": json_type,
            "cake_photo":         "VARCHAR(500)",
            "extra_items_json":   json_type,
        }
        added_new_cols = set()
        with engine.begin() as conn:
            for col, ddl in extended.items():
                if col not in don_cols:
                    conn.exec_driver_sql(
                        f"ALTER TABLE donations ADD COLUMN {col} {ddl}"
                    )
                    added_new_cols.add(col)

            # ---- Backfill print_size from items_json (idempotent, safe on every startup) ----
            # Only touches rows where print_size IS NULL — so it self-limits.
            try:
                rows = conn.exec_driver_sql(
                    "SELECT id, items_json FROM donations "
                    "WHERE print_size IS NULL AND items_json IS NOT NULL"
                ).fetchall()
                updated = 0
                for r in rows:
                    try:
                        items = json.loads(r[1] or "[]")
                        if not isinstance(items, list):
                            continue
                        size = None
                        for it in items:
                            if not isinstance(it, dict):
                                continue
                            nm = (it.get("name") or "").upper()
                            if "A3" in nm and "PHOTO" in nm:
                                size = "A3"
                                break
                            if "A4" in nm and "PHOTO" in nm:
                                size = "A4"
                                break
                        if size:
                            conn.exec_driver_sql(
                                "UPDATE donations SET print_size = ? WHERE id = ?",
                                (size, r[0])
                            )
                            updated += 1
                    except Exception:
                        continue
                if updated:
                    print(f"[migration] Backfilled print_size for {updated} donation(s)")
            except Exception as e:
                print(f"[migration] print_size backfill skipped: {e}")
    # ============================================================
    # SQLite-only: legacy donation/order column migrations
    # ============================================================
    if settings.DB_TYPE != "sqlite":
        return

    with engine.begin() as conn:
        donation_columns = {
            row[1] for row in conn.exec_driver_sql("PRAGMA table_info(donations)").fetchall()
        }
        for column, ddl in {
            "phone": "VARCHAR(50)",
            "country_code": "VARCHAR(20)",
            "instagram": "VARCHAR(100)",
            "occasion": "VARCHAR(255)",
            "label_name": "VARCHAR(255)",
            "service_date": "VARCHAR(100)",
            "special_requests": "TEXT",
            "items_json": "TEXT",
            "currency": "VARCHAR(20) DEFAULT 'INR'",
        }.items():
            if column not in donation_columns:
                conn.exec_driver_sql(f"ALTER TABLE donations ADD COLUMN {column} {ddl}")

        order_columns = {
            row[1] for row in conn.exec_driver_sql("PRAGMA table_info(orders)").fetchall()
        }
        if "payment_method" not in order_columns:
            conn.exec_driver_sql(
                "ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'Card'"
            )
            
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()