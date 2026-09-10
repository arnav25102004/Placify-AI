import React, { useState } from "react";
import { coordinatorDrivesStyles as styles } from "./drives.styles";
import { IDriveOverview } from "../../types/coordinator.types";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Building2,
  CheckCircle2,
  FileSpreadsheet,
  ArrowUpRight,
  ShieldCheck,
  Search,
  CheckCheck
} from "lucide-react";

export const CoordinatorDrivesPage: React.FC = () => {
  const [drives, setDrives] = useState<IDriveOverview[]>([
    { id: "d-1", companyName: "Google India", role: "Software Engineer Intern & PPO", eligibleBatch: "Batch 2021-2025", offersReleased: 14, lettersVerified: 14, inchargeFacultyCount: 3, status: "Export_Ready" },
    { id: "d-2", companyName: "Microsoft", role: "Cloud Support & SDE", eligibleBatch: "Batch 2021-2025", offersReleased: 22, lettersVerified: 19, inchargeFacultyCount: 4, status: "Verification_In_Progress" },
    { id: "d-3", companyName: "Goldman Sachs", role: "Summer Analyst", eligibleBatch: "Batch 2022-2026", offersReleased: 8, lettersVerified: 3, inchargeFacultyCount: 2, status: "Active_Drive" },
    { id: "d-4", companyName: "Amazon", role: "SDE-1", eligibleBatch: "Batch 2020-2024", offersReleased: 45, lettersVerified: 45, inchargeFacultyCount: 5, status: "Closed" },
    { id: "d-5", companyName: "Cisco Systems", role: "Network Consulting Engineer", eligibleBatch: "Batch 2021-2025", offersReleased: 16, lettersVerified: 16, inchargeFacultyCount: 3, status: "Export_Ready" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const handleTriggerBulkERPExport = (driveId: string, companyName: string) => {
    setDrives((prev) =>
      prev.map((d) => (d.id === driveId ? { ...d, status: "Closed" } : d))
    );
    setExportMessage(
      `REST Push Success: All verified offer records for ${companyName} successfully exported to University ERP (HTTP 200 OK • Batch ID: ERP-EXP-${driveId.toUpperCase()}).`
    );
    setTimeout(() => setExportMessage(null), 6000);
  };

  const filteredDrives = drives.filter(
    (d) =>
      d.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.eligibleBatch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* Coordinator Header Banner */}
      <div className={styles.headerBanner}>
        <div className={styles.headerAccentGlow} />
        <div className={styles.headerInner}>
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Placement Coordinator Control Center</h1>
              <span className="text-xs px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> All-Campus Authority
              </span>
            </div>
            <p className="text-slate-300 text-sm">
              Coordinator: <strong className="text-white">Prof. S. K. Roy</strong> • Central University Placement Cell (5 Campuses)
            </p>
            <p className="text-xs text-slate-400">
              Oversees 11,000+ Students, 220 Teachers, and 280 Placement Reps. Authorizes final institutional College ERP synchronization.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs gap-1.5 shadow-md">
              <FileSpreadsheet className="w-4 h-4" /> Download ERP Audit Log
            </Button>
          </div>
        </div>
      </div>

      {exportMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-emerald-900 text-sm shadow-sm transition-all animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">University ERP Sync Completed</div>
            <div className="text-xs text-emerald-800 mt-0.5">{exportMessage}</div>
          </div>
        </div>
      )}

      {/* Campus Aggregate Stat Grid */}
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Placement Drives</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">128 Drives</div>
          <div className="text-xs text-blue-600 font-medium">Across 5 Campuses</div>
        </div>
        <div className={styles.statCard}>
          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Offers Logged</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">1,480 Letters</div>
          <div className="text-xs text-gray-500">92% Verified by Mentors</div>
        </div>
        <div className={styles.statCard}>
          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Synced to College ERP</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">1,310 Records</div>
          <div className="text-xs text-emerald-700 font-medium">100% Audit Defensible</div>
        </div>
        <div className={styles.statCard}>
          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Fraud / Tampering Caught</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">6 Alterations</div>
          <div className="text-xs text-gray-500">Flagged by Agent 3</div>
        </div>
      </div>

      {/* Drives Management Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Company Placement Drives & ERP Export Readiness
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Review drive progress, check mentor completion, and trigger bulk pushes to the College ERP.
            </p>
          </div>

          <div className={styles.searchBar}>
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search drive, company, or batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs outline-none w-full placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className={styles.tableHeader}>
                <tr>
                  <th className="px-6 py-3.5">Company Name</th>
                  <th className="px-6 py-3.5">Job Role</th>
                  <th className="px-6 py-3.5">Eligible Cohort</th>
                  <th className="px-6 py-3.5">Total Offers</th>
                  <th className="px-6 py-3.5">Faculty Verification Progress</th>
                  <th className="px-6 py-3.5">Drive Status</th>
                  <th className="px-6 py-3.5 text-right">ERP Integration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredDrives.map((d) => {
                  const percentVerified = Math.round((d.lettersVerified / d.offersReleased) * 100);
                  return (
                    <tr key={d.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-sm">{d.companyName}</div>
                        <div className="text-[11px] text-gray-400 font-mono">ID: {d.id}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">{d.role}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                          {d.eligibleBatch}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">{d.offersReleased}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-gray-600 font-medium">
                            <span>
                              {d.lettersVerified} of {d.offersReleased} verified
                            </span>
                            <span className="font-bold text-emerald-700">{percentVerified}%</span>
                          </div>
                          <div className="w-36 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                percentVerified === 100 ? "bg-emerald-600" : "bg-blue-600"
                              }`}
                              style={{ width: `${percentVerified}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {d.status === "Export_Ready" && (
                          <Badge variant="success" className="gap-1 bg-emerald-50 text-emerald-800 border-emerald-200">
                            <CheckCheck className="w-3 h-3" /> Ready for ERP Push
                          </Badge>
                        )}
                        {d.status === "Verification_In_Progress" && (
                          <Badge variant="warning" className="gap-1 bg-amber-50 text-amber-800 border-amber-200">
                            Verifying
                          </Badge>
                        )}
                        {d.status === "Active_Drive" && (
                          <Badge variant="default" className="gap-1">
                            Active Drive
                          </Badge>
                        )}
                        {d.status === "Closed" && (
                          <Badge variant="outline" className="gap-1 text-gray-500">
                            Synced & Closed
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {d.status === "Export_Ready" ? (
                          <Button
                            size="sm"
                            onClick={() => handleTriggerBulkERPExport(d.id, d.companyName)}
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 gap-1.5 shadow-sm"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" /> Push to ERP
                          </Button>
                        ) : d.status === "Closed" ? (
                          <span className="text-emerald-700 text-xs font-medium inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Synced
                          </span>
                        ) : (
                          <Button size="sm" variant="outline" disabled className="h-8 text-xs text-gray-400">
                            Awaiting Mentors
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
