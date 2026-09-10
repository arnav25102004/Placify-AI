import React, { useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  ArrowRightLeft,
  ArrowLeft,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Printer,
  ChevronDown,
  Check
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface CompareDocumentPageProps {
  onBack?: () => void;
}

export const CompareDocumentPage: React.FC<CompareDocumentPageProps> = ({ onBack }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isSaved, setIsSaved] = useState(false);

  // Form Fields State matching mockup
  const [formData, setFormData] = useState({
    studentName: "Arjun Kumar",
    rollNumber: "1023",
    collegeInstitution: "ABC Institute of Technology",
    email: "arjun@example.com",
    companyName: "TechNova Solutions Pvt. Ltd.",
    internshipRole: "Software Engineering Intern",
    internshipType: "Paid Internship",
    location: "Bangalore",
    startDate: "10/06/2026",
    endDate: "10/08/2026",
    duration: "2 Months",
    monthlyStipend: "₹20,000",
  });

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 70));
  const handleZoomReset = () => setZoomLevel(100);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumbs matching mockup */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Compare Document
          </h1>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span className="hover:text-slate-800 cursor-pointer" onClick={onBack}>Dashboard</span>
            <span>&gt;</span>
            <span className="text-blue-600 font-medium">Comparisons</span>
            <span>&gt;</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Compare Document</span>
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="h-9 px-3.5 text-xs text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Save Changes
          </Button>
        </div>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Extracted fields saved successfully! ERP sync staging table has been updated.</span>
        </div>
      )}

      {/* Comparison Source vs Target Card Header matching mockup */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Original Uploaded PDF */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center text-rose-600 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
              Class_10_Internship_Offer.pdf
            </div>
            <div className="text-[11px] text-slate-400">PDF Document • 2.4 MB</div>
          </div>
        </div>

        {/* Center: Bidirectional Compare Pill */}
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 shrink-0 shadow-2xs">
          <ArrowRightLeft className="w-3.5 h-3.5" />
        </div>

        {/* Right: Extracted / ERP Record Excel */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0 justify-end text-right">
          <div className="min-w-0">
            <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
              Student_Internship_Data.xlsx
            </div>
            <div className="text-[11px] text-slate-400">Extracted Data • 145 records</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-center text-emerald-600 shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: 1. Offer Letter (PDF Preview) | 2. Extracted Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 1. Offer Letter (PDF Viewer) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col min-h-[750px]">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              1. Offer Letter (PDF)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Original document uploaded by student
            </p>
          </div>

          {/* PDF Toolbar matching mockup */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span className="font-medium text-slate-700 dark:text-slate-300">1/1</span>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
              <button
                onClick={handleZoomOut}
                className="p-1 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] w-9 text-center">{zoomLevel}%</span>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomReset}
                className="p-1 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors">
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors">
                <Download className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors">
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* PDF Page Canvas Rendering (Matching exact text from screenshot) */}
          <div className="flex-1 p-6 bg-slate-100/70 dark:bg-slate-950 overflow-y-auto flex justify-center">
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
              className="w-full max-w-[500px] bg-white text-slate-900 shadow-lg border border-slate-200 rounded-lg p-8 font-sans transition-transform duration-150 ease-out"
            >
              {/* Document Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-blue-600 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center">
                    TN
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight text-slate-900">
                      TechNova Solutions Pvt. Ltd.
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Engineering Excellence, Delivered
                    </p>
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 text-right leading-tight font-sans">
                  No. 48, 3rd Floor<br />
                  Koramangala, Bangalore – 560034<br />
                  Karnataka, India<br />
                  Phone: +91 80 4187 6900
                </div>
              </div>

              {/* Date & Recipient Details */}
              <div className="text-[11px] space-y-1 text-slate-700 mb-4 font-sans">
                <p><span className="font-semibold text-slate-900">Date:</span> 05 June 2026</p>
                <div className="pt-2">
                  <p>To,</p>
                  <p className="font-bold text-slate-900">Arjun Kumar</p>
                  <p>ABC Institute of Technology</p>
                  <p>Bangalore</p>
                </div>
              </div>

              {/* Subject */}
              <div className="text-center font-bold text-xs underline text-slate-900 my-4">
                Subject: Internship Offer Letter
              </div>

              {/* Salutation & Body */}
              <div className="text-[11px] text-slate-700 leading-relaxed space-y-3 font-sans">
                <p>Dear Arjun,</p>
                <p>
                  We are pleased to offer you the position of <strong className="text-slate-900">Software Engineering Intern</strong> at TechNova Solutions Pvt. Ltd. for the period and terms mentioned below:
                </p>

                {/* Terms Table */}
                <div className="border border-slate-300 rounded overflow-hidden mt-3 text-[10px]">
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-1.5 px-3 font-semibold bg-slate-50 w-1/3 border-r border-slate-200">Internship Role</td>
                        <td className="py-1.5 px-3">Software Engineering Intern</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-semibold bg-slate-50 border-r border-slate-200">Internship Duration</td>
                        <td className="py-1.5 px-3">10 June 2026 – 10 August 2026</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-semibold bg-slate-50 border-r border-slate-200">Location</td>
                        <td className="py-1.5 px-3">Bangalore</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-semibold bg-slate-50 border-r border-slate-200">Monthly Stipend</td>
                        <td className="py-1.5 px-3 font-semibold text-emerald-700">₹20,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="pt-2 text-[10px] text-slate-500">
                  Please sign and return the duplicate copy of this letter as confirmation of your acceptance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 2. Extracted Information (Form matching mockup) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-6">
          {/* Header with Re-extract Button */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                2. Extracted Information
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review and edit the information extracted from the offer letter.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Re-extract Data</span>
            </Button>
          </div>

          {/* Section 1: STUDENT INFORMATION */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              STUDENT INFORMATION
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Student Name */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-600 dark:text-slate-400 font-medium">Student Name</label>
                  <span className="text-[11px] px-1.5 py-0.2 rounded font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 flex items-center gap-0.5">
                    98% <Check className="w-3 h-3" />
                  </span>
                </div>
                <Input
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="h-9 text-xs bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              {/* Roll Number */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-600 dark:text-slate-400 font-medium">Roll Number</label>
                  <span className="text-[11px] px-1.5 py-0.2 rounded font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 flex items-center gap-0.5">
                    96% <Check className="w-3 h-3" />
                  </span>
                </div>
                <Input
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  className="h-9 text-xs bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              {/* College / Institution */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-600 dark:text-slate-400 font-medium">College / Institution</label>
                  <span className="text-[11px] px-1.5 py-0.2 rounded font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 flex items-center gap-0.5">
                    95% <Check className="w-3 h-3" />
                  </span>
                </div>
                <Input
                  value={formData.collegeInstitution}
                  onChange={(e) => setFormData({ ...formData, collegeInstitution: e.target.value })}
                  className="h-9 text-xs bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-600 dark:text-slate-400 font-medium">Email</label>
                  <span className="text-[11px] px-1.5 py-0.2 rounded font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 flex items-center gap-0.5">
                    96% <Check className="w-3 h-3" />
                  </span>
                </div>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-9 text-xs bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Section 2: INTERNSHIP DETAILS */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              INTERNSHIP DETAILS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company Name */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-600 dark:text-slate-400 font-medium">Company Name</label>
                  <span className="text-[11px] px-1.5 py-0.2 rounded font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 flex items-center gap-0.5">
                    96% <Check className="w-3 h-3" />
                  </span>
                </div>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="h-9 text-xs bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              {/* Internship Role (Amber Highlight in mockup) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-600 dark:text-slate-400 font-medium">Internship Role</label>
                  <span className="text-[11px] px-1.5 py-0.2 rounded font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 flex items-center gap-0.5">
                    88% <AlertTriangle className="w-3 h-3" />
                  </span>
                </div>
                <Input
                  value={formData.internshipRole}
                  onChange={(e) => setFormData({ ...formData, internshipRole: e.target.value })}
                  className="h-9 text-xs bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700 rounded-xl focus-visible:ring-amber-500"
                />
              </div>

              {/* Internship Type */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-600 dark:text-slate-400 font-medium">Internship Type</label>
                  <span className="text-[11px] px-1.5 py-0.2 rounded font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 flex items-center gap-0.5">
                    90% <Check className="w-3 h-3" />
                  </span>
                </div>
                <div className="relative">
                  <Input
                    value={formData.internshipType}
                    onChange={(e) => setFormData({ ...formData, internshipType: e.target.value })}
                    className="h-9 text-xs bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-xl pr-8"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-600 dark:text-slate-400 font-medium">Location</label>
                  <span className="text-[11px] px-1.5 py-0.2 rounded font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 flex items-center gap-0.5">
                    95% <Check className="w-3 h-3" />
                  </span>
                </div>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-9 text-xs bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Section 3: INTERNSHIP DURATION */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              INTERNSHIP DURATION
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date (Amber Highlight in mockup) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-600 dark:text-slate-400 font-medium">Start Date</label>
                  <span className="text-[11px] px-1.5 py-0.2 rounded font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 flex items-center gap-0.5">
                    72% <AlertTriangle className="w-3 h-3" />
                  </span>
                </div>
                <Input
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="h-9 text-xs bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700 rounded-xl focus-visible:ring-amber-500"
                />
              </div>

              {/* End Date */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-600 dark:text-slate-400 font-medium">End Date</label>
                  <span className="text-[11px] px-1.5 py-0.2 rounded font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 flex items-center gap-0.5">
                    93% <Check className="w-3 h-3" />
                  </span>
                </div>
                <Input
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="h-9 text-xs bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              {/* Duration (Amber Highlight in mockup) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-600 dark:text-slate-400 font-medium">Duration</label>
                  <span className="text-[11px] px-1.5 py-0.2 rounded font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 flex items-center gap-0.5">
                    80% <AlertTriangle className="w-3 h-3" />
                  </span>
                </div>
                <Input
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="h-9 text-xs bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700 rounded-xl focus-visible:ring-amber-500"
                />
              </div>

              {/* Monthly Stipend */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-600 dark:text-slate-400 font-medium">Monthly Stipend</label>
                  <span className="text-[11px] px-1.5 py-0.2 rounded font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 flex items-center gap-0.5">
                    98% <Check className="w-3 h-3" />
                  </span>
                </div>
                <Input
                  value={formData.monthlyStipend}
                  onChange={(e) => setFormData({ ...formData, monthlyStipend: e.target.value })}
                  className="h-9 text-xs bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Bottom Bar matching mockup */}
      <div className="sticky bottom-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">7 fields need review</span>
          <span className="text-slate-500 hidden sm:inline">— Please review the highlighted fields before verifying.</span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="h-9 text-xs font-medium border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Save Draft
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="h-9 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Verified
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm gap-1.5"
          >
            Save &amp; Next Document
          </Button>
        </div>
      </div>
    </div>
  );
};
