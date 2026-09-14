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

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onProfileUpdated }) => {
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [formData, setFormData] = useState<UpdateProfilePayload>({
    full_name: user?.full_name || (user?.role === "student" ? "Arnav Sharma" : "Dr. Emily Chen, MD"),
    phone: user?.phone || "(212) 555-7890",
    department: user?.department || (user?.role === "student" ? "COMPUTER SCIENCE & ENGINEERING" : "INTERNAL MEDICINE, CARDIOLOGY"),
    designation: user?.designation || (user?.role === "student" ? "Final Year B.Tech Placement Candidate" : "Associate Professor & Senior Verification Reviewer"),
    bio: user?.bio || (user?.role === "student"
      ? "Arnav Sharma is praised for strong algorithmic problem-solving, distributed systems mastery, and clear technical communication. Consistently ranks top 5% in placement cohorts with an active PPO offer."
      : "Dr. Emily Chen is praised for professionalism, empathy, and clear explanations. Patients and coordinators value her cardiology expertise and easy booking. Some note rare communication delays."),
    avatar_url: user?.avatar_url || "https://images.unsplash.com/photo-1594824813593-c90a1f0a8241?auto=format&fit=crop&q=80&w=1000",
    linkedin_url: user?.linkedin_url || "https://linkedin.com/in/emily-chen-cardiology",
    github_url: user?.github_url || "https://github.com/placify-lead",
  });

  const [location, setLocation] = useState<string>("New York, NY, Manhattan Health Associates");
  const [competencies, setCompetencies] = useState<string[]>([
    "English (Native)",
    "Spanish (Fluent)",
  ]);
  const [newCompetency, setNewCompetency] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Calendar / Scheduling State matching reference
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
    if (confirm("Reset to default profile values?")) {
      setFormData({
        full_name: user?.role === "student" ? "Arnav Sharma" : "Dr. Emily Chen, MD",
        phone: "(212) 555-7890",
        department: user?.role === "student" ? "COMPUTER SCIENCE & ENGINEERING" : "INTERNAL MEDICINE, CARDIOLOGY",
        designation: user?.role === "student" ? "Final Year Placement Candidate" : "Associate Professor & Senior Verification Reviewer",
        bio: user?.role === "student"
          ? "Arnav Sharma is praised for strong algorithmic problem-solving, distributed systems mastery, and clear technical communication."
          : "Dr. Emily Chen is praised for professionalism, empathy, and clear explanations. Patients and coordinators value her cardiology expertise and easy booking. Some note rare communication delays.",
        avatar_url: "https://images.unsplash.com/photo-1594824813593-c90a1f0a8241?auto=format&fit=crop&q=80&w=1000",
        linkedin_url: "https://linkedin.com/in/emily-chen-cardiology",
        github_url: "https://github.com/placify-lead",
      });
      setLocation("New York, NY, Manhattan Health Associates");
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
    const roleName = formData.designation || "Senior Specialist";
    const deptName = formData.department || "Internal Medicine";
    const generated = `${formData.full_name || "Specialist"} is celebrated for outstanding expertise in ${deptName}, delivering disciplined accuracy and rapid turnaround. Peers and reviewers value their clinical rigor and prompt feedback across complex audit pipelines.`;
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
    <div className="max-w-[1380px] mx-auto py-2 sm:py-6 px-3 sm:px-6 space-y-6 text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* Toast Alert */}
      {saveSuccess && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-[#D4F436] text-slate-950 font-bold shadow-2xl border border-[#b6f000] flex items-center gap-3 animate-in slide-in-from-top-4 text-xs">
          <CheckCircle2 className="w-5 h-5 text-slate-950" />
          <div>
            <div className="font-extrabold text-sm">Profile Saved</div>
            <div className="text-[11px] text-slate-800">Your profile changes were successfully updated.</div>
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

      {/* Top Banner & Mode Toggle */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-maroon-50 dark:bg-maroon-950/60 text-maroon-900 dark:text-maroon-300 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                {formData.full_name || "Profile"}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-maroon-100 dark:bg-maroon-950 text-maroon-900 dark:text-maroon-200 font-bold">
                {user?.role?.toUpperCase() || "FACULTY"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isEditing
                ? "Direct In-Place Editing: Click and modify any text field, avatar, or competency below."
                : "Public View Mode: Viewing the clean HealthRate design presentation."}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
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

      {/* Main 3-Column Layout exactly mirroring HealthRate reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* =========================================================================
            COLUMN 1: BIG PROMINENT PORTRAIT PHOTO & CONTACT INFO (4 COLS)
            ========================================================================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Big Portrait Container: Prominent ~560px height with warm background matching Emily Chen */}
          <div className="relative w-full h-[480px] sm:h-[560px] rounded-[32px] overflow-hidden bg-[#ECE6DC] dark:bg-[#201d1c] shadow-md border border-stone-200/80 dark:border-stone-800 flex items-center justify-center group">
            <img
              src={formData.avatar_url || AVATAR_PRESETS[0].url}
              alt={formData.full_name}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-103"
              onError={(e) => {
                (e.target as HTMLImageElement).src = AVATAR_PRESETS[0].url;
              }}
            />

            {/* Editable Camera Overlay Button */}
            {isEditing && (
              <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-6">
                <Button
                  size="sm"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="bg-white/95 hover:bg-white text-slate-950 font-bold text-xs rounded-2xl shadow-xl gap-2 backdrop-blur-xs px-4 py-2"
                >
                  <Camera className="w-4 h-4 text-maroon-900" />
                  <span>Change Portrait Photo</span>
                </Button>
              </div>
            )}
          </div>

          {/* Quick Avatar Picker Dialog */}
          {showAvatarPicker && isEditing && (
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-900 dark:text-white">Choose Preset Avatar</div>
                <button
                  onClick={() => setShowAvatarPicker(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
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
                  Or Custom Photo URL
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
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

          {/* Contact Details List matching HealthRate clean iconography */}
          <div className="space-y-3 px-1 text-sm text-slate-700 dark:text-slate-300">
            {/* Location */}
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-slate-900 dark:text-slate-200 shrink-0 stroke-[2.2]" />
              {isEditing ? (
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location / Organization"
                  className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-maroon-900 focus:outline-hidden"
                />
              ) : (
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{location}</span>
              )}
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-900 dark:text-slate-200 shrink-0 stroke-[2.2]" />
              {isEditing ? (
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(212) 555-7890"
                  className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-maroon-900 focus:outline-hidden font-mono"
                />
              ) : (
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 font-mono">
                  {formData.phone || "(212) 555-7890"}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-900 dark:text-slate-200 shrink-0 stroke-[2.2]" />
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                {user?.email || "drchen@gmail.com"}
              </span>
            </div>

            {/* Competencies / Languages Bullet List */}
            <div className="pt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  Languages & Competencies
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
                    placeholder="Add item (e.g. French)..."
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

            {/* Social / Portfolio Profiles */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Professional Links
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-maroon-900 dark:text-maroon-300 shrink-0" />
                    <input
                      type="text"
                      placeholder="https://linkedin.com/in/..."
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
                    <input
                      type="text"
                      placeholder="https://github.com/..."
                      value={formData.github_url}
                      onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs"
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
        </div>

        {/* =========================================================================
            COLUMN 2: NAME, AI SUMMARY, RATINGS & DATA VISUALIZATIONS (5 COLS)
            ========================================================================= */}
        <div className="lg:col-span-5 space-y-7">
          {/* Header Title & Department */}
          <div className="space-y-1">
            {isEditing ? (
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Full Name & Credential
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. Dr. Emily Chen, MD"
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
                    placeholder="INTERNAL MEDICINE, CARDIOLOGY"
                    className="w-full text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-transparent border-b border-slate-200 dark:border-slate-700 py-1 focus:outline-hidden"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {formData.full_name || "Dr. Emily Chen, MD"}
                </h1>
                <div className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mt-1">
                  {formData.department || "INTERNAL MEDICINE, CARDIOLOGY"}
                </div>
              </div>
            )}
          </div>

          {/* AI Summary Card with Signature Lime #D4F436 Box */}
          <div className="flex flex-col sm:flex-row items-stretch rounded-[24px] overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            {/* Left Lime Rating Badge */}
            <div className="bg-[#D4F436] text-slate-950 p-6 sm:w-36 flex flex-col items-center justify-center text-center shrink-0">
              <div className="text-4xl font-black tracking-tight leading-none">4.8</div>
              <div className="text-xs font-bold mt-1 text-slate-900">38 reviews</div>
            </div>

            {/* Right AI Summary Content (Editable Bio) */}
            <div className="p-5 flex-1 flex flex-col justify-center bg-white dark:bg-slate-900 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#8CBF00] dark:text-[#D4F436]" />
                  AI SUMMARY
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

          {/* 3 Metrics Ratings Row with Stars matching HealthRate (WAIT TIME, BEDSIDE MANNER, CLEAR EXPLANATIONS) */}
          <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                WAIT TIME
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex text-amber-400 text-xs">★★★★★</div>
                <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">4.63</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                BEDSIDE MANNER
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex text-amber-400 text-xs">★★★★★</div>
                <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">4.19</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                CLEAR EXPLANATIONS
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex text-amber-400 text-xs">★★★★★</div>
                <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">4.74</span>
              </div>
            </div>
          </div>

          {/* Top Patient Visit Reasons / Specializations Donut Graphic with Leader Percentages */}
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Top Patient Visit Reasons
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-1">
              {/* SVG Donut */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
                  {/* Segment 1: Deep Teal #004D47 (35%) */}
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
                  {/* Segment 2: Lime #D4F436 (25%) */}
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
                  {/* Segment 3: Mint #8FE388 (22%) */}
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
                  {/* Segment 4: Warm Gray #D6DCD0 (18%) */}
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
                {/* Center hole */}
                <div className="absolute w-16 h-16 rounded-full bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">100%</span>
                </div>
              </div>

              {/* Dotted Leader Breakdown matching reference */}
              <div className="flex-1 w-full space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#004D47]" />
                    <span>Hypertension Management</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">35%</span>
                </div>

                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D4F436]" />
                    <span>Preventive Cardiology</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">25%</span>
                </div>

                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8FE388]" />
                    <span>Heart Failure Monitoring</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">22%</span>
                </div>

                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D6DCD0]" />
                    <span>Chest Pain Evaluation</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">18%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Activities Horizontal Stacked Bar */}
          <div className="space-y-2 pt-1">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Professional Activities
            </h3>

            <div className="flex h-5 w-full rounded-lg overflow-hidden gap-1">
              <div className="h-full bg-[#004D47] rounded-l-md" style={{ width: "47%" }} title="Clinical Consultations (47%)" />
              <div className="h-full bg-[#C8E24D]" style={{ width: "24%" }} title="Diagnostic Procedures (24%)" />
              <div className="h-full bg-[#D4F436]" style={{ width: "16%" }} title="Post-Op Follow-ups (16%)" />
              <div className="h-full bg-[#C2CDB4]" style={{ width: "10%" }} title="Clinical Research (10%)" />
              <div className="h-full bg-[#E2E4DC] rounded-r-md" style={{ width: "3%" }} title="Administration (3%)" />
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

        {/* =========================================================================
            COLUMN 3: BOOK AN APPOINTMENT CARD (3 COLS)
            ========================================================================= */}
        <div className="lg:col-span-3 space-y-5">
          {/* Main Elevated Appointment Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Book an Appointment
              </h3>
            </div>

            {/* Month & Week Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>June</span>
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

              <div className="text-right">
                <button className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium">
                  Show full calendar ▾
                </button>
              </div>
            </div>

            {/* Time Slot Picker */}
            <div className="space-y-3 pt-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Time</div>

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
                  DAY
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
              {bookingSuccess ? "Appointment Reserved ✓" : "Book Now"}
            </Button>

            {/* In-Place Quick Save & Reset Controls */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <button
                onClick={handleResetDefaults}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
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
      </div>
    </div>
  );
};

export default ProfilePage;
