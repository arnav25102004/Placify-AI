import React, { useState } from "react";
import { UserRole } from "@/shared/types";
import { ThemeProvider } from "@/shared/context/theme-context";
import { AppLayout } from "@/shared/components/layout";
import { PRPipelinePage } from "@/modules/pr";
import { FacultyVerificationWorkspacePage, DocumentHistoryPage, CompareDocumentPage } from "@/modules/verification";
import { CoordinatorDrivesPage } from "@/modules/coordinator";
import { StudentDashboardPage } from "@/modules/student";
import { AdminOverviewPage } from "@/modules/admin";
import {
  UploadCloud,
  FileCheck2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export const App: React.FC = () => {
  // Default role is faculty (Teacher) matching user's initial mockup
  const [currentRole, setCurrentRole] = useState<UserRole>("faculty");
  const [activeNavId, setActiveNavId] = useState<string>("history");

  const renderContent = () => {
    // 1. SUPER ADMIN: Unrestricted access across all modules & systems
    if (currentRole === "admin") {
      switch (activeNavId) {
        case "admin_overview":
          return <AdminOverviewPage onNavigate={(target) => setActiveNavId(target)} />;
        case "comparisons":
          return <CompareDocumentPage onBack={() => setActiveNavId("admin_overview")} />;
        case "history":
          return <DocumentHistoryPage onOpenWorkspace={() => setActiveNavId("comparisons")} />;
        case "coordinator_drives":
        case "erp_sync":
          return <CoordinatorDrivesPage />;
        case "pr_pipeline":
        case "cohort_15":
          return <PRPipelinePage />;
        case "student_dashboard":
          return <StudentDashboardPage />;
        default:
          return <AdminOverviewPage onNavigate={(target) => setActiveNavId(target)} />;
      }
    }

    // 2. TEACHER / FACULTY: Document history, batch uploads, verification workspace
    if (currentRole === "faculty") {
      switch (activeNavId) {
        case "history":
          return (
            <DocumentHistoryPage
              onOpenWorkspace={() => setActiveNavId("workspace")}
            />
          );
        case "dashboard":
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Faculty Dashboard
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Overview of department placement verifications and student offer statuses.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setActiveNavId("history")}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <FileCheck2 className="w-4 h-4" /> View Document History
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-xs font-medium text-slate-500">Total Verified</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">142</div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">94.6% Auto-Verified</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-xs font-medium text-slate-500">Needs Review</div>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">12</div>
                  <div className="text-[11px] text-amber-600 mt-1 font-medium">Salary / Role ambiguity</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-xs font-medium text-slate-500">Mismatches</div>
                  <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">3</div>
                  <div className="text-[11px] text-rose-600 mt-1 font-medium">OCR vs Student claim mismatch</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-xs font-medium text-slate-500">Average CTC</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">14.8 LPA</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">Highest: 48.0 LPA</div>
                </div>
              </div>

              {/* Quick Jump to Comparison / Verification */}
              <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-transparent border border-blue-200/60 dark:border-blue-900/40 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">Active Document Review Queue</h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Arjun Kumar's TechNova Internship Offer (₹20,000/mo) is ready for side-by-side comparison & verification.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setActiveNavId("comparisons")}
                  className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 gap-2"
                >
                  Open Compare Document <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Embedded Document History table */}
              <DocumentHistoryPage onOpenWorkspace={() => setActiveNavId("comparisons")} />
            </div>
          );
        case "upload":
          return (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Batch Upload Documents
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Upload multiple student offer letters or employment agreements for automated 7-agent verification.
                </p>
              </div>

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center bg-white dark:bg-slate-900/50 hover:border-blue-500 transition-colors">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Drag and drop student offer letters
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Supports PDF, PNG, JPG up to 25MB each. Agent 2 (OCR) and Agent 3 (Tamper Detector) run automatically.
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                    Browse Files
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveNavId("history")} className="text-xs">
                    View History
                  </Button>
                </div>
              </div>
            </div>
          );
        case "comparisons":
          return <CompareDocumentPage onBack={() => setActiveNavId("dashboard")} />;
        default:
          return <DocumentHistoryPage onOpenWorkspace={() => setActiveNavId("comparisons")} />;
      }
    }

    // 3. PR HUB: 15-Student cohort management, PR pipeline, ingestion tasks
    if (currentRole === "pr") {
      switch (activeNavId) {
        case "pr_pipeline":
        case "cohort_15":
        default:
          return <PRPipelinePage />;
      }
    }

    // 4. PLACEMENT COORDINATOR: Multi-campus drives, ERP sync, company audits
    if (currentRole === "placement_coordinator") {
      switch (activeNavId) {
        case "coordinator_drives":
        case "erp_sync":
        case "comparisons":
        case "history":
        default:
          return <CoordinatorDrivesPage />;
      }
    }

    // 5. STUDENT: My placements, upload offer, senior placement directory
    if (currentRole === "student") {
      return <StudentDashboardPage />;
    }

    // Fallbacks
    if (activeNavId === "settings") {
      return (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <p className="text-sm text-slate-500">Preferences, role delegation, and notification settings.</p>
          </div>
        </div>
      );
    }

    if (activeNavId === "help") {
      return (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Help & Support</h1>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <p className="text-sm text-slate-500">Need assistance with 7-Agent AI checks, PR cohorts or ERP exports? Contact university placement support.</p>
          </div>
        </div>
      );
    }

    return <DocumentHistoryPage onOpenWorkspace={() => setActiveNavId("workspace")} />;
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="placify-ui-theme">
      <AppLayout
        currentRole={currentRole}
        onRoleChange={(newRole) => {
          setCurrentRole(newRole);
          if (newRole === "faculty") setActiveNavId("history");
          else if (newRole === "admin") setActiveNavId("admin_overview");
          else if (newRole === "pr") setActiveNavId("pr_pipeline");
          else if (newRole === "placement_coordinator") setActiveNavId("coordinator_drives");
          else if (newRole === "student") setActiveNavId("student_dashboard");
        }}
        activeNavId={activeNavId}
        onNavSelect={setActiveNavId}
      >
        {renderContent()}
      </AppLayout>
    </ThemeProvider>
  );
};

export default App;
