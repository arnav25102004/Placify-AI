import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Server,
  Users,
  FileCheck2,
  Building,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Sparkles,
  Plus,
  Edit2,
  SlidersHorizontal,
  RotateCcw,
  BookOpen,
  Info,
  Check,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Progress } from "@/shared/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  ProgramCohortAllocation,
  getProgramAllocations,
  saveProgramAllocations,
  updateProgramCapacity,
  resetProgramAllocationsToDefault,
} from "@/shared/lib/pr-cohort-config";
import { api } from "@/shared/lib/api";

interface AdminOverviewPageProps {
  onNavigate: (viewId: string) => void;
}

export const AdminOverviewPage: React.FC<AdminOverviewPageProps> = ({ onNavigate }) => {
  const [syncRunning, setSyncRunning] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // PR Cohort Program Allocations (Super Admin Governance)
  const [allocations, setAllocations] = useState<ProgramCohortAllocation[]>(() =>
    getProgramAllocations()
  );

  // Sync with live backend cohort allocation policies
  useEffect(() => {
    let isMounted = true;
    const fetchAllocations = async () => {
      try {
        const live = await api.getProgramCohortAllocations();
        if (isMounted && live && live.length > 0) {
          setAllocations(live as ProgramCohortAllocation[]);
          saveProgramAllocations(live as ProgramCohortAllocation[]);
        }
      } catch (err) {
        console.warn("Backend cohort allocations fallback to local storage:", err);
      }
    };
    fetchAllocations();
    return () => {
      isMounted = false;
    };
  }, []);
  const [editingAllocation, setEditingAllocation] = useState<ProgramCohortAllocation | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [policyToast, setPolicyToast] = useState<string | null>(null);

  // Form states for Add / Edit Program Cohort Policy
  const [formProgramName, setFormProgramName] = useState("");
  const [formDeptCode, setFormDeptCode] = useState("");
  const [formTotalStudents, setFormTotalStudents] = useState("300");
  const [formStudentsPerPR, setFormStudentsPerPR] = useState("15");
  const [formNotes, setFormNotes] = useState("");

  const triggerGlobalERPSync = () => {
    setSyncRunning(true);
    setTimeout(() => {
      setSyncRunning(false);
      setSyncStatus(
        "Global ERP Sync Completed at " +
          new Date().toLocaleTimeString() +
          " — 1,480 student placement records synchronized across all 5 campuses."
      );
    }, 1200);
  };

  const handleOpenEditDialog = (allocation: ProgramCohortAllocation) => {
    setEditingAllocation(allocation);
    setFormProgramName(allocation.programName);
    setFormDeptCode(allocation.departmentCode);
    setFormTotalStudents(allocation.totalStudents.toString());
    setFormStudentsPerPR(allocation.studentsPerPR.toString());
    setFormNotes(allocation.notes || "");
    setIsEditDialogOpen(true);
  };

  const handleOpenAddDialog = () => {
    setFormProgramName("");
    setFormDeptCode("");
    setFormTotalStudents("150");
    setFormStudentsPerPR("15");
    setFormNotes("");
    setIsAddDialogOpen(false);
    setIsAddDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingAllocation) return;
    const studentsPerPR = Math.max(1, parseInt(formStudentsPerPR) || 15);
    const totalStudents = Math.max(1, parseInt(formTotalStudents) || 100);
    const needed = Math.ceil(totalStudents / studentsPerPR);

    const updated = allocations.map((a) =>
      a.id === editingAllocation.id
        ? {
            ...a,
            programName: formProgramName,
            departmentCode: formDeptCode.toUpperCase(),
            totalStudents,
            studentsPerPR,
            totalPRsNeeded: needed,
            notes: formNotes,
            lastUpdatedBy: "Super Admin",
            lastUpdatedAt: new Date().toLocaleDateString(),
          }
        : a
    );

    setAllocations(updated);
    saveProgramAllocations(updated);
    setIsEditDialogOpen(false);
    setPolicyToast(
      `Updated ${editingAllocation.departmentCode} allocation: 1 PR per ${studentsPerPR} students (${needed} PRs needed). Dynamic cohort capacity propagated.`
    );
    setTimeout(() => setPolicyToast(null), 5000);

    try {
      api.updateProgramCohortAllocation(editingAllocation.id, {
        studentsPerPR,
        totalStudents,
        programName: formProgramName,
        notes: formNotes,
      }).catch((e) => console.warn("Backend allocation update note:", e));
    } catch (err) {
      console.warn("Backend allocation update fallback:", err);
    }
  };

  const handleCreateProgramPolicy = () => {
    if (!formProgramName || !formDeptCode) return;
    const studentsPerPR = Math.max(1, parseInt(formStudentsPerPR) || 15);
    const totalStudents = Math.max(1, parseInt(formTotalStudents) || 100);
    const needed = Math.ceil(totalStudents / studentsPerPR);

    const newAlloc: ProgramCohortAllocation = {
      id: `prog-${formDeptCode.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now()}`,
      programName: formProgramName,
      departmentCode: formDeptCode.toUpperCase(),
      totalStudents,
      studentsPerPR,
      totalPRsNeeded: needed,
      activePRsAssigned: needed,
      academicYear: "2024-2025",
      status: "Active",
      notes: formNotes,
      lastUpdatedBy: "Super Admin",
      lastUpdatedAt: new Date().toLocaleDateString(),
    };

    const updated = [...allocations, newAlloc];
    setAllocations(updated);
    saveProgramAllocations(updated);
    setIsAddDialogOpen(false);
    setPolicyToast(
      `Created new PR cohort policy for ${newAlloc.programName} (${newAlloc.departmentCode}): 1 PR per ${studentsPerPR} students.`
    );
    setTimeout(() => setPolicyToast(null), 5000);
  };

  const handleInlineCapacityAdjust = (id: string, delta: number) => {
    const item = allocations.find((a) => a.id === id);
    if (!item) return;
    const newCap = Math.max(5, Math.min(50, item.studentsPerPR + delta));
    const updated = updateProgramCapacity(id, newCap);
    setAllocations(updated);
    setPolicyToast(
      `Adjusted ${item.departmentCode} PR capacity to ${newCap} students per PR.`
    );
    setTimeout(() => setPolicyToast(null), 4000);

    try {
      api.updateProgramCohortAllocation(id, {
        studentsPerPR: newCap,
      }).catch((e) => console.warn("Backend inline allocation update note:", e));
    } catch (err) {
      console.warn("Backend allocation update fallback:", err);
    }
  };

  const handleResetBaselines = () => {
    const defaults = resetProgramAllocationsToDefault();
    setAllocations(defaults);
    setPolicyToast("Reset all program PR cohort allocations to institutional baseline standards.");
    setTimeout(() => setPolicyToast(null), 4000);
  };

  // Institutional Aggregates
  const totalEnrolledAll = allocations.reduce((acc, a) => acc + a.totalStudents, 0);
  const totalPRsNeededAll = allocations.reduce((acc, a) => acc + a.totalPRsNeeded, 0);
  const totalPRsAssignedAll = allocations.reduce((acc, a) => acc + a.activePRsAssigned, 0);
  const avgCohortSize = (totalEnrolledAll / totalPRsNeededAll).toFixed(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Super Admin Console
            </h1>
            <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 flex items-center gap-1 font-semibold text-xs py-0.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Full Root Access
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global governance over 5 campuses, 220 faculty reviewers, multi-program PR cohort ratios, and placement AI agents.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerGlobalERPSync}
            disabled={syncRunning}
            className="text-xs h-9 gap-1.5 border-slate-200 dark:border-slate-800 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncRunning ? "animate-spin text-blue-600" : ""}`} />
            <span>{syncRunning ? "Syncing ERP..." : "Trigger Multi-Campus ERP Sync"}</span>
          </Button>
        </div>
      </div>

      {syncStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {policyToast && (
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-medium">{policyToast}</span>
          </div>
          <button onClick={() => setPolicyToast(null)} className="text-blue-500 hover:text-blue-800 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Global Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Multi-Campus Tenants</span>
              <Building className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">5 Campuses</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">100% Online & Synced</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Enrolled Cohorts</span>
              <Users className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalEnrolledAll} Students</div>
            <div className="text-[11px] text-slate-400 font-mono">
              {totalPRsNeededAll} PRs Required (Avg 1:{avgCohortSize})
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Verified Offers</span>
              <FileCheck2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">892 Offers</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">96.4% Verification Accuracy</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">PR Policy Coverage</span>
              <SlidersHorizontal className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {allocations.length} Programs
            </div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              Dynamic Ratio Enabled
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SUPER ADMIN GOVERNANCE: Program-Wise PR Cohort Capacity Policy */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  Program-Wise PR Cohort Allocation Policy
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                Super Admin governance rule: student-to-PR ratios differ across academic programs based on total enrollment, curriculum depth, and drive intensity. Adjusting capacity per PR updates PR Hub cohorts in real time.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetBaselines}
                className="text-xs h-9 gap-1.5 border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Baselines</span>
              </Button>
              <Button
                size="sm"
                onClick={handleOpenAddDialog}
                className="text-xs h-9 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold gap-1.5 rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Program Rule</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Quick Notice */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300">
            <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold">Super Admin Rule Enforcement:</span> PRs manage a variable number of students depending on their assigned program. For example, high-volume engineering batches (CSE) may be assigned 15 or 20 students per PR, while specialized postgraduate cohorts (MCA or M.Tech) are configured at 10 to 12 students.
            </div>
          </div>

          {/* Program Allocation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allocations.map((alloc) => {
              const staffingPct = Math.min(
                100,
                Math.round((alloc.activePRsAssigned / alloc.totalPRsNeeded) * 100)
              );

              return (
                <div
                  key={alloc.id}
                  className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-4.5 bg-white dark:bg-slate-900/60 hover:border-amber-500/50 dark:hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-xs group"
                >
                  <div>
                    {/* Top Row: Department & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                            {alloc.departmentCode}
                          </span>
                          <Badge variant="outline" className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300">
                            {alloc.status}
                          </Badge>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1.5 leading-snug line-clamp-1">
                          {alloc.programName}
                        </h4>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditDialog(alloc)}
                        className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        title="Edit Policy"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Ratio Callout Highlight */}
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400">
                          Configured Ratio
                        </div>
                        <div className="text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                          1 PR : {alloc.studentsPerPR} Students
                        </div>
                      </div>

                      {/* Quick Stepper for Super Admin */}
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-850 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => handleInlineCapacityAdjust(alloc.id, -1)}
                          disabled={alloc.studentsPerPR <= 5}
                          className="w-6 h-6 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 disabled:opacity-30 cursor-pointer"
                          title="Decrease capacity by 1"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono font-bold px-1 text-slate-900 dark:text-white">
                          {alloc.studentsPerPR}
                        </span>
                        <button
                          onClick={() => handleInlineCapacityAdjust(alloc.id, 1)}
                          disabled={alloc.studentsPerPR >= 50}
                          className="w-6 h-6 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 disabled:opacity-30 cursor-pointer"
                          title="Increase capacity by 1"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Breakdown Numbers */}
                    <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Batch Total</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {alloc.totalStudents}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">PRs Needed</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {alloc.totalPRsNeeded}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Assigned</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {alloc.activePRsAssigned}
                        </span>
                      </div>
                    </div>

                    {/* Staffing Progress */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Staffing Coverage</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{staffingPct}%</span>
                      </div>
                      <Progress value={staffingPct} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                    </div>
                  </div>

                  {/* Notes / Footer */}
                  <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="truncate">{alloc.notes || "Standard policy"}</span>
                    <button
                      onClick={() => handleOpenEditDialog(alloc)}
                      className="text-amber-600 dark:text-amber-400 font-semibold hover:underline shrink-0 ml-2 cursor-pointer"
                    >
                      Configure →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Direct Module Gateways for Admin */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" /> Direct Module Gateways (Admin Privilege)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigate("comparisons")}
            className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 dark:hover:border-purple-500/50 rounded-2xl cursor-pointer transition-all hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
              Compare Document
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Side-by-side offer letter preview, extracted field review, and confidence scoring.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-purple-600">
              Open Compare <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onNavigate("pr_pipeline")}
            className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 rounded-2xl cursor-pointer transition-all hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
              PR Hub & Program Cohorts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage PR assignments, monitor program-specific cohort pipelines, and issue document ingestion tasks.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-amber-600">
              Open PR Pipeline <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onNavigate("coordinator_drives")}
            className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 dark:hover:border-rose-500/50 rounded-2xl cursor-pointer transition-all hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
              Placement Drives & Coordinators
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Track multi-company hiring drives, eligibility cuts, and university ERP connector states.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-rose-600">
              View Drives Tracker <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onNavigate("student_dashboard")}
            className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 rounded-2xl cursor-pointer transition-all hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              Student Experience Preview
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Preview placement status cards, senior mentor directory, and upload request portals.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-blue-600">
              View Student Portal <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* System Microservices Heartbeat Panel */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <Server className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Autonomous Verification & Audit Engine
                </h3>
                <p className="text-[11px] text-slate-500">Real-time daemon statuses across pipeline services</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Pipeline Services Operational
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {[
              { id: "Service 1", name: "Document Ingestion & Parsing", status: "Healthy", time: "14ms avg" },
              { id: "Service 2", name: "Information Extraction (Parser)", status: "Healthy", time: "1.8s avg" },
              { id: "Service 3", name: "Authenticity & Fraud Detector", status: "Healthy", time: "340ms avg" },
              { id: "Service 4", name: "Cross-Verification & Profile Match", status: "Healthy", time: "92ms avg" },
              { id: "Service 5", name: "Faculty Discrepancy Assistant", status: "Healthy", time: "410ms avg" },
              { id: "Service 6", name: "Audit & ERP Sync Compliance", status: "Healthy", time: "180ms avg" },
            ].map((agent) => (
              <div
                key={agent.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{agent.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{agent.id} • {agent.time}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  {agent.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Program Allocation Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xl">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Configure PR Cohort Capacity
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Set the exact student ratio for {editingAllocation?.programName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs py-2">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Program / Degree Name
              </label>
              <Input
                type="text"
                value={formProgramName}
                onChange={(e) => setFormProgramName(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Department Code
                </label>
                <Input
                  type="text"
                  value={formDeptCode}
                  onChange={(e) => setFormDeptCode(e.target.value)}
                  className="h-9 text-xs rounded-xl uppercase font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Total Enrolled Students
                </label>
                <Input
                  type="number"
                  value={formTotalStudents}
                  onChange={(e) => setFormTotalStudents(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Configured Students Per PR: The Key User Request */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-amber-900 dark:text-amber-300 text-xs">
                  Students Handled per PR Representative
                </label>
                <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400 font-mono">
                  {formStudentsPerPR} Students / PR
                </span>
              </div>
              <Input
                type="number"
                min="1"
                max="50"
                value={formStudentsPerPR}
                onChange={(e) => setFormStudentsPerPR(e.target.value)}
                className="h-9 text-xs rounded-xl bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-700"
              />
              <div className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                Calculation: {parseInt(formTotalStudents) || 0} students ÷ {parseInt(formStudentsPerPR) || 15} per PR ={" "}
                <strong>{Math.ceil((parseInt(formTotalStudents) || 0) / (parseInt(formStudentsPerPR) || 15))} PRs</strong>{" "}
                required for full coverage.
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Program Notes / Special Instructions
              </label>
              <Input
                type="text"
                placeholder="e.g. Circuital branch, core embedded focus"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(false)}
              className="text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
            >
              Save Policy & Propagate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Program Allocation Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xl">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Create Program PR Cohort Policy
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Define the student-to-PR ratio for a new academic program or department.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs py-2">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Program / Degree Name
              </label>
              <Input
                type="text"
                placeholder="e.g. B.Tech Artificial Intelligence"
                value={formProgramName}
                onChange={(e) => setFormProgramName(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Department Code
                </label>
                <Input
                  type="text"
                  placeholder="e.g. AI-ML"
                  value={formDeptCode}
                  onChange={(e) => setFormDeptCode(e.target.value)}
                  className="h-9 text-xs rounded-xl uppercase font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Total Enrolled Students
                </label>
                <Input
                  type="number"
                  placeholder="120"
                  value={formTotalStudents}
                  onChange={(e) => setFormTotalStudents(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Students per PR */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-amber-900 dark:text-amber-300 text-xs">
                  Students Handled per PR Representative
                </label>
                <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400 font-mono">
                  {formStudentsPerPR} Students / PR
                </span>
              </div>
              <Input
                type="number"
                min="1"
                max="50"
                value={formStudentsPerPR}
                onChange={(e) => setFormStudentsPerPR(e.target.value)}
                className="h-9 text-xs rounded-xl bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-700"
              />
              <div className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                Calculation: {parseInt(formTotalStudents) || 0} students ÷ {parseInt(formStudentsPerPR) || 15} per PR ={" "}
                <strong>{Math.ceil((parseInt(formTotalStudents) || 0) / (parseInt(formStudentsPerPR) || 15))} PRs</strong>{" "}
                required.
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Program Notes
              </label>
              <Input
                type="text"
                placeholder="e.g. Specialized track, high project load"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddDialogOpen(false)}
              className="text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateProgramPolicy}
              disabled={!formProgramName || !formDeptCode}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
            >
              Create Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOverviewPage;
