export const coordinatorDrivesStyles = {
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8",
  headerBanner: "relative overflow-hidden bg-slate-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800",
  headerAccentGlow: "absolute -right-20 -top-20 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none",
  headerInner: "relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6",
  statGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
  statCard: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow transition-all space-y-2 text-slate-900 dark:text-slate-100",
  tableCard: "bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-slate-900 dark:text-slate-100",
  tableHeader: "bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider",
  searchBar: "flex items-center gap-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 w-full sm:w-64 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all",
} as const;
