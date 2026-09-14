import hashlib
import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_student
from app.logging_config import get_logger
from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentStatus
from app.schemas.student import SeniorProfile, CreateSeniorRequest, RecruitingCompany
from app.services.drive_adapter import drive_adapter
from app.tasks.extraction import extract_document, process_document_extraction

logger = get_logger("placify.student")
router = APIRouter(prefix="/api/v1/student", tags=["student"])

# In-memory realistic initial dataset for seniors (dynamically appended with POST)
_INITIAL_SENIORS = [
    {
        "id": 1,
        "name": "Priya Venkatesh",
        "batch": "2024",
        "department": "Computer Science & Engineering",
        "company": "Uber",
        "role": "Software Engineer II",
        "package_lpa": 38.5,
        "offer_type": "Full-Time",
        "skills": ["Distributed Systems", "Golang", "Microservices", "System Design"],
        "interview_experience": "3 Technical rounds focusing on Distributed Concurrency, Graph algorithms, and LLD. Emphasize low-latency design and edge-case handling.",
        "linkedin_url": "https://linkedin.com/in/priya-venkatesh-uber",
        "email": "priya.v@alumni.christuniversity.in",
        "referral_status": "Available",
        "campus": "Bangalore Main Campus",
    },
    {
        "id": 2,
        "name": "Karan Nair",
        "batch": "2024",
        "department": "Information Technology",
        "company": "Amazon",
        "role": "Cloud Support Associate",
        "package_lpa": 24.0,
        "offer_type": "Full-Time",
        "skills": ["AWS", "Linux Kernel", "Docker", "Networking", "Python"],
        "interview_experience": "Strong emphasis on Amazon Leadership Principles (Customer Obsession, Ownership). Hands-on troubleshooting test and AWS architecture scenarios.",
        "linkedin_url": "https://linkedin.com/in/karan-nair-cloud",
        "email": "karan.n@alumni.christuniversity.in",
        "referral_status": "Available",
        "campus": "Bangalore Main Campus",
    },
    {
        "id": 3,
        "name": "Rohan Mukherjee",
        "batch": "2024",
        "department": "Master of Computer Applications",
        "company": "Goldman Sachs",
        "role": "Summer Analyst (Engineering)",
        "package_lpa": 26.0,
        "offer_type": "Full-Time",
        "skills": ["Data Structures", "Dynamic Programming", "Core Java", "Financial Engineering"],
        "interview_experience": "Aptitude + CoderPad round. In-person interviews grilled extensively on HashMaps internals, Garbage Collection, and tree traversals.",
        "linkedin_url": "https://linkedin.com/in/rohan-mukherjee-gs",
        "email": "rohan.m@alumni.christuniversity.in",
        "referral_status": "Limited",
        "campus": "Bangalore Central Campus",
    },
    {
        "id": 4,
        "name": "Ananya Iyer",
        "batch": "2024",
        "department": "Computer Science & Engineering",
        "company": "Microsoft",
        "role": "Software Engineer",
        "package_lpa": 32.0,
        "offer_type": "Full-Time",
        "skills": ["C++", "Azure", "Algorithms", "Object-Oriented Design"],
        "interview_experience": "4 rounds of DSA and System Architecture. Prepare Tree & Trie algorithms, plus trade-offs in distributed caching.",
        "linkedin_url": "https://linkedin.com/in/ananya-iyer-msft",
        "email": "ananya.i@alumni.christuniversity.in",
        "referral_status": "Available",
        "campus": "Bangalore Main Campus",
    },
    {
        "id": 5,
        "name": "Devansh Kothari",
        "batch": "2023",
        "department": "Computer Science & Engineering",
        "company": "Atlassian",
        "role": "Software Development Engineer",
        "package_lpa": 42.0,
        "offer_type": "Full-Time",
        "skills": ["Java", "Spring Boot", "React", "Kafka", "High Availability"],
        "interview_experience": "Values round is just as decisive as system design. Code craft round evaluates clean code principles and unit test coverage.",
        "linkedin_url": "https://linkedin.com/in/devansh-atlassian",
        "email": "devansh.k@alumni.christuniversity.in",
        "referral_status": "Available",
        "campus": "Bangalore Main Campus",
    },
    {
        "id": 6,
        "name": "Sneha Sen",
        "batch": "2024",
        "department": "Electronics & Communication Engineering",
        "company": "Cisco Systems",
        "role": "Consulting Engineer",
        "package_lpa": 19.5,
        "offer_type": "Full-Time",
        "skills": ["TCP/IP", "BGP", "Python Automation", "Network Security"],
        "interview_experience": "Deep packet analysis questions, subnets, and scripting. Be ready to explain packet flow through a router step-by-step.",
        "linkedin_url": "https://linkedin.com/in/sneha-sen-cisco",
        "email": "sneha.s@alumni.christuniversity.in",
        "referral_status": "Available",
        "campus": "Kengeri Campus",
    },
    {
        "id": 7,
        "name": "Vikramaditya Singh",
        "batch": "2023",
        "department": "Computer Science & Engineering",
        "company": "Google India",
        "role": "Software Engineer (Platforms)",
        "package_lpa": 35.0,
        "offer_type": "Full-Time",
        "skills": ["C++", "Operating Systems", "Linux", "Competitive Programming"],
        "interview_experience": "5 coding rounds. Speed, optimal time/space complexity, and bug-free production code are paramount.",
        "linkedin_url": "https://linkedin.com/in/vikram-singh-google",
        "email": "vikram.s@alumni.christuniversity.in",
        "referral_status": "Closed",
        "campus": "Bangalore Main Campus",
    },
    {
        "id": 8,
        "name": "Meera Nambiar",
        "batch": "2024",
        "department": "Master of Computer Applications",
        "company": "Oracle",
        "role": "Cloud Database Engineer",
        "package_lpa": 18.0,
        "offer_type": "Full-Time",
        "skills": ["SQL Internals", "Database Sharding", "Python", "Oracle Cloud"],
        "interview_experience": "Index tuning, ACID vs BASE, and SQL query optimizations under heavy concurrent load.",
        "linkedin_url": "https://linkedin.com/in/meera-oracle",
        "email": "meera.n@alumni.christuniversity.in",
        "referral_status": "Available",
        "campus": "Bangalore Central Campus",
    }
]

_SENIOR_STORE: List[dict] = list(_INITIAL_SENIORS)

_COMPANIES_STORE = [
    {
        "id": 1,
        "name": "Google India",
        "industry": "Internet & Software Products",
        "tier": "Super Dream (20+ LPA)",
        "avg_package_lpa": 34.5,
        "highest_package_lpa": 44.0,
        "total_offers": 14,
        "years_visited": ["2024", "2025", "2026"],
        "roles": ["Software Engineer", "Application Engineer", "Site Reliability Engineer"],
        "selection_process": ["Online OA (HackerRank)", "3x Technical DSA Rounds", "Googliness & Leadership"],
        "eligibility": "B.Tech CS/IT, MCA | CGPA >= 8.0 | No standing arrears",
        "website": "https://careers.google.com",
    },
    {
        "id": 2,
        "name": "Microsoft",
        "industry": "Enterprise Cloud & Software",
        "tier": "Super Dream (20+ LPA)",
        "avg_package_lpa": 31.0,
        "highest_package_lpa": 42.0,
        "total_offers": 18,
        "years_visited": ["2024", "2025", "2026"],
        "roles": ["Software Development Engineer", "Support Engineer", "Cloud Solutions Architect"],
        "selection_process": ["Online Codility Assessment", "System Design & Algorithms", "AA (As Appropriate) Round"],
        "eligibility": "B.Tech all circuital, MCA | CGPA >= 7.5",
        "website": "https://careers.microsoft.com",
    },
    {
        "id": 3,
        "name": "Amazon",
        "industry": "E-Commerce & Cloud Infrastructure",
        "tier": "Super Dream (20+ LPA)",
        "avg_package_lpa": 28.5,
        "highest_package_lpa": 40.0,
        "total_offers": 24,
        "years_visited": ["2024", "2025", "2026"],
        "roles": ["Software Development Engineer 1", "Cloud Support Associate", "Data Engineer"],
        "selection_process": ["Online Debugging & Coding", "Behavioral Leadership Review", "Technical Bar Raiser"],
        "eligibility": "B.Tech all branches, MCA | CGPA >= 7.0",
        "website": "https://amazon.jobs",
    },
    {
        "id": 4,
        "name": "Atlassian",
        "industry": "Enterprise Collaboration Tools",
        "tier": "Super Dream (20+ LPA)",
        "avg_package_lpa": 39.5,
        "highest_package_lpa": 52.0,
        "total_offers": 8,
        "years_visited": ["2024", "2025", "2026"],
        "roles": ["Graduate Software Engineer", "Product Specialist"],
        "selection_process": ["Code Pair Coding", "System Design Round", "Values & Cultural Interview"],
        "eligibility": "B.Tech CS/IT | CGPA >= 8.0",
        "website": "https://atlassian.com/company/careers",
    },
    {
        "id": 5,
        "name": "Goldman Sachs",
        "industry": "Investment Banking & FinTech",
        "tier": "Super Dream (20+ LPA)",
        "avg_package_lpa": 27.0,
        "highest_package_lpa": 36.0,
        "total_offers": 15,
        "years_visited": ["2024", "2025", "2026"],
        "roles": ["Summer Analyst", "Full-Time Analyst", "Quant Developer"],
        "selection_process": ["Math & Aptitude + Coding Test", "Technical Interview 1 & 2", "Managing Director Round"],
        "eligibility": "B.Tech all branches, MCA, M.Tech | CGPA >= 7.5",
        "website": "https://goldmansachs.com/careers",
    },
    {
        "id": 6,
        "name": "Cisco Systems",
        "industry": "Networking & Telecommunications",
        "tier": "Dream (10-20 LPA)",
        "avg_package_lpa": 18.5,
        "highest_package_lpa": 24.0,
        "total_offers": 32,
        "years_visited": ["2024", "2025", "2026"],
        "roles": ["Software Engineer", "Consulting Engineer", "Network Assurance Specialist"],
        "selection_process": ["Online Aptitude + Coding", "Tech Interview (Networks + C++)", "Managerial & HR"],
        "eligibility": "B.Tech CS/IT/ECE/EEE | CGPA >= 7.0",
        "website": "https://jobs.cisco.com",
    },
    {
        "id": 7,
        "name": "Oracle",
        "industry": "Cloud Database & Applications",
        "tier": "Dream (10-20 LPA)",
        "avg_package_lpa": 17.5,
        "highest_package_lpa": 22.0,
        "total_offers": 28,
        "years_visited": ["2024", "2025", "2026"],
        "roles": ["Associate Applications Developer", "Cloud Support Engineer", "Database Specialist"],
        "selection_process": ["Oracle Online Assessment", "Database & Coding Interview", "HR Round"],
        "eligibility": "B.Tech all circuital, MCA | CGPA >= 7.0",
        "website": "https://oracle.com/corporate/careers",
    },
    {
        "id": 8,
        "name": "JP Morgan Chase & Co.",
        "industry": "Financial Services & Banking Tech",
        "tier": "Dream (10-20 LPA)",
        "avg_package_lpa": 19.0,
        "highest_package_lpa": 25.0,
        "total_offers": 22,
        "years_visited": ["2024", "2025", "2026"],
        "roles": ["Software Engineer (SEP Program)", "Analyst - Risk Technology"],
        "selection_process": ["HackerRank Coding", "Code for Good Hackathon / Interview", "Final Behavioral Round"],
        "eligibility": "B.Tech CS/IT/ECE | CGPA >= 7.5",
        "website": "https://careers.jpmorgan.com",
    },
    {
        "id": 9,
        "name": "Deloitte Digital",
        "industry": "Management & Technology Consulting",
        "tier": "Dream (10-20 LPA)",
        "avg_package_lpa": 11.5,
        "highest_package_lpa": 15.0,
        "total_offers": 46,
        "years_visited": ["2024", "2025", "2026"],
        "roles": ["Analyst - Solutions Engineering", "Cybersecurity Consultant"],
        "selection_process": ["Online Aptitude & Reasoning", "Technical Case Study", "Partner Interview"],
        "eligibility": "B.Tech, MCA, MBA | CGPA >= 6.5",
        "website": "https://deloitte.com/careers",
    },
    {
        "id": 10,
        "name": "TCS Digital & Prime",
        "industry": "IT Services & Enterprise Consulting",
        "tier": "Core / Mass",
        "avg_package_lpa": 9.2,
        "highest_package_lpa": 11.5,
        "total_offers": 110,
        "years_visited": ["2024", "2025", "2026"],
        "roles": ["Digital Innovator", "Systems Engineer", "Cloud Migration Associate"],
        "selection_process": ["TCS NQT Assessment (Advanced Section)", "Technical Interview", "HR Interview"],
        "eligibility": "All engineering & computer science branches | CGPA >= 6.0",
        "website": "https://tcs.com/careers",
    }
]


@router.get("/seniors", response_model=List[SeniorProfile])
def list_seniors(
    search: Optional[str] = Query(None, description="Search by name, company, or skills"),
    company: Optional[str] = Query(None, description="Filter by company"),
    department: Optional[str] = Query(None, description="Filter by department"),
    batch: Optional[str] = Query(None, description="Filter by graduating batch"),
):
    """
    Returns verified placed senior directory records for peer mentorship and referral connections.
    """
    results = _SENIOR_STORE

    if search:
        s = search.lower().strip()
        results = [
            sen for sen in results
            if s in sen["name"].lower()
            or s in sen["company"].lower()
            or s in sen["role"].lower()
            or any(s in skill.lower() for skill in sen.get("skills", []))
        ]

    if company:
        results = [sen for sen in results if sen["company"].lower() == company.lower()]

    if department:
        results = [sen for sen in results if department.lower() in sen["department"].lower()]

    if batch:
        results = [sen for sen in results if sen["batch"] == batch]

    return results


@router.post("/seniors", response_model=SeniorProfile, status_code=201)
def add_senior(
    payload: CreateSeniorRequest,
):
    """
    Allows adding or seeding new senior profile records.
    """
    new_id = max([s["id"] for s in _SENIOR_STORE], default=0) + 1
    new_senior = {
        "id": new_id,
        "name": payload.name,
        "batch": payload.batch,
        "department": payload.department,
        "company": payload.company,
        "role": payload.role,
        "package_lpa": payload.package_lpa,
        "offer_type": payload.offer_type,
        "skills": payload.skills,
        "interview_experience": payload.interview_experience,
        "linkedin_url": payload.linkedin_url,
        "email": payload.email,
        "referral_status": payload.referral_status,
        "campus": payload.campus,
    }
    _SENIOR_STORE.insert(0, new_senior)
    logger.info(f"Added new senior record id={new_id}: '{payload.name}' at '{payload.company}'")
    return new_senior


@router.get("/companies", response_model=List[RecruitingCompany])
def list_previous_companies(
    search: Optional[str] = Query(None, description="Search by company name or role"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    tier: Optional[str] = Query(None, description="Filter by recruitment tier"),
):
    """
    Returns historical placement recruiting companies, packages offered, and hiring processes.
    """
    results = _COMPANIES_STORE

    if search:
        s = search.lower().strip()
        results = [
            comp for comp in results
            if s in comp["name"].lower()
            or any(s in role.lower() for role in comp.get("roles", []))
        ]

    if industry:
        results = [comp for comp in results if industry.lower() in comp["industry"].lower()]

    if tier:
        import re
        norm_filter = re.sub(r'[^a-z0-9]', '', tier.lower())
        results = [comp for comp in results if norm_filter in re.sub(r'[^a-z0-9]', '', comp["tier"].lower())]

    return results


@router.post("/offer-letter", response_model=DocumentStatus, status_code=202)
def submit_offer_letter(
    file: UploadFile,
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """
    Allows a student to upload their single offer letter.
    Uploads file to Google Drive, persists Document row, and enqueues Celery extraction.
    """
    if not file:
        raise HTTPException(status_code=400, detail="Offer letter file is required")

    content = file.file.read()
    if not content:
        raise HTTPException(status_code=400, detail="File content cannot be empty")

    file_hash = hashlib.sha256(content).hexdigest()
    filename = file.filename or "student_offer_letter.pdf"
    content_type = file.content_type or "application/pdf"

    # Stream/upload raw file to Google Drive
    drive_res = drive_adapter.upload_file(content, filename, content_type)

    doc = Document(
        batch_id=None,
        student_id=current_student.id,
        submission_source="student_self",
        drive_file_id=drive_res["drive_file_id"],
        drive_view_link=drive_res["drive_view_link"],
        file_hash=file_hash,
        status="pending",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    logger.info(f"Student id={current_student.id} submitted offer letter '{filename}', enqueued document id={doc.id}")

    # Enqueue async extraction job
    use_celery = False
    if os.getenv("TESTING") != "true":
        try:
            import redis
            r = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"), socket_timeout=0.5)
            r.ping()
            use_celery = True
        except Exception:
            use_celery = False

    if use_celery:
        try:
            extract_document.delay(doc.id)
        except Exception:
            process_document_extraction(doc.id, db=db)
    else:
        process_document_extraction(doc.id, db=db)

    db.refresh(doc)

    return DocumentStatus(
        id=doc.id,
        status=doc.status,
        submission_source=doc.submission_source,
        student_id=doc.student_id,
        batch_id=doc.batch_id,
    )


@router.get("/my-submissions", response_model=List[DocumentStatus])
def list_my_submissions(
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """
    Returns all offer letter submissions uploaded by the logged-in student.
    """
    return db.query(Document).filter(Document.student_id == current_student.id).all()
