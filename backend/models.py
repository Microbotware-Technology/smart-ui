from datetime import datetime
from sqlalchemy import JSON, Column, Date, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .database import Base

from sqlalchemy import Index

class Cause(Base):
    __tablename__ = "causes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True)
    category = Column(String(100), default="Education")
    description = Column(Text, nullable=False)
    target_amount = Column(Float, default=10000.0)
    raised_amount = Column(Float, default=0.0)
    image_url = Column(String(500), nullable=True)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    donations = relationship("Donation", back_populates="cause")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    event_date = Column(String(100), nullable=False) # e.g. "25 Aug 2026"
    event_time = Column(String(100), default="10:00 AM - 4:00 PM")
    description = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)
    organizer = Column(String(255), default="Smart Help Foundation Charity")
    registered_count = Column(Integer, default=0)
    capacity = Column(Integer, default=200)
    created_at = Column(DateTime, default=datetime.utcnow)

    registrations = relationship("EventRegistration", back_populates="event")

class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    status = Column(String(50), default="Confirmed")
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="registrations")

class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    donor_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    country_code = Column(String(20), nullable=True)
    instagram = Column(String(100), nullable=True)
    occasion = Column(String(255), nullable=True)
    label_name = Column(String(255), nullable=True)
    service_date = Column(String(100), nullable=True)
    special_requests = Column(Text, nullable=True)
    items_json = Column(Text, nullable=True)
    photos_json = Column(Text, nullable=True)
    currency = Column(String(20), default="INR")
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), default="Credit Card")
    cause_id = Column(Integer, ForeignKey("causes.id"), nullable=True)
    status = Column(String(50), default="Pending")
    transaction_id = Column(String(100), nullable=True)
    razorpay_payment_id = Column(String(100), nullable=True, index=True) 
    razorpay_order_id   = Column(String(100), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    state         = Column(String, nullable=True)
    city          = Column(String, nullable=True)
    banner_name   = Column(String, nullable=True)
    cake_name     = Column(String, nullable=True)
    occasion_date = Column(Date, nullable=True)
    cake_qty      = Column(Integer, nullable=True)
    cake_shape    = Column(String, nullable=True)
    parcel_photo  = Column(String, nullable=True)
    print_size    = Column(String(20), nullable=True)   # ← NEW ("A3" | "A4")
    print_photos_json = Column(JSON, nullable=True)
    print_photo   = Column(String, nullable=True)
    banner_photos_json = Column(JSON, nullable=True)
    cake_photo    = Column(String, nullable=True)
    extra_items_json   = Column(JSON, nullable=True)

    cause = relationship("Cause", back_populates="donations")

class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    occupation = Column(String(100), nullable=True)
    skills = Column(String(255), nullable=True)
    message = Column(Text, nullable=True)
    status = Column(String(50), default="Pending") # Pending, Approved, Rejected
    created_at = Column(DateTime, default=datetime.utcnow)

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    subject = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    status = Column(String(20), default="pending", nullable=False, index=True) 
    created_at = Column(DateTime, default=datetime.utcnow)

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)
    old_price = Column(Float, nullable=True)
    category = Column(String(100), default="General")
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    stock = Column(Integer, default=50)
    rating = Column(Float, default=5.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    total_amount = Column(Float, nullable=False)
    items_json = Column(Text, nullable=False) # JSON array string of items
    payment_method = Column(String(50), default="Card")
    status = Column(String(50), default="Processing")
    created_at = Column(DateTime, default=datetime.utcnow)

class Subscriber(Base):
    __tablename__ = "subscribers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    subscribed_at = Column(DateTime, default=datetime.utcnow)
 

# ============================================================
# ADMIN USER
# ============================================================

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="viewer")   # super_admin | editor | viewer
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# ============================================================
# CONTACT ACTIVITY TRACKING
# ============================================================

class ContactActivity(Base):
    __tablename__ = "contact_activities"

    id = Column(Integer, primary_key=True, index=True)
    activity_type = Column(String(20), nullable=False, index=True)  # "call" | "email" | "whatsapp"
    page_url = Column(String(500), nullable=True)
    session_id = Column(String(100), nullable=True, index=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)