import React, { useState, useEffect } from "react";
import { api, UserProfileData, UpdateProfilePayload } from "@/shared/lib";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  MapPin,
  Phone,
  Mail,
  Edit3,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Linkedin,
  Github,
  Save,
  Eye,
  Camera,
  RotateCcw,
  User,
  Zap,
  Check,
  Plus,
  Trash2,
  FileText,
  ExternalLink,
  Code2,
  Award,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Download,
  X,
  Star,
  Users,
  Terminal,
  FolderGit2,
  Cpu,
  Clock,
} from "lucide-react";

interface ProfilePageProps {
  user: UserProfileData | null;
  onProfileUpdated?: (updatedUser: UserProfileData) => void;
}

const AVATAR_PRESETS = [
  {
    name: "Dr. Emily Chen Style (HealthRate)",
    url: "https://images.unsplash.com/photo-1594824813593-c90a1f0a8241?auto=format&fit=crop&q=80&w=1000",
  },
  {
    name: "Faculty Reviewer",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1000",
  },
  {
    name: "Student Candidate",
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=1000",
  },
  {
    name: "Engineering Lead",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000",
  },
];

interface CapstoneProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  demoUrl: string;
  isVerified: boolean;
  verifiedBy: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onProfileUpdated }) => {
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const isStudent = user?.role === "student";

  const [formData, setFormData] = useState<UpdateProfilePayload>({
    full_name: user?.full_name || (isStudent ? "Arnav Sharma" : "Dr. Emily Chen, MD"),
    phone: user?.phone || (isStudent ? "+91 98765-43210" : "(212) 555-7890"),
    department: user?.department || (isStudent ? "COMPUTER SCIENCE & ENGINEERING" : "INTERNAL MEDICINE, CARDIOLOGY"),
    designation: user?.designation || (isStudent ? "Final Year B.Tech • Super Dream Candidate" : "Associate Professor & Senior Verification Reviewer"),
    bio: user?.bio || (isStudent
      ? "Arnav Sharma is praised for high-throughput distributed systems, algorithmic precision, and clean full-stack architecture. Consistently ranks in the top 3% of the campus batch with an active Super Dream PPO offer."
      : "Dr. Emily Chen is praised for professionalism, empathy, and clear explanations. Patients and coordinators value her cardiology expertise and easy booking. Some note rare communication delays."),
    avatar_url: user?.avatar_url || (isStudent
      ? "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=1000"
      : "https://images.unsplash.com/photo-1594824813593-c90a1f0a8241?auto=format&fit=crop&q=80&w=1000"),
    linkedin_url: user?.linkedin_url || "https://linkedin.com/in/arnav-placify",
    github_url: user?.github_url || "https://github.com/arnav-dev",
  });

  // Academic & Placement Credentials
  const [academicStats, setAcademicStats] = useState({
    cgpa: "8.94",
    backlogs: "0 Active",
    placementTier: "Tier 1 Super Dream",
    prVerified: true,
    verifiedBy: "Dr. Mary Issac (Placement Cell)",
    verifiedAt: "Sept 12, 2026",
    ppoStatus: "Offer Extended (Amazon SDE-1)",
    atsScore: 94,
  });

  // Technical Footprint
  const [techStats, setTechStats] = useState({
    leetcodeRating: "1,942 (Knight)",
    leetcodeSolved: "485+",
    githubCommits: "890+ this year",
    primaryStack: ["TypeScript", "Go / Golang", "React", "PostgreSQL", "Docker", "FastAPI"],
  });

  // Projects State
  const [projects, setProjects] = useState<CapstoneProject[]>([
    {
      id: "p1",
      title: "Placify AI - Autonomous Verification Engine",
      description: "Distributed OCR verification microservice utilizing vision LLMs and edge caching to automate institutional placement credential approvals.",
      technologies: ["FastAPI", "React", "PostgreSQL", "OpenAI Vision"],
      githubUrl: "https://github.com/placify-lead/placify-ai",
      demoUrl: "https://placify.internal",
      isVerified: true,
      verifiedBy: "Verified by PR Cell",
    },
    {
      id: "p2",
      title: "ZeroDrop - Low-Latency Message Broker",
      description: "Custom zero-copy UDP/TCP pub-sub broker built with Rust handling 100k msgs/sec with p99 latency < 2ms.",
      technologies: ["Rust", "Tokio", "gRPC", "Docker"],
      githubUrl: "https://github.com/arnav-dev/zerodrop",
      demoUrl: "https://zerodrop.dev",
      isVerified: true,
      verifiedBy: "Verified by PR Cell",
    },
  ]);

  const [location, setLocation] = useState<string>("Bangalore Campus, Christ University, Hosur Road");
  const [competencies, setCompetencies] = useState<string[]>([
    "Distributed Systems",
    "Full-Stack Architecture",
    "English (Professional Native)",
    "German (A2 Intermediate)",
  ]);
  const [newCompetency, setNewCompetency] = useState("");

  // Slide-over Drawers State
  const [activeDrawer, setActiveDrawer] = useState<"resume" | "project" | "endorsements" | null>(null);
  const [selectedProject, setSelectedProject] = useState<CapstoneProject | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Calendar / Scheduling State
  const [selectedDay, setSelectedDay] = useState<number>(25);
  const [selectedTime, setSelectedTime] = useState<string>("11:00 AM");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: user.full_name || prev.full_name,
        phone: user.phone || prev.phone,
        department: user.department || prev.department,
        designation: user.designation || prev.designation,
        bio: user.bio || prev.bio,
        avatar_url: user.avatar_url || prev.avatar_url,
        linkedin_url: user.linkedin_url || prev.linkedin_url,
        github_url: user.github_url || prev.github_url,
      }));
    }
  }, [user]);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const updated = await api.updateProfile(formData);
      setSaveSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset profile values to recommended defaults?")) {
      setFormData({
        full_name: isStudent ? "Arnav Sharma" : "Dr. Emily Chen, MD",
        phone: isStudent ? "+91 98765-43210" : "(212) 555-7890",
        department: isStudent ? "COMPUTER SCIENCE & ENGINEERING" : "INTERNAL MEDICINE, CARDIOLOGY",
        designation: isStudent ? "Final Year B.Tech • Super Dream Candidate" : "Associate Professor & Senior Verification Reviewer",
        bio: isStudent
          ? "Arnav Sharma is praised for high-throughput distributed systems, algorithmic precision, and clean full-stack architecture. Consistently ranks in the top 3% of the campus batch with an active Super Dream PPO offer."
          : "Dr. Emily Chen is praised for professionalism, empathy, and clear explanations. Patients and coordinators value her cardiology expertise and easy booking. Some note rare communication delays.",
        avatar_url: isStudent
          ? "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=1000"
          : "https://images.unsplash.com/photo-1594824813593-c90a1f0a8241?auto=format&fit=crop&q=80&w=1000",
        linkedin_url: "https://linkedin.com/in/arnav-placify",
        github_url: "https://github.com/arnav-dev",
      });
      setLocation("Bangalore Campus, Christ University, Hosur Road");
    }
  };

  const addCompetency = () => {
    if (newCompetency.trim() && !competencies.includes(newCompetency.trim())) {
      setCompetencies([...competencies, newCompetency.trim()]);
      setNewCompetency("");
    }
  };

  const removeCompetency = (index: number) => {
    setCompetencies(competencies.filter((_, i) => i !== index));
  };

  const generateAiBio = () => {
    const roleName = formData.designation || "Candidate";
    const deptName = formData.department || "Computer Science";
    const generated = `${formData.full_name || "Candidate"} is recognized for high-caliber problem solving in ${deptName}, showing verified engineering excellence and clean system architecture. Placement evaluators commend their consistent technical velocity and rapid turnaround.`;
    setFormData((prev) => ({ ...prev, bio: generated }));
  };

  const daysInWeek = [
    { day: "SUN", date: 22 },
    { day: "MON", date: 23 },
    { day: "TUE", date: 24 },
    { day: "WED", date: 25 },
    { day: "THU", date: 26 },
    { day: "FRI", date: 27 },
    { day: "SAT", date: 28 },
  ];

  const morningSlots = ["9:00 AM", "10:00 AM", "11:00 AM"];
  const afternoonSlots = ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM"];

  return (
    <div className="max-w-[1400px] mx-auto py-2 sm:py-6 px-3 sm:px-6 space-y-6 text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* Toast Alert */}
      {saveSuccess && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-[#D4F436] text-slate-950 font-bold shadow-2xl border border-[#b6f000] flex items-center gap-3 animate-in slide-in-from-top-4 text-xs">
          <CheckCircle2 className="w-5 h-5 text-slate-950" />
          <div>
            <div className="font-extrabold text-sm">Profile Saved Successfully</div>
            <div className="text-[11px] text-slate-800">Your profile changes are synced and verified in the database.</div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Top Header Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-maroon-50 dark:bg-maroon-950/60 text-maroon-900 dark:text-maroon-300 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                {formData.full_name || "Profile Hub"}
              </h2>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-maroon-100 dark:bg-maroon-950 text-maroon-900 dark:text-maroon-200 font-bold border border-maroon-200 dark:border-maroon-800">
                {user?.role?.toUpperCase() || "STUDENT"}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3" /> PR VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isEditing
                ? "Interactive Bento Edit Mode: Modify information in-place. Academic fields show faculty verified stamps."
                : "Bento View Mode: Executive summary for placement reviews, recruiters, and faculty."}
            </p>
          </div>
        </div>

        {/* Action Controls & Fast Triggers */}
        <div className="flex items-center gap-2.5">
          {/* Quick Drawer Triggers */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveDrawer("resume")}
            className="h-9 px-3 rounded-2xl text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-maroon-900 dark:text-maroon-300" />
            <span>Resume Drawer</span>
          </Button>

          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setIsEditing(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                !isEditing
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                isEditing
                  ? "bg-maroon-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Mode</span>
            </button>
          </div>

          {/* Save Profile Changes */}
          <Button
            size="sm"
            onClick={() => handleSaveProfile()}
            disabled={isSaving}
            className="h-9 px-4 rounded-2xl bg-[#D4F436] hover:bg-[#c2e428] text-slate-950 font-black text-xs gap-1.5 shadow-sm transition-transform active:scale-98 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>

      {/* =========================================================================
          MAIN BENTO GRID (12-Column Responsive Layout)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================================================
            BENTO QUADRANT 1: HERO IDENTITY & BIG PORTRAIT (4 Columns)
            ========================================================================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Bento Card: Big Portrait Frame */}
          <div className="relative w-full h-[470px] sm:h-[540px] rounded-[32px] overflow-hidden bg-[#ECE6DC] dark:bg-[#1e1b1a] shadow-md border border-stone-200/80 dark:border-stone-800 flex items-center justify-center group">
            <img
              src={formData.avatar_url || AVATAR_PRESETS[0].url}
              alt={formData.full_name}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-103"
              onError={(e) => {
                (e.target as HTMLImageElement).src = AVATAR_PRESETS[0].url;
              }}
            />

            {/* Quick Status Pill On Photo */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/75 text-white backdrop-blur-md text-[11px] font-medium border border-white/10 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#D4F436] animate-pulse" />
              <span>Placement Ready • Top 3%</span>
            </div>

            {/* Editable Camera Overlay Button */}
            {isEditing && (
              <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-6">
                <Button
                  size="sm"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="bg-white/95 hover:bg-white text-slate-950 font-bold text-xs rounded-2xl shadow-xl gap-2 backdrop-blur-xs px-4 py-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-maroon-900" />
                  <span>Change Portrait Photo</span>
                </Button>
              </div>
            )}
          </div>

          {/* Quick Avatar Preset Selector Dialog */}
          {showAvatarPicker && isEditing && (
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-900 dark:text-white">Choose Preset Avatar</div>
                <button
                  onClick={() => setShowAvatarPicker(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setFormData({ ...formData, avatar_url: preset.url });
                      setShowAvatarPicker(false);
                    }}
                    className="rounded-2xl overflow-hidden aspect-square border-2 border-transparent hover:border-maroon-900 focus:border-maroon-900 transition-all cursor-pointer shadow-xs"
                    title={preset.name}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Custom Image URL
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="https://..."
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    className="h-8 rounded-xl text-xs"
                  />
                  <Button
                    size="sm"
                    onClick={() => setShowAvatarPicker(false)}
                    className="h-8 px-3 text-xs bg-maroon-900 hover:bg-maroon-800 text-white rounded-xl"
                  >
                    Set
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Bento Card: Contact Details & Location */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3.5 text-xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Direct Contact & Campus Location
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-slate-900 dark:text-slate-200 shrink-0 stroke-[2.2]" />
              {isEditing ? (
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Campus Location"
                  className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-maroon-900 focus:outline-hidden"
                />
              ) : (
                <span className="text-slate-800 dark:text-slate-200 font-medium">{location}</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-900 dark:text-slate-200 shrink-0 stroke-[2.2]" />
              {isEditing ? (
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765-43210"
                  className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-mono"
                />
              ) : (
                <span className="text-slate-800 dark:text-slate-200 font-mono font-medium">{formData.phone}</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-900 dark:text-slate-200 shrink-0 stroke-[2.2]" />
              <span className="text-slate-800 dark:text-slate-200 font-medium truncate">
                {user?.email || "student@placify.internal"}
              </span>
              <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                VERIFIED
              </span>
            </div>
          </div>

          {/* Bento Card: Core Competencies & Skills */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Core Competencies & Languages
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                PR Approved ✓
              </span>
            </div>

            <ul className="space-y-1.5 pl-1">
              {competencies.map((comp, idx) => (
                <li key={idx} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-slate-300" />
                    <span>{comp}</span>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => removeCompetency(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      ✕
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {isEditing && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add skill (e.g. Kubernetes)..."
                  value={newCompetency}
                  onChange={(e) => setNewCompetency(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCompetency()}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs focus:ring-1 focus:ring-maroon-900 focus:outline-hidden"
                />
                <Button
                  size="sm"
                  onClick={addCompetency}
                  className="h-7 px-2.5 rounded-lg bg-maroon-900 hover:bg-maroon-800 text-white text-[11px]"
                >
                  Add
                </Button>
              </div>
            )}
          </div>

          {/* Bento Card: Verified Social Footprints */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Verified Profiles
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-maroon-900 dark:text-maroon-300 shrink-0" />
                  <input
                    type="text"
                    placeholder="LinkedIn URL"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-mono"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
                  <input
                    type="text"
                    placeholder="GitHub URL"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-mono"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {formData.linkedin_url && (
                  <a
                    href={formData.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-maroon-900 dark:hover:text-white flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-maroon-900 dark:text-maroon-300" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {formData.github_url && (
                  <a
                    href={formData.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-maroon-900 dark:hover:text-white flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            BENTO QUADRANTS 2 & 3: ACADEMIC & TECHNICAL SHOWCASE (5 Columns)
            ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Name & Department */}
          <div className="space-y-1">
            {isEditing ? (
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Full Name & Title
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. Arnav Sharma"
                    className="w-full text-3xl sm:text-4xl font-black text-slate-900 dark:text-white bg-transparent border-b-2 border-maroon-900/30 focus:border-maroon-900 focus:outline-hidden py-1 tracking-tight"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Department / Specialty (Uppercase)
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="COMPUTER SCIENCE & ENGINEERING"
                    className="w-full text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-transparent border-b border-slate-200 dark:border-slate-700 py-1 focus:outline-hidden"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {formData.full_name || "Arnav Sharma"}
                </h1>
                <div className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mt-1">
                  {formData.department || "COMPUTER SCIENCE & ENGINEERING"}
                </div>
              </div>
            )}
          </div>

          {/* AI Summary Card with Signature Lime #D4F436 Box */}
          <div className="flex flex-col sm:flex-row items-stretch rounded-[24px] overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            {/* Left Lime Rating Badge */}
            <div className="bg-[#D4F436] text-slate-950 p-6 sm:w-36 flex flex-col items-center justify-center text-center shrink-0">
              <div className="text-4xl font-black tracking-tight leading-none">4.9</div>
              <div className="text-xs font-bold mt-1 text-slate-900">Placement Index</div>
            </div>

            {/* Right AI Summary Content (Editable Bio) */}
            <div className="p-5 flex-1 flex flex-col justify-center bg-white dark:bg-slate-900 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#8CBF00] dark:text-[#D4F436]" />
                  AI CANDIDATE EVALUATION
                </div>
                {isEditing && (
                  <button
                    onClick={generateAiBio}
                    className="text-[11px] font-bold text-maroon-900 dark:text-maroon-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3 h-3 text-amber-500" />
                    Auto-Generate
                  </button>
                )}
              </div>

              {isEditing ? (
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Edit professional AI summary..."
                  className="w-full text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:ring-1 focus:ring-maroon-900 focus:outline-hidden leading-relaxed"
                />
              ) : (
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {formData.bio}
                </p>
              )}
            </div>
          </div>

          {/* Bento Sub-Grid: Academic & Placement Status (CGPA, Backlogs, Tier 1, PPO) */}
          <div className="p-5 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-maroon-900 dark:text-maroon-300" />
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Academic & Placement Credentials
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                Verified by {academicStats.verifiedBy}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">CGPA</div>
                <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                  {academicStats.cgpa}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Scale of 10.0</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Backlogs</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  {academicStats.backlogs}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Clean Record</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Eligibility</div>
                <div className="text-sm font-black text-maroon-900 dark:text-maroon-300 mt-1">
                  Super Dream
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Tier 1 Unlimited</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">ATS Score</div>
                <div className="text-xl font-black text-[#8CBF00] font-mono mt-0.5">
                  {academicStats.atsScore}%
                </div>
                <div className="text-[10px] text-slate-500 font-medium">ATS High Rank</div>
              </div>
            </div>

            {/* PPO Offer Highlight Bar */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Active Placement Offer (PPO)
                </span>
              </div>
              <span className="text-xs font-black font-mono text-emerald-700 dark:text-emerald-300">
                {academicStats.ppoStatus}
              </span>
            </div>
          </div>

          {/* Bento Sub-Grid: Technical Footprint (LeetCode, GitHub, Tech Stack) */}
          <div className="p-5 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-maroon-900 dark:text-maroon-300" />
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Technical Footprint & Coding Metrics
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Live Profiles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400">LeetCode Contest Rating</div>
                  <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
                    {techStats.leetcodeRating}
                  </div>
                </div>
                <span className="px-2 py-1 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold font-mono">
                  {techStats.leetcodeSolved}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400">GitHub Contributions</div>
                  <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
                    {techStats.githubCommits}
                  </div>
                </div>
                <span className="px-2 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold font-mono">
                  Top 5%
                </span>
              </div>
            </div>

            {/* Primary Stack Badges */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Core Stack Proficiency
              </div>
              <div className="flex flex-wrap gap-1.5">
                {techStats.primaryStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold font-mono border border-slate-200 dark:border-slate-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bento Sub-Grid: Verified Capstone Projects Showcase */}
          <div className="p-5 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-maroon-900 dark:text-maroon-300" />
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Verified Capstone Projects (PR Cell Verified)
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                2 Pinned
              </span>
            </div>

            <div className="space-y-3">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 hover:border-maroon-900/40 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{proj.title}</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                        PR VERIFIED ✓
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedProject(proj);
                        setActiveDrawer("project");
                      }}
                      className="h-7 px-2.5 text-[11px] text-maroon-900 dark:text-maroon-300 hover:bg-maroon-50 dark:hover:bg-maroon-950/50 font-bold cursor-pointer"
                    >
                      <span>Deep Dive</span>
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {proj.description}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.technologies.map((t, tidx) => (
                      <span
                        key={tidx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Segmented Bar Graphic: Engineering Distribution */}
          <div className="space-y-2 pt-1">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Engineering Distribution
            </h3>

            <div className="flex h-5 w-full rounded-lg overflow-hidden gap-1">
              <div className="h-full bg-[#004D47] rounded-l-md" style={{ width: "47%" }} title="Backend & Distributed (47%)" />
              <div className="h-full bg-[#C8E24D]" style={{ width: "24%" }} title="Algorithms & Data Structs (24%)" />
              <div className="h-full bg-[#D4F436]" style={{ width: "16%" }} title="System Design & Cloud (16%)" />
              <div className="h-full bg-[#C2CDB4]" style={{ width: "10%" }} title="Frontend & UX (10%)" />
              <div className="h-full bg-[#E2E4DC] rounded-r-md" style={{ width: "3%" }} title="Audits & Testing (3%)" />
            </div>

            <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-0.5">
              <span>47% Backend</span>
              <span>24% DSA</span>
              <span>16% Cloud</span>
              <span>10% UI</span>
              <span>3% QA</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BENTO QUADRANT 4: BOOKING & MENTORSHIP ACTIONS (3 Columns)
            ========================================================================= */}
        <div className="lg:col-span-3 space-y-5">
          {/* Main Elevated Appointment / Office Hours Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {isStudent ? "Book Mock Interview / PR Audit" : "Book an Appointment"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Reserve 1:1 slot with faculty or placement coordinators
              </p>
            </div>

            {/* Month & Week Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>September 2026</span>
                <div className="flex items-center gap-1 text-slate-400">
                  <button className="p-1 hover:text-slate-700 dark:hover:text-slate-200 rounded cursor-pointer">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="p-1 hover:text-slate-700 dark:hover:text-slate-200 rounded cursor-pointer">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day Pills */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {daysInWeek.map((item) => {
                  const isSelected = selectedDay === item.date;
                  return (
                    <button
                      key={item.date}
                      onClick={() => setSelectedDay(item.date)}
                      className="flex flex-col items-center py-1.5 rounded-xl cursor-pointer transition-colors"
                    >
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        {item.day}
                      </span>
                      <span
                        className={`w-7 h-7 mt-1 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {item.date}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Picker */}
            <div className="space-y-3 pt-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Time Slots</div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  MORNING
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {morningSlots.map((slot) => {
                    const isSelected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-slate-950 dark:border-white font-bold"
                            : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  AFTERNOON
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {afternoonSlots.map((slot) => {
                    const isSelected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-slate-950 dark:border-white font-bold"
                            : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Signature Lime Book Now Button */}
            <Button
              onClick={() => {
                setBookingSuccess(true);
                setTimeout(() => setBookingSuccess(false), 4000);
              }}
              className="w-full bg-[#D4F436] hover:bg-[#c2e428] text-slate-950 font-black text-xs h-11 rounded-2xl shadow-sm transition-transform active:scale-98 cursor-pointer mt-2"
            >
              {bookingSuccess ? "Session Confirmed ✓" : "Book 1:1 Session"}
            </Button>
          </div>

          {/* Bento Card: Peer & Senior Mentorship Endorsements */}
          <div className="p-5 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-maroon-900 dark:text-maroon-300" />
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Senior Peer Mentorship
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                4.9 / 5.0
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>Rohan Verma (Senior @ Google)</span>
                <div className="flex text-amber-400 text-[10px]">★★★★★</div>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                "Exceptional depth in concurrent systems and gRPC architecture. Cleared mock bar easily."
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveDrawer("endorsements")}
              className="w-full h-8 rounded-xl text-[11px] font-bold text-maroon-900 dark:text-maroon-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              View Senior Recommendations
            </Button>
          </div>

          {/* Reset & Quick Navigation */}
          <div className="pt-1 flex items-center justify-between text-xs px-1">
            <button
              onClick={handleResetDefaults}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Defaults
            </button>

            <button
              onClick={() => handleSaveProfile()}
              disabled={isSaving}
              className="text-maroon-900 dark:text-maroon-300 hover:underline font-bold cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Edits ↑"}
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE SLIDE-OVER DRAWERS
          ========================================================================= */}

      {/* 1. RESUME VIEWER & VERSION MANAGER DRAWER */}
      {activeDrawer === "resume" && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full p-6 shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-maroon-900 dark:text-maroon-300" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Primary Verified Resume
                  </h3>
                </div>
                <button
                  onClick={() => setActiveDrawer(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Resume Card Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    Arnav_Sharma_Resume_2026.pdf
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                    PR VERIFIED
                  </span>
                </div>
                <div className="text-xs text-slate-500 space-y-1 font-mono">
                  <div>• Size: 242 KB (Single Page PDF)</div>
                  <div>• ATS Readability: 94 / 100</div>
                  <div>• Last verified: Sept 12, 2026 by Dr. Mary Issac</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  className="w-full h-10 rounded-2xl bg-maroon-900 hover:bg-maroon-800 text-white font-bold text-xs gap-2 cursor-pointer"
                  onClick={() => alert("Downloading verified PDF...")}
                >
                  <Download className="w-4 h-4" /> Download Official Resume PDF
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-10 rounded-2xl text-xs font-semibold gap-2 border-slate-200 dark:border-slate-800 cursor-pointer"
                  onClick={() => alert("Opening ATS verification report...")}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> View ATS Scoring Breakdown
                </Button>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 text-[11px] text-slate-400 text-center">
              Verified by Central Placement Cell • Encrypted Document Hash: #a8f09d2
            </div>
          </div>
        </div>
      )}

      {/* 2. CAPSTONE PROJECT DEEP-DIVE DRAWER */}
      {activeDrawer === "project" && selectedProject && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full p-6 shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-maroon-900 dark:text-maroon-300" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Project Deep Dive
                  </h3>
                </div>
                <button
                  onClick={() => setActiveDrawer(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedProject.title}
                </h4>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {selectedProject.verifiedBy}
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedProject.description}
              </p>

              {/* Technologies */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tech Stack Architecture
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.technologies.map((t, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono font-semibold"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="space-y-2 pt-2">
                <a
                  href={selectedProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <Github className="w-4 h-4" /> View Source Code
                </a>
                <a
                  href={selectedProject.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-maroon-900 hover:bg-maroon-800 text-xs font-bold text-white"
                >
                  <ExternalLink className="w-4 h-4" /> Live Demo Deployment
                </a>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 text-[11px] text-slate-400 text-center">
              Audited by Placement Review Committee
            </div>
          </div>
        </div>
      )}

      {/* 3. SENIOR RECOMMENDATIONS & ENDORSEMENTS DRAWER */}
      {activeDrawer === "endorsements" && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full p-6 shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-maroon-900 dark:text-maroon-300" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Senior Recommendations
                  </h3>
                </div>
                <button
                  onClick={() => setActiveDrawer(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Rohan Verma • Google SWE-2 (Batch '24)
                    </span>
                    <span className="text-amber-500 text-xs">★★★★★</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    "Arnav's algorithmic intuition is top-tier. In our 60-minute mock interview, he designed a distributed rate limiter with sliding window logs effortlessly."
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Priya Nair • Microsoft SDE (Batch '25)
                    </span>
                    <span className="text-amber-500 text-xs">★★★★★</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    "Very communicative problem solver. Great understanding of database internals, indexing tradeoffs, and isolation levels."
                  </p>
                </div>
              </div>
            </div>

            <Button
              className="w-full h-10 rounded-2xl bg-[#D4F436] hover:bg-[#c2e428] text-slate-950 font-black text-xs cursor-pointer"
              onClick={() => setActiveDrawer(null)}
            >
              Close Recommendations
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
