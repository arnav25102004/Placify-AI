import React, { useState, useEffect } from "react";
import { UserRole } from "@/shared/types";
import { ThemeProvider } from "@/shared/context/theme-context";
import { AppLayout } from "@/shared/components/layout";
import { LoginPage } from "@/modules/auth/pages/login/LoginPage";
import { api, UserProfileData } from "@/shared/lib";
import { PRPipelinePage } from "@/modules/pr";
import { FacultyVerificationWorkspacePage, DocumentHistoryPage, CompareDocumentPage } from "@/modules/verification";
import { CoordinatorDrivesPage } from "@/modules/coordinator";
import { StudentDashboardPage, SeniorsPage, PreviousCompaniesPage } from "@/modules/student";
import { AdminOverviewPage, DatabaseStudioPage } from "@/modules/admin";
import { ProfilePage } from "@/modules/profile";
import {
  UploadCloud,
  FileCheck2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

export const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<UserProfileData | null>(() => api.getUser());
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const savedUser = api.getUser();
    if (savedUser?.role) {
      return (savedUser.role === "teacher" ? "faculty" : savedUser.role) as UserRole;
    }
    return "student";
  });
  const [activeNavId, setActiveNavId] = useState<string>(() => {
    const savedUser = api.getUser();
    const r = savedUser?.role;
    if (r === "admin") return "admin_overview";
    if (r === "teacher" || r === "faculty") return "history";
    if (r === "pr") return "pr_pipeline";
    if (r === "placement_coordinator") return "coordinator_drives";
    return "student_dashboard";
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(api.getToken());
  });

  // Verify session on mount with backend /auth/me
  useEffect(() => {
    if (api.getToken()) {
      api.getMe()
        .then((profile) => {
          setCurrentUser(profile);
          api.setUser(profile);
          const r = (profile.role === "teacher" ? "faculty" : profile.role) as UserRole;
          setCurrentRole(r);
          setIsAuthenticated(true);
        })
        .catch(() => {
          // Token expired or invalid
          api.clearToken();
          setCurrentUser(null);
          setIsAuthenticated(false);
        });
    }
  }, []);

  const handleLoginSuccess = (user: UserProfileData, role: UserRole) => {
    setCurrentUser(user);
    setCurrentRole(role);
    setIsAuthenticated(true);
    if (role === "student") setActiveNavId("student_dashboard");
    else if (role === "faculty") setActiveNavId("history");
    else if (role === "admin") setActiveNavId("admin_overview");
    else if (role === "pr") setActiveNavId("pr_pipeline");
    else if (role === "placement_coordinator") setActiveNavId("coordinator_drives");
    navigate("/");
  };

  const handleLogout = () => {
    api.clearToken();
    setCurrentUser(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  const renderContent = () => {
    // Universal Profile Page accessible by any authenticated user/role
    if (activeNavId === "profile") {
      return (
        <ProfilePage
          user={currentUser}
          onProfileUpdated={(updated) => {
            setCurrentUser(updated);
            api.setUser(updated);
          }}
        />
      );
    }

    // Universal Developer & Test DB Studio
    if (activeNavId === "dev_db") {
      return <DatabaseStudioPage />;
    }

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
        case "seniors":
          return <SeniorsPage />;
        case "companies":
          return (
            <PreviousCompaniesPage
              onNavigateToSeniors={() => setActiveNavId("seniors")}
            />
          );
        case "dev_db":
          return <DatabaseStudioPage />;
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
                  Upload multiple student offer letters or employment agreements for automated placement verification.
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
                  Supports PDF, PNG, JPG up to 25MB each. Automated OCR extraction and validation run automatically.
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

    // 5. STUDENT: My placements, upload offer, senior placement directory, past recruiters
    if (currentRole === "student") {
      switch (activeNavId) {
        case "seniors":
          return <SeniorsPage />;
        case "companies":
          return (
            <PreviousCompaniesPage
              onNavigateToSeniors={() => setActiveNavId("seniors")}
            />
          );
        case "student_dashboard":
        default:
          return <StudentDashboardPage />;
      }
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
            <p className="text-sm text-slate-500">Need assistance with placement verification, PR cohorts or ERP exports? Contact university placement support.</p>
          </div>
        </div>
      );
    }

    return <DocumentHistoryPage onOpenWorkspace={() => setActiveNavId("workspace")} />;
  };

  // Map path to active nav id
  useEffect(() => {
    const p = location.pathname;
    if (p === "/profile") setActiveNavId("profile");
    else if (p === "/dev-db" || p === "/dev_db") setActiveNavId("dev_db");
    else if (p === "/student" || p === "/student-portal") setActiveNavId("student_dashboard");
    else if (p === "/seniors") setActiveNavId("seniors");
    else if (p === "/companies") setActiveNavId("companies");
    else if (p === "/dashboard") setActiveNavId("dashboard");
    else if (p === "/upload") setActiveNavId("upload");
    else if (p === "/comparisons") setActiveNavId("comparisons");
    else if (p === "/history") setActiveNavId("history");
    else if (p === "/pr-pipeline") setActiveNavId("pr_pipeline");
    else if (p === "/cohort-15") setActiveNavId("cohort_15");
    else if (p === "/coordinator-drives") setActiveNavId("coordinator_drives");
    else if (p === "/erp-sync") setActiveNavId("erp_sync");
    else if (p === "/admin" || p === "/admin-overview") setActiveNavId("admin_overview");
    else if (p === "/settings") setActiveNavId("settings");
    else if (p === "/help") setActiveNavId("help");
    else if (p === "/") {
      // Default based on role
      if (currentRole === "student") setActiveNavId("student_dashboard");
      else if (currentRole === "faculty") setActiveNavId("history");
      else if (currentRole === "admin") setActiveNavId("admin_overview");
      else if (currentRole === "pr") setActiveNavId("pr_pipeline");
      else if (currentRole === "placement_coordinator") setActiveNavId("coordinator_drives");
    }
  }, [location.pathname, currentRole]);

  const handleNavSelect = (navId: string) => {
    setActiveNavId(navId);
    switch (navId) {
      case "profile":
        navigate("/profile");
        break;
      case "dev_db":
        navigate("/dev-db");
        break;
      case "student_dashboard":
        navigate("/student");
        break;
      case "seniors":
        navigate("/seniors");
        break;
      case "companies":
        navigate("/companies");
        break;
      case "dashboard":
        navigate("/dashboard");
        break;
      case "upload":
        navigate("/upload");
        break;
      case "comparisons":
        navigate("/comparisons");
        break;
      case "history":
        navigate("/history");
        break;
      case "pr_pipeline":
        navigate("/pr-pipeline");
        break;
      case "cohort_15":
        navigate("/cohort-15");
        break;
      case "coordinator_drives":
        navigate("/coordinator-drives");
        break;
      case "erp_sync":
        navigate("/erp-sync");
        break;
      case "admin_overview":
        navigate("/admin");
        break;
      case "settings":
        navigate("/settings");
        break;
      case "help":
        navigate("/help");
        break;
      default:
        navigate("/");
        break;
    }
  };

  const getRoleDefaultRoute = (role: UserRole) => {
    if (role === "student") return "/student";
    if (role === "faculty") return "/history";
    if (role === "admin") return "/admin";
    if (role === "pr") return "/pr-pipeline";
    if (role === "placement_coordinator") return "/coordinator-drives";
    return "/student";
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="placify-ui-theme">
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={getRoleDefaultRoute(currentRole)} replace />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Authenticated Application with URL Routes */}
        <Route
          path="/*"
          element={
            !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : (
              <AppLayout
                currentRole={currentRole}
                onRoleChange={(newRole) => {
                  setCurrentRole(newRole);
                  const target = getRoleDefaultRoute(newRole);
                  navigate(target);
                }}
                activeNavId={activeNavId}
                onNavSelect={handleNavSelect}
                onLogout={handleLogout}
                userEmail={currentUser?.email}
                userProgram={currentUser?.program}
              >
                <Routes>
                  {/* Default root redirects to role home */}
                  <Route path="/" element={<Navigate to={getRoleDefaultRoute(currentRole)} replace />} />

                  {/* Universal Profile Page */}
                  <Route
                    path="/profile"
                    element={
                      <ProfilePage
                        user={currentUser}
                        onProfileUpdated={(updated) => {
                          setCurrentUser(updated);
                          api.setUser(updated);
                        }}
                      />
                    }
                  />

                  {/* Universal Test DB Studio */}
                  <Route path="/dev-db" element={<DatabaseStudioPage />} />
                  <Route path="/dev_db" element={<Navigate to="/dev-db" replace />} />

                  {/* Student Routes */}
                  <Route path="/student" element={<StudentDashboardPage />} />
                  <Route path="/seniors" element={<SeniorsPage />} />
                  <Route
                    path="/companies"
                    element={<PreviousCompaniesPage onNavigateToSeniors={() => navigate("/seniors")} />}
                  />

                  {/* Faculty & Verification Routes */}
                  <Route
                    path="/dashboard"
                    element={
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
                            onClick={() => navigate("/history")}
                            className="bg-maroon-900 hover:bg-maroon-800 text-white gap-2"
                          >
                            <FileCheck2 className="w-4 h-4" /> View Document History
                          </Button>
                        </div>
                        <DocumentHistoryPage onOpenWorkspace={() => navigate("/comparisons")} />
                      </div>
                    }
                  />
                  <Route
                    path="/history"
                    element={<DocumentHistoryPage onOpenWorkspace={() => navigate("/comparisons")} />}
                  />
                  <Route
                    path="/upload"
                    element={
                      <div className="space-y-6">
                        <div>
                          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Batch Upload Documents
                          </h1>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Upload multiple student offer letters or employment agreements for automated placement verification.
                          </p>
                        </div>
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center bg-white dark:bg-slate-900/50 hover:border-maroon-900 transition-colors">
                          <div className="w-16 h-16 mx-auto rounded-2xl bg-maroon-50 dark:bg-maroon-950/60 text-maroon-900 dark:text-maroon-300 flex items-center justify-center mb-4">
                            <UploadCloud className="w-8 h-8" />
                          </div>
                          <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                            Drag and drop student offer letters
                          </h3>
                          <div className="mt-6 flex items-center justify-center gap-3">
                            <Button className="bg-maroon-900 hover:bg-maroon-800 text-white text-xs">
                              Browse Files
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => navigate("/history")} className="text-xs">
                              View History
                            </Button>
                          </div>
                        </div>
                      </div>
                    }
                  />
                  <Route path="/comparisons" element={<CompareDocumentPage onBack={() => navigate("/dashboard")} />} />

                  {/* PR Pipeline Routes */}
                  <Route path="/pr-pipeline" element={<PRPipelinePage />} />
                  <Route path="/cohort-15" element={<PRPipelinePage />} />

                  {/* Placement Coordinator Routes */}
                  <Route path="/coordinator-drives" element={<CoordinatorDrivesPage />} />
                  <Route path="/erp-sync" element={<CoordinatorDrivesPage />} />

                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={<AdminOverviewPage onNavigate={(target) => handleNavSelect(target)} />}
                  />
                  <Route path="/admin-overview" element={<Navigate to="/admin" replace />} />

                  {/* Settings & Help */}
                  <Route
                    path="/settings"
                    element={
                      <div className="space-y-6">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                          <p className="text-sm text-slate-500">Preferences, role delegation, and notification settings.</p>
                        </div>
                      </div>
                    }
                  />
                  <Route
                    path="/help"
                    element={
                      <div className="space-y-6">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Help & Support</h1>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                          <p className="text-sm text-slate-500">Need assistance with placement verification, PR cohorts or ERP exports? Contact university placement support.</p>
                        </div>
                      </div>
                    }
                  />

                  {/* Catch-all redirect */}
                  <Route path="*" element={<Navigate to={getRoleDefaultRoute(currentRole)} replace />} />
                </Routes>
              </AppLayout>
            )
          }
        />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
