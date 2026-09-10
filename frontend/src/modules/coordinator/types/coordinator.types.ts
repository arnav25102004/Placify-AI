export interface IDriveOverview {
  id: string;
  companyName: string;
  role: string;
  eligibleBatch: string;
  offersReleased: number;
  lettersVerified: number;
  inchargeFacultyCount: number;
  status: "Active_Drive" | "Verification_In_Progress" | "Export_Ready" | "Closed";
}
