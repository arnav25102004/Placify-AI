import React, { useState } from "react";
import {
  ShieldAlert,
  Server,
  Users,
  FileCheck2,
  Building,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Sparkles
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface AdminOverviewPageProps {
  onNavigate: (viewId: string) => void;
}

export const AdminOverviewPage: React.FC<AdminOverviewPageProps> = ({ onNavigate }) => {
  const [syncRunning, setSyncRunning] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const triggerGlobalERPSync = () => {
    setSyncRunning(true);
    setTimeout(() => {
      setSyncRunning(false);
      setSyncStatus("Global ERP Sync Completed at " + new Date().toLocaleTimeString() + " — 1,480 student placement records synchronized across all 5 campuses.");
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Super Admin Console
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 flex items-center gap-1 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" /> Full Root Access
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global governance over 5 campuses, 220 faculty reviewers, 74 PR cohorts, and all 7 AI verification agents.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerGlobalERPSync}
            disabled={syncRunning}
            className="text-xs h-9 gap-1.5 border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncRunning ? "animate-spin text-blue-600" : ""}`} />
            <span>{syncRunning ? "Syncing ERP..." : "Trigger Multi-Campus ERP Sync"}</span>
          </Button>
        </div>
      </div>

      {syncStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Global Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Multi-Campus Tenants</span>
            <Building className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">5 Campuses</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">100% Online & Synced</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Placement Cohorts</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">1,110 Students</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">74 PR Representatives (1:15)</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Verified Offers</span>
            <FileCheck2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">892 Offers</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">96.4% Verification Accuracy</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Security & Integrity</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">3 Flagged</div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">Tamper / Hash Anomaly</div>
        </div>
      </div>

      {/* Direct Module Gateways for Admin */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" /> Direct Module Gateways (Admin Privilege)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigate("comparisons")}
            className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 dark:hover:border-purple-500/50 rounded-2xl cursor-pointer transition-all hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
              Compare Document
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Side-by-side offer letter preview, extracted field review, and confidence scoring.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-purple-600">
              Open Compare <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onNavigate("pr_pipeline")}
            className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 rounded-2xl cursor-pointer transition-all hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
              PR Hub & 15-Student Cohorts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage PR assignments, monitor 1:15 student pipelines, and issue document ingestion tasks.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-amber-600">
              Open PR Pipeline <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onNavigate("coordinator_drives")}
            className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 dark:hover:border-rose-500/50 rounded-2xl cursor-pointer transition-all hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
              Placement Drives & Coordinators
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Track multi-company hiring drives, eligibility cuts, and university ERP connector states.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-rose-600">
              View Drives Tracker <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onNavigate("student_dashboard")}
            className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 rounded-2xl cursor-pointer transition-all hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              Student Experience Preview
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Preview placement status cards, senior mentor directory, and upload request portals.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-blue-600">
              View Student Portal <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* System Microservices Heartbeat Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                Autonomous Verification & Audit Engine
              </h3>
              <p className="text-[11px] text-slate-500">Real-time daemon statuses across pipeline services</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            All Pipeline Services Operational
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {[
            { id: "Service 1", name: "Document Ingestion & Parsing", status: "Healthy", time: "14ms avg" },
            { id: "Service 2", name: "Information Extraction (Parser)", status: "Healthy", time: "1.8s avg" },
            { id: "Service 3", name: "Authenticity & Fraud Detector", status: "Healthy", time: "340ms avg" },
            { id: "Service 4", name: "Cross-Verification & Profile Match", status: "Healthy", time: "92ms avg" },
            { id: "Service 5", name: "Faculty Discrepancy Assistant", status: "Healthy", time: "410ms avg" },
            { id: "Service 6", name: "Audit & ERP Sync Compliance", status: "Healthy", time: "180ms avg" },
          ].map((agent) => (
            <div
              key={agent.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{agent.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{agent.id} • {agent.time}</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                {agent.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
