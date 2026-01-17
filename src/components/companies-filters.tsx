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
import { CompanyStage } from "@prisma/client";

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

interface CompaniesFiltersProps {
  sectors: string[];
}

export function CompaniesFilters({ sectors }: CompaniesFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";
  const currentStage = searchParams.get("stage") || "ALL";
  const currentSector = searchParams.get("sector") || "ALL";

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

  const hasActiveFilters = currentSearch || currentStage !== "ALL" || currentSector !== "ALL";

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
  );
}
