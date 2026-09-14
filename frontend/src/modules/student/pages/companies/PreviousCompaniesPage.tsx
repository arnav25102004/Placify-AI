import React, { useState, useEffect } from "react";
import { api, RecruitingCompany } from "@/shared/lib";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Building2,
  Search,
  Filter,
  TrendingUp,
  Award,
  Users,
  Calendar,
  ExternalLink,
  Briefcase,
  CheckCircle,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Compass
} from "lucide-react";

interface PreviousCompaniesPageProps {
  onNavigateToSeniors?: (companyName?: string) => void;
}

export const PreviousCompaniesPage: React.FC<PreviousCompaniesPageProps> = ({
  onNavigateToSeniors
}) => {
  const [companies, setCompanies] = useState<RecruitingCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedTier, setSelectedTier] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState<RecruitingCompany | null>(null);

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPreviousCompanies({
        search: searchQuery || undefined,
        industry: selectedIndustry !== "all" ? selectedIndustry : undefined,
        tier: selectedTier !== "all" ? selectedTier : undefined,
      });
      setCompanies(data);
    } catch (err) {
      console.error("Failed to load recruiters:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [selectedIndustry, selectedTier]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCompanies();
  };

  // Get distinct list of industries and tiers from current or default set
  const allIndustries = Array.from(new Set(companies.map((c) => c.industry))).filter(Boolean);
  const allTiers = Array.from(new Set(companies.map((c) => c.tier))).filter(Boolean);

  const getTierColor = (tier: string) => {
    if (tier.toLowerCase().includes("super dream")) {
      return "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800";
    }
    if (tier.toLowerCase().includes("dream")) {
      return "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800";
    }
    return "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
  };

  // Aggregate metrics
  const totalOffersCount = companies.reduce((acc, c) => acc + c.total_offers, 0);
  const highestPackageAll = companies.length > 0 ? Math.max(...companies.map((c) => c.highest_package_lpa)) : 0;
  const avgPackageAll = companies.length > 0
    ? (companies.reduce((acc, c) => acc + c.avg_package_lpa, 0) / companies.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-xs tracking-wider uppercase">
            <Compass className="w-4 h-4" />
            <span>Campus Placement Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Previous Year Recruiters
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Explore companies that visited campus in past recruitment drives, historical CTC packages, selection processes, and eligibility criteria.
          </p>
        </div>
      </div>

      {/* Aggregate Stat Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Recruiters Listed</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {companies.length}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium">
            Across 5+ Sectors
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Highest Historic CTC</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
            ₹{highestPackageAll} LPA
          </div>
          <div className="text-[11px] text-purple-600/80 mt-1 font-medium">
            Super Dream Tier Record
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Average Historic CTC</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            ₹{avgPackageAll} LPA
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-1 font-medium">
            Mean across campus drives
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Hires Documented</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {totalOffersCount}+
          </div>
          <div className="text-[11px] text-amber-600/80 mt-1 font-medium">
            Students successfully placed
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search companies by name, role, or technology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Industry Filter */}
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              aria-label="Filter by Industry"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Industries</option>
              {allIndustries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>

            {/* Tier Filter */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              aria-label="Filter by Tier"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Tiers</option>
              <option value="Super Dream">Super Dream (20+ LPA)</option>
              <option value="Dream">Dream (10-20 LPA)</option>
              <option value="Core">Core / Regular (5-10 LPA)</option>
            </select>

            <Button
              type="submit"
              size="sm"
              className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0"
            >
              Apply Filter
            </Button>
          </div>
        </form>

        {(selectedIndustry !== "all" || selectedTier !== "all" || searchQuery) && (
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span>Active filters:</span>
            {searchQuery && (
              <Badge variant="outline" className="text-[10px] gap-1">
                Query: {searchQuery}
              </Badge>
            )}
            {selectedIndustry !== "all" && (
              <Badge variant="outline" className="text-[10px] gap-1">
                Industry: {selectedIndustry}
              </Badge>
            )}
            {selectedTier !== "all" && (
              <Badge variant="outline" className="text-[10px] gap-1">
                Tier: {selectedTier}
              </Badge>
            )}
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedIndustry("all");
                setSelectedTier("all");
                api.getPreviousCompanies().then(setCompanies);
              }}
              className="ml-auto text-blue-600 dark:text-blue-400 hover:underline text-[11px] font-semibold"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Companies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="h-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse"
            />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No Recruiting Companies Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try adjusting your search keywords, industry selection, or tier filter to view records.
          </p>
          <Button
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedIndustry("all");
              setSelectedTier("all");
              loadCompanies();
            }}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-500/50 dark:hover:border-blue-500/40 transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-md group"
            >
              <div>
                {/* Header: Company Name & Tier */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/50 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-base shadow-xs shrink-0">
                      {company.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {company.name}
                      </h3>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {company.industry}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getTierColor(
                      company.tier
                    )} shrink-0`}
                  >
                    {company.tier.split(" ")[0]}
                  </span>
                </div>

                {/* Compensation & Offers Row */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                      Avg CTC
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      ₹{company.avg_package_lpa} LPA
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                      Highest CTC
                    </span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      ₹{company.highest_package_lpa} LPA
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 mt-1 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {company.total_offers} campus offers made
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Visits: {company.years_visited.join(", ")}
                    </span>
                  </div>
                </div>

                {/* Roles Offered */}
                <div className="mt-3">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    Offered Roles
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {company.roles.map((role, rIdx) => (
                      <span
                        key={rIdx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Eligibility Criteria */}
                <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Eligibility
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                    {company.eligibility}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedCompany(company)}
                  className="flex-1 text-xs h-8 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                >
                  Process & Rounds
                </Button>

                {onNavigateToSeniors && (
                  <Button
                    size="sm"
                    onClick={() => onNavigateToSeniors(company.name)}
                    className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white font-medium gap-1 px-3"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    Seniors
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Process & Selection Details Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {selectedCompany.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedCompany.name} Recruitment Drive
                  </h2>
                  <div className="text-xs text-slate-500">
                    {selectedCompany.industry} • {selectedCompany.tier}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                aria-label="Close recruitment drive modal"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Package Summary */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Avg CTC</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    ₹{selectedCompany.avg_package_lpa} LPA
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Highest CTC</div>
                  <div className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                    ₹{selectedCompany.highest_package_lpa} LPA
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Recruited</div>
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {selectedCompany.total_offers}
                  </div>
                </div>
              </div>

              {/* Selection Process Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Standard Selection Process & Rounds
                </h4>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200 dark:before:bg-blue-900">
                  {selectedCompany.selection_process.map((round, rIdx) => (
                    <div key={rIdx} className="relative">
                      <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center shadow-xs">
                        {rIdx + 1}
                      </div>
                      <div className="bg-white dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="font-semibold text-xs text-slate-900 dark:text-white">
                          Round {rIdx + 1}: {round}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {rIdx === 0
                            ? "Core aptitude, reasoning, and programming fundamentals on test portal."
                            : rIdx === selectedCompany.selection_process.length - 1
                            ? "Cultural alignment, behavioural scenarios, leadership principles & compensation discussion."
                            : "Data structures, problem solving, system design, and past project architecture."}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eligibility & Campus Years */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Campus Eligibility Criteria
                </h4>
                <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  {selectedCompany.eligibility}
                </div>
              </div>

              {/* Campus Drives Recorded */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Campus Drive Batches: {selectedCompany.years_visited.join(", ")}
                </span>
                {selectedCompany.website && (
                  <a
                    href={selectedCompany.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    Careers Site <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCompany(null)}
                className="text-xs"
              >
                Close
              </Button>
              {onNavigateToSeniors && (
                <Button
                  size="sm"
                  onClick={() => {
                    const compName = selectedCompany.name;
                    setSelectedCompany(null);
                    onNavigateToSeniors(compName);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  View Placed Seniors from {selectedCompany.name}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviousCompaniesPage;
