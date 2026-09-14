import React, { useState, useEffect } from "react";
import { prPipelineStyles as styles } from "./pipeline.styles";
import { IManagedStudent } from "@/shared/types";
import { Button } from "@/shared/components/ui/button";
import { ButtonGroup } from "@/shared/components/ui/button-group";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import {
  getCohortCapacityForProgram,
  ALLOCATION_UPDATE_EVENT,
} from "@/shared/lib/pr-cohort-config";
import {
  Users,
  UploadCloud,
  FileText,
  UserCheck,
  Search,
  CheckCircle2,
  Clock,
  UserPlus,
  ShieldCheck,
  Award,
  ChevronRight,
  GraduationCap,
  Briefcase,
  LayoutGrid,
  List,
  AlertTriangle,
  Bot,
  FileCheck2,
  Sliders,
} from "lucide-react";

// Curated brand logos for student companies
const COMPANY_LOGOS: Record<string, string> = {
  "Google India":
    "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  Microsoft:
    "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
  Amazon:
    "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  Atlassian:
    "https://upload.wikimedia.org/wikipedia/commons/8/82/Atlassian-logo.svg",
  "Goldman Sachs":
    "https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg",
  "Cisco Systems":
    "https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg",
  Oracle:
    "https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg",
  "Morgan Stanley":
    "https://upload.wikimedia.org/wikipedia/commons/3/34/Morgan_Stanley_Logo_1.svg",
  Adobe:
    "https://upload.wikimedia.org/wikipedia/commons/5/51/Adobe_Inc._logo.svg",
};

const CompanyMiniLogo: React.FC<{ companyName: string }> = ({ companyName }) => {
  const [hasError, setHasError] = useState(false);
  const matchedKey = Object.keys(COMPANY_LOGOS).find(
    (k) =>
      companyName.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(companyName.toLowerCase())
  );
  const logoUrl = matchedKey ? COMPANY_LOGOS[matchedKey] : null;

  if (logoUrl && !hasError) {
    return (
      <div className="w-5 h-5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
        <img
          src={logoUrl}
          alt={companyName}
          className="max-h-full max-w-full object-contain"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  return <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />;
};

export const PRPipelinePage: React.FC = () => {
  // Current PR's program & dynamic cohort capacity configured by Super Admin
  const currentDepartment = "CSE";
  const [cohortCapacity, setCohortCapacity] = useState(() =>
    getCohortCapacityForProgram(currentDepartment)
  );

  // Synchronize in real time when Super Admin updates program allocation policy
  useEffect(() => {
    const handleAllocUpdate = () => {
      setCohortCapacity(getCohortCapacityForProgram(currentDepartment));
    };
    window.addEventListener(ALLOCATION_UPDATE_EVENT, handleAllocUpdate);
    return () => window.removeEventListener(ALLOCATION_UPDATE_EVENT, handleAllocUpdate);
  }, []);

  // Assigned students managed by this PR
  const [students, setStudents] = useState<IManagedStudent[]>([
    {
      id: "s-01",
      name: "Arnav Sharma",
      rollNo: "21CS042",
      email: "arnav.s@college.edu",
      phone: "+91 98765 43210",
      cgpa: "8.92",
      department: "CSE",
      batchTimeline: "2021-2025",
      assignedPrId: "pr-1",
      assignedPrName: "Rohit Patel",
      status: "Letter_Uploaded",
      company: "Google India",
      role: "SWE Intern + PPO",
      packageLPA: 32.5,
      assignedFaculty: "Dr. Anita Desai (HOD)",
      hasOfferLetter: true,
      offerFileName: "Google_India_Arnav_21CS042.pdf",
    },
    {
      id: "s-02",
      name: "Divya Ramesh",
      rollNo: "21CS019",
      email: "divya.r@college.edu",
      phone: "+91 98765 43211",
      cgpa: "9.15",
      department: "CSE",
      batchTimeline: "2021-2025",
      assignedPrId: "pr-1",
      assignedPrName: "Rohit Patel",
      status: "Verified_Placed",
      company: "Microsoft",
      role: "Cloud Solutions Eng.",
      packageLPA: 28.0,
      assignedFaculty: "Prof. S. Ranganathan",
      hasOfferLetter: true,
      offerFileName: "Microsoft_Divya_21CS019.pdf",
    },
    {
      id: "s-03",
      name: "Rahul Verma",
      rollNo: "21CS088",
      email: "rahul.v@college.edu",
      phone: "+91 98765 43212",
      cgpa: "7.84",
      department: "CSE",
      batchTimeline: "2021-2025",
      assignedPrId: "pr-1",
      assignedPrName: "Rohit Patel",
      status: "Unplaced",
      hasOfferLetter: false,
    },
    {
      id: "s-04",
      name: "Tanvi Gupta",
      rollNo: "21CS065",
      email: "tanvi.g@college.edu",
      phone: "+91 98765 43213",
      cgpa: "8.45",
      department: "CSE",
      batchTimeline: "2021-2025",
      assignedPrId: "pr-1",
      assignedPrName: "Rohit Patel",
      status: "Offer_Reported",
      company: "Goldman Sachs",
      role: "Summer Analyst",
      packageLPA: 24.0,
      assignedFaculty: "Dr. P. K. Sharma",
      hasOfferLetter: false,
    },
    {
      id: "s-05",
      name: "Siddharth Kumar",
      rollNo: "21CS102",
      email: "siddharth.k@college.edu",
      phone: "+91 98765 43214",
      cgpa: "8.20",
      department: "CSE",
      batchTimeline: "2021-2025",
      assignedPrId: "pr-1",
      assignedPrName: "Rohit Patel",
      status: "Offer_Reported",
      company: "Oracle",
      role: "Server Tech Eng.",
      packageLPA: 18.0,
      hasOfferLetter: false,
    },
    {
      id: "s-06",
      name: "Sneha Sen",
      rollNo: "21CS034",
      email: "sneha.s@college.edu",
      phone: "+91 98765 43215",
      cgpa: "8.70",
      department: "CSE",
      batchTimeline: "2021-2025",
      assignedPrId: "pr-1",
      assignedPrName: "Rohit Patel",
      status: "Verified_Placed",
      company: "Cisco Systems",
      role: "Network Software Eng.",
      packageLPA: 19.5,
      assignedFaculty: "Dr. Anita Desai (HOD)",
      hasOfferLetter: true,
      offerFileName: "Cisco_Sneha_21CS034.pdf",
    },
    {
      id: "s-07",
      name: "Ananya Iyer",
      rollNo: "21CS011",
      email: "ananya.i@college.edu",
      phone: "+91 98765 43216",
      cgpa: "8.90",
      department: "CSE",
      batchTimeline: "2021-2025",
      assignedPrId: "pr-1",
      assignedPrName: "Rohit Patel",
      status: "Unplaced",
      hasOfferLetter: false,
    },
    {
      id: "s-08",
      name: "Vikram Malhotra",
      rollNo: "21CS115",
      email: "vikram.m@college.edu",
      phone: "+91 98765 43217",
      cgpa: "7.95",
      department: "CSE",
      batchTimeline: "2021-2025",
      assignedPrId: "pr-1",
      assignedPrName: "Rohit Patel",
      status: "Unplaced",
      hasOfferLetter: false,
    },
    {
      id: "s-09",
      name: "Kavya Menon",
      rollNo: "21CS054",
      email: "kavya.m@college.edu",
      phone: "+91 98765 43218",
      cgpa: "8.65",
      department: "CSE",
      batchTimeline: "2021-2025",
      assignedPrId: "pr-1",
      assignedPrName: "Rohit Patel",
      status: "Letter_Uploaded",
      company: "Amazon",
      role: "SDE-1",
      packageLPA: 26.0,
      assignedFaculty: "Prof. S. Ranganathan",
      hasOfferLetter: true,
      offerFileName: "Amazon_Kavya_21CS054.pdf",
    },
    {
      id: "s-10",
      name: "Nikhil Joshi",
      rollNo: "21CS076",
      email: "nikhil.j@college.edu",
      phone: "+91 98765 43219",
      cgpa: "8.12",
      department: "CSE",
      batchTimeline: "2021-2025",
      assignedPrId: "pr-1",
      assignedPrName: "Rohit Patel",
      status: "Unplaced",
      hasOfferLetter: false,
    },
    {
      id: "s-11",
      name: "Meera Nair",
      rollNo: "21CS061",
      email: "meera.n@college.edu",
      phone: "+91 98765 43220",
      cgpa: "8.50",
      department: "CSE",
      batchTimeline: "2021-2025",
      assignedPrId: "pr-1",
      assignedPrName: "Rohit Patel",
      status: "Offer_Reported",
      company: "Morgan Stanley",
      role: "Tech Analyst",
      packageLPA: 22.0,
      hasOfferLetter: false,
    },
    {
      id: "s-12",
      name: "Aditya Roy",
      rollNo: "21CS008",
      email: "aditya.r@college.edu",
      phone: "+91 98765 43221",
      cgpa: "7.70",
      department: "CSE",
      batchTimeline: "2021-2025",
      assignedPrId: "pr-1",
      assignedPrName: "Rohit Patel",
      status: "Unplaced",
      hasOfferLetter: false,
    },
    {
      id: "s-13",
      name: "Pooja Hegde",
      rollNo: "21CS049",
      email: "pooja.h@college.edu",
      phone: "+91 98765 43222",
      cgpa: "8.85",
      department: "CSE",
      batchTimeline: "2021-2025",
      assignedPrId: "pr-1",
      assignedPrName: "Rohit Patel",
      status: "Verified_Placed",
      company: "Adobe",
      role: "Member Tech Staff",
      packageLPA: 34.0,
      assignedFaculty: "Dr. P. K. Sharma",
      hasOfferLetter: true,
      offerFileName: "Adobe_Pooja_21CS049.pdf",
    },
    {
      id: "s-14",
      name: "Gaurav Shah",
      rollNo: "21CS038",
      email: "gaurav.s@college.edu",
      phone: "+91 98765 43223",
      cgpa: "8.30",
      department: "CSE",
      batchTimeline: "2021-2025",
      assignedPrId: "pr-1",
      assignedPrName: "Rohit Patel",
      status: "Unplaced",
      hasOfferLetter: false,
    },
    {
      id: "s-15",
      name: "Rhea Chawla",
      rollNo: "21CS093",
      email: "rhea.c@college.edu",
      phone: "+91 98765 43224",
      cgpa: "9.05",
      department: "CSE",
      batchTimeline: "2021-2025",
      assignedPrId: "pr-1",
      assignedPrName: "Rohit Patel",
      status: "Letter_Uploaded",
      company: "Atlassian",
      role: "Associate Developer",
      packageLPA: 36.0,
      assignedFaculty: "Dr. Anita Desai (HOD)",
      hasOfferLetter: true,
      offerFileName: "Atlassian_Rhea_21CS093.pdf",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Center Dialog state for student detail inspection & offer ingestion
  const [selectedStudent, setSelectedStudent] = useState<IManagedStudent | null>(
    null
  );
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);

  // Dialog state for adding a student
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);

  // Form states for PR Offer Upload & In-charge Faculty Assignment
  const [inchargeFaculty, setInchargeFaculty] = useState(
    "Dr. Anita Desai (HOD CS)"
  );
  const [offerCompany, setOfferCompany] = useState("");
  const [offerRole, setOfferRole] = useState("Software Engineer");
  const [offerPackage, setOfferPackage] = useState("24.0");
  const [stagedDocName, setStagedDocName] = useState(
    "Student_Offer_Letter_Official.pdf"
  );
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form states for adding a student to this PR cohort
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentRoll, setNewStudentRoll] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentPhone, setNewStudentPhone] = useState("");
  const [newStudentCgpa, setNewStudentCgpa] = useState("8.50");

  const handleOpenStudentDialog = (student: IManagedStudent) => {
    setSelectedStudent(student);
    setOfferCompany(student.company || "");
    setOfferRole(student.role || "Software Engineer");
    setOfferPackage(student.packageLPA ? student.packageLPA.toString() : "20.0");
    setInchargeFaculty(student.assignedFaculty || "Dr. Anita Desai (HOD CS)");
    setStagedDocName(
      student.offerFileName ||
        `${student.name.replace(/\s+/g, "_")}_Offer_Letter.pdf`
    );
    setIsStudentDialogOpen(true);
  };

  const handleConfirmUpload = () => {
    if (!selectedStudent) return;
    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudent.id
          ? {
              ...s,
              status: "Letter_Uploaded",
              company: offerCompany,
              role: offerRole,
              packageLPA: parseFloat(offerPackage),
              assignedFaculty: inchargeFaculty,
              hasOfferLetter: true,
              offerFileName: stagedDocName,
            }
          : s
      )
    );
    setIsStudentDialogOpen(false);
    setSuccessToast(
      `Offer letter for ${selectedStudent.name} saved to Drive and assigned to ${inchargeFaculty}. Verification workflow initiated.`
    );
    setTimeout(() => setSuccessToast(null), 6000);
  };

  const handleAddStudent = () => {
    if (!newStudentName || !newStudentRoll) return;
    const newStudent: IManagedStudent = {
      id: `s-${students.length + 1}`,
      name: newStudentName,
      rollNo: newStudentRoll.toUpperCase(),
      email: newStudentEmail || `${newStudentRoll.toLowerCase()}@college.edu`,
      phone: newStudentPhone || "+91 98765 00000",
      cgpa: newStudentCgpa,
      department: currentDepartment,
      batchTimeline: "2021-2025",
      assignedPrId: "pr-1",
      assignedPrName: "Rohit Patel",
      status: "Unplaced",
      hasOfferLetter: false,
    };
    setStudents([...students, newStudent]);
    setIsAddStudentDialogOpen(false);
    setNewStudentName("");
    setNewStudentRoll("");
    setSuccessToast(
      `Added ${newStudent.name} (${newStudent.rollNo}) to your ${currentDepartment} cohort roster.`
    );
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Status-based counts
  const placedCount = students.filter(
    (s) => s.status === "Verified_Placed" || s.status === "Letter_Uploaded"
  ).length;
  const verifiedCount = students.filter(
    (s) => s.status === "Verified_Placed"
  ).length;
  const letterUploadedCount = students.filter(
    (s) => s.status === "Letter_Uploaded"
  ).length;
  const offerReportedCount = students.filter(
    (s) => s.status === "Offer_Reported"
  ).length;
  const unplacedCount = students.filter((s) => s.status === "Unplaced").length;

  // Placement progress relative to the Super Admin configured cohort capacity
  const effectiveCapacity = Math.max(cohortCapacity, students.length);
  const placementRate = Math.round((placedCount / effectiveCapacity) * 100);

  // Tab & search filtering
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.company && s.company.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "unplaced") return s.status === "Unplaced";
    if (activeTab === "action_needed")
      return s.status === "Offer_Reported" || s.status === "Letter_Uploaded";
    if (activeTab === "verified") return s.status === "Verified_Placed";
    return true;
  });

  const getStatusBadge = (status: IManagedStudent["status"]) => {
    switch (status) {
      case "Verified_Placed":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 font-semibold text-[11px]"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Verified Placed
          </Badge>
        );
      case "Letter_Uploaded":
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1 font-semibold text-[11px]"
          >
            <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Faculty Review
          </Badge>
        );
      case "Offer_Reported":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 font-semibold text-[11px]"
          >
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Upload Letter
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 gap-1 font-medium text-[11px]"
          >
            <GraduationCap className="w-3 h-3 text-slate-500" />
            Unplaced
          </Badge>
        );
    }
  };

  return (
    <div className={styles.container}>
      {/* College PR Command Banner */}
      <div className={styles.headerBanner}>
        <div className={styles.headerAccentGlow} />
        <div className={styles.headerInner}>
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs px-2.5 py-0.5 font-semibold">
                PR Batch 2021–2025 • {currentDepartment}
              </Badge>
              <span className="text-xs text-slate-300 font-mono flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-0.5 rounded-md border border-slate-800">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Super Admin Ratio: 1 PR : {cohortCapacity} Students ({currentDepartment})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              Placement Representative Hub
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              As the designated PR for this {currentDepartment} cohort, you manage student
              academic records, report compensation packages, and ingest verified
              offer letters for In-charge Faculty authentication. The maximum cohort size
              is dynamically governed per program by the Super Admin Console.
            </p>

            <div className="pt-1 flex items-center gap-4 text-xs text-slate-400 flex-wrap">
              <span>
                PR: <strong className="text-slate-100">Rohit Patel</strong>
              </span>
              <span>•</span>
              <span>
                Branch: <strong className="text-slate-100">Computer Science (Section A)</strong>
              </span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Automated Verification Active
              </span>
            </div>
          </div>

          {/* Quick Metrics & Cohort Progress Ring */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg min-w-[250px]">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
                <span>Cohort Placement Progress</span>
                <span className="font-bold text-white">{placementRate}%</span>
              </div>
              <Progress value={placementRate} className="h-2 bg-slate-800" />
              <div className="flex justify-between items-center mt-2.5 text-[11px]">
                <span className="text-emerald-400 font-semibold">
                  {placedCount} of {students.length} Placed
                </span>
                <span className="text-slate-400 font-mono">
                  Cap: {cohortCapacity} Seats
                </span>
              </div>
            </div>

            <Button
              onClick={() => setIsAddStudentDialogOpen(true)}
              className="h-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs gap-1.5 shadow-lg cursor-pointer rounded-xl"
            >
              <UserPlus className="w-4 h-4" /> Add Student (Seat)
            </Button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successToast && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3.5 flex items-center justify-between text-emerald-950 dark:text-emerald-200 text-xs shadow-sm transition-all animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Cohort Seats</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {students.length} / {cohortCapacity}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {students.length >= cohortCapacity
              ? "Configured Program Cap Reached"
              : `${cohortCapacity - students.length} Seat(s) Available`}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Letters Ingested</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {letterUploadedCount + verifiedCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Uploaded by PR to Drive
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Faculty Verified</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {verifiedCount} Records
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Signed off & Locked in ERP
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Highest Package</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ₹36.0 LPA
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Atlassian • Rhea Chawla
          </p>
        </div>
      </div>

      {/* Interactive Controls & View Modes */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        {/* Tabs for Stage Filtering */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full md:w-auto"
        >
          <TabsList className="bg-slate-200/70 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-xl">
            <TabsTrigger
              value="all"
              className="text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm"
            >
              All Assigned ({students.length})
            </TabsTrigger>
            <TabsTrigger
              value="unplaced"
              className="text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm"
            >
              Unplaced ({unplacedCount})
            </TabsTrigger>
            <TabsTrigger
              value="action_needed"
              className="text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm"
            >
              In Pipeline ({offerReportedCount + letterUploadedCount})
            </TabsTrigger>
            <TabsTrigger
              value="verified"
              className="text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm"
            >
              Verified ({verifiedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Input & Grid/Table Toggle */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            <Input
              type="text"
              placeholder="Filter by name, roll, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-3 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500"
            />
          </div>

          <ButtonGroup className="bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`h-8 px-2.5 text-xs rounded-lg cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 mr-1" /> Grid
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("table")}
              className={`h-8 px-2.5 text-xs rounded-lg cursor-pointer ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <List className="w-3.5 h-3.5 mr-1" /> Ledger
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {/* Main Cohort View: Upgraded Cards Grid or Ledger Table */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4.5">
          {filteredStudents.map((s, index) => {
            const isVerified = s.status === "Verified_Placed";
            const isUploaded = s.status === "Letter_Uploaded";
            const isReported = s.status === "Offer_Reported";

            return (
              <div
                key={s.id}
                onClick={() => handleOpenStudentDialog(s)}
                className={`group relative rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl border bg-white dark:bg-slate-900/95 flex flex-col justify-between p-4.5 ${
                  isVerified
                    ? "border-emerald-200/90 dark:border-emerald-800/80 hover:border-emerald-500 shadow-xs"
                    : isUploaded
                    ? "border-blue-200/90 dark:border-blue-800/80 hover:border-blue-500 shadow-xs"
                    : isReported
                    ? "border-amber-200/90 dark:border-amber-800/80 hover:border-amber-500 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 shadow-xs"
                }`}
              >
                {/* Top Row: Avatar, Student Name, Roll No & Seat Indicator */}
                <div>
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <Avatar className="w-11 h-11 border-2 border-white dark:border-slate-800 shadow-sm shrink-0">
                          <AvatarFallback
                            className={`font-bold text-xs text-white ${
                              isVerified
                                ? "bg-gradient-to-br from-emerald-600 to-teal-700"
                                : isUploaded
                                ? "bg-gradient-to-br from-blue-600 to-indigo-700"
                                : isReported
                                ? "bg-gradient-to-br from-amber-600 to-orange-700"
                                : "bg-gradient-to-br from-slate-700 to-slate-800"
                            }`}
                          >
                            {s.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {isVerified && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {s.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                            {s.rollNo}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full shrink-0">
                      #{String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Academic Metrics Row */}
                  <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      CGPA {s.cgpa}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {s.department} • {s.batchTimeline.split("-")[1]}
                    </span>
                  </div>

                  {/* Placement Details Card */}
                  <div className="mt-3 min-h-[58px] rounded-xl p-2.5 transition-all flex flex-col justify-center bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/70">
                    {s.company ? (
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <CompanyMiniLogo companyName={s.company} />
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {s.company}
                            </span>
                          </div>
                          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
                            ₹{s.packageLPA} LPA
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                          {s.role}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 dark:text-slate-500 italic flex items-center justify-center gap-1.5 py-1">
                        <Clock className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                        <span>Awaiting Placement Drive</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer with Status Badge and Click-to-Manage Hint */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="shrink-0">{getStatusBadge(s.status)}</div>

                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 inline-flex items-center gap-0.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                    Manage <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Dense College Ledger Table */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-mono">Seat</th>
                  <th className="px-5 py-3">Roll No</th>
                  <th className="px-5 py-3">Student Name</th>
                  <th className="px-5 py-3">CGPA</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Company & CTC</th>
                  <th className="px-5 py-3">In-charge Faculty</th>
                  <th className="px-5 py-3 text-right">PR Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredStudents.map((s, idx) => (
                  <tr
                    key={s.id}
                    onClick={() => handleOpenStudentDialog(s)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-slate-400 dark:text-slate-500">
                      #{idx + 1}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {s.rollNo}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                      <div>{s.name}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {s.email}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                      {s.cgpa}
                    </td>
                    <td className="px-5 py-3.5">{getStatusBadge(s.status)}</td>
                    <td className="px-5 py-3.5">
                      {s.company ? (
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <CompanyMiniLogo companyName={s.company} />
                            <span>{s.company}</span>
                          </div>
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                            ₹{s.packageLPA} LPA • {s.role}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic">
                          No offer reported
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      {s.assignedFaculty ? (
                        <span className="font-medium">{s.assignedFaculty}</span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        size="sm"
                        variant={s.hasOfferLetter ? "outline" : "default"}
                        className="h-7 text-xs px-2.5 cursor-pointer rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenStudentDialog(s);
                        }}
                      >
                        {s.hasOfferLetter ? "Inspect PDF" : "Upload Letter"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Center Dialog Modal: Student Detail, Offer Ingestion & Faculty Assignment */}
      <Dialog
        open={isStudentDialogOpen}
        onOpenChange={setIsStudentDialogOpen}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl">
          {selectedStudent && (
            <div className="space-y-6">
              {/* Modal Header */}
              <DialogHeader className="text-left space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-slate-200 dark:border-slate-700 shadow-xs">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm">
                        {selectedStudent.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                        {selectedStudent.name}
                      </DialogTitle>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                          {selectedStudent.rollNo}
                        </span>
                        <span className="text-xs text-slate-400">
                          {selectedStudent.department} • Batch{" "}
                          {selectedStudent.batchTimeline}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>{getStatusBadge(selectedStudent.status)}</div>
                </div>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Managed student placement dossier • PR Rohit Patel ({currentDepartment} Cohort)
                </DialogDescription>
              </DialogHeader>

              {/* Student Quick Contact & Academic Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Cumulative CGPA
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {selectedStudent.cgpa}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Department
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {selectedStudent.department}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Contact Email
                  </span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1 truncate block font-mono">
                    {selectedStudent.email}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Mobile Phone
                  </span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1 truncate block font-mono">
                    {selectedStudent.phone}
                  </span>
                </div>
              </div>

              {/* Uploaded Offer Letter Banner if available */}
              {selectedStudent.hasOfferLetter && (
                <div className="border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Official Offer Letter Ingested
                    </span>
                    <Badge className="bg-emerald-600 text-white text-[10px]">
                      Ready for Faculty Review
                    </Badge>
                  </div>
                  <div className="bg-white dark:bg-slate-850 border border-emerald-200/80 dark:border-emerald-800/70 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-xs">
                      <FileText className="w-5 h-5 text-rose-500 shrink-0" />
                      <div>
                        <div className="font-mono text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[280px]">
                          {selectedStudent.offerFileName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Synced with College Cloud Repository
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold"
                    >
                      View PDF
                    </Button>
                  </div>
                </div>
              )}

              {/* Offer Details & Ingestion Form */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {selectedStudent.hasOfferLetter
                      ? "Update Placement Compensation & Reviewer"
                      : "Ingest New Offer Letter & Assign Reviewer"}
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Company Name
                  </label>
                  <Input
                    type="text"
                    value={offerCompany}
                    onChange={(e) => setOfferCompany(e.target.value)}
                    placeholder="e.g. Google India, Cisco, Microsoft"
                    className="h-9 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Role Designation
                    </label>
                    <Input
                      type="text"
                      value={offerRole}
                      onChange={(e) => setOfferRole(e.target.value)}
                      placeholder="e.g. Software Development Engineer"
                      className="h-9 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Package (CTC in LPA)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={offerPackage}
                      onChange={(e) => setOfferPackage(e.target.value)}
                      placeholder="24.0"
                      className="h-9 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Assign In-charge Faculty Reviewer
                  </label>
                  <select
                    value={inchargeFaculty}
                    onChange={(e) => setInchargeFaculty(e.target.value)}
                    className="w-full h-9 px-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Dr. Anita Desai (HOD CS)">
                      Dr. Anita Desai (HOD CS)
                    </option>
                    <option value="Prof. S. Ranganathan (Senior Mentor)">
                      Prof. S. Ranganathan (Senior Mentor)
                    </option>
                    <option value="Dr. P. K. Sharma (Placement Chair)">
                      Dr. P. K. Sharma (Placement Chair)
                    </option>
                  </select>
                </div>

                {/* Offer Letter Upload Dropzone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Upload Official Offer Letter (PDF)
                  </label>
                  <div className="border-2 border-dashed border-blue-200 dark:border-blue-900/60 hover:border-blue-400 bg-blue-50/30 dark:bg-blue-950/20 rounded-2xl p-5 text-center cursor-pointer transition-all">
                    <UploadCloud className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto" />
                    <div className="text-xs text-slate-800 dark:text-slate-200 font-semibold mt-2">
                      Attached File:{" "}
                      <span className="font-mono text-blue-700 dark:text-blue-400">
                        {stagedDocName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Files are securely transmitted directly to College Google
                      Drive
                    </p>
                  </div>
                </div>

                {/* AI Automated Pipeline Notice */}
                <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 space-y-1.5 text-xs border border-slate-800">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <Bot className="w-4 h-4" /> Automated AI Verification
                    Pipeline
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Upon submission, our automated parser extracts terms (CTC,
                    joining date, bond clauses) and initiates the side-by-side
                    comparison workflow for {inchargeFaculty}.
                  </p>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsStudentDialogOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!offerCompany}
                  onClick={handleConfirmUpload}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 cursor-pointer rounded-xl"
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Confirm & Submit to
                  Faculty
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog for Adding New Student to Cohort */}
      <Dialog
        open={isAddStudentDialogOpen}
        onOpenChange={setIsAddStudentDialogOpen}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 p-6 space-y-4 rounded-3xl shadow-2xl">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Register Student into {currentDepartment} Cohort
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Allocated standard capacity: {cohortCapacity} students per PR for {currentDepartment}.
            </DialogDescription>
          </DialogHeader>

          {students.length >= cohortCapacity && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                Standard cohort allocation ({cohortCapacity} seats set by Super Admin) is reached. Registering additional students expands your cohort beyond the program quota.
              </span>
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Full Student Name
              </label>
              <Input
                type="text"
                placeholder="e.g. Vikram Malhotra"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="h-9 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Roll Number
                </label>
                <Input
                  type="text"
                  placeholder="21CS115"
                  value={newStudentRoll}
                  onChange={(e) => setNewStudentRoll(e.target.value)}
                  className="h-9 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Cumulative CGPA
                </label>
                <Input
                  type="text"
                  placeholder="8.50"
                  value={newStudentCgpa}
                  onChange={(e) => setNewStudentCgpa(e.target.value)}
                  className="h-9 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                College Email ID
              </label>
              <Input
                type="email"
                placeholder="student.roll@college.edu"
                value={newStudentEmail}
                onChange={(e) => setNewStudentEmail(e.target.value)}
                className="h-9 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Mobile Phone
              </label>
              <Input
                type="tel"
                placeholder="+91 98765 43210"
                value={newStudentPhone}
                onChange={(e) => setNewStudentPhone(e.target.value)}
                className="h-9 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddStudentDialogOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddStudent}
              disabled={!newStudentName || !newStudentRoll}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs gap-1 cursor-pointer rounded-xl"
            >
              <UserPlus className="w-3.5 h-3.5" /> Save to Cohort Roster
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PRPipelinePage;
