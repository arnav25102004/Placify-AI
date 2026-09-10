export interface IBatchStudentItem {
  id: string;
  name: string;
  rollNo: string;
  department: string;
  status: "Unplaced" | "Offer_Received" | "Document_Requested" | "Verified" | "Placed";
  company?: string;
  packageLPA?: number;
  assignedFaculty?: string;
  hasOfferLetter: boolean;
}
