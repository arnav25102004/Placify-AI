import os
from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.auth_utils import get_password_hash

def seed_db():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == "teacher@placify.ai").first()
        if not existing:
            teacher = User(
                email="teacher@placify.ai",
                password_hash=get_password_hash("password123"),
                role="teacher",
                campus_id=1
            )
            db.add(teacher)
            db.commit()
            print("Successfully seeded teacher user (teacher@placify.ai / password123)")
        else:
            print("Teacher user teacher@placify.ai already exists.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
