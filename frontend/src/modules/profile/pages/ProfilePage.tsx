import React, { useState } from "react";
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
  Star,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Linkedin,
  Github,
  Globe,
  Briefcase,
  ShieldCheck,
  Check,
  X,
  UserCheck
} from "lucide-react";

interface ProfilePageProps {
  user: UserProfileData | null;
  onProfileUpdated?: (updatedUser: UserProfileData) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onProfileUpdated }) => {
  // Edit Profile Form State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<UpdateProfilePayload>({
    full_name: user?.full_name || "",
    phone: user?.phone || "+91 98765 43210",
    department: user?.department || (user?.role === "student" ? "Computer Science & Engineering" : "School of Engineering & Technology"),
    designation: user?.designation || (user?.role === "student" ? "Final Year B.Tech Candidate" : "Associate Professor & Placement Reviewer"),
    bio: user?.bio || "",
    avatar_url: user?.avatar_url || "",
    linkedin_url: user?.linkedin_url || "https://linkedin.com",
    github_url: user?.github_url || "https://github.com",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Interactive Booking / Office Hours Simulation
  const [selectedDay, setSelectedDay] = useState<number>(25);
  const [selectedTime, setSelectedTime] = useState<string>("11:00 AM");
  const [bookingSuccess, setBookingSuccess] = useState(false);

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
      setIsEditModalOpen(false);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = formData.full_name || user?.full_name || (user?.role === "faculty" ? "Dr. Mary Issac, Ph.D." : "Arnav Sharma");
  const departmentText = formData.department || (user?.role === "student" ? "COMPUTER SCIENCE & ENGINEERING" : "INTERNAL PLACEMENT AUDIT, FACULTY REVIEW");
  const defaultPhoto = "https://images.unsplash.com/photo-1594824813593-c90a1f0a8241?auto=format&fit=crop&q=80&w=900";

  return (
    <div className="max-w-[1360px] mx-auto py-2 sm:py-6 space-y-8 text-slate-900 dark:text-slate-100">
      {/* Toast Notification */}
      {saveSuccess && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-[#D4F436] text-slate-950 font-semibold shadow-xl border border-[#b6f000] flex items-center gap-2.5 animate-in slide-in-from-top-4 text-xs">
          <CheckCircle2 className="w-4 h-4 text-slate-950" />
          <span>Profile changes updated and saved successfully!</span>
        </div>
      )}

      {/* Main 3-Column / 2-Column Responsive Layout matching HealthRate inspiration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= COLUMN 1: PORTRAIT & CONTACT DETAILS (3.5 cols) ================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Portrait Photo Container */}
          <div className="relative rounded-3xl overflow-hidden bg-[#F4EFE6] dark:bg-slate-800/80 aspect-4/5 shadow-xs border border-slate-200/80 dark:border-slate-800 flex items-center justify-center group">
            <img
              src={formData.avatar_url || defaultPhoto}
              alt={displayName}
              className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-102"
              onError={(e) => {
                // Fallback to stylized portrait on image load failure
                (e.target as HTMLImageElement).src = defaultPhoto;
              }}
            />

            {/* Quick Edit Overlay Button */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white text-slate-700 dark:text-slate-200 shadow-md backdrop-blur-xs transition-all hover:scale-105 cursor-pointer"
              title="Edit Profile Information"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {/* Contact Details List */}
          <div className="space-y-3 px-1 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
              <span>Bangalore Main Campus, Christ University, Hosur Road</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <span>{formData.phone || "+91 (080) 4012-9100"}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <span>{user?.email || "faculty@placify.internal"}</span>
            </div>

            {/* Languages / Skills List */}
            <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 space-y-1.5 text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>English (Native / Institutional)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>Full-Stack Architecture & Verification Audits</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>Distributed Systems & ERP Integration</span>
              </div>
            </div>

            {/* Social / Portfolio links */}
            <div className="pt-3 flex items-center gap-3">
              {formData.linkedin_url && (
                <a
                  href={formData.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
                  title="LinkedIn Profile"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {formData.github_url && (
                <a
                  href={formData.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  title="GitHub Profile"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="ml-auto text-xs h-8 rounded-xl border-slate-200 dark:border-slate-800 font-semibold gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2: MAIN BIO, AI SUMMARY, RATINGS & CHARTS (5 cols) ================= */}
        <div className="lg:col-span-5 space-y-7">
          {/* Header Title */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {displayName}
            </h1>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-1">
              {departmentText}
            </div>
          </div>

          {/* AI Summary Card with Lime Badge (Exact styling from inspiration mockup) */}
          <div className="flex flex-col sm:flex-row items-stretch rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            {/* Left Lime Rating Badge */}
            <div className="bg-[#D4F436] text-slate-950 p-5 sm:w-36 flex flex-col items-center justify-center text-center shrink-0">
              <div className="text-4xl font-black tracking-tight leading-none">4.9</div>
              <div className="text-xs font-bold mt-1 text-slate-900">48 reviews</div>
            </div>

            {/* Right AI Summary Content */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center bg-white dark:bg-slate-900">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#a4cd00] dark:text-[#D4F436]" />
                AI SUMMARY
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {formData.bio ||
                  `${displayName} is commended for institutional diligence, swift document verification, and precise compliance review. Known for identifying salary/role discrepancies and facilitating zero-defect ERP exports across all departments.`}
              </p>
            </div>
          </div>

          {/* 3 Metric Ratings Row with Stars */}
          <div className="grid grid-cols-3 gap-2 py-1 border-y border-slate-200/70 dark:border-slate-800/80">
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                AUDIT SPEED
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex text-amber-400">
                  {"★".repeat(5)}
                </div>
                <span className="font-bold text-xs text-slate-900 dark:text-white">4.88</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                ACCURACY RATE
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex text-amber-400">
                  {"★".repeat(5)}
                </div>
                <span className="font-bold text-xs text-slate-900 dark:text-white">4.95</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                ERP COMPLIANCE
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex text-amber-400">
                  {"★".repeat(5)}
                </div>
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

              {/* Dotted Leader Percentage Legend matching inspiration */}
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

          {/* Professional Activities Stacked Segment Bar (From Mockup) */}
          <div className="space-y-2 pt-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Operational Distribution
            </h3>

            {/* Segmented multi-color bar */}
            <div className="flex h-5 w-full rounded-lg overflow-hidden gap-1">
              <div className="h-full bg-[#004D47] rounded-l-md" style={{ width: "47%" }} title="Direct Verification (47%)" />
              <div className="h-full bg-[#C8E24D]" style={{ width: "24%" }} title="AI Audit & OCR (24%)" />
              <div className="h-full bg-[#D4F436]" style={{ width: "16%" }} title="ERP Push & Sync (16%)" />
              <div className="h-full bg-[#C2CDB4]" style={{ width: "10%" }} title="Student Guidance (10%)" />
              <div className="h-full bg-[#E2E4DC] rounded-r-md" style={{ width: "3%" }} title="Flagged Audits (3%)" />
            </div>

            {/* Percentage Marks Underneath */}
            <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-0.5">
              <span>47%</span>
              <span>24%</span>
              <span>16%</span>
              <span>10%</span>
              <span>3%</span>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 3: INTERACTIVE APPOINTMENT / SCHEDULING CARD (3.5 cols) ================= */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Book a Session
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Schedule mock interview or document review
              </p>
            </div>

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
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Time</div>

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

            {/* Lime Action Button matching the inspiration mockup */}
            <Button
              onClick={() => {
                setBookingSuccess(true);
                setTimeout(() => setBookingSuccess(false), 4000);
              }}
              className="w-full bg-[#D4F436] hover:bg-[#c2e428] text-slate-950 font-extrabold text-xs h-11 rounded-2xl shadow-sm transition-transform active:scale-98 cursor-pointer mt-2"
            >
              {bookingSuccess ? "Appointment Reserved ✓" : "Book Now"}
            </Button>

            <div className="pt-2 text-center">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
              >
                Update Profile Settings & Bio →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= EDIT PROFILE MODAL ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D4F436] text-slate-950 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Edit Profile Information
                  </h2>
                  <div className="text-xs text-slate-500">
                    Update your public credentials, contact, and AI bio
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Modal Form Body */}
            <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Full Name & Title
                  </label>
                  <Input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. Dr. Emily Chen, MD"
                    className="h-9 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <Input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="h-9 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Department / Specialty
                  </label>
                  <Input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Internal Medicine, Cardiology"
                    className="h-9 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Role / Designation
                  </label>
                  <Input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Senior Faculty Reviewer"
                    className="h-9 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Profile Avatar Image URL
                </label>
                <Input
                  type="text"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className="h-9 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  AI Summary / Professional Bio
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Highlight core verification specialties, background, or placement milestones..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    LinkedIn Profile URL
                  </label>
                  <Input
                    type="text"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="h-9 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    GitHub / Portfolio URL
                  </label>
                  <Input
                    type="text"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/username"
                    className="h-9 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#D4F436] hover:bg-[#c2e428] text-slate-950 font-extrabold text-xs px-5 shadow-sm"
                >
                  {isSaving ? "Saving Updates..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
