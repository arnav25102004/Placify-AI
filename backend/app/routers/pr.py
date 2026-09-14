import hashlib
import os
from typing import List, Optional
from fastapi import APIRouter, Depends, Form, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_pr
from app.logging_config import get_logger
from app.models.document import Document
from app.models.extraction import Extraction
from app.models.managed_student import ManagedStudent
from app.models.user import User
from app.schemas.pr import (
    ManagedStudentSchema,
    CreateManagedStudentRequest,
    UpdateStudentOfferRequest,
    FacultyOptionSchema,
    ProgramCohortAllocationSchema,
    UpdateProgramAllocationRequest,
)
from app.services.drive_adapter import drive_adapter
from app.tasks.extraction import extract_document, process_document_extraction

logger = get_logger("placify.pr")
router = APIRouter(prefix="/api/v1/pr", tags=["pr"])


def _to_schema(db: Session, student: ManagedStudent) -> ManagedStudentSchema:
    """Builds the API response by joining the roster row to its latest Document+Extraction."""
    latest_doc = (
        db.query(Document)
        .filter(Document.managed_student_id == student.id)
        .order_by(Document.id.desc())
        .first()
    )
    extraction = None
    if latest_doc:
        extraction = (
            db.query(Extraction)
            .filter(Extraction.document_id == latest_doc.id)
            .order_by(Extraction.id.desc())
            .first()
        )

    faculty_name = None
    if student.incharge_faculty_id:
        faculty = db.query(User).filter(User.id == student.incharge_faculty_id).first()
        faculty_name = (faculty.full_name or faculty.email) if faculty else None

    return ManagedStudentSchema(
        id=str(student.id),
        name=student.name,
        rollNo=student.roll_no,
        email=student.email or "",
        phone=student.phone or "",
        cgpa=student.cgpa or "",
        department=student.department or "",
        batchTimeline=student.batch_timeline or "",
        assignedPrId=str(student.pr_id),
        assignedPrName="",
        status=student.status,
        company=extraction.company if extraction else (latest_doc.company_name_hint if latest_doc else None),
        role=extraction.role if extraction else (latest_doc.role_title_hint if latest_doc else None),
        packageLPA=float(extraction.package) if extraction and extraction.package is not None else None,
        assignedFaculty=faculty_name,
        hasOfferLetter=latest_doc is not None,
        offerFileName=latest_doc.drive_file_id if latest_doc else None,
        photoUrl=student.photo_url,
    )


@router.get("/students", response_model=List[ManagedStudentSchema])
def list_managed_students(
    search: Optional[str] = Query(None, description="Search by name, roll number, or company"),
    status: Optional[str] = Query(None, description="Filter by status"),
    department: Optional[str] = Query(None, description="Filter by department"),
    current_pr: User = Depends(get_current_pr),
    db: Session = Depends(get_db),
):
    """Returns the PR's cohort roster with placement status, derived from real documents/extractions."""
    query = db.query(ManagedStudent)
    if current_pr.role != "admin":
        query = query.filter(ManagedStudent.pr_id == current_pr.id)

    if status:
        query = query.filter(ManagedStudent.status == status)
    if department:
        query = query.filter(ManagedStudent.department == department)

    students = query.all()
    results = [_to_schema(db, s) for s in students]

    if search:
        s = search.lower().strip()
        results = [
            r for r in results
            if s in r.name.lower()
            or s in r.rollNo.lower()
            or (r.company and s in r.company.lower())
            or (r.role and s in r.role.lower())
        ]

    return results


@router.post("/students", response_model=ManagedStudentSchema, status_code=201)
def add_managed_student(
    payload: CreateManagedStudentRequest,
    current_pr: User = Depends(get_current_pr),
    db: Session = Depends(get_db),
):
    """Registers a student into the PR's assigned cohort roster."""
    student = ManagedStudent(
        name=payload.name,
        roll_no=payload.rollNo.upper(),
        email=payload.email or f"{payload.rollNo.lower()}@college.edu",
        phone=payload.phone or "+91 98765 00000",
        cgpa=payload.cgpa,
        department=payload.department,
        batch_timeline=payload.batchTimeline,
        pr_id=current_pr.id,
        campus_id=current_pr.campus_id,
        status="Unplaced",
        photo_url=payload.photoUrl,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    logger.info(f"Registered student {student.name} ({student.roll_no}) to PR cohort id={student.id} by pr_id={current_pr.id}")
    return _to_schema(db, student)


@router.put("/students/{student_id}", response_model=ManagedStudentSchema)
def update_student_roster_info(
    student_id: int,
    payload: UpdateStudentOfferRequest,
    current_pr: User = Depends(get_current_pr),
    db: Session = Depends(get_db),
):
    """Updates roster metadata (name/phone/cgpa/department) for a managed student."""
    student = db.query(ManagedStudent).filter(ManagedStudent.id == student_id).first()
    if not student or (current_pr.role != "admin" and student.pr_id != current_pr.id):
        raise HTTPException(status_code=404, detail="Student record not found in cohort roster")

    if payload.name is not None:
        student.name = payload.name
    if payload.phone is not None:
        student.phone = payload.phone
    if payload.cgpa is not None:
        student.cgpa = payload.cgpa
    if payload.department is not None:
        student.department = payload.department

    db.commit()
    db.refresh(student)
    logger.info(f"Updated roster info for managed_student_id={student_id}")
    return _to_schema(db, student)


@router.post("/students/{student_id}/request-offer", response_model=ManagedStudentSchema)
def request_offer(
    student_id: int,
    file: UploadFile,
    company: str = Form(...),
    role: str = Form(...),
    offer_type: str = Form("Full-time"),
    incharge_faculty_id: Optional[int] = Form(None),
    current_pr: User = Depends(get_current_pr),
    db: Session = Depends(get_db),
):
    """
    PR reports a student's offer with the letter attached directly. Creates a real Document,
    uploads the file, links it to the roster student, and enqueues extraction.
    """
    student = db.query(ManagedStudent).filter(ManagedStudent.id == student_id).first()
    if not student or (current_pr.role != "admin" and student.pr_id != current_pr.id):
        raise HTTPException(status_code=404, detail="Student record not found in cohort roster")

    if incharge_faculty_id is not None:
        faculty = db.query(User).filter(User.id == incharge_faculty_id, User.role == "teacher").first()
        if not faculty:
            raise HTTPException(status_code=400, detail="incharge_faculty_id must reference a valid teacher")

    content = file.file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Offer letter file cannot be empty")

    file_hash = hashlib.sha256(content).hexdigest()
    filename = file.filename or "offer_letter.pdf"
    content_type = file.content_type or "application/pdf"

    drive_res = drive_adapter.upload_file(content, filename, content_type)

    doc = Document(
        batch_id=None,
        student_id=None,
        submission_source="pr_request",
        drive_file_id=drive_res["drive_file_id"],
        drive_view_link=drive_res["drive_view_link"],
        file_hash=file_hash,
        status="pending",
        managed_student_id=student.id,
        requested_by_id=current_pr.id,
        incharge_faculty_id=incharge_faculty_id,
        company_name_hint=company,
        role_title_hint=role,
        offer_type_hint=offer_type,
    )
    db.add(doc)

    student.status = "Letter_Uploaded"
    if incharge_faculty_id is not None:
        student.incharge_faculty_id = incharge_faculty_id

    db.commit()
    db.refresh(doc)
    logger.info(
        f"PR id={current_pr.id} reported offer for managed_student_id={student.id}: "
        f"company='{company}', role='{role}', document id={doc.id}"
    )

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

    db.refresh(student)
    return _to_schema(db, student)


@router.get("/faculty-roster", response_model=List[FacultyOptionSchema])
def list_faculty_roster(
    current_pr: User = Depends(get_current_pr),
    db: Session = Depends(get_db),
):
    """Same-campus teacher list for assigning an in-charge reviewer to a request."""
    faculty = (
        db.query(User)
        .filter(User.role == "teacher", User.campus_id == current_pr.campus_id)
        .all()
    )
    return [
        FacultyOptionSchema(id=f.id, name=f.full_name or f.email, email=f.email)
        for f in faculty
    ]


# --- Program Cohort Allocations (Super Admin governance) — unchanged, still in-memory ---
# Out of scope for this reconciliation: not part of the real-data gap it closes.
import datetime
import math

_ALLOCATIONS_STORE = [
    {
        "id": "prog-cse",
        "programName": "B.Tech Computer Science & Engineering",
        "departmentCode": "CSE",
        "totalStudents": 300,
        "studentsPerPR": 15,
        "totalPRsNeeded": 20,
        "activePRsAssigned": 20,
        "academicYear": "2024-2025",
        "status": "Active",
        "notes": "Circuital branch with heavy product firm placement drive focus.",
        "lastUpdatedBy": "Super Admin",
        "lastUpdatedAt": "2026-09-14",
    },
    {
        "id": "prog-it",
        "programName": "B.Tech Information Technology",
        "departmentCode": "IT",
        "totalStudents": 180,
        "studentsPerPR": 18,
        "totalPRsNeeded": 10,
        "activePRsAssigned": 10,
        "academicYear": "2024-2025",
        "status": "Active",
        "notes": "Standard 3-section IT cohort.",
        "lastUpdatedBy": "Super Admin",
        "lastUpdatedAt": "2026-09-14",
    },
    {
        "id": "prog-mca",
        "programName": "Master of Computer Applications",
        "departmentCode": "MCA",
        "totalStudents": 120,
        "studentsPerPR": 12,
        "totalPRsNeeded": 10,
        "activePRsAssigned": 10,
        "academicYear": "2024-2025",
        "status": "Active",
        "notes": "2-year postgraduate program requiring direct placement guidance.",
        "lastUpdatedBy": "Super Admin",
        "lastUpdatedAt": "2026-09-14",
    },
    {
        "id": "prog-ece",
        "programName": "B.Tech Electronics & Communication",
        "departmentCode": "ECE",
        "totalStudents": 240,
        "studentsPerPR": 20,
        "totalPRsNeeded": 12,
        "activePRsAssigned": 11,
        "academicYear": "2024-2025",
        "status": "Active",
        "notes": "Hardware and telecom placement track.",
        "lastUpdatedBy": "Super Admin",
        "lastUpdatedAt": "2026-09-14",
    },
    {
        "id": "prog-ds",
        "programName": "M.Tech Data Science & AI",
        "departmentCode": "MTech DS",
        "totalStudents": 60,
        "studentsPerPR": 10,
        "totalPRsNeeded": 6,
        "activePRsAssigned": 6,
        "academicYear": "2024-2025",
        "status": "Active",
        "notes": "Research-focused cohort with direct faculty advisor connections.",
        "lastUpdatedBy": "Super Admin",
        "lastUpdatedAt": "2026-09-14",
    },
    {
        "id": "prog-mbatech",
        "programName": "MBA (Technology Management)",
        "departmentCode": "MBA-Tech",
        "totalStudents": 150,
        "studentsPerPR": 15,
        "totalPRsNeeded": 10,
        "activePRsAssigned": 9,
        "academicYear": "2024-2025",
        "status": "Active",
        "notes": "Techno-managerial & consulting recruitment pipeline.",
        "lastUpdatedBy": "Super Admin",
        "lastUpdatedAt": "2026-09-14",
    },
]


@router.get("/cohort-allocations", response_model=List[ProgramCohortAllocationSchema])
def list_cohort_allocations():
    """Returns program-wise PR cohort allocation policies configured by the Super Admin."""
    return _ALLOCATIONS_STORE


@router.put("/cohort-allocations/{allocation_id}", response_model=ProgramCohortAllocationSchema)
def update_cohort_allocation(allocation_id: str, payload: UpdateProgramAllocationRequest):
    """Allows Super Admin to set how many students a PR handles per program."""
    for alloc in _ALLOCATIONS_STORE:
        if alloc["id"] == allocation_id:
            alloc["studentsPerPR"] = max(1, payload.studentsPerPR)
            if payload.totalStudents is not None:
                alloc["totalStudents"] = payload.totalStudents
            if payload.programName is not None:
                alloc["programName"] = payload.programName
            if payload.notes is not None:
                alloc["notes"] = payload.notes

            alloc["totalPRsNeeded"] = math.ceil(alloc["totalStudents"] / alloc["studentsPerPR"])
            alloc["lastUpdatedBy"] = "Super Admin"
            alloc["lastUpdatedAt"] = datetime.date.today().isoformat()
            logger.info(f"Super Admin updated allocation {allocation_id}: {alloc['studentsPerPR']} students/PR")
            return alloc

    raise HTTPException(status_code=404, detail="Program cohort allocation policy not found")
