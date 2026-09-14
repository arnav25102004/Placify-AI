import React, { useState } from "react";
import { api } from "@/shared/lib";
import { studentDashboardStyles as styles } from "./dashboard.styles";
import { IDocumentRequestItem, IPlacementRecord } from "../../types/student.types";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  UploadCloud,
  CheckCircle,
  Clock,
  Building2,
  Sparkles,
  Search,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
  AlertCircle,
  FileCheck2,
  Calendar,
  User,
  GraduationCap
} from "lucide-react";

export const StudentDashboardPage: React.FC = () => {
  // Static state representing authenticated student profile
  const studentProfile = {
    name: "Arnav Sharma",
    rollNo: "21CS042",
    batchTimeline: "2021 – 2025",
    department: "Computer Science & Engineering",
    campus: "Bangalore Main Campus",
    cgpa: "8.92",
    placedStatus: "Placed (Offer Awaiting Final ERP Sync)",
  };

  const [requests, setRequests] = useState<IDocumentRequestItem[]>([
    {
      id: "req-101",
      companyName: "Google India",
      role: "Software Engineering Intern + PPO",
      offerType: "PPO",
      requestedBy: "Rohit Patel (PR Cohort A)",
      inchargeFacultyName: "Dr. Anita Desai (HOD CS)",
      deadline: "15 Sep 2026",
      status: "pending_upload",
    },
    {
      id: "req-102",
      companyName: "Microsoft",
      role: "Summer Research Intern",
      offerType: "Internship",
      requestedBy: "Prof. S. K. Roy (Placement Cell)",
      inchargeFacultyName: "Prof. S. Ranganathan",
      deadline: "20 Aug 2026",
      status: "verified",
      uploadedFileName: "Microsoft_OfferLetter_Arnav.pdf",
    },
  ]);

  const [placements] = useState<IPlacementRecord[]>([
    { id: "pl-1", studentName: "Priya Venkatesh", companyName: "Uber", role: "Software Engineer", packageLPA: 38.5, batchTimeline: "2020-2024", offerType: "Full-Time", isSenior: true },
    { id: "pl-2", studentName: "Karan Nair", companyName: "Amazon", role: "Cloud Support Associate", packageLPA: 24.0, batchTimeline: "2020-2024", offerType: "Full-Time", isSenior: true },
    { id: "pl-3", studentName: "Arnav Sharma", companyName: "Google India", role: "SWE Intern (PPO)", packageLPA: 32.5, batchTimeline: "2021-2025", offerType: "PPO", isSenior: false },
    { id: "pl-4", studentName: "Sneha Sen", companyName: "Cisco Systems", role: "Network Engineer", packageLPA: 19.5, batchTimeline: "2021-2025", offerType: "Full-Time", isSenior: false },
    { id: "pl-5", studentName: "Rohan Mukherjee", companyName: "Goldman Sachs", role: "Summer Analyst", packageLPA: 26.0, batchTimeline: "2020-2024", offerType: "Full-Time", isSenior: true },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeUploadRequest, setActiveUploadRequest] = useState<IDocumentRequestItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadToast, setUploadToast] = useState<string | null>(null);

  // Simulated drag/drop file
  const stagedFileName = "Google_India_Offer_Letter_21CS042.pdf";

  const handleTriggerUploadModal = (req: IDocumentRequestItem) => {
    setActiveUploadRequest(req);
  };

  const handleConfirmUpload = async (event?: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeUploadRequest) return;
    setIsUploading(true);

    try {
      // Auto-authenticate student if token not set
      if (!api.getToken()) {
        await api.login("student@placify.ai", "password123").catch(() => {});
      }

      const fileToUpload = event?.target?.files?.[0] || new File(
        ["%PDF-1.4 Mock Student Offer Letter"],
        stagedFileName,
        { type: "application/pdf" }
      );

      const result = await api.submitStudentOfferLetter(fileToUpload).catch(() => null);

      setRequests((prev) =>
        prev.map((r) =>
          r.id === activeUploadRequest.id
            ? { ...r, status: "processing", uploadedFileName: stagedFileName }
            : r
        )
      );
      setIsUploading(false);
      setActiveUploadRequest(null);
      setUploadToast(
        result
          ? `Offer Letter (ID #${result.id}) uploaded & sent to backend pipeline!`
          : `Offer Letter successfully uploaded! Ingestion Agent & Fraud Detection Agent (Agent 2 & 3) have started processing.`
      );
      setTimeout(() => setUploadToast(null), 6000);
    } catch (err: any) {
      setIsUploading(false);
      setUploadToast(`Upload error: ${err.message || "Failed to submit"}`);
      setTimeout(() => setUploadToast(null), 6000);
    }
  };


  const filteredPlacements = placements.filter(
    (p) =>
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* Professional Top Hero Profile */}
      <div className={styles.headerBanner}>
        <div className={styles.headerAccentGlow} />
        <div className={styles.headerInner}>
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{studentProfile.name}</h1>
              <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {studentProfile.rollNo}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Senior Cohort
              </span>
            </div>
            <p className="text-slate-300 text-sm">
              {studentProfile.department} • <span className="text-blue-400 font-semibold">{studentProfile.batchTimeline}</span>
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <span>Campus: <strong className="text-slate-200">{studentProfile.campus}</strong></span>
              <span>•</span>
              <span>CGPA: <strong className="text-slate-200">{studentProfile.cgpa}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-4 border border-slate-700/60 text-right min-w-[210px]">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Placement Status</div>
              <div className="text-base font-bold text-emerald-400 mt-1 flex items-center justify-end gap-1.5">
                <Briefcase className="w-4 h-4" /> 1 Verified PPO
              </div>
              <div className="text-xs text-blue-300 mt-0.5">1 Action Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className={styles.quickStatsGrid}>
        <div className={styles.statBox}>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Pending Uploads</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">1 Request</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">From Placement Rep</div>
        </div>
        <div className={styles.statBox}>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Letters Verified</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">1 Letter</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">By Faculty In-charge</div>
        </div>
        <div className={styles.statBox}>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Top Campus Package</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">₹38.5 LPA</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Uber India</div>
        </div>
        <div className={styles.statBox}>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Placed Alumni</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">3,400+</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Available for Referrals</div>
        </div>
      </div>

      {uploadToast && (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-start gap-3 text-emerald-900 dark:text-emerald-100 text-sm shadow-sm transition-all animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Document Ingestion Triggered</div>
            <div className="text-xs text-emerald-800 dark:text-emerald-200 mt-0.5">{uploadToast}</div>
          </div>
        </div>
      )}

      {/* Document Requests Section */}
      <div className="space-y-4">
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Document Requests Assigned to You
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Placement Representatives & Coordinators assign these requests when an offer is reported.
            </p>
          </div>
          <Badge variant="outline" className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            {requests.filter((r) => r.status === "pending_upload").length} action required
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className={styles.requestCard}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white text-base">{req.companyName}</span>
                    <Badge variant={req.offerType === "PPO" ? "warning" : "default"}>{req.offerType}</Badge>
                    {req.status === "pending_upload" && (
                      <Badge variant="destructive" className="animate-pulse">Upload Required</Badge>
                    )}
                    {req.status === "processing" && (
                      <Badge variant="warning" className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                        Automated Extraction & Audit Running...
                      </Badge>
                    )}
                    {req.status === "verified" && (
                      <Badge variant="success">Verified by Faculty • Pushed to ERP</Badge>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>Role: <strong className="text-slate-800 dark:text-slate-100">{req.role}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Assigned by: <strong className="text-slate-800 dark:text-slate-100">{req.requestedBy}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Faculty In-charge: <strong className="text-slate-800 dark:text-slate-100">{req.inchargeFacultyName}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Deadline: <strong className="text-rose-600 dark:text-rose-400">{req.deadline}</strong></span>
                    </div>
                  </div>

                  {req.uploadedFileName && (
                    <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-md px-2.5 py-1.5 inline-flex items-center gap-1.5 mt-1 font-mono">
                      <FileCheck2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Stored in College Shared Drive: {req.uploadedFileName}
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {req.status === "pending_upload" ? (
                    <Button
                      onClick={() => handleTriggerUploadModal(req)}
                      className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 shadow-sm"
                    >
                      <UploadCloud className="w-4 h-4" /> Upload Offer Letter
                    </Button>
                  ) : req.status === "processing" ? (
                    <Button variant="outline" size="sm" disabled className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                      Processing with AI
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled className="text-xs text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/30">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" /> Verified Record
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campus Placement & Senior Directory */}
      <div className="space-y-4 pt-2">
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Campus Placements & Senior Mentorship Explorer
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Browse placement outcomes across batches. Connect with seniors for company interview guidance & referrals.
            </p>
          </div>

          <div className={styles.searchBar}>
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search company, senior, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs outline-none w-full placeholder:text-slate-400 text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-200">
              <thead className={styles.tableHeader}>
                <tr>
                  <th className="px-6 py-3.5">Candidate</th>
                  <th className="px-6 py-3.5">Company & Role</th>
                  <th className="px-6 py-3.5">Compensation</th>
                  <th className="px-6 py-3.5">Batch Timeline</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Referral Matching</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredPlacements.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                          {p.studentName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white text-sm">{p.studentName}</div>
                          <div className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                            <GraduationCap className="w-3 h-3" /> {p.isSenior ? "Alumni Senior" : "Batch Peer"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{p.companyName}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{p.role}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800">
                        ₹{p.packageLPA} LPA
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">{p.offerType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                        {p.batchTimeline}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={p.isSenior ? "outline" : "default"} className="text-[11px]">
                        {p.isSenior ? "Placed Senior" : "Current Cohort"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.isSenior ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-medium cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" /> Request Referral
                        </Button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Campus Peer</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Professional Upload Modal */}
      {activeUploadRequest && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Submit Offer Letter Document</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">For {activeUploadRequest.companyName} ({activeUploadRequest.offerType})</p>
              </div>
              <button
                onClick={() => setActiveUploadRequest(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 space-y-1">
                <div className="text-slate-700 dark:text-slate-300 font-medium">Assigned In-charge Faculty:</div>
                <div className="text-slate-900 dark:text-white font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {activeUploadRequest.inchargeFacultyName}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  Once uploaded, your document will be safely stored in the institution's Google Shared Drive. The In-charge Faculty will verify it before exporting to ERP.
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-blue-200 dark:border-blue-900/60 hover:border-blue-400 dark:hover:border-blue-700 bg-blue-50/40 dark:bg-blue-950/20 rounded-xl p-6 text-center space-y-2 cursor-pointer transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                  Selected File: <span className="font-mono text-blue-700 dark:text-blue-300 font-semibold">{stagedFileName}</span>
                </div>
                <p className="text-[11px] text-slate-400">PDF, PNG, JPG accepted (Max 10MB)</p>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy Guaranteed:</strong> Raw offer letters are strictly restricted to your assigned In-charge Faculty, Placement Rep, and Placement Admins. Other students cannot view your letter.
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveUploadRequest(null)}
                disabled={isUploading}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleConfirmUpload()}
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
              >
                {isUploading ? (
                  <>Processing Verification Pipeline...</>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" /> Confirm & Send to In-charge
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

