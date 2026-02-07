"use client";

import { useState, useCallback, useEffect } from "react";

// =============================================================================
// TYPES
// =============================================================================

export interface DealStageData {
  name: string;
  value: number;
}

export interface SectorData {
  name: string;
  value: number;
}

export interface DashboardStats {
  // Portfolio metrics
  portfolioCount: number;
  totalInvested: number;

  // Pipeline metrics
  activeDeals: number;
  pipelineValue: number;
  conversionRate: number;

  // Deal stage breakdown for visualization
  dealStages: DealStageData[];

  // Sector breakdown (from portfolio companies)
  sectorDistribution: SectorData[];
}

interface ApiPipelineStage {
  stage: string;
  count: number;
  totalAmount: number;
}

interface ApiDealStatsResponse {
  pipeline: ApiPipelineStage[];
  summary: {
    totalDeals: number;
    activeDeals: number;
    wonDeals: number;
    conversionRate: number;
    totalInvested: number;
    activePipelineValue: number;
  };
}

interface PortfolioDeal {
  id: string;
  company: {
    sector: string | null;
  };
}

export interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Stage display names for KPIGrid visualization
const STAGE_DISPLAY_NAMES: Record<string, string> = {
  INITIAL_REVIEW: "Initial Review",
  PARTNER_REVIEW: "Partner Review",
  DUE_DILIGENCE: "Due Diligence",
  IC_REVIEW: "IC Review",
  TERM_SHEET: "Term Sheet",
  NEGOTIATION: "Negotiation",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
};

// Stages to show in the active deals breakdown (exclude closed stages)
const ACTIVE_STAGES = [
  "DUE_DILIGENCE",
  "IC_REVIEW",
  "TERM_SHEET",
  "NEGOTIATION",
];

// =============================================================================
// HOOK
// =============================================================================

export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch deal stats and portfolio deals in parallel
      const [statsResponse, portfolioResponse] = await Promise.all([
        fetch("/api/deals/stats"),
        fetch("/api/deals?stage=CLOSED_WON"),
      ]);

      if (!statsResponse.ok) {
        throw new Error("Failed to fetch deal statistics");
      }

      if (!portfolioResponse.ok) {
        throw new Error("Failed to fetch portfolio data");
      }

      const statsData: ApiDealStatsResponse = await statsResponse.json();
      const portfolioData = await portfolioResponse.json();
      const portfolioDeals: PortfolioDeal[] = portfolioData.data || [];

      // Calculate sector distribution from portfolio companies
      const sectorCounts: Record<string, number> = {};
      portfolioDeals.forEach((deal) => {
        const sector = deal.company?.sector || "Other";
        sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
      });

      const sectorDistribution = Object.entries(sectorCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Format deal stages for visualization (active stages only)
      const dealStages = statsData.pipeline
        .filter((stage) => ACTIVE_STAGES.includes(stage.stage))
        .map((stage) => ({
          name: STAGE_DISPLAY_NAMES[stage.stage] || stage.stage,
          value: stage.count,
        }))
        .sort((a, b) => b.value - a.value);

      setStats({
        portfolioCount: statsData.summary.wonDeals,
        totalInvested: statsData.summary.totalInvested,
        activeDeals: statsData.summary.activeDeals,
        pipelineValue: statsData.summary.activePipelineValue,
        conversionRate: Math.round(statsData.summary.conversionRate),
        dealStages,
        sectorDistribution,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
