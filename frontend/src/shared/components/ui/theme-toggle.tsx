import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/shared/context/theme-context";
import { Button } from "@/shared/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer flex items-center gap-2 shadow-xs select-none"
      title={`Current: ${isDark ? "Dark" : "Light"} mode. Click to switch to ${isDark ? "Light" : "Dark"} mode.`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <Sun className={`h-4 w-4 text-amber-500 transition-all duration-300 transform ${isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`} />
        <Moon className={`absolute h-4 w-4 text-indigo-400 transition-all duration-300 transform ${isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"}`} />
      </div>
      <span className="text-xs font-semibold tracking-tight transition-colors duration-200">
        {isDark ? "Dark" : "Light"}
      </span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
