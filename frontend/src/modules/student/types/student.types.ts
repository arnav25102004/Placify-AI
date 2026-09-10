export type RequestStatus = "pending_upload" | "processing" | "needs_review" | "verified" | "rejected";

export interface IDocumentRequestItem {
  id: string;
  companyName: string;
  role: string;
  offerType: "Internship" | "PPO" | "Full-Time";
  requestedBy: string; // PR Name or Coordinator
  inchargeFacultyName: string;
  deadline: string;
  status: RequestStatus;
  uploadedFileName?: string;
}

export interface IPlacementRecord {
  id: string;
  studentName: string;
  companyName: string;
  role: string;
  packageLPA: number;
  batchTimeline: string;
  offerType: string;
  isSenior: boolean;
}
