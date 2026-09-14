export interface ProgramCohortAllocation {
  id: string;
  programName: string;
  departmentCode: string;
  totalStudents: number;
  studentsPerPR: number; // Configurable by Super Admin!
  totalPRsNeeded: number;
  activePRsAssigned: number;
  academicYear: string;
  status: "Active" | "Draft" | "Archived";
  notes?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export const DEFAULT_PROGRAM_ALLOCATIONS: ProgramCohortAllocation[] = [
  {
    id: "prog-cse",
    programName: "B.Tech Computer Science & Engineering",
    departmentCode: "CSE",
    totalStudents: 300,
    studentsPerPR: 15,
    totalPRsNeeded: 20,
    activePRsAssigned: 20,
    academicYear: "2024-2025",
    status: "Active",
    notes: "High placement volume; circuital branch with Tier 1 and Super Dream focus.",
    lastUpdatedBy: "Super Admin",
    lastUpdatedAt: new Date().toLocaleDateString(),
  },
  {
    id: "prog-it",
    programName: "B.Tech Information Technology",
    departmentCode: "IT",
    totalStudents: 180,
    studentsPerPR: 18,
    totalPRsNeeded: 10,
    activePRsAssigned: 10,
    academicYear: "2024-2025",
    status: "Active",
    notes: "Standard IT cohort size based on 3 sections.",
    lastUpdatedBy: "Super Admin",
    lastUpdatedAt: new Date().toLocaleDateString(),
  },
  {
    id: "prog-mca",
    programName: "Master of Computer Applications",
    departmentCode: "MCA",
    totalStudents: 120,
    studentsPerPR: 12,
    totalPRsNeeded: 10,
    activePRsAssigned: 10,
    academicYear: "2024-2025",
    status: "Active",
    notes: "Intensive 2-year postgraduate program requiring closer PR mentorship.",
    lastUpdatedBy: "Super Admin",
    lastUpdatedAt: new Date().toLocaleDateString(),
  },
  {
    id: "prog-ece",
    programName: "B.Tech Electronics & Communication",
    departmentCode: "ECE",
    totalStudents: 240,
    studentsPerPR: 20,
    totalPRsNeeded: 12,
    activePRsAssigned: 11,
    academicYear: "2024-2025",
    status: "Active",
    notes: "Core and embedded hardware drives with software crossover.",
    lastUpdatedBy: "Super Admin",
    lastUpdatedAt: new Date().toLocaleDateString(),
  },
  {
    id: "prog-ds",
    programName: "M.Tech Data Science & AI",
    departmentCode: "MTech DS",
    totalStudents: 60,
    studentsPerPR: 10,
    totalPRsNeeded: 6,
    activePRsAssigned: 6,
    academicYear: "2024-2025",
    status: "Active",
    notes: "Specialized research batch with direct faculty placement oversight.",
    lastUpdatedBy: "Super Admin",
    lastUpdatedAt: new Date().toLocaleDateString(),
  },
  {
    id: "prog-mbatech",
    programName: "MBA (Technology Management)",
    departmentCode: "MBA-Tech",
    totalStudents: 150,
    studentsPerPR: 15,
    totalPRsNeeded: 10,
    activePRsAssigned: 9,
    academicYear: "2024-2025",
    status: "Active",
    notes: "Techno-managerial, product management, and consulting profiles.",
    lastUpdatedBy: "Super Admin",
    lastUpdatedAt: new Date().toLocaleDateString(),
  },
];

const STORAGE_KEY = "placify_program_cohort_allocations";
export const ALLOCATION_UPDATE_EVENT = "placify:program-allocations-updated";

export const getProgramAllocations = (): ProgramCohortAllocation[] => {
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.error("Failed to load program allocations:", e);
  }
  return DEFAULT_PROGRAM_ALLOCATIONS;
};

export const saveProgramAllocations = (allocations: ProgramCohortAllocation[]): void => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allocations));
      window.dispatchEvent(new CustomEvent(ALLOCATION_UPDATE_EVENT, { detail: allocations }));
    }
  } catch (e) {
    console.error("Failed to save program allocations:", e);
  }
};

export const updateProgramCapacity = (
  id: string,
  newStudentsPerPR: number,
  updatedBy: string = "Super Admin"
): ProgramCohortAllocation[] => {
  const current = getProgramAllocations();
  const updated = current.map((p) => {
    if (p.id === id) {
      const safeCapacity = Math.max(1, newStudentsPerPR);
      const needed = Math.ceil(p.totalStudents / safeCapacity);
      return {
        ...p,
        studentsPerPR: safeCapacity,
        totalPRsNeeded: needed,
        lastUpdatedBy: updatedBy,
        lastUpdatedAt: new Date().toLocaleDateString(),
      };
    }
    return p;
  });
  saveProgramAllocations(updated);
  return updated;
};

export const getCohortCapacityForProgram = (deptOrProgram: string): number => {
  const allocations = getProgramAllocations();
  const norm = deptOrProgram.toLowerCase().trim();
  const match = allocations.find(
    (a) =>
      a.departmentCode.toLowerCase() === norm ||
      a.programName.toLowerCase().includes(norm) ||
      norm.includes(a.departmentCode.toLowerCase())
  );
  return match ? match.studentsPerPR : 15;
};

export const resetProgramAllocationsToDefault = (): ProgramCohortAllocation[] => {
  saveProgramAllocations(DEFAULT_PROGRAM_ALLOCATIONS);
  return DEFAULT_PROGRAM_ALLOCATIONS;
};
