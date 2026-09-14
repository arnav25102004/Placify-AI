from sqlalchemy import Column, Integer, String, Float, Text
from app.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    industry = Column(String, nullable=False)
    tier = Column(String, nullable=False, default="Core / Regular (5-10 LPA)")
    avg_package_lpa = Column(Float, nullable=False, default=8.0)
    highest_package_lpa = Column(Float, nullable=False, default=12.0)
    total_offers = Column(Integer, nullable=False, default=0)
    years_visited = Column(Text, nullable=True)  # JSON or comma-separated
    roles = Column(Text, nullable=True)  # JSON or comma-separated
    selection_process = Column(Text, nullable=True)  # JSON or comma-separated
    eligibility = Column(Text, nullable=True)
    website = Column(String, nullable=True)
