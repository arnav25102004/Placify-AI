import os
from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.auth_utils import get_password_hash

from app.logging_config import get_logger

logger = get_logger("placify.seed")

def seed_db():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        existing_teacher = db.query(User).filter(User.email == "teacher@placify.ai").first()
        if not existing_teacher:
            teacher = User(
                email="teacher@placify.ai",
                password_hash=get_password_hash("password123"),
                role="teacher",
                campus_id=1
            )
            db.add(teacher)
            logger.info("Seeded default teacher user: teacher@placify.ai")

        existing_student = db.query(User).filter(User.email == "student@placify.ai").first()
        if not existing_student:
            student = User(
                email="student@placify.ai",
                password_hash=get_password_hash("password123"),
                role="student",
                campus_id=1
            )
            db.add(student)
            logger.info("Seeded default student user: student@placify.ai")

        existing_admin = db.query(User).filter(User.email == "admin@placify.ai").first()
        if not existing_admin:
            admin = User(
                email="admin@placify.ai",
                password_hash=get_password_hash("password123"),
                role="admin",
                campus_id=1
            )
            db.add(admin)
            logger.info("Seeded default admin user: admin@placify.ai")

        existing_dev_admin = db.query(User).filter(User.email == "admin@gmail.com").first()
        if not existing_dev_admin:
            dev_admin = User(
                email="admin@gmail.com",
                password_hash=get_password_hash("admin123"),
                role="admin",
                campus_id=1
            )
            db.add(dev_admin)
            logger.info("Seeded dev admin user: admin@gmail.com")
        else:
            existing_dev_admin.password_hash = get_password_hash("admin123")
            existing_dev_admin.role = "admin"

        existing_pr = db.query(User).filter(User.email == "pr@placify.ai").first()
        if not existing_pr:
            pr = User(
                email="pr@placify.ai",
                password_hash=get_password_hash("password123"),
                role="pr",
                campus_id=1
            )
            db.add(pr)
            logger.info("Seeded default PR user: pr@placify.ai")

        existing_coord = db.query(User).filter(User.email == "coordinator@placify.ai").first()
        if not existing_coord:
            coord = User(
                email="coordinator@placify.ai",
                password_hash=get_password_hash("password123"),
                role="placement_coordinator",
                campus_id=1
            )
            db.add(coord)
            logger.info("Seeded default coordinator user: coordinator@placify.ai")

        # Christ University Faculty Account
        existing_cu_fac = db.query(User).filter(User.email == "faculty@christuniversity.in").first()
        if not existing_cu_fac:
            cu_fac = User(
                email="faculty@christuniversity.in",
                password_hash=get_password_hash("password123"),
                role="teacher",
                campus_id=1
            )
            db.add(cu_fac)
            logger.info("Seeded Christ University Faculty: faculty@christuniversity.in")

        # Christ University Student Account (MCA Program)
        existing_cu_stud = db.query(User).filter(User.email == "arnav@mca.christuniversity.in").first()
        if not existing_cu_stud:
            cu_stud = User(
                email="arnav@mca.christuniversity.in",
                password_hash=get_password_hash("password123"),
                role="student",
                campus_id=1
            )
            db.add(cu_stud)
            logger.info("Seeded Christ University Student: arnav@mca.christuniversity.in")

        db.commit()
        logger.info("Database seeding validation complete.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}", exc_info=True)
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
