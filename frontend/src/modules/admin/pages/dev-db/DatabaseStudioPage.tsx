import React, { useState, useEffect } from "react";
import {
  api,
  TableInfo,
  TableRowsResponse,
  CustomQueryResponse,
  TableColumnMeta
} from "@/shared/lib";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Database,
  Table as TableIcon,
  Search,
  Plus,
  Trash2,
  Play,
  RefreshCw,
  Terminal,
  FileCode,
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronRight,
  Code2,
  Key,
  Layers,
  Zap,
  Info
} from "lucide-react";

export const DatabaseStudioPage: React.FC = () => {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<"explorer" | "sql" | "presets">("explorer");

  // Tables & Selected Table
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [dbDialect, setDbDialect] = useState<string>("sqlite");
  const [selectedTableName, setSelectedTableName] = useState<string>("");
  const [isLoadingTables, setIsLoadingTables] = useState<boolean>(true);
  const [tableSearch, setTableSearch] = useState<string>("");

  // Table Data State
  const [tableData, setTableData] = useState<TableRowsResponse | null>(null);
  const [isLoadingRows, setIsLoadingRows] = useState<boolean>(false);
  const [rowSearch, setRowSearch] = useState<string>("");
  const [pageOffset, setPageOffset] = useState<number>(0);
  const pageSize = 25;

  // Insert Modal State
  const [isInsertModalOpen, setIsInsertModalOpen] = useState<boolean>(false);
  const [insertMode, setInsertMode] = useState<"form" | "json">("form");
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [jsonInput, setJsonInput] = useState<string>("");
  const [autoHashPasswords, setAutoHashPasswords] = useState<boolean>(true);
  const [isSubmittingInsert, setIsSubmittingInsert] = useState<boolean>(false);
  const [insertError, setInsertError] = useState<string | null>(null);

  // SQL Console State
  const [sqlQuery, setSqlQuery] = useState<string>("SELECT * FROM users LIMIT 10;");
  const [sqlResult, setSqlResult] = useState<CustomQueryResponse | null>(null);
  const [isRunningSql, setIsRunningSql] = useState<boolean>(false);
  const [sqlError, setSqlError] = useState<string | null>(null);

  // Preset Seeder State
  const [seedingPreset, setSeedingPreset] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load all tables
  const loadTables = async (selectDefault = true) => {
    setIsLoadingTables(true);
    try {
      const res = await api.getDbTables();
      setTables(res.tables);
      setDbDialect(res.dialect);
      if (selectDefault && res.tables.length > 0) {
        if (!selectedTableName || !res.tables.some((t) => t.name === selectedTableName)) {
          setSelectedTableName(res.tables[0].name);
        }
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load database tables", "error");
    } finally {
      setIsLoadingTables(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  // Load rows when selected table or page changes
  const loadRows = async (tableName: string, offset = 0, search = rowSearch) => {
    if (!tableName) return;
    setIsLoadingRows(true);
    try {
      const data = await api.getDbTableRows(tableName, {
        limit: pageSize,
        offset,
        search: search || undefined,
      });
      setTableData(data);
      setPageOffset(offset);
    } catch (err: any) {
      showToast(err.message || "Failed to load table rows", "error");
    } finally {
      setIsLoadingRows(false);
    }
  };

  useEffect(() => {
    if (selectedTableName) {
      setRowSearch("");
      setPageOffset(0);
      loadRows(selectedTableName, 0, "");
    }
  }, [selectedTableName]);

  const activeTableInfo = tables.find((t) => t.name === selectedTableName);

  // Open Insert Modal with initialized form
  const handleOpenInsertModal = () => {
    if (!activeTableInfo) return;
    const initialForm: Record<string, any> = {};
    activeTableInfo.columns.forEach((col) => {
      // Don't pre-populate auto-increment PKs unless user wants to
      if (col.primary_key && col.type.toLowerCase().includes("int")) {
        return;
      }
      initialForm[col.name] = "";
    });

    // Provide helpful sample defaults
    if (selectedTableName === "users") {
      initialForm["email"] = `test.user${Math.floor(Math.random() * 1000)}@example.com`;
      initialForm["password"] = "password123";
      initialForm["role"] = "student";
      initialForm["campus_id"] = 1;
      initialForm["full_name"] = "Sample Test User";
      initialForm["department"] = "Computer Science";
    } else if (selectedTableName === "seniors") {
      initialForm["name"] = "Senior Alumni";
      initialForm["batch"] = "2024";
      initialForm["department"] = "Computer Science & Engineering";
      initialForm["company"] = "Google";
      initialForm["role"] = "Software Engineer";
      initialForm["package_lpa"] = 28.5;
      initialForm["offer_type"] = "Full-Time";
      initialForm["skills"] = "Algorithms, System Design, Python";
      initialForm["referral_status"] = "Available";
      initialForm["campus"] = "Bangalore Main Campus";
    } else if (selectedTableName === "companies") {
      initialForm["name"] = "New Recruiter Inc";
      initialForm["industry"] = "Technology & Cloud";
      initialForm["tier"] = "Super Dream (20+ LPA)";
      initialForm["avg_package_lpa"] = 18.0;
      initialForm["highest_package_lpa"] = 32.0;
      initialForm["total_offers"] = 12;
      initialForm["years_visited"] = "2023, 2024";
      initialForm["roles"] = "SDE, Data Analyst";
      initialForm["selection_process"] = "Online Test, Technical Round, HR";
      initialForm["eligibility"] = "CGPA >= 7.5, No active backlogs";
    }

    setFormValues(initialForm);
    setJsonInput(JSON.stringify(initialForm, null, 2));
    setInsertError(null);
    setIsInsertModalOpen(true);
  };

  // Submit Insert
  const handleInsertSubmit = async () => {
    if (!selectedTableName) return;
    setIsSubmittingInsert(true);
    setInsertError(null);

    try {
      let payloadData: any;
      if (insertMode === "json") {
        try {
          payloadData = JSON.parse(jsonInput);
        } catch (e: any) {
          throw new Error(`Invalid JSON syntax: ${e.message}`);
        }
      } else {
        // Clean empty non-required values
        payloadData = {};
        Object.entries(formValues).forEach(([k, v]) => {
          if (v !== "" && v !== undefined) {
            // Auto cast numbers
            const col = activeTableInfo?.columns.find((c) => c.name === k);
            const colType = col?.type.toLowerCase() || "";
            if (colType.includes("int") && !isNaN(Number(v))) {
              payloadData[k] = parseInt(v, 10);
            } else if ((colType.includes("float") || colType.includes("real") || colType.includes("numeric")) && !isNaN(Number(v))) {
              payloadData[k] = parseFloat(v);
            } else {
              payloadData[k] = v;
            }
          }
        });
      }

      await api.insertDbTableRow(selectedTableName, payloadData, autoHashPasswords);
      showToast(`Successfully inserted data into '${selectedTableName}'!`);
      setIsInsertModalOpen(false);
      loadRows(selectedTableName, pageOffset);
      loadTables(false);
    } catch (err: any) {
      setInsertError(err.message || "Failed to insert record.");
    } finally {
      setIsSubmittingInsert(false);
    }
  };

  // Delete row
  const handleDeleteRow = async (row: Record<string, any>) => {
    if (!selectedTableName || !activeTableInfo) return;
    const pkCols = activeTableInfo.primary_keys.length > 0
      ? activeTableInfo.primary_keys
      : [activeTableInfo.columns[0].name];

    const pkPayload: Record<string, any> = {};
    pkCols.forEach((col) => {
      pkPayload[col] = row[col];
    });

    if (!confirm(`Are you sure you want to delete this row from '${selectedTableName}' (${JSON.stringify(pkPayload)})?`)) {
      return;
    }

    try {
      await api.deleteDbTableRow(selectedTableName, pkPayload);
      showToast(`Deleted row from ${selectedTableName}`);
      loadRows(selectedTableName, pageOffset);
      loadTables(false);
    } catch (err: any) {
      showToast(err.message || "Failed to delete row", "error");
    }
  };

  // Truncate table
  const handleTruncateTable = async () => {
    if (!selectedTableName) return;
    if (!confirm(`⚠️ DANGER: Are you sure you want to TRUNCATE / WIPE all records in table '${selectedTableName}'? This cannot be undone!`)) {
      return;
    }

    try {
      await api.truncateDbTable(selectedTableName);
      showToast(`Table '${selectedTableName}' has been truncated.`);
      loadRows(selectedTableName, 0);
      loadTables(false);
    } catch (err: any) {
      showToast(err.message || "Failed to truncate table", "error");
    }
  };

  // Execute SQL
  const handleExecuteSql = async () => {
    if (!sqlQuery.trim()) return;
    setIsRunningSql(true);
    setSqlError(null);
    try {
      const res = await api.runCustomSql(sqlQuery);
      setSqlResult(res);
      showToast(`SQL executed in ${res.execution_time_ms}ms`);
      loadTables(false);
    } catch (err: any) {
      setSqlError(err.message || "SQL Execution Error");
      setSqlResult(null);
    } finally {
      setIsRunningSql(false);
    }
  };

  // Seed Preset
  const handleSeedPreset = async (preset: string) => {
    setSeedingPreset(preset);
    try {
      const res = await api.seedDbPreset(preset);
      showToast(res.message || `Preset '${preset}' seeded successfully!`);
      loadTables(false);
      if (selectedTableName) loadRows(selectedTableName, pageOffset);
    } catch (err: any) {
      showToast(err.message || "Preset seeding failed", "error");
    } finally {
      setSeedingPreset(null);
    }
  };

  // Download table as JSON
  const handleExportTable = () => {
    if (!tableData || !tableData.rows) return;
    const blob = new Blob([JSON.stringify(tableData.rows, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedTableName}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredTables = tables.filter((t) =>
    t.name.toLowerCase().includes(tableSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-semibold animate-in slide-in-from-top-4 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/90 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <Database className="w-4 h-4" />
            <span>Developer & Testing Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Database & Test Data Manager
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Inspect database tables, insert custom test data into any table, execute arbitrary SQL queries, and populate test presets with 1-click.
          </p>
        </div>

        {/* Global Connection Badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-slate-600 dark:text-slate-300 font-medium">
              Dialect: <span className="font-bold text-slate-900 dark:text-white uppercase">{dbDialect}</span>
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => loadTables(false)}
            className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-800 text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTables ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("explorer")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "explorer"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <TableIcon className="w-4 h-4" />
          <span>Table Data Explorer & Editor</span>
        </button>

        <button
          onClick={() => setActiveTab("sql")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "sql"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Execute Custom SQL</span>
        </button>

        <button
          onClick={() => setActiveTab("presets")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "presets"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>1-Click Test Data Presets</span>
        </button>
      </div>

      {/* TAB 1: TABLE EXPLORER & DATA EDITOR */}
      {activeTab === "explorer" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Table List Navigation (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Tables ({tables.length})
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => loadTables(false)}
                  className="h-6 w-6 p-0 text-slate-400"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTables ? "animate-spin" : ""}`} />
                </Button>
              </div>

              {/* Table search filter */}
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Filter tables..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="pl-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>

              {/* Table list */}
              <div className="space-y-1 max-h-[550px] overflow-y-auto">
                {filteredTables.map((t) => {
                  const isSelected = t.name === selectedTableName;
                  return (
                    <button
                      key={t.name}
                      onClick={() => setSelectedTableName(t.name)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80 font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <TableIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        <span className="truncate">{t.name}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono shrink-0">
                        {t.row_count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Table Schema Overview */}
            {activeTableInfo && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Schema: {activeTableInfo.name}</span>
                </div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {activeTableInfo.columns.map((c) => (
                    <div
                      key={c.name}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {c.primary_key && <Key className="w-3 h-3 text-amber-500 shrink-0" />}
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {c.name}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">
                        {c.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Selected Table Records & Actions (9 cols) */}
          <div className="lg:col-span-9 space-y-4">
            {/* Table Toolbar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <TableIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{selectedTableName}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {tableData?.total_count ?? 0} rows
                    </Badge>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Showing records {pageOffset + 1} - {Math.min(pageOffset + pageSize, tableData?.total_count || 0)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <Button
                  size="sm"
                  onClick={handleOpenInsertModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl h-9 gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Record
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportTable}
                  className="rounded-xl h-9 text-xs border-slate-200 dark:border-slate-700 gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export JSON
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTruncateTable}
                  title="Clear all rows"
                  className="rounded-xl h-9 text-xs border-rose-200 dark:border-rose-900/50 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Wipe Table
                </Button>
              </div>
            </div>

            {/* Row Search Filter */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder={`Search in ${selectedTableName}...`}
                  value={rowSearch}
                  onChange={(e) => setRowSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      loadRows(selectedTableName, 0, rowSearch);
                    }
                  }}
                  className="pl-10 h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => loadRows(selectedTableName, 0, rowSearch)}
                className="h-10 px-4 rounded-xl text-xs border-slate-200 dark:border-slate-800 font-semibold"
              >
                Search
              </Button>
            </div>

            {/* Table Records Grid */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              {isLoadingRows ? (
                <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                  <span>Loading table rows...</span>
                </div>
              ) : !tableData || tableData.rows.length === 0 ? (
                <div className="p-12 text-center">
                  <TableIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    No Records Found in {selectedTableName}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    This table is currently empty or no rows match your search query. Click "Add New Record" to insert test data.
                  </p>
                  <Button
                    size="sm"
                    onClick={handleOpenInsertModal}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Insert First Record
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[600px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 backdrop-blur-xs">
                      <tr>
                        <th className="p-3 font-semibold text-slate-700 dark:text-slate-300 w-12 text-center">
                          #
                        </th>
                        {tableData.columns.map((col) => (
                          <th
                            key={col}
                            className="p-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap"
                          >
                            <span className="flex items-center gap-1">
                              {activeTableInfo?.primary_keys.includes(col) && (
                                <Key className="w-3 h-3 text-amber-500 shrink-0" />
                              )}
                              {col}
                            </span>
                          </th>
                        ))}
                        <th className="p-3 font-semibold text-slate-700 dark:text-slate-300 text-right pr-4">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {tableData.rows.map((row, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                        >
                          <td className="p-3 text-slate-400 font-mono text-[11px] text-center">
                            {pageOffset + idx + 1}
                          </td>
                          {tableData.columns.map((col) => {
                            const val = row[col];
                            return (
                              <td
                                key={col}
                                className="p-3 font-mono text-[11px] text-slate-800 dark:text-slate-200 max-w-xs truncate"
                                title={typeof val === "object" ? JSON.stringify(val) : String(val ?? "")}
                              >
                                {val === null || val === undefined ? (
                                  <span className="text-slate-300 dark:text-slate-600 italic">null</span>
                                ) : typeof val === "boolean" ? (
                                  <Badge variant="outline" className="text-[10px]">
                                    {val ? "true" : "false"}
                                  </Badge>
                                ) : (
                                  String(val)
                                )}
                              </td>
                            );
                          })}
                          <td className="p-3 text-right pr-4 whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteRow(row)}
                              title="Delete this record"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Bar */}
              {tableData && tableData.total_count > pageSize && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Total: {tableData.total_count} records
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pageOffset === 0}
                      onClick={() => loadRows(selectedTableName, Math.max(0, pageOffset - pageSize))}
                      className="h-8 text-xs px-3"
                    >
                      Previous
                    </Button>
                    <span className="font-mono text-slate-600 dark:text-slate-400">
                      Page {Math.floor(pageOffset / pageSize) + 1} of{" "}
                      {Math.ceil(tableData.total_count / pageSize)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pageOffset + pageSize >= tableData.total_count}
                      onClick={() => loadRows(selectedTableName, pageOffset + pageSize)}
                      className="h-8 text-xs px-3"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXECUTE CUSTOM SQL */}
      {activeTab === "sql" && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  SQL Query Console ({dbDialect.toUpperCase()})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Execute SELECT queries, INSERT statements, schema migrations, or data transformations directly against the database.
                </p>
              </div>

              {/* Sample Preset Queries */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-[11px] font-semibold text-slate-400 shrink-0">Quick Queries:</span>
                <button
                  onClick={() => setSqlQuery("SELECT id, email, role, full_name, department FROM users;")}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-mono shrink-0 cursor-pointer"
                >
                  All Users
                </button>
                <button
                  onClick={() => setSqlQuery("SELECT status, count(*) as total FROM documents GROUP BY status;")}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-mono shrink-0 cursor-pointer"
                >
                  Doc Counts
                </button>
                <button
                  onClick={() => setSqlQuery("SELECT name, company, package_lpa, role FROM seniors ORDER BY package_lpa DESC;")}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-mono shrink-0 cursor-pointer"
                >
                  Top Seniors
                </button>
                <button
                  onClick={() => setSqlQuery("SELECT name, tier, avg_package_lpa, total_offers FROM companies;")}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-mono shrink-0 cursor-pointer"
                >
                  Recruiters
                </button>
              </div>
            </div>

            {/* SQL Textarea */}
            <div className="relative">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={6}
                placeholder="Type your SQL query here (e.g. SELECT * FROM users;)"
                className="w-full font-mono text-xs p-4 rounded-xl bg-slate-900 text-emerald-400 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
            </div>

            {/* Run Button & Hotkey Hint */}
            <div className="flex items-center justify-between">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Supports both query reading (SELECT) and schema modification (INSERT/UPDATE/CREATE).</span>
              </div>
              <Button
                size="sm"
                onClick={handleExecuteSql}
                disabled={isRunningSql || !sqlQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl h-10 px-5 gap-2 shadow-sm"
              >
                <Play className={`w-3.5 h-3.5 ${isRunningSql ? "animate-spin" : ""}`} />
                {isRunningSql ? "Executing Query..." : "Execute SQL"}
              </Button>
            </div>
          </div>

          {/* SQL Error Box */}
          {sqlError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> SQL Execution Failed
              </div>
              <pre className="font-mono text-[11px] whitespace-pre-wrap">{sqlError}</pre>
            </div>
          )}

          {/* SQL Result Box */}
          {sqlResult && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    Query Result
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {sqlResult.execution_time_ms} ms
                  </Badge>
                  {sqlResult.type === "dml_ddl" && (
                    <Badge variant="secondary" className="text-[10px]">
                      {sqlResult.rows_affected} rows affected
                    </Badge>
                  )}
                  {sqlResult.type === "select" && (
                    <Badge variant="secondary" className="text-[10px]">
                      {sqlResult.row_count} rows returned
                    </Badge>
                  )}
                </div>

                {sqlResult.rows && sqlResult.rows.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const formatted = (sqlResult.rows || []).map((r) => {
                        const obj: Record<string, any> = {};
                        sqlResult.columns?.forEach((col, idx) => {
                          obj[col] = r[idx];
                        });
                        return obj;
                      });
                      const blob = new Blob([JSON.stringify(formatted, null, 2)], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "query_result.json";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="h-8 text-xs border-slate-200 dark:border-slate-800"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" /> Export Result
                  </Button>
                )}
              </div>

              {sqlResult.message && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {sqlResult.message}
                </p>
              )}

              {/* Result Table */}
              {sqlResult.columns && sqlResult.columns.length > 0 && (
                <div className="overflow-x-auto max-h-[500px] border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        {sqlResult.columns.map((c) => (
                          <th key={c} className="p-2.5 font-semibold text-slate-700 dark:text-slate-300">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {sqlResult.rows?.map((r, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          {r.map((val, cIdx) => (
                            <td key={cIdx} className="p-2.5 font-mono text-[11px] text-slate-800 dark:text-slate-200">
                              {val === null || val === undefined ? (
                                <span className="text-slate-400 italic">null</span>
                              ) : (
                                String(val)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: 1-CLICK TEST DATA PRESETS */}
      {activeTab === "presets" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Instant Test Data Generators
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Populate database tables with realistic test entities for end-to-end testing of verification workflows, student dashboards, alumni mentoring, and recruiter audits.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              {/* Preset 1: Seed All Demo Data */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200 dark:border-blue-800/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Master Preset
                    </span>
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base mt-2">
                    Seed Complete Test Suite
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Initializes default faculty, student, admin accounts, batches, senior directory, and recruiter profiles.
                  </p>
                </div>
                <Button
                  size="sm"
                  disabled={Boolean(seedingPreset)}
                  onClick={() => handleSeedPreset("all")}
                  className="mt-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl h-9"
                >
                  {seedingPreset === "all" ? "Seeding..." : "Generate Master Suite"}
                </Button>
              </div>

              {/* Preset 2: Seed Sample Students */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Students (users)
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base mt-2">
                    Seed 5 Test Students
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Adds 5 verified students across CS, IT, AI, EC, and DS with password <code className="text-blue-600">student123</code>.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={Boolean(seedingPreset)}
                  onClick={() => handleSeedPreset("sample_students")}
                  className="mt-5 text-xs font-semibold rounded-xl h-9 border-slate-200 dark:border-slate-700"
                >
                  {seedingPreset === "sample_students" ? "Seeding..." : "Seed 5 Students"}
                </Button>
              </div>

              {/* Preset 3: Seed Senior Profiles */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Alumni (seniors)
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base mt-2">
                    Seed Placed Seniors
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Adds placed alumni profiles across Uber, Amazon, Goldman Sachs, and Cisco with package CTCs and skills.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={Boolean(seedingPreset)}
                  onClick={() => handleSeedPreset("sample_seniors")}
                  className="mt-5 text-xs font-semibold rounded-xl h-9 border-slate-200 dark:border-slate-700"
                >
                  {seedingPreset === "sample_seniors" ? "Seeding..." : "Seed Senior Mentors"}
                </Button>
              </div>

              {/* Preset 4: Seed Recruiting Companies */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Recruiters (companies)
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base mt-2">
                    Seed Past Recruiters
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Adds historical recruitment drives (Google, Microsoft, Cisco, Deloitte) with eligibility rules and rounds.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={Boolean(seedingPreset)}
                  onClick={() => handleSeedPreset("sample_companies")}
                  className="mt-5 text-xs font-semibold rounded-xl h-9 border-slate-200 dark:border-slate-700"
                >
                  {seedingPreset === "sample_companies" ? "Seeding..." : "Seed Company Master"}
                </Button>
              </div>

              {/* Preset 5: Seed Documents & Extractions */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Verification Engine (documents)
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base mt-2">
                    Seed Offers & Extractions
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Adds sample verified and flagged offer letters with OCR extractions ready for faculty review.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={Boolean(seedingPreset)}
                  onClick={() => handleSeedPreset("sample_documents")}
                  className="mt-5 text-xs font-semibold rounded-xl h-9 border-slate-200 dark:border-slate-700"
                >
                  {seedingPreset === "sample_documents" ? "Seeding..." : "Seed Sample Offers"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSERT RECORD MODAL */}
      {isInsertModalOpen && activeTableInfo && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Insert Record into '{selectedTableName}'
                  </h2>
                  <div className="text-xs text-slate-500">
                    Enter row fields or paste raw JSON object / array
                  </div>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                <button
                  onClick={() => {
                    setInsertMode("form");
                  }}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    insertMode === "form"
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Form Mode
                </button>
                <button
                  onClick={() => {
                    setJsonInput(JSON.stringify(formValues, null, 2));
                    setInsertMode("json");
                  }}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    insertMode === "json"
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Raw JSON
                </button>
              </div>
            </div>

            {/* Modal Error Banner */}
            {insertError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{insertError}</span>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {insertMode === "form" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeTableInfo.columns.map((col) => {
                    const isPk = col.primary_key;
                    return (
                      <div key={col.name} className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            {isPk && <Key className="w-3 h-3 text-amber-500" />}
                            {col.name}
                            {!col.nullable && <span className="text-rose-500">*</span>}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {col.type}
                          </span>
                        </label>
                        <Input
                          type="text"
                          value={formValues[col.name] ?? ""}
                          onChange={(e) =>
                            setFormValues({ ...formValues, [col.name]: e.target.value })
                          }
                          placeholder={col.default ? `Default: ${col.default}` : isPk ? "Auto-increment ID" : `Enter ${col.name}`}
                          className="h-9 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>JSON Payload (single object or array of objects)</span>
                    <span className="text-[11px] text-slate-400">Valid JSON required</span>
                  </label>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    rows={12}
                    className="w-full font-mono text-xs p-3.5 rounded-xl bg-slate-900 text-emerald-400 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Password Hashing Option for users table */}
              {selectedTableName === "users" && (
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoHashPasswords}
                    onChange={(e) => setAutoHashPasswords(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    Automatically hash plain passwords using bcrypt algorithm (Recommended for testing logins)
                  </span>
                </label>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInsertModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isSubmittingInsert}
                onClick={handleInsertSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4"
              >
                {isSubmittingInsert ? "Inserting Record..." : "Insert Record into DB"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseStudioPage;
