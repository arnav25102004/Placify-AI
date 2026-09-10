import React, { useState } from "react";
import { prPipelineStyles as styles } from "./pipeline.styles";
import { IManagedStudent } from "@/shared/types";
import { Button } from "@/shared/components/ui/button";
import { ButtonGroup } from "@/shared/components/ui/button-group";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
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
  Bot
} from "lucide-react";

export const PRPipelinePage: React.FC = () => {
  // Static state: Exactly 15 students assigned to this single PR
  const [students, setStudents] = useState<IManagedStudent[]>([
    { id: "s-01", name: "Arnav Sharma", rollNo: "21CS042", email: "arnav.s@college.edu", phone: "+91 98765 43210", cgpa: "8.92", department: "CSE", batchTimeline: "2021-2025", assignedPrId: "pr-1", assignedPrName: "Rohit Patel", status: "Letter_Uploaded", company: "Google India", role: "SWE Intern + PPO", packageLPA: 32.5, assignedFaculty: "Dr. Anita Desai (HOD)", hasOfferLetter: true, offerFileName: "Google_India_Arnav_21CS042.pdf" },
    { id: "s-02", name: "Divya Ramesh", rollNo: "21CS019", email: "divya.r@college.edu", phone: "+91 98765 43211", cgpa: "9.15", department: "CSE", batchTimeline: "2021-2025", assignedPrId: "pr-1", assignedPrName: "Rohit Patel", status: "Verified_Placed", company: "Microsoft", role: "Cloud Solutions Eng.", packageLPA: 28.0, assignedFaculty: "Prof. S. Ranganathan", hasOfferLetter: true, offerFileName: "Microsoft_Divya_21CS019.pdf" },
    { id: "s-03", name: "Rahul Verma", rollNo: "21CS088", email: "rahul.v@college.edu", phone: "+91 98765 43212", cgpa: "7.84", department: "CSE", batchTimeline: "2021-2025", assignedPrId: "pr-1", assignedPrName: "Rohit Patel", status: "Unplaced", hasOfferLetter: false },
    { id: "s-04", name: "Tanvi Gupta", rollNo: "21CS065", email: "tanvi.g@college.edu", phone: "+91 98765 43213", cgpa: "8.45", department: "CSE", batchTimeline: "2021-2025", assignedPrId: "pr-1", assignedPrName: "Rohit Patel", status: "Offer_Reported", company: "Goldman Sachs", role: "Summer Analyst", packageLPA: 24.0, assignedFaculty: "Dr. P. K. Sharma", hasOfferLetter: false },
    { id: "s-05", name: "Siddharth Kumar", rollNo: "21CS102", email: "siddharth.k@college.edu", phone: "+91 98765 43214", cgpa: "8.20", department: "CSE", batchTimeline: "2021-2025", assignedPrId: "pr-1", assignedPrName: "Rohit Patel", status: "Offer_Reported", company: "Oracle", role: "Server Tech Eng.", packageLPA: 18.0, hasOfferLetter: false },
    { id: "s-06", name: "Sneha Sen", rollNo: "21CS034", email: "sneha.s@college.edu", phone: "+91 98765 43215", cgpa: "8.70", department: "CSE", batchTimeline: "2021-2025", assignedPrId: "pr-1", assignedPrName: "Rohit Patel", status: "Verified_Placed", company: "Cisco Systems", role: "Network Software Eng.", packageLPA: 19.5, assignedFaculty: "Dr. Anita Desai (HOD)", hasOfferLetter: true, offerFileName: "Cisco_Sneha_21CS034.pdf" },
    { id: "s-07", name: "Ananya Iyer", rollNo: "21CS011", email: "ananya.i@college.edu", phone: "+91 98765 43216", cgpa: "8.90", department: "CSE", batchTimeline: "2021-2025", assignedPrId: "pr-1", assignedPrName: "Rohit Patel", status: "Unplaced", hasOfferLetter: false },
    { id: "s-08", name: "Vikram Malhotra", rollNo: "21CS115", email: "vikram.m@college.edu", phone: "+91 98765 43217", cgpa: "7.95", department: "CSE", batchTimeline: "2021-2025", assignedPrId: "pr-1", assignedPrName: "Rohit Patel", status: "Unplaced", hasOfferLetter: false },
    { id: "s-09", name: "Kavya Menon", rollNo: "21CS054", email: "kavya.m@college.edu", phone: "+91 98765 43218", cgpa: "8.65", department: "CSE", batchTimeline: "2021-2025", assignedPrId: "pr-1", assignedPrName: "Rohit Patel", status: "Letter_Uploaded", company: "Amazon", role: "SDE-1", packageLPA: 26.0, assignedFaculty: "Prof. S. Ranganathan", hasOfferLetter: true, offerFileName: "Amazon_Kavya_21CS054.pdf" },
    { id: "s-10", name: "Nikhil Joshi", rollNo: "21CS076", email: "nikhil.j@college.edu", phone: "+91 98765 43219", cgpa: "8.12", department: "CSE", batchTimeline: "2021-2025", assignedPrId: "pr-1", assignedPrName: "Rohit Patel", status: "Unplaced", hasOfferLetter: false },
    { id: "s-11", name: "Meera Nair", rollNo: "21CS061", email: "meera.n@college.edu", phone: "+91 98765 43220", cgpa: "8.50", department: "CSE", batchTimeline: "2021-2025", assignedPrId: "pr-1", assignedPrName: "Rohit Patel", status: "Offer_Reported", company: "Morgan Stanley", role: "Tech Analyst", packageLPA: 22.0, hasOfferLetter: false },
    { id: "s-12", name: "Aditya Roy", rollNo: "21CS008", email: "aditya.r@college.edu", phone: "+91 98765 43221", cgpa: "7.70", department: "CSE", batchTimeline: "2021-2025", assignedPrId: "pr-1", assignedPrName: "Rohit Patel", status: "Unplaced", hasOfferLetter: false },
    { id: "s-13", name: "Pooja Hegde", rollNo: "21CS049", email: "pooja.h@college.edu", phone: "+91 98765 43222", cgpa: "8.85", department: "CSE", batchTimeline: "2021-2025", assignedPrId: "pr-1", assignedPrName: "Rohit Patel", status: "Verified_Placed", company: "Adobe", role: "Member Tech Staff", packageLPA: 34.0, assignedFaculty: "Dr. P. K. Sharma", hasOfferLetter: true, offerFileName: "Adobe_Pooja_21CS049.pdf" },
    { id: "s-14", name: "Gaurav Shah", rollNo: "21CS038", email: "gaurav.s@college.edu", phone: "+91 98765 43223", cgpa: "8.30", department: "CSE", batchTimeline: "2021-2025", assignedPrId: "pr-1", assignedPrName: "Rohit Patel", status: "Unplaced", hasOfferLetter: false },
    { id: "s-15", name: "Rhea Chawla", rollNo: "21CS093", email: "rhea.c@college.edu", phone: "+91 98765 43224", cgpa: "9.05", department: "CSE", batchTimeline: "2021-2025", assignedPrId: "pr-1", assignedPrName: "Rohit Patel", status: "Letter_Uploaded", company: "Atlassian", role: "Associate Developer", packageLPA: 36.0, assignedFaculty: "Dr. Anita Desai (HOD)", hasOfferLetter: true, offerFileName: "Atlassian_Rhea_21CS093.pdf" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Drawer (Sheet) state for inspection & offer letter ingestion
  const [selectedStudent, setSelectedStudent] = useState<IManagedStudent | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Dialog state for adding a student
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);

  // Form states for PR Offer Upload & In-charge Faculty Assignment
  const [inchargeFaculty, setInchargeFaculty] = useState("Dr. Anita Desai (HOD CS)");
  const [offerCompany, setOfferCompany] = useState("");
  const [offerRole, setOfferRole] = useState("Software Engineer");
  const [offerPackage, setOfferPackage] = useState("24.0");
  const [stagedDocName, setStagedDocName] = useState("Student_Offer_Letter_Official.pdf");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form states for adding a student to this PR cohort
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentRoll, setNewStudentRoll] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentPhone, setNewStudentPhone] = useState("");
  const [newStudentCgpa, setNewStudentCgpa] = useState("8.50");

  const handleOpenStudentDrawer = (student: IManagedStudent) => {
    setSelectedStudent(student);
    setOfferCompany(student.company || "");
    setOfferRole(student.role || "Software Engineer");
    setOfferPackage(student.packageLPA ? student.packageLPA.toString() : "20.0");
    setInchargeFaculty(student.assignedFaculty || "Dr. Anita Desai (HOD CS)");
    setStagedDocName(student.offerFileName || `${student.name.replace(/\s+/g, "_")}_Offer_Letter.pdf`);
    setIsSheetOpen(true);
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
    setIsSheetOpen(false);
    setSuccessToast(
      `Offer letter for ${selectedStudent.name} uploaded to College Drive. Assigned ${inchargeFaculty}. 7-Agent verification pipeline initiated.`
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
      department: "CSE",
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
    setSuccessToast(`Added ${newStudent.name} (${newStudent.rollNo}) to your 15-student cohort.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Status-based counts
  const placedCount = students.filter((s) => s.status === "Verified_Placed" || s.status === "Letter_Uploaded").length;
  const verifiedCount = students.filter((s) => s.status === "Verified_Placed").length;
  const letterUploadedCount = students.filter((s) => s.status === "Letter_Uploaded").length;
  const offerReportedCount = students.filter((s) => s.status === "Offer_Reported").length;
  const unplacedCount = students.filter((s) => s.status === "Unplaced").length;
  const placementRate = Math.round((placedCount / students.length) * 100);

  // Tab & search filtering
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.company && s.company.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "unplaced") return s.status === "Unplaced";
    if (activeTab === "action_needed") return s.status === "Offer_Reported" || s.status === "Letter_Uploaded";
    if (activeTab === "verified") return s.status === "Verified_Placed";
    return true;
  });

  const getStatusBadge = (status: IManagedStudent["status"]) => {
    switch (status) {
      case "Verified_Placed":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 font-semibold text-[11px]">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Verified Placed
          </Badge>
        );
      case "Letter_Uploaded":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1 font-semibold text-[11px]">
            <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Faculty Review
          </Badge>
        );
      case "Offer_Reported":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 font-semibold text-[11px]">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Upload Letter
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 gap-1 font-medium text-[11px]">
            <GraduationCap className="w-3 h-3 text-slate-500" /> Unplaced
          </Badge>
        );
    }
  };

  return (
    <div className={styles.container}>
      {/* Precision College PR Command Banner */}
      <div className={styles.headerBanner}>
        <div className={styles.headerAccentGlow} />
        <div className={styles.headerInner}>
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs px-2.5 py-0.5 font-semibold">
                PR Batch 2021–2025
              </Badge>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" /> 1 PR : Exactly 15 Assigned Students
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              Placement Representative Hub
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              As the designated PR for your 15-student cohort, you manage student academic details, report compensation, and upload verified PDF offer letters for In-charge Faculty authentication.
            </p>

            <div className="pt-1 flex items-center gap-4 text-xs text-slate-400">
              <span>PR: <strong className="text-slate-100">Rohit Patel</strong></span>
              <span>•</span>
              <span>Branch: <strong className="text-slate-100">CSE (Section A)</strong></span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 7-Agent Guard Active
              </span>
            </div>
          </div>

          {/* Quick Metrics & Cohort Progress Ring */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg min-w-[240px]">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
                <span>Cohort Placement Progress</span>
                <span className="font-bold text-white">{placementRate}%</span>
              </div>
              <Progress value={placementRate} className="h-2 bg-slate-800" />
              <div className="flex justify-between items-center mt-2.5 text-[11px]">
                <span className="text-emerald-400 font-semibold">{placedCount} of {students.length} Placed</span>
                <span className="text-slate-500 font-mono">{unplacedCount} Unplaced</span>
              </div>
            </div>

            <Button
              onClick={() => setIsAddStudentDialogOpen(true)}
              className="h-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs gap-1.5 shadow-lg cursor-pointer"
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
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <CardContent className="p-4 space-y-1">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Cohort Seats</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{students.length} / 15</div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">100% Cohort Registered</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <CardContent className="p-4 space-y-1">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Letters Ingested</span>
              <FileText className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{letterUploadedCount + verifiedCount}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Uploaded by PR to Drive</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <CardContent className="p-4 space-y-1">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Faculty Verified</span>
              <UserCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{verifiedCount} Records</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Signed off & Locked in ERP</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <CardContent className="p-4 space-y-1">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Highest Package</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">₹36.0 LPA</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Atlassian • Rhea Chawla</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Controls & View Modes */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* Tabs for Stage Filtering */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="bg-slate-200/70 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-xl">
            <TabsTrigger value="all" className="text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
              All 15 Students ({students.length})
            </TabsTrigger>
            <TabsTrigger value="unplaced" className="text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
              Unplaced ({unplacedCount})
            </TabsTrigger>
            <TabsTrigger value="action_needed" className="text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
              In Pipeline ({offerReportedCount + letterUploadedCount})
            </TabsTrigger>
            <TabsTrigger value="verified" className="text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
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
                viewMode === "grid" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 mr-1" /> Grid
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("table")}
              className={`h-8 px-2.5 text-xs rounded-lg cursor-pointer ${
                viewMode === "table" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <List className="w-3.5 h-3.5 mr-1" /> Ledger
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {/* Main Cohort View: 15-Slot Visual Grid or Dense Ledger Table */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {filteredStudents.map((s, index) => {
            return (
              <Card
                key={s.id}
                onClick={() => handleOpenStudentDrawer(s)}
                className={`relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border ${
                  s.status === "Verified_Placed"
                    ? "border-emerald-200/90 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/20 hover:border-emerald-400"
                    : s.status === "Letter_Uploaded"
                    ? "border-blue-200 dark:border-blue-800/80 bg-blue-50/20 dark:bg-blue-950/20 hover:border-blue-400"
                    : s.status === "Offer_Reported"
                    ? "border-amber-200 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/20 hover:border-amber-400"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-slate-900/90"
                }`}
              >
                {/* Seat Number Tag */}
                <div className="absolute top-2.5 right-2.5 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  #{String(index + 1).padStart(2, "0")}
                </div>

                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-slate-200 dark:border-slate-700 shadow-xs">
                      <AvatarFallback className="bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs">
                        {s.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{s.name}</h3>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">{s.rollNo}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <span>CGPA: <strong className="text-slate-800 dark:text-slate-200">{s.cgpa}</strong></span>
                    <span>{s.department}</span>
                  </div>

                  {/* Company & CTC Section */}
                  <div className="min-h-[46px] rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2 flex flex-col justify-center border border-slate-100 dark:border-slate-800">
                    {s.company ? (
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>{s.company}</span>
                        </div>
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                          ₹{s.packageLPA} LPA • <span className="text-slate-500 dark:text-slate-400 font-normal truncate">{s.role}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 italic flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                        <span>Awaiting Placement Drive</span>
                      </div>
                    )}
                  </div>

                  {/* Status & Action */}
                  <div className="flex items-center justify-between pt-1">
                    {getStatusBadge(s.status)}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Dense College Ledger Table */
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
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
                  <th className="px-5 py-3 text-right">PR Ingestion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredStudents.map((s, idx) => (
                  <tr
                    key={s.id}
                    onClick={() => handleOpenStudentDrawer(s)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-slate-400 dark:text-slate-500">#{idx + 1}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">{s.rollNo}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                      <div>{s.name}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{s.email}</div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">{s.cgpa}</td>
                    <td className="px-5 py-3.5">{getStatusBadge(s.status)}</td>
                    <td className="px-5 py-3.5">
                      {s.company ? (
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{s.company}</div>
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">₹{s.packageLPA} LPA • {s.role}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic">No offer reported</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      {s.assignedFaculty ? (
                        <span className="font-medium">{s.assignedFaculty}</span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        size="sm"
                        variant={s.hasOfferLetter ? "outline" : "default"}
                        className="h-7 text-xs px-2.5 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenStudentDrawer(s);
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
        </Card>
      )}

      {/* Radix Sheet Drawer: Student Detail, Offer Upload & Faculty Assignment */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800 overflow-y-auto p-6 space-y-6">
          {selectedStudent && (
            <>
              <SheetHeader className="space-y-1 text-left border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-xs text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40">
                    {selectedStudent.rollNo}
                  </Badge>
                  {getStatusBadge(selectedStudent.status)}
                </div>
                <SheetTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {selectedStudent.name}
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Student Record managed directly by PR Rohit Patel • Department of Computer Science
                </SheetDescription>
              </SheetHeader>

              {/* Academic Overview Box */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">CGPA</div>
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100">{selectedStudent.cgpa}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Department</div>
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100">{selectedStudent.department}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Batch</div>
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100">{selectedStudent.batchTimeline}</div>
                </div>
              </div>

              {/* Uploaded Offer Letter Preview if present */}
              {selectedStudent.hasOfferLetter && (
                <div className="border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Letter Ingested
                    </span>
                    <Badge className="bg-emerald-600 text-white text-[10px]">Ready for Review</Badge>
                  </div>
                  <div className="bg-white dark:bg-slate-850 border border-emerald-200 dark:border-emerald-800/70 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <FileText className="w-4 h-4 text-rose-500" />
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-medium truncate max-w-[200px]">
                        {selectedStudent.offerFileName}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                      View PDF
                    </Button>
                  </div>
                </div>
              )}

              {/* PR Ingestion Form */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    {selectedStudent.hasOfferLetter ? "Update Offer Information" : "Ingest New Offer & Assign Reviewer"}
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Company Name</label>
                  <Input
                    type="text"
                    value={offerCompany}
                    onChange={(e) => setOfferCompany(e.target.value)}
                    placeholder="e.g. Google India, Cisco, Adobe"
                    className="h-9 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Role Designation</label>
                    <Input
                      type="text"
                      value={offerRole}
                      onChange={(e) => setOfferRole(e.target.value)}
                      placeholder="e.g. SDE-1"
                      className="h-9 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Package (CTC in LPA)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={offerPackage}
                      onChange={(e) => setOfferPackage(e.target.value)}
                      placeholder="24.0"
                      className="h-9 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
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
                    className="w-full h-9 px-3 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Dr. Anita Desai (HOD CS)">Dr. Anita Desai (HOD CS)</option>
                    <option value="Prof. S. Ranganathan (Senior Mentor)">Prof. S. Ranganathan (Senior Mentor)</option>
                    <option value="Dr. P. K. Sharma (Placement Chair)">Dr. P. K. Sharma (Placement Chair)</option>
                  </select>
                </div>

                {/* Offer Letter Upload Box */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Upload Official Offer Letter (PDF)
                  </label>
                  <div className="border-2 border-dashed border-blue-200 dark:border-blue-900/60 hover:border-blue-400 bg-blue-50/30 dark:bg-blue-950/20 rounded-xl p-4 text-center cursor-pointer transition-all">
                    <UploadCloud className="w-7 h-7 text-blue-600 dark:text-blue-400 mx-auto" />
                    <div className="text-xs text-slate-800 dark:text-slate-200 font-semibold mt-1.5">
                      Attached: <span className="font-mono text-blue-700 dark:text-blue-400">{stagedDocName}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Files are securely transmitted directly to College Google Drive
                    </p>
                  </div>
                </div>

                {/* 7-Agent Checklist Indicator */}
                <div className="bg-slate-900 text-slate-200 rounded-xl p-3.5 space-y-2 text-xs border border-slate-800">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <Bot className="w-4 h-4" /> 7-Agent AI Verification Pipeline
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Upon submission, Agent 1 extracts terms (CTC, DOJ), Agent 2 runs tamper detection, and Agent 3 verifies against college placement policy before notifying {inchargeFaculty}.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsSheetOpen(false)}>
                    Close
                  </Button>
                  <Button
                    size="sm"
                    disabled={!offerCompany}
                    onClick={handleConfirmUpload}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" /> Confirm & Submit to Faculty
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog for Adding New Student to Cohort */}
      <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Register Student into 15-Seat Cohort
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Students do not create login accounts. As PR, you register their details directly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Full Student Name</label>
              <Input
                type="text"
                placeholder="e.g. Vikram Malhotra"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="h-9 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Roll Number</label>
                <Input
                  type="text"
                  placeholder="21CS115"
                  value={newStudentRoll}
                  onChange={(e) => setNewStudentRoll(e.target.value)}
                  className="h-9 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Cumulative CGPA</label>
                <Input
                  type="text"
                  placeholder="8.50"
                  value={newStudentCgpa}
                  onChange={(e) => setNewStudentCgpa(e.target.value)}
                  className="h-9 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">College Email ID</label>
              <Input
                type="email"
                placeholder="student.roll@college.edu"
                value={newStudentEmail}
                onChange={(e) => setNewStudentEmail(e.target.value)}
                className="h-9 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Mobile Phone</label>
              <Input
                type="tel"
                placeholder="+91 98765 43210"
                value={newStudentPhone}
                onChange={(e) => setNewStudentPhone(e.target.value)}
                className="h-9 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsAddStudentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddStudent}
              disabled={!newStudentName || !newStudentRoll}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs gap-1 cursor-pointer"
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
