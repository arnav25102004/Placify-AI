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
  Calendar as CalendarIcon,
  Clock,
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
  ShieldCheck,
  Check,
  Upload,
  User,
  Layers,
  Zap
} from "lucide-react";

interface ProfilePageProps {
  user: UserProfileData | null;
  onProfileUpdated?: (updatedUser: UserProfileData) => void;
}

const AVATAR_PRESETS = [
  {
    name: "Faculty Reviewer",
    url: "https://images.unsplash.com/photo-1594824813593-c90a1f0a8241?auto=format&fit=crop&q=80&w=900",
  },
  {
    name: "Professor",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=900",
  },
  {
    name: "Student Candidate",
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=900",
  },
  {
    name: "Research Lead",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=900",
  },
];

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onProfileUpdated }) => {
  const [isEditing, setIsEditing] = useState<boolean>(true); // Default to editable so user can edit right away
  const [formData, setFormData] = useState<UpdateProfilePayload>({
    full_name: user?.full_name || (user?.role === "student" ? "Arnav Sharma" : "Dr. Mary Issac, Ph.D."),
    phone: user?.phone || "+91 (080) 4012-9100",
    department: user?.department || (user?.role === "student" ? "Computer Science & Engineering" : "School of Engineering & Technology"),
    designation: user?.designation || (user?.role === "student" ? "Final Year B.Tech Placement Candidate" : "Associate Professor & Senior Verification Reviewer"),
    bio: user?.bio || (user?.role === "student"
      ? "Arnav Sharma is praised for strong algorithmic problem-solving, distributed systems mastery, and clear technical communication. Consistently ranks top 5% in placement cohorts with an active PPO offer."
      : "Dr. Mary Issac is praised for verification precision, prompt compliance reviews, and clear discrepancy resolution. Students and placement coordinators value her edge-case fraud audits and fast approval turnaround."),
    avatar_url: user?.avatar_url || "https://images.unsplash.com/photo-1594824813593-c90a1f0a8241?auto=format&fit=crop&q=80&w=900",
    linkedin_url: user?.linkedin_url || "https://linkedin.com/in/faculty-reviewer",
    github_url: user?.github_url || "https://github.com/placify-lead",
  });

  const [skills, setSkills] = useState<string[]>([
    "Full-Stack Architecture & Verification Audits",
    "Distributed Systems & ERP Integration",
    "English (Institutional / Native)",
  ]);
  const [newSkillInput, setNewSkillInput] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Scheduling State
  const [selectedDay, setSelectedDay] = useState<number>(25);
  const [selectedTime, setSelectedTime] = useState<string>("11:00 AM");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Sync state when user prop changes
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
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setFormData({
      full_name: user?.full_name || (user?.role === "student" ? "Arnav Sharma" : "Dr. Mary Issac, Ph.D."),
      phone: user?.phone || "+91 (080) 4012-9100",
      department: user?.department || (user?.role === "student" ? "Computer Science & Engineering" : "School of Engineering & Technology"),
      designation: user?.designation || (user?.role === "student" ? "Final Year B.Tech Placement Candidate" : "Associate Professor & Senior Verification Reviewer"),
      bio: user?.bio || "",
      avatar_url: user?.avatar_url || AVATAR_PRESETS[0].url,
      linkedin_url: user?.linkedin_url || "https://linkedin.com",
      github_url: user?.github_url || "https://github.com",
    });
  };

  const generateAiBio = () => {
    const roleName = user?.role || "faculty";
    const name = formData.full_name || "Profile Owner";
    const dept = formData.department || "Engineering";
    if (roleName === "student") {
      setFormData((prev) => ({
        ...prev,
        bio: `${name} is a high-performing student in ${dept} recognized for strong algorithmic problem-solving, clean code craftsmanship, and distributed systems design. Valued by interviewers for clear architectural communication and high readiness.`,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        bio: `${name} (${dept}) is praised for institutional diligence, swift document verification, and zero-defect ERP compliance. Known for identifying salary/role discrepancies and facilitating streamlined placement audits.`,
      }));
    }
  };

  const addSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput("");
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
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
    <div className="max-w-[1360px] mx-auto py-2 sm:py-6 space-y-6 text-slate-900 dark:text-slate-100">
      {/* Toast Alert Banner */}
      {saveSuccess && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-[#D4F436] text-slate-950 font-semibold shadow-2xl border border-[#b6f000] flex items-center gap-3 animate-in slide-in-from-top-4 text-xs">
          <CheckCircle2 className="w-5 h-5 text-slate-950" />
          <div>
            <div className="font-bold">Profile Saved</div>
            <div className="text-[11px] text-slate-800">Your changes were successfully synced to the database.</div>
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

      {/* Top Controls Bar: Edit / Preview Switcher & Save Button */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 dark:text-white text-base leading-none">
                {formData.full_name || "User Profile"}
              </h2>
              <Badge variant="outline" className="text-[10px] font-mono">
                {user?.role?.toUpperCase() || "FACULTY"}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isEditing
                ? "Interactive Edit Mode: Click on any field below to update details in real time."
                : "Public View Mode: Showing how your profile appears to peers and coordinators."}
            </p>
          </div>
        </div>

        {/* Action Buttons: Toggle Mode & Save */}
        <div className="flex items-center gap-2.5">
          {/* Mode Toggle Pills */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setIsEditing(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                isEditing
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Mode</span>
            </button>
          </div>

          {/* Save Profile Button with Lime Accent */}
          <Button
            size="sm"
            onClick={() => handleSaveProfile()}
            disabled={isSaving}
            className="h-9 px-4 rounded-xl bg-[#D4F436] hover:bg-[#c2e428] text-slate-950 font-black text-xs gap-1.5 shadow-sm transition-transform active:scale-98 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>

      {/* Main 3-Column Profile Grid matching HealthRate Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= COLUMN 1: PORTRAIT & CONTACT DETAILS (3.5 cols) ================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Portrait Photo Frame */}
          <div className="relative rounded-3xl overflow-hidden bg-[#F4EFE6] dark:bg-slate-800/80 aspect-4/5 shadow-xs border border-slate-200/80 dark:border-slate-800 flex items-center justify-center group">
            <img
              src={formData.avatar_url || AVATAR_PRESETS[0].url}
              alt={formData.full_name}
              className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-102"
              onError={(e) => {
                (e.target as HTMLImageElement).src = AVATAR_PRESETS[0].url;
              }}
            />

            {/* Editable Camera Overlay */}
            {isEditing && (
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 text-white">
                <Button
                  size="sm"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="bg-white/90 hover:bg-white text-slate-950 font-bold text-xs rounded-xl shadow-lg gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-600" /> Change Portrait
                </Button>
              </div>
            )}
          </div>

          {/* Quick Avatar URL Picker Dropdown / Box */}
          {showAvatarPicker && isEditing && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 animate-in fade-in">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Choose Preset Avatar</div>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setFormData({ ...formData, avatar_url: preset.url });
                      setShowAvatarPicker(false);
                    }}
                    className="rounded-xl overflow-hidden aspect-square border-2 hover:border-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="space-y-1 pt-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase">Or Custom Image URL</label>
                <Input
                  type="text"
                  placeholder="https://..."
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  className="h-8 rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          {/* Contact Details List */}
          <div className="space-y-3 px-1 text-xs text-slate-600 dark:text-slate-300">
            {/* Location */}
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
              {isEditing ? (
                <Input
                  type="text"
                  value="Bangalore Main Campus, Christ University, Hosur Road"
                  readOnly
                  className="h-8 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-xs"
                />
              ) : (
                <span>Bangalore Main Campus, Christ University, Hosur Road</span>
              )}
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              {isEditing ? (
                <Input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 (080) 4012-9100"
                  className="h-8 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs focus:ring-blue-500"
                />
              ) : (
                <span>{formData.phone || "+91 (080) 4012-9100"}</span>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <span>{user?.email || "faculty@placify.internal"}</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold font-mono">
                VERIFIED
              </span>
            </div>

            {/* Skills & Competencies */}
            <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 space-y-2 text-slate-500 dark:text-slate-400">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Core Competencies & Languages
              </div>
              <div className="space-y-1.5">
                {skills.map((skill, sIdx) => (
                  <div key={sIdx} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300">{skill}</span>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => removeSkill(sIdx)}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        title="Remove"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="flex items-center gap-1.5 pt-1">
                  <Input
                    type="text"
                    placeholder="Add competency (e.g. Spanish (Fluent))..."
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSkill()}
                    className="h-8 rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
                  />
                  <Button size="sm" onClick={addSkill} className="h-8 px-2.5 text-xs bg-slate-800 text-white">
                    Add
                  </Button>
                </div>
              )}
            </div>

            {/* Social / Portfolio Links */}
            <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Professional Profiles
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-600 shrink-0" />
                    <Input
                      type="text"
                      placeholder="https://linkedin.com/in/username"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      className="h-8 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
                    <Input
                      type="text"
                      placeholder="https://github.com/username"
                      value={formData.github_url}
                      onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                      className="h-8 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
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
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 hover:underline flex items-center gap-1.5"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {formData.github_url && (
                    <a
                      href={formData.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:underline flex items-center gap-1.5"
                    >
                      <Github className="w-4 h-4" />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2: EDITABLE NAME, AI SUMMARY, RATINGS & CHARTS (5 cols) ================= */}
        <div className="lg:col-span-5 space-y-7">
          {/* Header Name & Department (Editable on page) */}
          <div className="space-y-1.5">
            {isEditing ? (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Full Name & Title
                </label>
                <Input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Dr. Emily Chen, MD"
                  className="text-2xl font-bold h-11 rounded-2xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                />

                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Department & Specialty
                </label>
                <Input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. INTERNAL MEDICINE, CARDIOLOGY"
                  className="text-xs uppercase tracking-wider font-semibold h-9 rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                />

                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Institutional Role / Designation
                </label>
                <Input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Associate Professor & Placement Reviewer"
                  className="text-xs h-9 rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                />
              </div>
            ) : (
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {formData.full_name || "Profile Name"}
                </h1>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-1">
                  {formData.department || "FACULTY REVIEW & AUDITS"}
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-medium">
                  {formData.designation || "Lead Reviewer"}
                </div>
              </div>
            )}
          </div>

          {/* AI Summary Card with Signature Lime Badge (Editable Bio) */}
          <div className="flex flex-col sm:flex-row items-stretch rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            {/* Left Lime Rating Badge */}
            <div className="bg-[#D4F436] text-slate-950 p-5 sm:w-36 flex flex-col items-center justify-center text-center shrink-0">
              <div className="text-4xl font-black tracking-tight leading-none">4.9</div>
              <div className="text-xs font-bold mt-1 text-slate-900">48 reviews</div>
            </div>

            {/* Right AI Summary Content */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center bg-white dark:bg-slate-900 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#8CBF00] dark:text-[#D4F436]" />
                  AI SUMMARY
                </div>

                {isEditing && (
                  <button
                    onClick={generateAiBio}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
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
                  placeholder="Enter or generate your professional AI summary bio..."
                  className="w-full text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              ) : (
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {formData.bio}
                </p>
              )}
            </div>
          </div>

          {/* 3 Metric Ratings Row with Stars */}
          <div className="grid grid-cols-3 gap-2 py-1 border-y border-slate-200/70 dark:border-slate-800/80">
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                AUDIT SPEED
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex text-amber-400">{"★".repeat(5)}</div>
                <span className="font-bold text-xs text-slate-900 dark:text-white">4.88</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                ACCURACY RATE
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex text-amber-400">{"★".repeat(5)}</div>
                <span className="font-bold text-xs text-slate-900 dark:text-white">4.95</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                ERP COMPLIANCE
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex text-amber-400">{"★".repeat(5)}</div>
                <span className="font-bold text-xs text-slate-900 dark:text-white">4.92</span>
              </div>
            </div>
          </div>

          {/* Top Activities Breakdown with Donut Graphic */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Top Placement & Verification Focus
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-1">
              {/* SVG Donut Graphic */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
                  {/* Segment 1 (Teal #004D47, 35%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#004D47"
                    strokeWidth="4.5"
                    strokeDasharray="35 65"
                    strokeDashoffset="0"
                  />
                  {/* Segment 2 (Lime #D4F436, 25%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#D4F436"
                    strokeWidth="4.5"
                    strokeDasharray="25 75"
                    strokeDashoffset="-35"
                  />
                  {/* Segment 3 (Mint #8FE388, 22%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#8FE388"
                    strokeWidth="4.5"
                    strokeDasharray="22 78"
                    strokeDashoffset="-60"
                  />
                  {/* Segment 4 (Warm Gray #D6DCD0, 18%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#D6DCD0"
                    strokeWidth="4.5"
                    strokeDasharray="18 82"
                    strokeDashoffset="-82"
                  />
                </svg>
                {/* Center hole cutout overlay */}
                <div className="absolute w-16 h-16 rounded-full bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">100%</span>
                </div>
              </div>

              {/* Dotted Leader Percentage Legend */}
              <div className="flex-1 w-full space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#004D47]" />
                    <span>Software Engineering (PPO)</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">35%</span>
                </div>

                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D4F436]" />
                    <span>Cloud Architecture & DevOps</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">25%</span>
                </div>

                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8FE388]" />
                    <span>Data Science & AI Systems</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">22%</span>
                </div>

                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D6DCD0]" />
                    <span>Product & Enterprise Consulting</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">18%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Activities Stacked Segment Bar */}
          <div className="space-y-2 pt-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Operational Distribution
            </h3>

            <div className="flex h-5 w-full rounded-lg overflow-hidden gap-1">
              <div className="h-full bg-[#004D47] rounded-l-md" style={{ width: "47%" }} title="Direct Verification (47%)" />
              <div className="h-full bg-[#C8E24D]" style={{ width: "24%" }} title="AI Audit & OCR (24%)" />
              <div className="h-full bg-[#D4F436]" style={{ width: "16%" }} title="ERP Push & Sync (16%)" />
              <div className="h-full bg-[#C2CDB4]" style={{ width: "10%" }} title="Student Guidance (10%)" />
              <div className="h-full bg-[#E2E4DC] rounded-r-md" style={{ width: "3%" }} title="Flagged Audits (3%)" />
            </div>

            <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-0.5">
              <span>47%</span>
              <span>24%</span>
              <span>16%</span>
              <span>10%</span>
              <span>3%</span>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 3: RIGHT ACTIONS / SCHEDULING CARD (3.5 cols) ================= */}
        <div className="lg:col-span-3 space-y-5">
          {/* Main Elevated Action Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {isEditing ? "Profile Manager" : "Book an Appointment"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isEditing
                  ? "Save your live edits or manage availability"
                  : "Schedule mock interview or document review"}
              </p>
            </div>

            {/* Profile Completion Indicator */}
            {isEditing && (
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Profile Readiness</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">95%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: "95%" }} />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Institutional verification authority active across campus.
                </p>
              </div>
            )}

            {/* Month & Week Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>September 2026</span>
                <div className="flex items-center gap-1 text-slate-400">
                  <button className="p-1 hover:text-slate-700 dark:hover:text-slate-200 rounded">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="p-1 hover:text-slate-700 dark:hover:text-slate-200 rounded">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day Pills Strip */}
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
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
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
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Available Time</div>

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
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white font-bold"
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
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white font-bold"
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

            {/* Signature Lime Action Button */}
            {isEditing ? (
              <Button
                onClick={() => handleSaveProfile()}
                disabled={isSaving}
                className="w-full bg-[#D4F436] hover:bg-[#c2e428] text-slate-950 font-black text-xs h-11 rounded-2xl shadow-sm transition-transform active:scale-98 cursor-pointer mt-2"
              >
                {isSaving ? "Saving Updates..." : "Save Profile Changes"}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setBookingSuccess(true);
                  setTimeout(() => setBookingSuccess(false), 4000);
                }}
                className="w-full bg-[#D4F436] hover:bg-[#c2e428] text-slate-950 font-black text-xs h-11 rounded-2xl shadow-sm transition-transform active:scale-98 cursor-pointer mt-2"
              >
                {bookingSuccess ? "Appointment Reserved ✓" : "Book Now"}
              </Button>
            )}

            {/* Reset / Toggle Footer */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <button
                onClick={handleResetDefaults}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
              >
                {isEditing ? "Switch to Preview Mode →" : "Edit Profile →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
