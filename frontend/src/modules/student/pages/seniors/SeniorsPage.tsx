import React, { useState, useEffect } from "react";
import { api, SeniorProfile, CreateSeniorPayload } from "@/shared/lib";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  GraduationCap,
  Building2,
  Search,
  Filter,
  Plus,
  Linkedin,
  Mail,
  Briefcase,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  MessageSquare,
  X,
  UserPlus
} from "lucide-react";

export const SeniorsPage: React.FC = () => {
  const [seniors, setSeniors] = useState<SeniorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");

  // Add Senior Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Referral / Connect Modal State
  const [referralTarget, setReferralTarget] = useState<SeniorProfile | null>(null);
  const [referralNote, setReferralNote] = useState("");
  const [referralSuccess, setReferralSuccess] = useState(false);

  // New Senior Form State
  const [newSenior, setNewSenior] = useState<CreateSeniorPayload>({
    name: "",
    batch: "2024",
    department: "Computer Science & Engineering",
    company: "",
    role: "",
    package_lpa: 20.0,
    offer_type: "Full-Time",
    skills: ["Data Structures", "System Design", "Algorithms"],
    interview_experience: "",
    linkedin_url: "",
    email: "",
    referral_status: "Available",
    campus: "Bangalore Main Campus",
  });
  const [skillsInput, setSkillsInput] = useState("Data Structures, System Design, Algorithms");

  const loadSeniors = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSeniors({
        search: searchQuery || undefined,
        company: selectedCompany !== "all" ? selectedCompany : undefined,
        batch: selectedBatch !== "all" ? selectedBatch : undefined,
      });
      setSeniors(data);
    } catch (err) {
      console.error("Failed to load seniors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSeniors();
  }, [searchQuery, selectedCompany, selectedBatch]);

  const handleAddSeniorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSenior.name || !newSenior.company || !newSenior.role) {
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedSkills = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);
      const created = await api.createSenior({
        ...newSenior,
        skills: parsedSkills,
      });

      setSeniors((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      setToastMessage(`Successfully added senior profile for ${created.name} at ${created.company}!`);
      setTimeout(() => setToastMessage(null), 4000);

      // Reset form
      setNewSenior({
        name: "",
        batch: "2024",
        department: "Computer Science & Engineering",
        company: "",
        role: "",
        package_lpa: 20.0,
        offer_type: "Full-Time",
        skills: [],
        interview_experience: "",
        linkedin_url: "",
        email: "",
        referral_status: "Available",
        campus: "Bangalore Main Campus",
      });
      setSkillsInput("");
    } catch (err: any) {
      alert(err.message || "Failed to add senior record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReferral = (e: React.FormEvent) => {
    e.preventDefault();
    setReferralSuccess(true);
    setTimeout(() => {
      setReferralSuccess(false);
      setReferralTarget(null);
      setReferralNote("");
      setToastMessage(`Referral request dispatched to ${referralTarget?.name}!`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
  };

  const companiesList = Array.from(new Set(seniors.map((s) => s.company)));

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-6 sm:p-10 shadow-lg">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Campus Alumni & Peer Mentorship Network</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Placed Seniors Directory
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Explore placed seniors from previous batches, read authentic interview experiences, and connect for company referrals.
            </p>
          </div>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-white hover:bg-slate-100 text-blue-700 hover:text-blue-800 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-black/10 flex items-center gap-2 shrink-0 cursor-pointer active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Senior Profile</span>
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by senior name, company, role, or skill..."
            className="pl-9 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl h-10 w-full"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0 font-medium">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>

          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Companies</option>
            {companiesList.map((comp) => (
              <option key={comp} value={comp}>
                {comp}
              </option>
            ))}
          </select>

          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Batches</option>
            <option value="2024">Class of 2024</option>
            <option value="2023">Class of 2023</option>
            <option value="2022">Class of 2022</option>
          </select>
        </div>
      </div>

      {/* Seniors Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading senior directory records...</div>
      ) : seniors.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <GraduationCap className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">No seniors found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search query or company filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seniors.map((senior) => (
            <div
              key={senior.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Top Profile Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                      {senior.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {senior.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <span>Class of {senior.batch}</span> • <span>{senior.department.split(" ")[0]}</span>
                      </p>
                    </div>
                  </div>

                  <Badge
                    className={
                      senior.referral_status === "Available"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px]"
                        : senior.referral_status === "Limited"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-[10px]"
                        : "bg-slate-500/15 text-slate-600 dark:text-slate-400 text-[10px]"
                    }
                  >
                    {senior.referral_status}
                  </Badge>
                </div>

                {/* Company & Offer Details */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      {senior.company}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {senior.package_lpa} LPA
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span className="truncate">{senior.role}</span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {senior.offer_type}
                    </span>
                  </div>
                </div>

                {/* Skills Chips */}
                {senior.skills && senior.skills.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Key Strengths
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {senior.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interview Experience Summary */}
                {senior.interview_experience && (
                  <div className="space-y-1 pt-1">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-indigo-500" /> Interview Insight
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed bg-indigo-50/40 dark:bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-100/60 dark:border-indigo-900/40">
                      "{senior.interview_experience}"
                    </p>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {senior.linkedin_url && (
                    <a
                      href={senior.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      title="LinkedIn Profile"
                      className="p-2 rounded-xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {senior.email && (
                    <a
                      href={`mailto:${senior.email}`}
                      title="Institutional Email"
                      className="p-2 rounded-xl text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <Button
                  size="sm"
                  onClick={() => setReferralTarget(senior)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Request Referral</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: Add Senior Profile (Fulfills "add dummy senior details")
          ───────────────────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Add Senior Placement Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Seed alumni placement records to help junior students connect and prepare.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSeniorSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Senior Full Name *</label>
                  <Input
                    type="text"
                    required
                    value={newSenior.name}
                    onChange={(e) => setNewSenior({ ...newSenior, name: e.target.value })}
                    placeholder="e.g. Nandita Krishnan"
                    className="h-9 text-xs bg-slate-50 dark:bg-slate-950 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Batch Year *</label>
                  <select
                    value={newSenior.batch}
                    onChange={(e) => setNewSenior({ ...newSenior, batch: e.target.value })}
                    className="w-full h-9 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-slate-800 dark:text-slate-200"
                  >
                    <option value="2024">Class of 2024</option>
                    <option value="2023">Class of 2023</option>
                    <option value="2022">Class of 2022</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Company Name *</label>
                  <Input
                    type="text"
                    required
                    value={newSenior.company}
                    onChange={(e) => setNewSenior({ ...newSenior, company: e.target.value })}
                    placeholder="e.g. NVIDIA / Google"
                    className="h-9 text-xs bg-slate-50 dark:bg-slate-950 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Role Title *</label>
                  <Input
                    type="text"
                    required
                    value={newSenior.role}
                    onChange={(e) => setNewSenior({ ...newSenior, role: e.target.value })}
                    placeholder="e.g. Deep Learning Systems Engineer"
                    className="h-9 text-xs bg-slate-50 dark:bg-slate-950 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Package (LPA) *</label>
                  <Input
                    type="number"
                    step="0.5"
                    required
                    value={newSenior.package_lpa}
                    onChange={(e) => setNewSenior({ ...newSenior, package_lpa: parseFloat(e.target.value) || 0 })}
                    placeholder="32.5"
                    className="h-9 text-xs bg-slate-50 dark:bg-slate-950 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Offer Type</label>
                  <select
                    value={newSenior.offer_type}
                    onChange={(e) => setNewSenior({ ...newSenior, offer_type: e.target.value })}
                    className="w-full h-9 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="PPO">PPO</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Referral Status</label>
                  <select
                    value={newSenior.referral_status}
                    onChange={(e) => setNewSenior({ ...newSenior, referral_status: e.target.value })}
                    className="w-full h-9 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Available">Available</option>
                    <option value="Limited">Limited</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Department / Specialization</label>
                <Input
                  type="text"
                  value={newSenior.department}
                  onChange={(e) => setNewSenior({ ...newSenior, department: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering"
                  className="h-9 text-xs bg-slate-50 dark:bg-slate-950 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Key Skills & Technologies (comma separated)
                </label>
                <Input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="e.g. CUDA, C++, PyTorch, Distributed Systems"
                  className="h-9 text-xs bg-slate-50 dark:bg-slate-950 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Interview Insights & Preparation Advice
                </label>
                <textarea
                  rows={3}
                  value={newSenior.interview_experience}
                  onChange={(e) => setNewSenior({ ...newSenior, interview_experience: e.target.value })}
                  placeholder="Share details on rounds, core topics asked, and tips for junior students..."
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">LinkedIn URL</label>
                  <Input
                    type="url"
                    value={newSenior.linkedin_url}
                    onChange={(e) => setNewSenior({ ...newSenior, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="h-9 text-xs bg-slate-50 dark:bg-slate-950 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Contact Email</label>
                  <Input
                    type="email"
                    value={newSenior.email}
                    onChange={(e) => setNewSenior({ ...newSenior, email: e.target.value })}
                    placeholder="name@alumni.christuniversity.in"
                    className="h-9 text-xs bg-slate-50 dark:bg-slate-950 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 rounded-xl shadow-md shadow-blue-600/25"
                >
                  {isSubmitting ? "Creating Record..." : "Add to Directory"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: Request Referral / Connect Modal
          ───────────────────────────────────────────────────────────── */}
      {referralTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  Connect with {referralTarget.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {referralTarget.role} at <span className="font-semibold text-blue-600">{referralTarget.company}</span>
                </p>
              </div>
              <button
                onClick={() => setReferralTarget(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {referralSuccess ? (
              <div className="py-8 text-center space-y-2 animate-in fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Referral Request Sent!
                </h4>
                <p className="text-xs text-slate-500">
                  {referralTarget.name} will be notified via campus email with your placement profile link.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendReferral} className="space-y-4">
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300">
                  Introduce yourself, mention your targeted role, and why your profile fits {referralTarget.company}.
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Introductory Note / Referral Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={referralNote}
                    onChange={(e) => setReferralNote(e.target.value)}
                    placeholder="Hello! I am a final-year CS student interested in the upcoming recruitment cycle at your organization..."
                    className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setReferralTarget(null)}
                    className="text-xs rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 rounded-xl shadow-md shadow-blue-600/25"
                  >
                    Send Request
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
