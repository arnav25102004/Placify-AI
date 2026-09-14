import React, { useState } from "react";
import { UserRole } from "@/shared/types";
import {
  Shield,
  LayoutGrid,
  UploadCloud,
  ArrowRightLeft,
  Clock,
  Settings,
  HelpCircle,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  FileCheck2,
  Users,
  Building,
  Building2,
  GraduationCap,
  Sparkles,
  Check,
  ShieldAlert,
  LogOut,
  User,
  Database
} from "lucide-react";
import { ThemeToggle } from "@/shared/components/ui/theme-toggle";
import { Input } from "@/shared/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  section?: string;
}

interface UserProfileConfig {
  name: string;
  email: string;
  roleLabel: string;
  initials: string;
  avatarBg: string;
  roleSubtitle: string;
}

interface AppLayoutProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeNavId: string;
  onNavSelect: (navId: string) => void;
  onLogout?: () => void;
  userEmail?: string;
  userProgram?: string;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentRole,
  onRoleChange,
  activeNavId,
  onNavSelect,
  onLogout,
  userEmail,
  userProgram,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  // Role metadata config: navigation items tailored strictly to each role's authorized capabilities
  const roleNavItems: Record<UserRole, NavItemConfig[]> = {
    // 1. Teacher / Faculty — Document verification, batch uploads, discrepancy comparisons & verification history
    faculty: [
      { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
      { id: "upload", label: "Upload Documents", icon: UploadCloud },
      { id: "comparisons", label: "Comparisons", icon: ArrowRightLeft },
      { id: "history", label: "History", icon: Clock },
    ],
    // 2. PR Hub — Ingestion tasks, PR pipeline and 15-student cohort management
    pr: [
      { id: "pr_pipeline", label: "PR Pipeline", icon: Users },
      { id: "cohort_15", label: "15 Students Cohort", icon: GraduationCap, badge: 15 },
    ],
    // 3. Placement Coordinator — Campus drives, company master, batch verification & ERP exports
    placement_coordinator: [
      { id: "coordinator_drives", label: "Campus Drives", icon: Building },
      { id: "erp_sync", label: "ERP Export Sync", icon: ArrowRightLeft },
      { id: "history", label: "Audit Log", icon: Clock },
    ],
    // 4. Student — My placements, upload offer, senior placement directory, past recruiters
    student: [
      { id: "student_dashboard", label: "Student Portal", icon: LayoutGrid },
      { id: "seniors", label: "Senior Directory", icon: GraduationCap },
      { id: "companies", label: "Past Recruiters", icon: Building2 },
    ],
    // 5. Admin — Full visibility across all modules
    admin: [
      { id: "admin_overview", label: "Institutional Overview", icon: ShieldAlert },
      { id: "history", label: "All Verifications", icon: Clock },
      { id: "coordinator_drives", label: "All Campus Drives", icon: Building },
      { id: "pr_pipeline", label: "PR Cohorts", icon: Users },
      { id: "student_dashboard", label: "Student View", icon: GraduationCap },
      { id: "seniors", label: "Senior Directory", icon: GraduationCap },
      { id: "companies", label: "Past Recruiters", icon: Building2 },
      { id: "dev_db", label: "Database Studio", icon: Database, badge: "TEST" },
    ],
  };

  // User profile mockups tailored to each persona's role
  const roleProfiles: Record<UserRole, UserProfileConfig> = {
    faculty: {
      name: "Dr. Mary Issac",
      email: "teacher@example.com",
      roleLabel: "Teacher",
      initials: "MI",
      avatarBg: "bg-purple-600 text-white",
      roleSubtitle: "Faculty Reviewer • CS Dept",
    },
    pr: {
      name: "Rohit Patel",
      email: "pr.rohit@example.com",
      roleLabel: "PR Representative",
      initials: "RP",
      avatarBg: "bg-amber-600 text-white",
      roleSubtitle: "PR Cohort A (15 Students)",
    },
    placement_coordinator: {
      name: "Prof. S. K. Roy",
      email: "coordinator@example.com",
      roleLabel: "Coordinator",
      initials: "SR",
      avatarBg: "bg-rose-600 text-white",
      roleSubtitle: "Placement Cell • Institutional",
    },
    student: {
      name: "Arnav Sharma",
      email: "arnav.21cs042@example.com",
      roleLabel: userProgram ? `Student (${userProgram})` : "Student",
      initials: "AS",
      avatarBg: "bg-blue-600 text-white",
      roleSubtitle: userProgram ? `Program: ${userProgram} • Placement Portal` : "CS-2021-042 • 8.92 CGPA",
    },
    admin: {
      name: "Admin Controller",
      email: "admin@placify.internal",
      roleLabel: "Super Admin",
      initials: "SA",
      avatarBg: "bg-indigo-600 text-white",
      roleSubtitle: "Full Root Privileges • 5 Campuses",
    },
  };

  const currentProfile = roleProfiles[currentRole] || roleProfiles.faculty;
  const currentNavItems = roleNavItems[currentRole] || roleNavItems.faculty;

  const handleRoleSwitch = (newRole: UserRole) => {
    onRoleChange(newRole);
    if (newRole === "faculty") {
      onNavSelect("history"); // Default matches mockup
    } else if (newRole === "admin") {
      onNavSelect("admin_overview");
    } else {
      const newItems = roleNavItems[newRole];
      if (newItems && newItems.length > 0) {
        onNavSelect(newItems[0].id);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex antialiased">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Top Part: Brand + Role Badge + Nav Items */}
        <div className="flex flex-col flex-1 overflow-y-auto px-4 pt-5 pb-4 space-y-4">
          {/* Brand Logo Header */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
                <Shield className="w-4 h-4 fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight leading-none">
                  Placify
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Placement Intelligence
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Role Identifier Pill */}
          <div className="px-2">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {currentProfile.roleLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Role Navigation Items */}
          <nav className="space-y-1">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNavId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavSelect(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer relative ${
                    isActive
                      ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {/* Subtle active left pill bar */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
                  )}
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Part: Settings, Help & User Profile */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
          {/* Utilities */}
          <div className="space-y-0.5">
            <button
              onClick={() => onNavSelect("profile")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                activeNavId === "profile"
                  ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span>My Profile</span>
            </button>
            <button
              onClick={() => onNavSelect("dev_db")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                activeNavId === "dev_db"
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-indigo-500" />
                <span>Test DB Studio</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold">
                DEV
              </span>
            </button>
            <button
              onClick={() => onNavSelect("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                activeNavId === "settings"
                  ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => onNavSelect("help")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                activeNavId === "help"
                  ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <HelpCircle className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span>Help & Support</span>
            </button>
          </div>

          {/* User Profile Card matching mockup */}
          <div
            onClick={() => onNavSelect("profile")}
            className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-3 px-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1.5 rounded-xl transition-colors group"
            title="Edit Profile"
          >
            <div
              className={`w-9 h-9 rounded-full ${currentProfile.avatarBg} flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ring-2 ring-transparent group-hover:ring-blue-500/40 transition-all`}
            >
              {currentProfile.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {currentProfile.name}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                {userEmail || currentProfile.email}
              </div>
            </div>
            {onLogout && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLogout();
                }}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper (shifted by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Mobile trigger & Search input */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Top Search Bar */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search documents, students..."
                className="w-full pl-9 pr-4 h-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-xs focus-visible:ring-1 focus-visible:ring-blue-500 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right: Theme Toggle, Bell & Role Dropdown */}
          <div className="flex items-center gap-3 ml-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification Bell */}
            <button className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-950" />
            </button>

            {/* Sign Out Button in Header */}
            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign Out"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/80 dark:border-rose-900/50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

            {/* Role Selector Pill Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer">
                  <span
                    className={`w-6 h-6 rounded-full ${currentProfile.avatarBg} flex items-center justify-center font-bold text-[10px]`}
                  >
                    {currentProfile.initials}
                  </span>
                  <span className="max-w-[100px] truncate">{currentProfile.roleLabel}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-1.5 shadow-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <DropdownMenuLabel className="text-[10px] font-mono uppercase text-slate-400 px-2 py-1">
                  Switch Operational Role
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />

                {/* 1. Super Admin (Full Root Access) */}
                <DropdownMenuItem
                  onClick={() => handleRoleSwitch("admin")}
                  className="flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                      SA
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        Super Admin <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">ALL ACCESS</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Root Over All Portals & Agents</div>
                    </div>
                  </div>
                  {currentRole === "admin" && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                </DropdownMenuItem>

                {/* 2. Faculty / Teacher */}
                <DropdownMenuItem
                  onClick={() => handleRoleSwitch("faculty")}
                  className="flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
                      MI
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">Teacher / Faculty</div>
                      <div className="text-[10px] text-slate-500">History, Verify & Uploads</div>
                    </div>
                  </div>
                  {currentRole === "faculty" && <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                </DropdownMenuItem>

                {/* 3. PR Hub */}
                <DropdownMenuItem
                  onClick={() => handleRoleSwitch("pr")}
                  className="flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">
                      RP
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">PR Hub</div>
                      <div className="text-[10px] text-slate-500">15 Students Cohort & Pipeline</div>
                    </div>
                  </div>
                  {currentRole === "pr" && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                </DropdownMenuItem>

                {/* 4. Placement Coordinator */}
                <DropdownMenuItem
                  onClick={() => handleRoleSwitch("placement_coordinator")}
                  className="flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
                      SR
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">Placement Coordinator</div>
                      <div className="text-[10px] text-slate-500">Campus Drives & ERP Sync</div>
                    </div>
                  </div>
                  {currentRole === "placement_coordinator" && <Check className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                </DropdownMenuItem>

                {/* 5. Student View */}
                <DropdownMenuItem
                  onClick={() => handleRoleSwitch("student")}
                  className="flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                      AS
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">Student View</div>
                      <div className="text-[10px] text-slate-500">Placements & Offer Upload</div>
                    </div>
                  </div>
                  {currentRole === "student" && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                <DropdownMenuItem
                  onClick={() => onNavSelect("profile")}
                  className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>My Profile & Settings</span>
                </DropdownMenuItem>

                {onLogout && (
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="flex items-center gap-2 p-2 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Work Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
