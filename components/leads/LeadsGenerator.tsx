"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Search,
  Loader2,
  Download,
  Phone,
  Globe,
  MapPin,
  Star,
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Users,
  TrendingUp,
  PhoneCall,
  Building2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lead } from "@/app/api/leads/search/route";

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const NICHE_SUGGESTIONS = [
  "Dentists", "Real Estate Agents", "HVAC Services", "Plumbers",
  "Personal Trainers", "Digital Marketing Agencies", "Restaurants",
  "Law Firms", "Auto Repair Shops", "Accountants", "Hair Salons",
  "Wedding Photographers", "Roofing Companies", "Electricians",
];

const MAX_OPTIONS = [10, 15, 20];

type SortKey = "name" | "category" | "rating" | "reviewCount";
type SortDir = "asc" | "desc";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function toCSV(leads: Lead[]): string {
  const header = ["#", "Business Name", "Category", "Phone", "Address", "Website", "Rating", "Reviews", "Status"];
  const rows = leads.map((l, i) => [
    i + 1,
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.category.replace(/"/g, '""')}"`,
    l.phone,
    `"${l.address.replace(/"/g, '""')}"`,
    l.website,
    l.rating ?? "",
    l.reviewCount ?? "",
    l.status,
  ]);
  return [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

function downloadCSV(leads: Lead[], query: string) {
  const csv  = toCSV(leads);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `leads-${query.replace(/\s+/g, "-").toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: any;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="glass-card p-4 flex items-center gap-3">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", color)}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
      title="Copy"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function SortHeader({
  col,
  label,
  sortKey,
  sortDir,
  onSort,
}: {
  col: SortKey;
  label: string;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = sortKey === col;
  return (
    <button
      onClick={() => onSort(col)}
      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors group"
    >
      {label}
      <span className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
        {active
          ? sortDir === "asc"
            ? <ChevronUp className="w-3 h-3" />
            : <ChevronDown className="w-3 h-3" />
          : <ChevronsUpDown className="w-3 h-3" />}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function LeadsGenerator() {
  // Form
  const [niche,      setNiche]      = useState("");
  const [location,   setLocation]   = useState("");
  const [maxResults, setMaxResults] = useState(20);
  const [showSugg,   setShowSugg]   = useState(false);

  // Results
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [leads,      setLeads]      = useState<Lead[]>([]);
  const [lastQuery,  setLastQuery]  = useState("");
  const [stats,      setStats]      = useState({ withPhone: 0, withSite: 0 });

  // Table
  const [search,   setSearch]   = useState("");
  const [sortKey,  setSortKey]  = useState<SortKey>("name");
  const [sortDir,  setSortDir]  = useState<SortDir>("asc");
  const [filterNoPhone, setFilterNoPhone] = useState(false);
  const [filterNoSite,  setFilterNoSite]  = useState(false);

  // ── Sort + filter ───────────────────────────────────────────────────────────
  const displayed = useMemo(() => {
    let out = [...leads];

    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.address.toLowerCase().includes(q)
      );
    }

    if (filterNoPhone) out = out.filter((l) => !l.phone);
    if (filterNoSite)  out = out.filter((l) => !l.website);

    out.sort((a, b) => {
      let av: any = a[sortKey] ?? "";
      let bv: any = b[sortKey] ?? "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ?  1 : -1;
      return 0;
    });

    return out;
  }, [leads, search, sortKey, sortDir, filterNoPhone, filterNoSite]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  // ── Search ──────────────────────────────────────────────────────────────────
  async function handleSearch() {
    if (!niche.trim() || !location.trim()) return;

    setLoading(true);
    setError(null);
    setLeads([]);

    try {
      const res = await fetch("/api/leads/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: niche.trim(), location: location.trim(), maxResults }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.redirect) { window.location.href = data.redirect; return; }
        throw new Error(data.error ?? "Search failed");
      }

      setLeads(data.leads ?? []);
      setLastQuery(data.query ?? "");
      setStats({ withPhone: data.withPhone ?? 0, withSite: data.withSite ?? 0 });
      setSearch("");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const canSearch = !loading && niche.trim() && location.trim();

  return (
    <div className="space-y-7">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
          <Search className="w-6 h-6 text-violet-400" />
          Lead Finder
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Discover local business leads from Google Maps — name, phone, address, website
        </p>
      </div>

      {/* ── Search form ── */}
      <div className="glass-card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Niche */}
          <div className="space-y-1.5 relative">
            <Label className="text-sm font-semibold">
              Business Type / Niche <span className="text-destructive">*</span>
            </Label>
            <input
              value={niche}
              onChange={(e) => { setNiche(e.target.value); setShowSugg(true); }}
              onFocus={() => setShowSugg(true)}
              onBlur={() => setTimeout(() => setShowSugg(false), 150)}
              placeholder='e.g. "Dentists", "Roofing Companies"'
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              className="w-full px-3 py-2.5 rounded-lg bg-background/40 border border-white/10 focus:border-violet-500/50 focus:outline-none text-sm placeholder:text-muted-foreground/60"
            />
            {/* Suggestions dropdown */}
            {showSugg && !niche.trim() && (
              <div className="absolute z-20 top-full mt-1 w-full glass-card border border-white/10 rounded-xl overflow-hidden shadow-xl">
                <p className="text-[10px] text-muted-foreground px-3 pt-2 pb-1 uppercase tracking-wide font-semibold">
                  Popular niches
                </p>
                <div className="grid grid-cols-2 gap-px pb-2 px-2">
                  {NICHE_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onMouseDown={() => { setNiche(s); setShowSugg(false); }}
                      className="text-left text-xs px-2 py-1.5 rounded-lg hover:bg-violet-500/10 hover:text-violet-300 text-muted-foreground transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">
              Location <span className="text-destructive">*</span>
            </Label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder='e.g. "Austin TX", "London UK", "Dubai UAE"'
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              className="w-full px-3 py-2.5 rounded-lg bg-background/40 border border-white/10 focus:border-violet-500/50 focus:outline-none text-sm placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Row 2: max results + search button */}
        <div className="flex items-end gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Max Results</Label>
            <div className="flex gap-2">
              {MAX_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setMaxResults(n)}
                  className={cn(
                    "w-12 h-9 rounded-lg border text-sm font-semibold transition-all",
                    maxResults === n
                      ? "border-violet-500 bg-violet-500/20 text-violet-300"
                      : "border-white/10 bg-background/30 text-muted-foreground hover:border-white/20"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={!canSearch}
            className="h-9 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-900/30 ml-auto"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Searching…</>
            ) : (
              <><Search className="w-4 h-4 mr-2" />Find Leads</>
            )}
          </Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}
      </div>

      {/* ── Results ── */}
      {leads.length > 0 && (
        <div className="space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={Building2}  value={leads.length}       label="Leads found"     color="bg-violet-600" />
            <StatCard icon={PhoneCall}  value={stats.withPhone}    label="With phone"      color="bg-emerald-600" />
            <StatCard icon={Globe}      value={stats.withSite}     label="With website"    color="bg-blue-600" />
            <StatCard icon={TrendingUp} value={`${Math.round((stats.withPhone / leads.length) * 100)}%`} label="Contact rate" color="bg-indigo-600" />
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search within results */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter results…"
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-background/40 border border-white/10 focus:border-violet-500/50 focus:outline-none text-sm placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Filters */}
            <button
              onClick={() => setFilterNoPhone(!filterNoPhone)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                filterNoPhone
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-300"
                  : "border-white/10 bg-background/30 text-muted-foreground hover:border-white/20"
              )}
            >
              <Phone className="w-3 h-3" />
              No Phone
            </button>
            <button
              onClick={() => setFilterNoSite(!filterNoSite)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                filterNoSite
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-300"
                  : "border-white/10 bg-background/30 text-muted-foreground hover:border-white/20"
              )}
            >
              <Globe className="w-3 h-3" />
              No Website
            </button>

            {/* Download */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadCSV(displayed, lastQuery)}
              className="border-white/10 hover:border-violet-500/40 hover:text-violet-300 gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </Button>
          </div>

          {/* Count indicator */}
          <p className="text-xs text-muted-foreground -mt-2">
            Showing {displayed.length} of {leads.length} leads
            {lastQuery && <span className="ml-1">for &ldquo;<span className="text-foreground">{lastQuery}</span>&rdquo;</span>}
          </p>

          {/* ── Table ── */}
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th className="text-left px-4 py-3 w-8 text-xs text-muted-foreground/60 font-medium">#</th>
                    <th className="text-left px-4 py-3">
                      <SortHeader col="name" label="Business" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                    </th>
                    <th className="text-left px-4 py-3">
                      <SortHeader col="category" label="Category" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                    </th>
                    <th className="text-left px-4 py-3 min-w-[150px]">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phone</span>
                    </th>
                    <th className="text-left px-4 py-3 min-w-[180px]">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Address</span>
                    </th>
                    <th className="text-left px-4 py-3 min-w-[140px]">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Website</span>
                    </th>
                    <th className="text-left px-4 py-3">
                      <SortHeader col="rating" label="Rating" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((lead, i) => (
                    <tr
                      key={lead.id}
                      className="border-b border-white/5 hover:bg-white/[0.025] transition-colors group"
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-xs text-muted-foreground/50">{i + 1}</td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-1.5">
                          <div>
                            <p className="font-medium leading-tight">{lead.name}</p>
                            {lead.status !== "OPERATIONAL" && (
                              <Badge variant="outline" className="text-[9px] mt-0.5 text-orange-400 border-orange-500/30 py-0">
                                {lead.status.replace(/_/g, " ")}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-xs font-normal whitespace-nowrap">
                          {lead.category}
                        </Badge>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3">
                        {lead.phone ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="text-xs font-mono">{lead.phone}</span>
                            <CopyButton text={lead.phone} />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/40 italic">—</span>
                        )}
                      </td>

                      {/* Address */}
                      <td className="px-4 py-3">
                        {lead.address ? (
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3 h-3 text-muted-foreground/60 shrink-0 mt-0.5" />
                            <span className="text-xs text-muted-foreground leading-snug">{lead.city || lead.address}</span>
                            <CopyButton text={lead.address} />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/40 italic">—</span>
                        )}
                      </td>

                      {/* Website */}
                      <td className="px-4 py-3">
                        {lead.website ? (
                          <div className="flex items-center gap-1.5">
                            <Globe className="w-3 h-3 text-blue-400 shrink-0" />
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 hover:underline truncate max-w-[110px]"
                            >
                              {lead.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                            </a>
                            <CopyButton text={lead.website} />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/40 italic">—</span>
                        )}
                      </td>

                      {/* Rating */}
                      <td className="px-4 py-3">
                        {lead.rating != null ? (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-medium">{lead.rating.toFixed(1)}</span>
                            {lead.reviewCount != null && (
                              <span className="text-[10px] text-muted-foreground/60">
                                ({lead.reviewCount > 999 ? `${(lead.reviewCount / 1000).toFixed(1)}k` : lead.reviewCount})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">—</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {displayed.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                        No leads match your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Download footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Powered by Google Places API · Data sourced from Google Maps
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadCSV(displayed, lastQuery)}
              className="text-xs text-violet-400 hover:text-violet-300 gap-1.5"
            >
              <Download className="w-3 h-3" />
              Export {displayed.length} leads as CSV
            </Button>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {leads.length === 0 && !loading && (
        <div className="glass-card min-h-[300px] flex flex-col items-center justify-center text-center p-10 border-dashed">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-violet-400/50" />
          </div>
          <p className="font-medium text-muted-foreground">Your leads will appear here</p>
          <p className="text-xs text-muted-foreground/60 mt-1.5 max-w-xs leading-relaxed">
            Enter a business type and location above to find local business leads with contact details
          </p>
          <div className="mt-5 flex flex-wrap gap-2 justify-center">
            {["Dentists in Dubai", "Gyms in London", "Agencies in New York"].map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  const [n, , ...rest] = ex.split(" ");
                  setNiche(n);
                  setLocation(rest.join(" "));
                }}
                className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-background/30 text-muted-foreground hover:border-violet-500/40 hover:text-violet-300 transition-all"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
