from datetime import datetime, date
from typing import Optional, List, Any
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict

# Cause Schemas
class CauseBase(BaseModel):
    title: str
    category: Optional[str] = "Education"
    description: str
    target_amount: Optional[float] = 10000.0
    goal_amount: Optional[float] = None
    raised_amount: Optional[float] = 0.0
    image_url: Optional[str] = None
    is_featured: Optional[bool] = False


class CauseCreate(CauseBase):
    pass

class CauseResponse(CauseBase):
    id: int
    slug: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Event Schemas
class EventBase(BaseModel):
    title: str
    location: str
    event_date: str
    event_time: Optional[str] = "10:00 AM - 4:00 PM"
    description: str
    image_url: Optional[str] = None
    organizer: Optional[str] = "Smart Help Foundation Charity"
    capacity: Optional[int] = 200

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: int
    registered_count: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class EventRegistrationCreate(BaseModel):
    name: str
    email: EmailStr

class EventRegistrationResponse(EventRegistrationCreate):
    id: int
    event_id: int
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Donation Schemas
class DonationCreate(BaseModel):
    donor_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    country_code: Optional[str] = None
    instagram: Optional[str] = None
    occasion: Optional[str] = None
    label: Optional[str] = None
    label_name: Optional[str] = None
    service_date: Optional[str] = None
    date: Optional[str] = None
    special_requests: Optional[str] = None
    items_json: Optional[str] = None
    photos_json: Optional[str] = None
    currency: Optional[str] = None
    amount: float
    payment_method: Optional[str] = "Credit Card"
    cause_id: Optional[int] = None
    transaction_id: Optional[str] = None
    # Razorpay verification fields (sent by frontend after successful payment)
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    # Extended fields (all optional — backward compatible)
    state: Optional[str] = None
    city: Optional[str] = None
    banner_name: Optional[str] = None
    cake_name: Optional[str] = None
    occasion_date: Optional[str] = None   # "YYYY-MM-DD" from frontend
    cake_qty: Optional[int] = None
    cake_shape: Optional[str] = None
    parcel_photo: Optional[str] = None
    print_size: Optional[str] = None
    print_photo: Optional[str] = None
    print_photos_json: Optional[Any] = None
    banner_photos_json: Optional[Any] = None
    cake_photo: Optional[str] = None
    extra_items_json: Optional[Any] = None

class DonationResponse(BaseModel):
    id: int
    donor_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    country_code: Optional[str] = None
    instagram: Optional[str] = None
    occasion: Optional[str] = None
    label_name: Optional[str] = None
    service_date: Optional[str] = None
    special_requests: Optional[str] = None
    items_json: Optional[str] = None
    photos_json: Optional[str] = None
    currency: Optional[str] = None
    amount: float
    payment_method: str
    cause_id: Optional[int]
    status: str
    transaction_id: Optional[str]
    razorpay_payment_id: Optional[str] = None   
    razorpay_order_id: Optional[str] = None
    created_at: datetime
    state: Optional[str] = None
    city: Optional[str] = None
    banner_name: Optional[str] = None
    cake_name: Optional[str] = None
    occasion_date: Optional[date] = None
    cake_qty: Optional[int] = None
    cake_shape: Optional[str] = None
    parcel_photo: Optional[str] = None
    print_size: Optional[str] = None
    print_photo: Optional[str] = None
    print_photos_json: Optional[Any] = None
    banner_photos_json: Optional[Any] = None
    cake_photo: Optional[str] = None
    extra_items_json: Optional[Any] = None
    model_config = ConfigDict(from_attributes=True)

# Volunteer Schemas
class VolunteerCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    occupation: Optional[str] = None
    skills: Optional[str] = None
    message: Optional[str] = None

class VolunteerResponse(VolunteerCreate):
    id: int
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Contact Schemas
class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str

class ContactResponse(ContactCreate):
    id: int
    is_read: bool
    status: str = "pending"          # NEW
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ContactStatusUpdate(BaseModel):    # NEW
    status: str

# Newsletter Schema
class SubscriberCreate(BaseModel):
    email: EmailStr

class SubscriberResponse(SubscriberCreate):
    id: int
    subscribed_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Product Schemas
class ProductBase(BaseModel):
    title: str
    price: float
    old_price: Optional[float] = None
    category: Optional[str] = "General"
    description: Optional[str] = None
    image_url: Optional[str] = None
    stock: Optional[int] = 50

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    rating: float
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Order Schemas
class OrderCreate(BaseModel):
    customer_name: str
    email: EmailStr
    phone: str
    address: str
    city: str
    total_amount: float
    items_json: str
    payment_method: Optional[str] = "Card"

class OrderResponse(OrderCreate):
    id: int
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class VolunteerStatusUpdate(BaseModel):
    status: str

# Admin Dashboard Stats Schema
class DashboardStats(BaseModel):
    total_donations: float
    donations_count: int
    active_causes: int
    volunteers_count: int
    pending_volunteers: int
    unread_messages: int
    total_orders: int
    recent_donations: List[DonationResponse]
    recent_volunteers: List[VolunteerResponse]
    recent_messages: List[ContactResponse]


# ============================================================
# CONTACT ACTIVITY SCHEMAS
# ============================================================

class ActivityCreate(BaseModel):
    activity_type: str          # "call" | "email" | "whatsapp"
    page_url: Optional[str] = None
    session_id: Optional[str] = None
    user_agent: Optional[str] = None


class ActivityResponse(BaseModel):
    id: int
    activity_type: str
    page_url: Optional[str] = None
    session_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ActivityStats(BaseModel):
    today_call: int = 0
    today_email: int = 0
    today_whatsapp: int = 0
    total_call: int = 0
    total_email: int = 0
    total_whatsapp: int = 0

# ============================================================
# ADMIN MANAGEMENT SCHEMAS
# ============================================================

class AdminCreate(BaseModel):
    username: str
    password: str
    role: str = "viewer"    # super_admin | editor | viewer


class AdminUpdateRole(BaseModel):
    role: str


class AdminResetPassword(BaseModel):
    new_password: str


class AdminResponse(BaseModel):
    id: int
    username: str
    role: str
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
