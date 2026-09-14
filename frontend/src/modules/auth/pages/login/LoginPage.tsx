import React, { useState } from "react";
import { api, UserProfileData } from "@/shared/lib";
import { UserRole } from "@/shared/types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { ThemeToggle } from "@/shared/components/ui/theme-toggle";
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  GraduationCap,
  Building2,
  Check
} from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: (user: UserProfileData, role: UserRole) => void;
  /** Optional custom image path or URL for the left column */
  imageSrc?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  imageSrc = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80",
}) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify your password.");
      return;
    }

    if (mode === "register" && password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      let loginRes;
      if (mode === "register") {
        loginRes = await api.register(email, password);
      } else {
        loginRes = await api.login(email, password);
      }

      let userProfile = loginRes.user;
      if (!userProfile) {
        userProfile = await api.getMe();
      }

      const role = (userProfile.role === "teacher" ? "faculty" : userProfile.role) as UserRole;
      onLoginSuccess(userProfile, role);
    } catch (err: any) {
      setErrorMessage(
        err.message || `${mode === "register" ? "Registration" : "Sign in"} failed. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* ─────────────────────────────────────────────────────────────
          LEFT COLUMN: Visual Hero Banner & Image Showcase
          ───────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 dark:bg-slate-950 flex-col justify-between p-12 xl:p-16 border-r border-slate-200 dark:border-slate-800/80">
        {/* Left Column Image */}
        <img
          src={imageSrc}
          alt="Placify AI Placement Intelligence"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* High-Contrast Ambient Overlay ensuring readability in both themes */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/75 to-slate-950/50" />
        <div className="absolute inset-0 bg-blue-950/30 mix-blend-multiply pointer-events-none" />

        {/* Top Brand Header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
            <Shield className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white block">Placify AI</span>
            <span className="text-xs text-blue-300 font-medium">
              Institutional Placement Intelligence
            </span>
          </div>
        </div>

        {/* Center / Bottom Highlights Card */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-xs font-semibold text-blue-200 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI-Powered Placement Ecosystem</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight drop-shadow-xs">
              Automate placement verification across campus.
            </h2>
            <p className="text-sm text-slate-200 leading-relaxed">
              Eliminate manual offer letter entry. Extract student records with Gemini Pro, verify
              side-by-side with original documents, and export straight to college ERPs.
            </p>
          </div>

          {/* Key Platform Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 text-xs text-white bg-slate-900/70 backdrop-blur-md border border-white/15 rounded-xl p-3 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">Gemini OCR Extraction</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-white bg-slate-900/70 backdrop-blur-md border border-white/15 rounded-xl p-3 shadow-xs">
              <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="font-medium">Multi-Campus Scoped</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-white bg-slate-900/70 backdrop-blur-md border border-white/15 rounded-xl p-3 shadow-xs">
              <GraduationCap className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="font-medium">Student & PR Portals</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-white bg-slate-900/70 backdrop-blur-md border border-white/15 rounded-xl p-3 shadow-xs">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">Direct ERP Integration</span>
            </div>
          </div>
        </div>

        {/* Left Bottom Footer */}
        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between border-t border-white/15 pt-6">
          <span>&copy; {new Date().getFullYear()} Placify AI Platform</span>
          <span>Version 1.0</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT COLUMN: Login & Registration Form
          ───────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-16 relative overflow-y-auto min-h-screen">
        {/* Top-Right Theme Toggle Control */}
        <div className="absolute top-5 right-5 sm:top-6 sm:right-8 z-20">
          <ThemeToggle />
        </div>

        {/* Subtle Background Glows matching active theme */}
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[350px] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-[350px] h-[250px] bg-purple-500/5 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md z-10 space-y-6 my-auto pt-8 sm:pt-0">
          {/* Mobile-Only Header */}
          <div className="lg:hidden text-center space-y-2 mb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-1">
              <Shield className="w-6 h-6 fill-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Placify AI
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Institutional Placement Intelligence
            </p>
          </div>

          {/* Form Card Container */}
          <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-6 transition-colors duration-200">
            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMessage(null);
                  if (email === "admin@gmail.com") setEmail("");
                  if (password === "admin123") setPassword("");
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  mode === "register"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Form Title & Explanatory Text */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {mode === "login" ? "Sign In to Your Account" : "Create New Account"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {mode === "login"
                  ? "Enter your email and password. Your operational role will resolve automatically."
                  : "Use your institutional email (e.g. name@christuniversity.in or name@mca.christuniversity.in)."}
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in flex items-start gap-2">
                <span className="shrink-0 text-rose-600 dark:text-rose-400 font-bold">!</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === "register" ? "name@mca.christuniversity.in" : "admin@gmail.com"}
                  required
                  className="h-10 bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl transition-colors"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Password
                  </label>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-10 bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl pr-10 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none cursor-pointer p-0.5 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Registration mode only) */}
              {mode === "register" && (
                <div className="space-y-1.5 animate-in fade-in">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Confirm Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-10 bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl transition-colors"
                  />
                </div>
              )}

              {/* Submit Action */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/25 gap-2 cursor-pointer transition-all mt-2 active:scale-[0.99]"
              >
                {isLoading ? (
                  mode === "register" ? "Creating Account..." : "Authenticating..."
                ) : (
                  <>
                    {mode === "register" ? "Create Account & Sign In" : "Sign In"} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Quick Credential Hints / Institutional Help */}
          <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400 space-y-2 transition-colors duration-200">
            <div className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
              Institutional Email Patterns
            </div>
            <div className="space-y-1 text-[11px]">
              <div>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Faculty:</span>{" "}
                <code className="px-1 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-mono">
                  @christuniversity.in
                </code>
              </div>
              <div>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Student (MCA):</span>{" "}
                <code className="px-1 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 font-mono">
                  @mca.christuniversity.in
                </code>
              </div>
              <div>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Dev Admin:</span>{" "}
                <code className="px-1 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-mono">
                  admin@gmail.com
                </code>{" "}
                / <code className="text-slate-500 dark:text-slate-400 font-mono">admin123</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
