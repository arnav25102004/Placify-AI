import React, { useState } from "react";
import { api, UserProfileData, UpdateProfilePayload } from "@/shared/lib";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  User as UserIcon,
  Mail,
  Phone,
  Building,
  Briefcase,
  Globe,
  Github,
  Linkedin,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  GraduationCap
} from "lucide-react";

interface ProfilePageProps {
  user: UserProfileData | null;
  onProfileUpdated?: (updatedUser: UserProfileData) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onProfileUpdated }) => {
  const [formData, setFormData] = useState<UpdateProfilePayload>({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    department: user?.department || "",
    designation: user?.designation || "",
    bio: user?.bio || "",
    avatar_url: user?.avatar_url || "",
    linkedin_url: user?.linkedin_url || "",
    github_url: user?.github_url || "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return "U";
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "teacher":
      case "faculty":
        return <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800">Faculty / Reviewer</Badge>;
      case "student":
        return <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">Student</Badge>;
      case "pr":
        return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">Placement Representative</Badge>;
      case "placement_coordinator":
        return <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800">Placement Coordinator</Badge>;
      case "admin":
        return <Badge className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800">Administrator</Badge>;
      default:
        return <Badge className="bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800">{role || "User"}</Badge>;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const displayName = formData.full_name || user?.full_name || user?.email?.split("@")[0] || "User Profile";

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white p-6 sm:p-10 shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-3xl shadow-xl ring-4 ring-white/30 shrink-0">
            {getInitials(formData.full_name, user?.email)}
          </div>
          <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
                {displayName}
              </h1>
              {getRoleBadge(user?.role)}
            </div>
            <p className="text-xs sm:text-sm text-blue-100 flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email}</span>
              {user?.program && (
                <>
                  <span>•</span>
                  <span className="font-semibold">{user.program} Program</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Save feedback alerts */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">Your profile information has been saved successfully!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Edit Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Personal & Academic Information
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your contact details, designation, and bio displayed across Placify AI.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" /> Full Name
                </label>
                <Input
                  type="text"
                  value={formData.full_name || ""}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Dr. Priya Sharma / Arnav Rao"
                  className="h-9.5 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
                </label>
                <Input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  className="h-9.5 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" /> Department / Branch
                </label>
                <Input
                  type="text"
                  value={formData.department || ""}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering"
                  className="h-9.5 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Role Title / Designation
                </label>
                <Input
                  type="text"
                  value={formData.designation || ""}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Associate Professor / Student Rep"
                  className="h-9.5 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-400" /> Bio / Academic Summary
              </label>
              <textarea
                rows={3}
                value={formData.bio || ""}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Briefly describe your responsibilities, technical expertise, or placement interests..."
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Professional & Social Profiles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5 text-blue-500" /> LinkedIn URL
                  </label>
                  <Input
                    type="url"
                    value={formData.linkedin_url || ""}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="h-9.5 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /> GitHub URL
                  </label>
                  <Input
                    type="url"
                    value={formData.github_url || ""}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/username"
                    className="h-9.5 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/25 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving Updates..." : "Save Profile"}</span>
              </Button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Live Identity & Verification Badge Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Account Tenancy
            </h3>

            <div className="space-y-3 text-xs divide-y divide-slate-100 dark:divide-slate-800">
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-400">Institutional ID</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  USR-{String(user?.id || 1).padStart(4, "0")}
                </span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-400">Account Role</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                  {user?.role}
                </span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-400">Tenancy Campus</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Campus #{user?.campus_id || 1}
                </span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-400">Email Domain</span>
                <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">
                  {user?.email?.split("@")[1] || "christuniversity.in"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-900/60 dark:to-blue-950/20 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Role Permissions
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Your profile changes update your display name in document verification audit trails, PR cohorts, and alumni networking directories automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
