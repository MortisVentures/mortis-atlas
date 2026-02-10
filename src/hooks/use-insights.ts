"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  InsightsResponse,
  InsightSection,
  OverviewData,
  DealFlowData,
  OutcomeLearningData,
  TrendsData,
} from "@/lib/insights/types";

// =============================================================================
// TYPES
// =============================================================================

export interface UseInsightsOptions {
  section?: InsightSection;
  autoFetch?: boolean;
}

export interface UseInsightsReturn {
  data: InsightsResponse | null;
  overview: OverviewData | null;
  dealFlow: DealFlowData | null;
  outcomes: OutcomeLearningData | null;
  trends: TrendsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchSection: (section: InsightSection) => Promise<void>;
}

// =============================================================================
// HOOK
// =============================================================================

export function useInsights(options: UseInsightsOptions = {}): UseInsightsReturn {
  const { section = "all", autoFetch = true } = options;

  const [data, setData] = useState<InsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (fetchSection: InsightSection = section) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/insights?section=${fetchSection}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch insights");
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      console.error("Error fetching insights:", err);
    } finally {
      setIsLoading(false);
    }
  }, [section]);

  const fetchSection = useCallback(async (newSection: InsightSection) => {
    await fetchData(newSection);
  }, [fetchData]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    overview: data?.overview || null,
    dealFlow: data?.dealFlow || null,
    outcomes: data?.outcomes || null,
    trends: data?.trends || null,
    isLoading,
    error,
    refetch: () => fetchData(),
    fetchSection,
  };
}

// =============================================================================
// SECTION-SPECIFIC HOOKS
// =============================================================================

export function useInsightsOverview() {
  return useInsights({ section: "overview" });
}

export function useInsightsDealFlow() {
  return useInsights({ section: "deal-flow" });
}

export function useInsightsOutcomes() {
  return useInsights({ section: "outcomes" });
}

export function useInsightsTrends() {
  return useInsights({ section: "trends" });
}
