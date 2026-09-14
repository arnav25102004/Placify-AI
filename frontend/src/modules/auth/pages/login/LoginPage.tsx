import React, { useState } from "react";
import { api, UserProfileData } from "@/shared/lib";
import { UserRole } from "@/shared/types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Shield, Lock, Mail, ArrowRight, UserCheck, CheckCircle2, Eye, EyeOff } from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: (user: UserProfileData, role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
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
      setErrorMessage(err.message || `${mode === "register" ? "Registration" : "Sign in"} failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-1">
            <Shield className="w-6 h-6 fill-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Placify AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Institutional Placement Intelligence & Verification Platform
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
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
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Create Account
            </button>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">
              {mode === "login" ? "Sign In to Your Account" : "Create New Account"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === "login"
                ? "Enter your email and password. Your role and portal access will be resolved automatically."
                : "Use your institutional email (e.g. name@christuniversity.in or name@mca.christuniversity.in)."}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 animate-in fade-in">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === "register" ? "name@mca.christuniversity.in" : "admin@gmail.com"}
                required
                className="h-10 bg-slate-950/80 border-slate-800 text-slate-100 text-xs focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
                </label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-10 bg-slate-950/80 border-slate-800 text-slate-100 text-xs focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer p-0.5"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-200" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400 hover:text-slate-200" />
                  )}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div className="space-y-1.5 animate-in fade-in">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Confirm Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-10 bg-slate-950/80 border-slate-800 text-slate-100 text-xs focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/30 gap-2 cursor-pointer transition-all"
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

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500">
          Persistent Local SQLite Database: <span className="font-mono text-slate-400">backend/data/placify.db</span>
        </div>
      </div>
    </div>
  );
};
