import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowUpRight
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { api } from "@/shared/lib/api";

export interface IDocumentHistoryItem {
  id: string;
  studentName: string;
  studentRoll: string;
  companyName: string;
  companyInitials: string;
  companyBgColor: string;
  documentName: string;
  fileSize: string;
  status: "Verified" | "Needs Review" | "Mismatch";
  verifiedBy: string;
  verifiedRole: string;
  date: string;
}

const mockDocumentHistory: IDocumentHistoryItem[] = [
  {
    id: "doc-01",
    studentName: "Aditya Sharma",
    studentRoll: "CS-2021-042",
    companyName: "Google",
    companyInitials: "G",
    companyBgColor: "bg-red-500",
    documentName: "Offer_Letter_Aditya.pdf",
    fileSize: "2.4 MB",
    status: "Verified",
    verifiedBy: "Dr. Anita Desai",
    verifiedRole: "Professor",
    date: "May 12, 2024",
  },
  {
    id: "doc-02",
    studentName: "Priya Patel",
    studentRoll: "EC-2021-118",
    companyName: "Microsoft",
    companyInitials: "MS",
    companyBgColor: "bg-blue-600",
    documentName: "Internship_Contract_Priya.pdf",
    fileSize: "1.8 MB",
    status: "Verified",
    verifiedBy: "Dr. Anita Desai",
    verifiedRole: "Professor",
    date: "May 11, 2024",
  },
  {
    id: "doc-03",
    studentName: "Rohan Verma",
    studentRoll: "ME-2021-089",
    companyName: "Tesla",
    companyInitials: "T",
    companyBgColor: "bg-rose-700",
    documentName: "Appointment_Letter.pdf",
    fileSize: "3.1 MB",
    status: "Needs Review",
    verifiedBy: "Pending",
    verifiedRole: "Awaiting Check",
    date: "May 10, 2024",
  },
  {
    id: "doc-04",
    studentName: "Sneha Reddy",
    studentRoll: "CS-2021-015",
    companyName: "Amazon",
    companyInitials: "A",
    companyBgColor: "bg-amber-600",
    documentName: "Offer_Letter_Final.pdf",
    fileSize: "4.2 MB",
    status: "Mismatch",
    verifiedBy: "Auto-Checked",
    verifiedRole: "OCR Flagged",
    date: "May 09, 2024",
  },
  {
    id: "doc-05",
    studentName: "Vikram Malhotra",
    studentRoll: "IT-2021-067",
    companyName: "Goldman Sachs",
    companyInitials: "GS",
    companyBgColor: "bg-indigo-600",
    documentName: "GS_FullTime_Offer.pdf",
    fileSize: "2.9 MB",
    status: "Verified",
    verifiedBy: "Dr. Anita Desai",
    verifiedRole: "Professor",
    date: "May 08, 2024",
  },
  {
    id: "doc-06",
    studentName: "Ananya Iyer",
    studentRoll: "CS-2021-104",
    companyName: "Adobe Systems",
    companyInitials: "A",
    companyBgColor: "bg-red-600",
    documentName: "Adobe_MTS_Offer.pdf",
    fileSize: "1.5 MB",
    status: "Verified",
    verifiedBy: "Prof. S. Ranganathan",
    verifiedRole: "Associate Prof",
    date: "May 07, 2024",
  },
  {
    id: "doc-07",
    studentName: "Karan Johar",
    studentRoll: "EE-2021-033",
    companyName: "Apple India",
    companyInitials: "AP",
    companyBgColor: "bg-slate-700",
    documentName: "Apple_SWE_Contract.pdf",
    fileSize: "3.4 MB",
    status: "Needs Review",
    verifiedBy: "Pending",
    verifiedRole: "Awaiting Check",
    date: "May 05, 2024",
  },
];

interface DocumentHistoryPageProps {
  onOpenWorkspace?: (docId: string) => void;
}

const companyBadgeColors = [
  "bg-red-500", "bg-blue-600", "bg-emerald-600", "bg-amber-600",
  "bg-indigo-600", "bg-rose-700", "bg-slate-700",
];

function companyColorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return companyBadgeColors[Math.abs(hash) % companyBadgeColors.length];
}

export const DocumentHistoryPage: React.FC<DocumentHistoryPageProps> = ({ onOpenWorkspace }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "Verified" | "Needs Review" | "Mismatch">("All");
  const [liveDocs, setLiveDocs] = useState<IDocumentHistoryItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    api
      .getFacultyQueue()
      .then((queue) => {
        if (!isMounted) return;
        const mapped: IDocumentHistoryItem[] = queue.map((item) => {
          const company = item.company || "Unknown Company";
          return {
            id: String(item.id),
            studentName: item.student_name || "Unknown Student",
            studentRoll: "",
            companyName: company,
            companyInitials: company.slice(0, 2).toUpperCase(),
            companyBgColor: companyColorFor(company),
            documentName: `${item.role || "Offer"} — ${company}`,
            fileSize: "",
            status: "Needs Review",
            verifiedBy: "Pending",
            verifiedRole: "PR-Assigned Request",
            date: "",
          };
        });
        setLiveDocs(mapped);
      })
      .catch((err) => {
        console.warn("Could not fetch faculty queue from backend:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const allDocs = useMemo(() => [...liveDocs, ...mockDocumentHistory], [liveDocs]);

  const filteredDocs = useMemo(() => {
    return allDocs.filter((doc) => {
      const matchesFilter = activeFilter === "All" || doc.status === activeFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        doc.studentName.toLowerCase().includes(q) ||
        doc.studentRoll.toLowerCase().includes(q) ||
        doc.companyName.toLowerCase().includes(q) ||
        doc.documentName.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [allDocs, searchQuery, activeFilter]);

  const counts = useMemo(() => {
    return {
      All: allDocs.length,
      Verified: allDocs.filter((d) => d.status === "Verified").length,
      "Needs Review": allDocs.filter((d) => d.status === "Needs Review").length,
      Mismatch: allDocs.filter((d) => d.status === "Mismatch").length,
    };
  }, [allDocs]);

  return (
    <div className="space-y-6">
      {/* Header section matching mockup */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Document History
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          View and manage all your verified and pending documents.
        </p>
      </div>

      {/* Control Bar: Search and Filters matching mockup */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search input with search icon */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, company or document..."
            className="pl-9 pr-4 h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-blue-500"
          />
        </div>

        {/* Filter Pills matching mockup */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
          {(["All", "Verified", "Needs Review", "Mismatch"] as const).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold shadow-xs border border-slate-200 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                }`}
              >
                <span>{filter}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {counts[filter]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table Card matching mockup */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">STUDENT</th>
                <th className="py-3.5 px-5">COMPANY</th>
                <th className="py-3.5 px-5">DOCUMENT</th>
                <th className="py-3.5 px-5">STATUS</th>
                <th className="py-3.5 px-5">VERIFIED BY</th>
                <th className="py-3.5 px-5">DATE</th>
                <th className="py-3.5 px-5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-xs">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No documents found matching "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Student */}
                    <td className="py-4 px-5">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {doc.studentName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {doc.studentRoll}
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-md ${doc.companyBgColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}
                        >
                          {doc.companyInitials}
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {doc.companyName}
                        </span>
                      </div>
                    </td>

                    {/* Document */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                        <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="truncate max-w-[200px]">{doc.documentName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 pl-6">
                        {doc.fileSize}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5">
                      {doc.status === "Verified" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          Verified
                        </span>
                      )}
                      {doc.status === "Needs Review" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          Needs Review
                        </span>
                      )}
                      {doc.status === "Mismatch" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          Mismatch
                        </span>
                      )}
                    </td>

                    {/* Verified By */}
                    <td className="py-4 px-5">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">
                        {doc.verifiedBy}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {doc.verifiedRole}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-5 text-slate-600 dark:text-slate-400 font-normal">
                      {doc.date}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenWorkspace?.(doc.id)}
                        className="h-8 px-2.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg gap-1"
                      >
                        <span>View</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
