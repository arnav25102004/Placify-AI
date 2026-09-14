from typing import Optional
from pydantic import BaseModel


class ManagedStudentSchema(BaseModel):
    id: str
    name: str
    rollNo: str
    email: str
    phone: str
    cgpa: str
    department: str
    batchTimeline: str
    assignedPrId: str
    assignedPrName: str
    status: str
    company: Optional[str] = None
    role: Optional[str] = None
    packageLPA: Optional[float] = None
    assignedFaculty: Optional[str] = None
    hasOfferLetter: bool = False
    offerFileName: Optional[str] = None
    photoUrl: Optional[str] = None


class CreateManagedStudentRequest(BaseModel):
    name: str
    rollNo: str
    email: Optional[str] = None
    phone: Optional[str] = None
    cgpa: str = "8.50"
    department: str = "CSE"
    batchTimeline: str = "2021-2025"
    assignedPrId: str = "pr-1"
    assignedPrName: str = "Rohit Patel"
    photoUrl: Optional[str] = None


class UpdateStudentOfferRequest(BaseModel):
    """Roster-metadata-only edit — offer data now flows through /request-offer."""
    name: Optional[str] = None
    phone: Optional[str] = None
    cgpa: Optional[str] = None
    department: Optional[str] = None


class FacultyOptionSchema(BaseModel):
    id: int
    name: str
    email: str


class ProgramCohortAllocationSchema(BaseModel):
    id: str
    programName: str
    departmentCode: str
    totalStudents: int
    studentsPerPR: int
    totalPRsNeeded: int
    activePRsAssigned: int
    academicYear: str
    status: str = "Active"
    notes: Optional[str] = None
    lastUpdatedBy: Optional[str] = None
    lastUpdatedAt: Optional[str] = None


class UpdateProgramAllocationRequest(BaseModel):
    studentsPerPR: int
    totalStudents: Optional[int] = None
    programName: Optional[str] = None
    notes: Optional[str] = None
