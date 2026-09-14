from typing import List, Optional
from pydantic import BaseModel


class SeniorProfile(BaseModel):
    id: int
    name: str
    batch: str
    department: str
    company: str
    role: str
    package_lpa: float
    offer_type: str = "Full-Time"
    skills: List[str] = []
    interview_experience: Optional[str] = None
    linkedin_url: Optional[str] = None
    email: Optional[str] = None
    referral_status: str = "Available"
    campus: str = "Bangalore Main Campus"


class CreateSeniorRequest(BaseModel):
    name: str
    batch: str
    department: str
    company: str
    role: str
    package_lpa: float
    offer_type: str = "Full-Time"
    skills: List[str] = []
    interview_experience: Optional[str] = None
    linkedin_url: Optional[str] = None
    email: Optional[str] = None
    referral_status: str = "Available"
    campus: str = "Bangalore Main Campus"


class RecruitingCompany(BaseModel):
    id: int
    name: str
    industry: str
    tier: str
    avg_package_lpa: float
    highest_package_lpa: float
    total_offers: int
    years_visited: List[str]
    roles: List[str]
    selection_process: List[str]
    eligibility: str
    website: Optional[str] = None
