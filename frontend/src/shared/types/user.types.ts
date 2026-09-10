export type UserRole = "pr" | "faculty" | "placement_coordinator" | "student" | "admin";

export interface IUserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  campusId: string;
  campusName: string;
  assignedCohortCount?: number; // e.g. 15 students
  department?: string;
}

export interface IManagedStudent {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  phone: string;
  cgpa: string;
  department: string;
  batchTimeline: string; // e.g. "2021-2025"
  assignedPrId: string;
  assignedPrName: string;
  status: "Unplaced" | "Offer_Reported" | "Letter_Uploaded" | "Verified_Placed";
  company?: string;
  role?: string;
  packageLPA?: number;
  assignedFaculty?: string;
  hasOfferLetter: boolean;
  offerFileName?: string;
}
