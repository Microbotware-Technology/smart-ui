import logging

from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .models import Cause, Event, Product, Donation, Volunteer, ContactMessage, Order

logger = logging.getLogger("uvicorn.error")


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Cause).first():
            logger.info("Seed: database already contains data; skipping demo seed.")
            return

        logger.info("Seed: seeding initial Smart Help Foundation demo data...")

        # 1. Seed Causes
        causes = [
            Cause(
                title="Ensure Pure Clean Water for Rural Children",
                slug="pure-clean-water-rural-children",
                category="Clean Water",
                description="Help us build deep solar-powered water wells to bring clean, drinkable water to remote villages.",
                target_amount=15000.0,
                raised_amount=10450.0,
                image_url="assets/images/cause/img-1.jpg",
                is_featured=True
            ),
            Cause(
                title="Quality Education & Books for Underprivileged Kids",
                slug="quality-education-underprivileged-kids",
                category="Education",
                description="Providing school supplies, backpacks, textbooks, and digital learning kits to over 500 children.",
                target_amount=12000.0,
                raised_amount=8750.0,
                image_url="assets/images/cause/img-2.jpg",
                is_featured=True
            ),
            Cause(
                title="Emergency Medical Assistance & Nutrition Support",
                slug="emergency-medical-assistance-nutrition",
                category="Healthcare",
                description="Funding mobile health clinics and emergency medical relief kits for malnourished infants and families.",
                target_amount=25000.0,
                raised_amount=18200.0,
                image_url="assets/images/cause/img-3.jpg",
                is_featured=True
            )
        ]
        db.add_all(causes)
        db.commit()

        # 2. Seed Events
        events = [
            Event(
                title="Global Charity Marathon & Walkathon 2026",
                location="Central Park, New York",
                event_date="25 Aug 2026",
                event_time="08:00 AM - 02:00 PM",
                description="Join hundreds of runners and volunteers raising money for clean water projects worldwide.",
                image_url="assets/images/event/img-1.jpg",
                capacity=500,
                registered_count=342
            ),
            Event(
                title="Youth Empowerment & Vocational Workshop",
                location="Community Center, Chicago",
                event_date="12 Sep 2026",
                event_time="10:00 AM - 04:00 PM",
                description="Hands-on digital skills and career guidance sessions for youth from underserved neighborhoods.",
                image_url="assets/images/event/img-2.jpg",
                capacity=200,
                registered_count=118
            )
        ]
        db.add_all(events)
        db.commit()

        # 3. Seed Products
        products = [
            Product(
                title="Handcrafted Eco-Friendly Charity Tote Bag",
                price=25.00,
                old_price=35.00,
                category="Accessories",
                description="Organic cotton canvas bag supporting women artisans in developing communities.",
                image_url="assets/images/shop/img-1.jpg",
                stock=100
            ),
            Product(
                title="Smart Help Foundation Hope Ceramic Water Bottle",
                price=18.00,
                old_price=22.00,
                category="Lifestyle",
                description="BPA-free reusable water bottle. 100% of proceeds go directly to village well projects.",
                image_url="assets/images/shop/img-2.jpg",
                stock=75
            ),
            Product(
                title="Charity Volunteer Organic Cotton T-Shirt",
                price=30.00,
                old_price=40.00,
                category="Apparel",
                description="Comfortable, high-quality t-shirt with Smart Help Foundation Foundation emblem.",
                image_url="assets/images/shop/img-3.jpg",
                stock=150
            )
        ]
        db.add_all(products)
        db.commit()

        # 4. Seed Donations
        donations = [
            Donation(donor_name="Sarah Jenkins", email="sarah.j@example.com", amount=500.0, payment_method="Credit Card", cause_id=1, status="Completed", transaction_id="TXN-9812A"),
            Donation(donor_name="Michael Chang", email="m.chang@example.com", amount=250.0, payment_method="PayPal", cause_id=2, status="Completed", transaction_id="TXN-4410B"),
            Donation(donor_name="Elena Rostova", email="elena@example.com", amount=1000.0, payment_method="Bank Transfer", cause_id=3, status="Completed", transaction_id="TXN-7733C")
        ]
        db.add_all(donations)

        # 5. Seed Volunteers
        volunteers = [
            Volunteer(full_name="David Miller", email="david.m@example.com", phone="+1 555-0192", occupation="Software Engineer", skills="Web Dev, Logistics", message="Excited to contribute to tech & education initiatives!", status="Approved"),
            Volunteer(full_name="Sophia Martinez", email="sophia.m@example.com", phone="+1 555-0144", occupation="Nurse", skills="First Aid, Medical Outreach", message="Available for weekend medical relief camps.", status="Pending")
        ]
        db.add_all(volunteers)

        # 6. Seed Contact Messages
        messages = [
            ContactMessage(name="Robert Taylor", email="robert.t@example.com", phone="+1 555-0821", subject="Corporate Partnership Inquiry", message="We would love to sponsor Smart Help Foundation's upcoming clean water initiative.", is_read=False)
        ]
        db.add_all(messages)

        db.commit()
        logger.info("Seed: demo data successfully seeded.")
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    seed_database()