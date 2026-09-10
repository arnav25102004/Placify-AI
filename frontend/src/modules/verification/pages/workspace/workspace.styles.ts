export const verificationWorkspaceStyles = {
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6",
  splitGrid: "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start",
  leftPane: "lg:col-span-6 bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800 flex flex-col min-h-[720px]",
  rightPane: "lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6 text-slate-900 dark:text-slate-100 transition-colors duration-300",
  fieldGrid: "grid grid-cols-1 sm:grid-cols-2 gap-4",
  inputField: "w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800",
  insightBox: "bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 rounded-xl p-4 space-y-3",
} as const;
