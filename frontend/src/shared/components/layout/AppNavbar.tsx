import React, { useState } from "react";
import { UserRole } from "@/shared/types";
import {
  ShieldCheck,
  UserCheck,
  Users,
  ChevronDown,
  Building,
  Bell,
  Search,
  Check,
  ArrowRightLeft,
  UserCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { ThemeToggle } from "@/shared/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface IAppNavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  userName: string;
}

export const AppNavbar: React.FC<IAppNavbarProps> = ({
  currentRole,
  onRoleChange,
  userName,
}) => {
  const [activeCampus, setActiveCampus] = useState("Bangalore Main Campus");

  const campuses = [
    "Bangalore Main Campus",
    "Electronic City Campus",
    "North Campus Tech Park",
    "Mysore Campus",
    "Hyderabad Campus",
  ];

  const roleMeta: Record<UserRole, { label: string; badge: string; icon: React.ElementType; color: string; bg: string }> = {
    pr: {
      label: "PR Hub (15 Students)",
      badge: "PR Hub",
      icon: Users,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30",
    },
    faculty: {
      label: "Faculty Verification",
      badge: "Faculty",
      icon: UserCheck,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
    },
    placement_coordinator: {
      label: "Placement Coordinator",
      badge: "Coordinator",
      icon: ShieldCheck,
      color: "text-rose-500 dark:text-rose-400",
      bg: "bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/30",
    },
    admin: {
      label: "System Admin",
      badge: "Admin",
      icon: ShieldCheck,
      color: "text-purple-500 dark:text-purple-400",
      bg: "bg-purple-500/10 text-purple-800 dark:text-purple-300 border-purple-500/30",
    },
    student: {
      label: "Student View",
      badge: "Student",
      icon: Users,
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/30",
    },
  };

  const CurrentRoleIcon = roleMeta[currentRole].icon;

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg backdrop-blur-md transition-colors duration-300">
      {/* Top Precision Utility Bar */}
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Mark & Campus Tenancy */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center cursor-pointer">
            <span className="font-bold text-slate-900 dark:text-white tracking-tight text-xl leading-tight">
              Placify AI
            </span>
          </div>

          <div className="hidden md:block h-6 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Campus Tenancy DropdownMenu */}
          <div className="hidden lg:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg flex items-center gap-2 font-normal transition-all cursor-pointer"
                >
                  <Building className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">{activeCampus}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 opacity-80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-xl">
                <DropdownMenuLabel className="text-[10px] font-mono uppercase text-slate-400">
                  Select Institutional Campus
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                {campuses.map((c) => (
                  <DropdownMenuItem
                    key={c}
                    onClick={() => setActiveCampus(c)}
                    className="flex items-center justify-between py-2 text-xs cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/90 focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors"
                  >
                    <span>{c}</span>
                    {activeCampus === c && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Global Quick Search Bar with shadcn Input */}
        <div className="hidden xl:flex items-center flex-1 max-w-md mx-6">
          <div className="w-full relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 z-10 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search students, roll no, company, or offer letter..."
              className="w-full pl-9 pr-4 h-9 bg-slate-100/80 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
            />
          </div>
        </div>

        {/* Right Section: Role Dropdown, Theme Toggle & User Actions */}
        <div className="flex items-center space-x-3">
          {/* Tactical Role DropdownMenu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 border rounded-xl flex items-center gap-2 text-xs font-semibold cursor-pointer transition-all ${roleMeta[currentRole].bg}`}
              >
                <CurrentRoleIcon className={`w-4 h-4 ${roleMeta[currentRole].color}`} />
                <span>{roleMeta[currentRole].label}</span>
                <ArrowRightLeft className="w-3 h-3 text-slate-400 ml-1 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 p-1.5 shadow-2xl">
              <DropdownMenuLabel className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                Switch Operational View
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              
              <DropdownMenuItem
                onClick={() => onRoleChange("pr")}
                className="flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-amber-500/10 border border-amber-500/30">
                    <Users className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">PR Hub</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">15 Assigned Students</div>
                  </div>
                </div>
                {currentRole === "pr" && <Check className="w-4 h-4 text-amber-500 dark:text-amber-400" />}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onRoleChange("faculty")}
                className="flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30">
                    <UserCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">Faculty Review</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Claims Verification</div>
                  </div>
                </div>
                {currentRole === "faculty" && <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onRoleChange("placement_coordinator")}
                className="flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-rose-500/10 border border-rose-500/30">
                    <ShieldCheck className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">Coordinator</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Institutional Audit & Drives</div>
                  </div>
                </div>
                {currentRole === "placement_coordinator" && <Check className="w-4 h-4 text-rose-500 dark:text-rose-400" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Dedicated Light / Dark Mode Toggle */}
          <ThemeToggle />

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

          {/* User Profile DropdownMenu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2.5 p-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                  {userName.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{userName.split("•")[0]}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-tight">{roleMeta[currentRole].badge}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xl">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{userName}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{activeCampus}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              <DropdownMenuItem className="text-xs cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors">
                <UserCircle className="w-3.5 h-3.5 mr-2 text-slate-400" /> Profile & Preferences
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors">
                <Bell className="w-3.5 h-3.5 mr-2 text-slate-400" /> Notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </header>
  );
};
