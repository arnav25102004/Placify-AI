export interface IExtractedOfferFields {
  candidateName: string;
  rollNo: string;
  companyName: string;
  role: string;
  offerType: string;
  ctcLPA: number;
  fixedSalaryLPA: number;
  joiningBonusLPA?: number;
  stipendPerMonth?: number;
  joiningDate: string;
  location: string;
  bondTerms?: string;
}

export interface IAgentInsights {
  authenticityScore: number;
  fraudFlags: string[];
  profileMatchScore: number;
  discrepancies: string[];
}
