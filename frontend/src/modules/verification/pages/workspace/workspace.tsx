import React, { useState } from "react";
import { verificationWorkspaceStyles as styles } from "./workspace.styles";
import { IExtractedOfferFields, IAgentInsights } from "../../types/verification.types";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  FileText,
  Sparkles,
  Lock,
  History,
  AlertTriangle
} from "lucide-react";

export const FacultyVerificationWorkspacePage: React.FC = () => {
  // Static state representing data synthesized by the 7-Agent pipeline
  const [extractedData, setExtractedData] = useState<IExtractedOfferFields>({
    candidateName: "Arnav Sharma",
    rollNo: "21CS042",
    companyName: "Google India Private Limited",
    role: "Software Engineering Intern + Pre-Placement Offer (PPO)",
    offerType: "PPO",
    ctcLPA: 32.5,
    fixedSalaryLPA: 26.0,
    joiningBonusLPA: 6.5,
    joiningDate: "01 July 2025",
    location: "Bangalore, India",
    bondTerms: "No mandatory service agreement / bond required.",
  });

  const [agentInsights] = useState<IAgentInsights>({
    authenticityScore: 98,
    fraudFlags: [
      "Duplicate Check: CLEAN (SHA-256 unique across 11,000 students)",
      "PDF Structure: Certified Google / Adobe Document Signature",
    ],
    profileMatchScore: 100,
    discrepancies: [
      "Candidate Name matched 100% with Student ID 21CS042",
      "Salary Breakdown: Fixed (26 LPA) + Bonus (6.5 LPA) = 32.5 LPA verified",
    ],
  });

  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "reject"; text: string } | null>(null);

  const handleApprove = () => {
    setStatusMessage({
      type: "success",
      text: "Offer Letter Approved! Agent 7 has written an append-only row into audit_logs and pushed placement record directly to College ERP via REST API.",
    });
  };

  const handleReject = () => {
    setStatusMessage({
      type: "reject",
      text: "Offer rejected with feedback. Student Arnav Sharma and PR Rohit Patel have been notified to upload an official stamped offer copy.",
    });
  };

  return (
    <div className={styles.container}>
      {/* Top Banner with Reviewer Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Faculty Verification Workspace</h1>
            <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 border border-emerald-300 flex items-center gap-1 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> 7-Agent Pre-Checked
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Reviewing Submission for <strong className="text-gray-900">Arnav Sharma (21CS042)</strong> • Google India
          </p>
          <p className="text-xs text-gray-400">In-charge Faculty: Dr. Anita Desai (HOD CS) • Campus Tenancy: Bangalore</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            className="border-rose-200 text-rose-700 hover:bg-rose-50 text-xs h-9"
          >
            <XCircle className="w-4 h-4 mr-1.5" /> Reject / Request Revision
          </Button>
          <Button
            size="sm"
            onClick={handleApprove}
            className="bg-emerald-600 hover:bg-emerald-700 text-xs h-9 shadow-sm"
          >
            <CheckCircle className="w-4 h-4 mr-1.5" /> Approve & Commit to ERP
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 text-sm shadow-sm transition-all animate-in fade-in ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-semibold">{statusMessage.type === "success" ? "Verification Completed" : "Submission Returned"}</div>
            <div className="text-xs mt-0.5">{statusMessage.text}</div>
          </div>
        </div>
      )}

      {/* Split-Screen Workspace */}
      <div className={styles.splitGrid}>
        {/* Left Pane: Original Document Preview */}
        <div className={styles.leftPane}>
          <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between text-xs text-slate-200">
            <span className="flex items-center gap-2 font-medium">
              <FileText className="w-4 h-4 text-blue-400" /> Google_India_Offer_Letter_21CS042.pdf
            </span>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Google Shared Drive (Read-Only)</span>
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
            {/* Authentic Offer Letter Simulator Card */}
            <div className="w-full max-w-md bg-white rounded-lg p-7 text-left shadow-2xl space-y-4 font-serif text-xs text-gray-800 leading-relaxed border border-gray-200">
              <div className="font-sans font-bold text-base text-gray-900 border-b border-gray-200 pb-3 flex justify-between items-center">
                <span className="tracking-tight text-blue-600">Google India Pvt Ltd</span>
                <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">CONFIDENTIAL</span>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-sans text-[11px] text-gray-500">Date: June 15, 2025</p>
                <p className="font-semibold text-gray-900">Dear Arnav Sharma,</p>
                <p>
                  We are pleased to offer you the position of <strong>Software Engineering Intern</strong> leading to a{" "}
                  <strong>Pre-Placement Offer (PPO)</strong> in our Bangalore Engineering Centre.
                </p>
                <p>
                  Your total annual cost to company (CTC) will be <strong>INR 32,50,000/-</strong> per annum, comprising
                  fixed base remuneration of <strong>INR 26,00,000/-</strong> and a performance joining incentive of{" "}
                  <strong>INR 6,50,000/-</strong>.
                </p>
                <p>
                  Reporting Date: <strong>July 01, 2025</strong>. Location: <strong>Bangalore, India</strong>.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 text-[10px] text-gray-500 font-sans flex items-center justify-between">
                <span>Authorized Signatory: Global Campus Hiring</span>
                <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  SHA-256 Verified
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Side-by-side rendering ensures zero unverified placement records enter the University ERP.
            </p>
          </div>
        </div>

        {/* Right Pane: AI Discrepancy Insights & Editable Auto-Matched Fields */}
        <div className={styles.rightPane}>
          {/* 7-Agent Insights Card */}
          <div className={styles.insightBox}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-blue-950 text-sm">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Multi-Agent Discrepancy & Fraud Audit</span>
              </div>
              <Badge variant="success" className="bg-emerald-100 text-emerald-800 font-semibold text-xs">
                Authenticity: {agentInsights.authenticityScore}%
              </Badge>
            </div>

            <div className="space-y-1.5 text-xs text-gray-700">
              {agentInsights.fraudFlags.map((flag, idx) => (
                <div key={idx} className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{flag}</span>
                </div>
              ))}
              {agentInsights.discrepancies.map((disc, idx) => (
                <div key={idx} className="flex items-center gap-2 text-blue-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{disc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Fields: Editable by Faculty */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm">Extracted Placement Metadata (Editable)</h3>
              <span className="text-[11px] text-gray-400">Audit logs record all manual adjustments</span>
            </div>

            <div className={styles.fieldGrid}>
              <div>
                <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Candidate Name</label>
                <input
                  type="text"
                  value={extractedData.candidateName}
                  onChange={(e) => setExtractedData({ ...extractedData, candidateName: e.target.value })}
                  className={styles.inputField}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Roll / Student ID</label>
                <input
                  type="text"
                  value={extractedData.rollNo}
                  onChange={(e) => setExtractedData({ ...extractedData, rollNo: e.target.value })}
                  className={styles.inputField}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Company Name</label>
                <input
                  type="text"
                  value={extractedData.companyName}
                  onChange={(e) => setExtractedData({ ...extractedData, companyName: e.target.value })}
                  className={styles.inputField}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Job Role / Designation</label>
                <input
                  type="text"
                  value={extractedData.role}
                  onChange={(e) => setExtractedData({ ...extractedData, role: e.target.value })}
                  className={styles.inputField}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Annual CTC (INR LPA)</label>
                <input
                  type="number"
                  step="0.1"
                  value={extractedData.ctcLPA}
                  onChange={(e) => setExtractedData({ ...extractedData, ctcLPA: parseFloat(e.target.value) })}
                  className={styles.inputField}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Fixed Base Salary (INR LPA)</label>
                <input
                  type="number"
                  step="0.1"
                  value={extractedData.fixedSalaryLPA}
                  onChange={(e) => setExtractedData({ ...extractedData, fixedSalaryLPA: parseFloat(e.target.value) })}
                  className={styles.inputField}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Reporting Date</label>
                <input
                  type="text"
                  value={extractedData.joiningDate}
                  onChange={(e) => setExtractedData({ ...extractedData, joiningDate: e.target.value })}
                  className={styles.inputField}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  value={extractedData.location}
                  onChange={(e) => setExtractedData({ ...extractedData, location: e.target.value })}
                  className={styles.inputField}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Bond / Service Commitment</label>
                <input
                  type="text"
                  value={extractedData.bondTerms}
                  onChange={(e) => setExtractedData({ ...extractedData, bondTerms: e.target.value })}
                  className={styles.inputField}
                />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-gray-400" />
              <span>Immutable Audit Trail: <strong>ADR-002</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleApprove} className="bg-blue-600 hover:bg-blue-700 text-xs">
                Confirm & Commit Record
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
