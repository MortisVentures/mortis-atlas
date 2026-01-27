"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CompanyStage, DealSource } from "@prisma/client";
import { cn } from "@/lib/utils";

const stageOptions: { value: CompanyStage | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Stages" },
  { value: "PROSPECT", label: "Prospect" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "ENGAGED", label: "Engaged" },
  { value: "DUE_DILIGENCE", label: "Due Diligence" },
  { value: "PASSED", label: "Passed" },
  { value: "PORTFOLIO", label: "Portfolio" },
  { value: "EXITED", label: "Exited" },
];

const sourceConfig: Record<DealSource, { label: string; color: string }> = {
  REFERRAL: { label: "Referral", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30" },
  DIRECT_OUTREACH: { label: "Outreach", color: "bg-slate-500/20 text-slate-400 border-slate-500/30 hover:bg-slate-500/30" },
  INBOUND: { label: "Inbound", color: "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30" },
  CONFERENCE: { label: "Conference", color: "bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30" },
  ACCELERATOR: { label: "Accelerator", color: "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30" },
  NETWORK: { label: "Network", color: "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30" },
  PORTFOLIO: { label: "Portfolio", color: "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30" },
  INVESTOR_NETWORK: { label: "Co-Investor", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30" },
  OTHER: { label: "Other", color: "bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30" },
};

interface CompaniesFiltersProps {
  sectors: string[];
  sourceTypes?: DealSource[];
}

export function CompaniesFilters({ sectors, sourceTypes = [] }: CompaniesFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";
  const currentStage = searchParams.get("stage") || "ALL";
  const currentSector = searchParams.get("sector") || "ALL";
  const currentSource = searchParams.get("source") || "ALL";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === "" || value === "ALL") {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      // Reset to page 1 when filters change
      params.delete("page");

      startTransition(() => {
        router.push(`/companies?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    startTransition(() => {
      router.push("/companies");
    });
  }, [router]);

  const hasActiveFilters = currentSearch || currentStage !== "ALL" || currentSector !== "ALL" || currentSource !== "ALL";

  // Get all available source types (show configured ones first, then any in use)
  const allSourceTypes = Object.keys(sourceConfig) as DealSource[];
  const displaySourceTypes = sourceTypes.length > 0 ? sourceTypes : allSourceTypes.slice(0, 5);

  return (
    <div className="space-y-4 mb-6">
      {/* Source Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider mr-2">Source:</span>
        <button
          onClick={() => updateParams("source", "ALL")}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
            currentSource === "ALL"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50"
          )}
        >
          All
        </button>
        {displaySourceTypes.map((source) => {
          const config = sourceConfig[source];
          const isActive = currentSource === source;
          return (
            <button
              key={source}
              onClick={() => updateParams("source", isActive ? "ALL" : source)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
                isActive
                  ? config.color
                  : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50"
              )}
            >
              {config.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <Input
          placeholder="Search companies..."
          defaultValue={currentSearch}
          onChange={(e) => {
            const value = e.target.value;
            // Debounce search
            const timeoutId = setTimeout(() => {
              updateParams("search", value);
            }, 300);
            return () => clearTimeout(timeoutId);
          }}
          className="pl-9 bg-card/50 border-border"
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Stage Filter */}
      <Select
        value={currentStage}
        onValueChange={(value) => updateParams("stage", value)}
      >
        <SelectTrigger className="w-[160px] bg-card/50 border-border">
          <SelectValue placeholder="Stage" />
        </SelectTrigger>
        <SelectContent>
          {stageOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sector Filter */}
      <Select
        value={currentSector}
        onValueChange={(value) => updateParams("sector", value)}
      >
        <SelectTrigger className="w-[160px] bg-card/50 border-border">
          <SelectValue placeholder="Sector" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Sectors</SelectItem>
          {sectors.map((sector) => (
            <SelectItem key={sector} value={sector}>
              {sector}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <svg
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Clear
        </Button>
      )}
      </div>
    </div>
  );
}
