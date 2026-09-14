import datetime
import math
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

from app.logging_config import get_logger
from app.schemas.pr import (
    ManagedStudentSchema,
    CreateManagedStudentRequest,
    UpdateStudentOfferRequest,
    ProgramCohortAllocationSchema,
    UpdateProgramAllocationRequest,
)

logger = get_logger("placify.pr")
router = APIRouter(prefix="/api/v1/pr", tags=["pr"])

# Realistic in-memory dataset of students assigned to PR cohort (with portrait photo URLs)
_MANAGED_STUDENTS_STORE: List[dict] = [
    {
        "id": "s-01",
        "name": "Arnav Sharma",
        "rollNo": "21CS042",
        "email": "arnav.s@college.edu",
        "phone": "+91 98765 43210",
        "cgpa": "8.92",
        "department": "CSE",
        "batchTimeline": "2021-2025",
        "assignedPrId": "pr-1",
        "assignedPrName": "Rohit Patel",
        "status": "Letter_Uploaded",
        "company": "Google India",
        "role": "SWE Intern + PPO",
        "packageLPA": 32.5,
        "assignedFaculty": "Dr. Anita Desai (HOD)",
        "hasOfferLetter": True,
        "offerFileName": "Google_India_Arnav_21CS042.pdf",
        "photoUrl": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    },
    {
        "id": "s-02",
        "name": "Divya Ramesh",
        "rollNo": "21CS019",
        "email": "divya.r@college.edu",
        "phone": "+91 98765 43211",
        "cgpa": "9.15",
        "department": "CSE",
        "batchTimeline": "2021-2025",
        "assignedPrId": "pr-1",
        "assignedPrName": "Rohit Patel",
        "status": "Verified_Placed",
        "company": "Microsoft",
        "role": "Cloud Solutions Eng.",
        "packageLPA": 28.0,
        "assignedFaculty": "Prof. S. Ranganathan",
        "hasOfferLetter": True,
        "offerFileName": "Microsoft_Divya_21CS019.pdf",
        "photoUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    },
    {
        "id": "s-03",
        "name": "Rahul Verma",
        "rollNo": "21CS088",
        "email": "rahul.v@college.edu",
        "phone": "+91 98765 43212",
        "cgpa": "7.84",
        "department": "CSE",
        "batchTimeline": "2021-2025",
        "assignedPrId": "pr-1",
        "assignedPrName": "Rohit Patel",
        "status": "Unplaced",
        "company": None,
        "role": None,
        "packageLPA": None,
        "assignedFaculty": None,
        "hasOfferLetter": False,
        "offerFileName": None,
        "photoUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    },
    {
        "id": "s-04",
        "name": "Tanvi Gupta",
        "rollNo": "21CS065",
        "email": "tanvi.g@college.edu",
        "phone": "+91 98765 43213",
        "cgpa": "8.45",
        "department": "CSE",
        "batchTimeline": "2021-2025",
        "assignedPrId": "pr-1",
        "assignedPrName": "Rohit Patel",
        "status": "Offer_Reported",
        "company": "Goldman Sachs",
        "role": "Summer Analyst",
        "packageLPA": 24.0,
        "assignedFaculty": "Dr. P. K. Sharma",
        "hasOfferLetter": False,
        "offerFileName": None,
        "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    },
    {
        "id": "s-05",
        "name": "Siddharth Kumar",
        "rollNo": "21CS102",
        "email": "siddharth.k@college.edu",
        "phone": "+91 98765 43214",
        "cgpa": "8.20",
        "department": "CSE",
        "batchTimeline": "2021-2025",
        "assignedPrId": "pr-1",
        "assignedPrName": "Rohit Patel",
        "status": "Offer_Reported",
        "company": "Oracle",
        "role": "Server Tech Eng.",
        "packageLPA": 18.0,
        "assignedFaculty": None,
        "hasOfferLetter": False,
        "offerFileName": None,
        "photoUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    },
    {
        "id": "s-06",
        "name": "Sneha Sen",
        "rollNo": "21CS034",
        "email": "sneha.s@college.edu",
        "phone": "+91 98765 43215",
        "cgpa": "8.70",
        "department": "CSE",
        "batchTimeline": "2021-2025",
        "assignedPrId": "pr-1",
        "assignedPrName": "Rohit Patel",
        "status": "Verified_Placed",
        "company": "Cisco Systems",
        "role": "Network Software Eng.",
        "packageLPA": 19.5,
        "assignedFaculty": "Dr. Anita Desai (HOD)",
        "hasOfferLetter": True,
        "offerFileName": "Cisco_Sneha_21CS034.pdf",
        "photoUrl": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    },
    {
        "id": "s-07",
        "name": "Ananya Iyer",
        "rollNo": "21CS011",
        "email": "ananya.i@college.edu",
        "phone": "+91 98765 43216",
        "cgpa": "8.90",
        "department": "CSE",
        "batchTimeline": "2021-2025",
        "assignedPrId": "pr-1",
        "assignedPrName": "Rohit Patel",
        "status": "Unplaced",
        "company": None,
        "role": None,
        "packageLPA": None,
        "assignedFaculty": None,
        "hasOfferLetter": False,
        "offerFileName": None,
        "photoUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    },
    {
        "id": "s-08",
        "name": "Vikram Malhotra",
        "rollNo": "21CS115",
        "email": "vikram.m@college.edu",
        "phone": "+91 98765 43217",
        "cgpa": "7.95",
        "department": "CSE",
        "batchTimeline": "2021-2025",
        "assignedPrId": "pr-1",
        "assignedPrName": "Rohit Patel",
        "status": "Unplaced",
        "company": None,
        "role": None,
        "packageLPA": None,
        "assignedFaculty": None,
        "hasOfferLetter": False,
        "offerFileName": None,
        "photoUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    },
    {
        "id": "s-09",
        "name": "Kavya Menon",
        "rollNo": "21CS054",
        "email": "kavya.m@college.edu",
        "phone": "+91 98765 43218",
        "cgpa": "8.65",
        "department": "CSE",
        "batchTimeline": "2021-2025",
        "assignedPrId": "pr-1",
        "assignedPrName": "Rohit Patel",
        "status": "Letter_Uploaded",
        "company": "Amazon",
        "role": "SDE-1",
        "packageLPA": 26.0,
        "assignedFaculty": "Prof. S. Ranganathan",
        "hasOfferLetter": True,
        "offerFileName": "Amazon_Kavya_21CS054.pdf",
        "photoUrl": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
    },
    {
        "id": "s-10",
        "name": "Nikhil Joshi",
        "rollNo": "21CS076",
        "email": "nikhil.j@college.edu",
        "phone": "+91 98765 43219",
        "cgpa": "8.12",
        "department": "CSE",
        "batchTimeline": "2021-2025",
        "assignedPrId": "pr-1",
        "assignedPrName": "Rohit Patel",
        "status": "Unplaced",
        "company": None,
        "role": None,
        "packageLPA": None,
        "assignedFaculty": None,
        "hasOfferLetter": False,
        "offerFileName": None,
        "photoUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
    },
    {
        "id": "s-11",
        "name": "Meera Nair",
        "rollNo": "21CS061",
        "email": "meera.n@college.edu",
        "phone": "+91 98765 43220",
        "cgpa": "8.50",
        "department": "CSE",
        "batchTimeline": "2021-2025",
        "assignedPrId": "pr-1",
        "assignedPrName": "Rohit Patel",
        "status": "Offer_Reported",
        "company": "Morgan Stanley",
        "role": "Tech Analyst",
        "packageLPA": 22.0,
        "assignedFaculty": None,
        "hasOfferLetter": False,
        "offerFileName": None,
        "photoUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    },
    {
        "id": "s-12",
        "name": "Aditya Roy",
        "rollNo": "21CS008",
        "email": "aditya.r@college.edu",
        "phone": "+91 98765 43221",
        "cgpa": "7.70",
        "department": "CSE",
        "batchTimeline": "2021-2025",
        "assignedPrId": "pr-1",
        "assignedPrName": "Rohit Patel",
        "status": "Unplaced",
        "company": None,
        "role": None,
        "packageLPA": None,
        "assignedFaculty": None,
        "hasOfferLetter": False,
        "offerFileName": None,
        "photoUrl": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80",
    },
    {
        "id": "s-13",
        "name": "Pooja Hegde",
        "rollNo": "21CS049",
        "email": "pooja.h@college.edu",
        "phone": "+91 98765 43222",
        "cgpa": "8.85",
        "department": "CSE",
        "batchTimeline": "2021-2025",
        "assignedPrId": "pr-1",
        "assignedPrName": "Rohit Patel",
        "status": "Verified_Placed",
        "company": "Adobe",
        "role": "Member Tech Staff",
        "packageLPA": 34.0,
        "assignedFaculty": "Dr. P. K. Sharma",
        "hasOfferLetter": True,
        "offerFileName": "Adobe_Pooja_21CS049.pdf",
        "photoUrl": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    },
    {
        "id": "s-14",
        "name": "Gaurav Shah",
        "rollNo": "21CS038",
        "email": "gaurav.s@college.edu",
        "phone": "+91 98765 43223",
        "cgpa": "8.30",
        "department": "CSE",
        "batchTimeline": "2021-2025",
        "assignedPrId": "pr-1",
        "assignedPrName": "Rohit Patel",
        "status": "Unplaced",
        "company": None,
        "role": None,
        "packageLPA": None,
        "assignedFaculty": None,
        "hasOfferLetter": False,
        "offerFileName": None,
        "photoUrl": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
    },
    {
        "id": "s-15",
        "name": "Rhea Chawla",
        "rollNo": "21CS093",
        "email": "rhea.c@college.edu",
        "phone": "+91 98765 43224",
        "cgpa": "9.05",
        "department": "CSE",
        "batchTimeline": "2021-2025",
        "assignedPrId": "pr-1",
        "assignedPrName": "Rohit Patel",
        "status": "Letter_Uploaded",
        "company": "Atlassian",
        "role": "Associate Developer",
        "packageLPA": 36.0,
        "assignedFaculty": "Dr. Anita Desai (HOD)",
        "hasOfferLetter": True,
        "offerFileName": "Atlassian_Rhea_21CS093.pdf",
        "photoUrl": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80",
    },
]

# In-memory store for Program Cohort Allocations (Super Admin Governance)
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


@router.get("/students", response_model=List[ManagedStudentSchema])
def list_managed_students(
    search: Optional[str] = Query(None, description="Search by name, roll number, or company"),
    status: Optional[str] = Query(None, description="Filter by status"),
    department: Optional[str] = Query(None, description="Filter by department"),
):
    """
    Returns the list of students in the PR cohort roster with placement status and portrait photos.
    """
    results = _MANAGED_STUDENTS_STORE

    if search:
        s = search.lower().strip()
        results = [
            st for st in results
            if s in st["name"].lower()
            or s in st["rollNo"].lower()
            or (st["company"] and s in st["company"].lower())
            or (st["role"] and s in st["role"].lower())
        ]

    if status:
        results = [st for st in results if st["status"] == status]

    if department:
        results = [st for st in results if st["department"].lower() == department.lower()]

    return results


@router.post("/students", response_model=ManagedStudentSchema, status_code=201)
def add_managed_student(payload: CreateManagedStudentRequest):
    """
    Allows a PR to register a student into their assigned cohort.
    """
    new_id = f"s-{len(_MANAGED_STUDENTS_STORE) + 1:02d}"
    email = payload.email or f"{payload.rollNo.lower()}@college.edu"
    phone = payload.phone or "+91 98765 00000"

    # Default fallback portrait if none provided
    photo = payload.photoUrl or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"

    new_student = {
        "id": new_id,
        "name": payload.name,
        "rollNo": payload.rollNo.upper(),
        "email": email,
        "phone": phone,
        "cgpa": payload.cgpa,
        "department": payload.department,
        "batchTimeline": payload.batchTimeline,
        "assignedPrId": payload.assignedPrId,
        "assignedPrName": payload.assignedPrName,
        "status": "Unplaced",
        "company": None,
        "role": None,
        "packageLPA": None,
        "assignedFaculty": None,
        "hasOfferLetter": False,
        "offerFileName": None,
        "photoUrl": photo,
    }
    _MANAGED_STUDENTS_STORE.append(new_student)
    logger.info(f"Registered student {new_student['name']} ({new_student['rollNo']}) to PR cohort id={new_id}")
    return new_student


@router.put("/students/{student_id}", response_model=ManagedStudentSchema)
def update_student_offer(student_id: str, payload: UpdateStudentOfferRequest):
    """
    Updates the placement offer, role, package, and assigned faculty reviewer for a student.
    """
    for idx, student in enumerate(_MANAGED_STUDENTS_STORE):
        if student["id"] == student_id:
            student["company"] = payload.company
            student["role"] = payload.role
            student["packageLPA"] = payload.packageLPA
            student["assignedFaculty"] = payload.assignedFaculty
            student["status"] = payload.status
            if payload.offerFileName:
                student["hasOfferLetter"] = True
                student["offerFileName"] = payload.offerFileName
            logger.info(f"Updated placement offer for student {student_id}: {payload.company} - {payload.packageLPA} LPA")
            return student

    raise HTTPException(status_code=404, detail="Student record not found in cohort roster")


@router.get("/cohort-allocations", response_model=List[ProgramCohortAllocationSchema])
def list_cohort_allocations():
    """
    Returns program-wise PR cohort allocation policies configured by the Super Admin.
    """
    return _ALLOCATIONS_STORE


@router.put("/cohort-allocations/{allocation_id}", response_model=ProgramCohortAllocationSchema)
def update_cohort_allocation(allocation_id: str, payload: UpdateProgramAllocationRequest):
    """
    Allows Super Admin to set how many students a PR handles per program.
    """
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
