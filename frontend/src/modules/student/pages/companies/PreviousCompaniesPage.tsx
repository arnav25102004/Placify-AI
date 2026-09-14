import React, { useState, useEffect } from "react";
import { api, RecruitingCompany } from "@/shared/lib";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Building2,
  Search,
  TrendingUp,
  Users,
  Calendar,
  ExternalLink,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  LayoutGrid,
  List,
  X,
  Layers,
} from "lucide-react";

interface PreviousCompaniesPageProps {
  onNavigateToSeniors?: (companyName?: string) => void;
}

// Curated high-res SVG and brand logos for recruiters
const COMPANY_LOGOS: Record<
  string,
  { logo: string; domain?: string; darkInvert?: boolean }
> = {
  "Google India": {
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    domain: "google.com",
  },
  Microsoft: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
    domain: "microsoft.com",
  },
  Amazon: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    domain: "amazon.com",
  },
  Atlassian: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/82/Atlassian-logo.svg",
    domain: "atlassian.com",
  },
  "Goldman Sachs": {
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg",
    domain: "goldmansachs.com",
  },
  "Cisco Systems": {
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg",
    domain: "cisco.com",
  },
  Oracle: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg",
    domain: "oracle.com",
  },
  "JP Morgan Chase & Co.": {
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/af/J_P_Morgan_Logo_2008_1.svg",
    domain: "jpmorgan.com",
  },
  "Deloitte Digital": {
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Deloitte.svg",
    domain: "deloitte.com",
  },
  "TCS Digital & Prime": {
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg",
    domain: "tcs.com",
  },
};

const CompanyLogo: React.FC<{
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}> = ({ name, className = "", size = "md" }) => {
  const [imgError, setImgError] = useState(false);

  // Match company logo by substring or exact name
  const matchedKey = Object.keys(COMPANY_LOGOS).find(
    (k) =>
      name.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(name.toLowerCase())
  );
  const logoInfo = matchedKey ? COMPANY_LOGOS[matchedKey] : null;

  const sizeClasses = {
    sm: "w-8 h-8 rounded-lg p-1 text-xs",
    md: "w-12 h-12 rounded-xl p-1.5 text-sm",
    lg: "w-14 h-14 rounded-2xl p-2 text-base",
  }[size];

  if (logoInfo && !imgError) {
    return (
      <div
        className={`${sizeClasses} bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-center shrink-0 overflow-hidden ${className}`}
      >
        <img
          src={logoInfo.logo}
          alt={`${name} logo`}
          className={`max-h-full max-w-full object-contain ${
            logoInfo.darkInvert ? "dark:brightness-0 dark:invert" : ""
          }`}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback to domain logo or initials
  return (
    <div
      className={`${sizeClasses} bg-gradient-to-br from-maroon-900 to-slate-800 text-white font-bold flex items-center justify-center shadow-xs shrink-0 ${className}`}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
};

export const PreviousCompaniesPage: React.FC<PreviousCompaniesPageProps> = ({
  onNavigateToSeniors,
}) => {
  const [companies, setCompanies] = useState<RecruitingCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedTier, setSelectedTier] = useState("all");
  const [selectedCompany, setSelectedCompany] =
    useState<RecruitingCompany | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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

  // Distinct industries and tiers
  const allIndustries = Array.from(
    new Set(companies.map((c) => c.industry))
  ).filter(Boolean);

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
  const totalOffersCount = companies.reduce(
    (acc, c) => acc + c.total_offers,
    0
  );
  const highestPackageAll =
    companies.length > 0
      ? Math.max(...companies.map((c) => c.highest_package_lpa))
      : 0;
  const avgPackageAll =
    companies.length > 0
      ? (
          companies.reduce((acc, c) => acc + c.avg_package_lpa, 0) /
          companies.length
        ).toFixed(1)
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
            Explore companies that visited campus in past recruitment drives,
            historical CTC packages, selection processes, and eligibility criteria.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 self-start sm:self-auto bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-label="Grid View"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "grid"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            aria-label="List View"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "list"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
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
              className="h-10 px-4 rounded-xl bg-maroon-900 hover:bg-maroon-800 text-white text-xs font-semibold shrink-0"
            >
              Apply Filter
            </Button>
          </div>
        </form>

        {(selectedIndustry !== "all" ||
          selectedTier !== "all" ||
          searchQuery) && (
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

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="h-44 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse"
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
            className="mt-4 bg-maroon-900 hover:bg-maroon-800 text-white text-xs"
          >
            Reset Filters
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* Minimal Responsive Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((company) => (
            <div
              key={company.id}
              onClick={() => setSelectedCompany(company)}
              className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/90 hover:border-maroon-900/50 dark:hover:border-maroon-800/60 p-5 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Top Row: Brand Logo, Name & Tier Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CompanyLogo name={company.name} size="md" />
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {company.name}
                      </h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
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

                {/* Minimal Stat Metric Strip */}
                <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/70">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                      Avg CTC
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      ₹{company.avg_package_lpa}L
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                      Highest
                    </span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      ₹{company.highest_package_lpa}L
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                      Offers
                    </span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {company.total_offers}
                    </span>
                  </div>
                </div>
              </div>

              {/* Minimal Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-medium text-slate-400">
                  Visits: {company.years_visited.slice(-2).join(", ")}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 text-xs group-hover:translate-x-0.5 transition-transform">
                  Details <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Compact List / Table View */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Avg CTC</th>
                  <th className="py-3 px-4">Highest CTC</th>
                  <th className="py-3 px-4">Offers</th>
                  <th className="py-3 px-4">Drives</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {companies.map((company) => (
                  <tr
                    key={company.id}
                    onClick={() => setSelectedCompany(company)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <CompanyLogo name={company.name} size="sm" />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {company.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {company.industry}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getTierColor(
                          company.tier
                        )}`}
                      >
                        {company.tier.split(" ")[0]}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      ₹{company.avg_package_lpa} LPA
                    </td>
                    <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">
                      ₹{company.highest_package_lpa} LPA
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                      {company.total_offers} offers
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {company.years_visited.join(", ")}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-semibold gap-1"
                      >
                        View <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comprehensive Click-to-Open Details Dialog Modal */}
      {selectedCompany && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCompany(null);
          }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Modal Header Banner */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-4">
                <CompanyLogo name={selectedCompany.name} size="lg" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedCompany.name}
                    </h2>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getTierColor(
                        selectedCompany.tier
                      )}`}
                    >
                      {selectedCompany.tier}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                    <span>{selectedCompany.industry}</span>
                    {selectedCompany.website && (
                      <a
                        href={selectedCompany.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Careers Portal <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCompany(null)}
                aria-label="Close recruitment modal"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Placement Compensation Statistics */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Campus Package & Hiring Statistics
                </h4>
                <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Average CTC
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      ₹{selectedCompany.avg_package_lpa} LPA
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Highest CTC
                    </div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                      ₹{selectedCompany.highest_package_lpa} LPA
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Total Hires
                    </div>
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {selectedCompany.total_offers} Placed
                    </div>
                  </div>
                </div>
              </div>

              {/* Roles Offered */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  Offered Profiles & Designations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCompany.roles.map((role, rIdx) => (
                    <span
                      key={rIdx}
                      className="text-xs px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium border border-blue-200/60 dark:border-blue-800/60"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Selection Process Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Selection Process & Evaluation Rounds
                </h4>
                <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-blue-200 dark:before:bg-blue-900">
                  {selectedCompany.selection_process.map((round, rIdx) => (
                    <div key={rIdx} className="relative">
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                        {rIdx + 1}
                      </div>
                      <div className="bg-white dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="font-semibold text-xs text-slate-900 dark:text-white">
                          Round {rIdx + 1}: {round}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {rIdx === 0
                            ? "Core aptitude, reasoning, and programming fundamentals on the test portal."
                            : rIdx ===
                              selectedCompany.selection_process.length - 1
                            ? "Cultural alignment, behavioural scenarios, leadership principles & compensation discussion."
                            : "Data structures, algorithms, problem solving, system design, and past project architecture."}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eligibility Criteria Callout */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Campus Eligibility Criteria
                </h4>
                <div className="text-xs text-slate-700 dark:text-slate-300 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                  {selectedCompany.eligibility}
                </div>
              </div>

              {/* Campus Drives Batches */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Past Campus Drives: {selectedCompany.years_visited.join(", ")}
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Layers className="w-4 h-4" />
                  {selectedCompany.selection_process.length} Assessment Rounds
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCompany(null)}
                className="text-xs rounded-xl"
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
                  className="bg-maroon-900 hover:bg-maroon-800 text-white text-xs gap-1.5 rounded-xl font-medium"
                >
                  <GraduationCap className="w-4 h-4" />
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
