"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { DealStage, DealPriority, DealSource } from "@prisma/client";
import { DealWithRelations } from "@/lib/db/deals";
import {
  groupDealsByStage,
  sortDealsByPriority,
  ACTIVE_STAGES,
  CLOSED_STAGES,
} from "@/lib/deals/pipeline-utils";

// =============================================================================
// TYPES
// =============================================================================

export interface KanbanFilters {
  search: string;
  priority: DealPriority | "ALL";
  source: DealSource | "ALL";
  showClosed: boolean;
}

export interface UseDealsKanbanOptions {
  initialDeals?: DealWithRelations[];
}

export interface UseDealsKanbanReturn {
  // Data
  deals: DealWithRelations[];
  filteredDeals: DealWithRelations[];
  dealsByStage: Map<DealStage, DealWithRelations[]>;
  visibleStages: DealStage[];

  // State
  isLoading: boolean;
  error: string | null;
  filters: KanbanFilters;

  // Actions
  setFilters: (filters: Partial<KanbanFilters>) => void;
  resetFilters: () => void;
  fetchDeals: () => Promise<void>;
  updateDealStage: (dealId: string, newStage: DealStage) => Promise<boolean>;
  refreshDeal: (dealId: string) => Promise<void>;

  // Optimistic updates
  optimisticUpdateStage: (dealId: string, newStage: DealStage) => void;
  revertOptimisticUpdate: () => void;
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

const DEFAULT_FILTERS: KanbanFilters = {
  search: "",
  priority: "ALL",
  source: "ALL",
  showClosed: false,
};

// =============================================================================
// HOOK
// =============================================================================

export function useDealsKanban(
  options: UseDealsKanbanOptions = {}
): UseDealsKanbanReturn {
  const { initialDeals = [] } = options;

  // State
  const [deals, setDeals] = useState<DealWithRelations[]>(initialDeals);
  const [previousDeals, setPreviousDeals] = useState<DealWithRelations[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<KanbanFilters>(DEFAULT_FILTERS);

  // Fetch deals from API
  const fetchDeals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/deals");
      if (!response.ok) {
        throw new Error("Failed to fetch deals");
      }

      const data = await response.json();
      setDeals(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching deals:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount if no initial deals
  useEffect(() => {
    if (initialDeals.length === 0) {
      fetchDeals();
    }
  }, [initialDeals.length, fetchDeals]);

  // Filter deals based on current filters
  const filteredDeals = useMemo(() => {
    let result = [...deals];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (deal) =>
          deal.dealName.toLowerCase().includes(searchLower) ||
          deal.company.name.toLowerCase().includes(searchLower) ||
          deal.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Priority filter
    if (filters.priority !== "ALL") {
      result = result.filter((deal) => deal.priority === filters.priority);
    }

    // Source filter
    if (filters.source !== "ALL") {
      result = result.filter((deal) => deal.sourceType === filters.source);
    }

    // Closed filter
    if (!filters.showClosed) {
      result = result.filter((deal) => !CLOSED_STAGES.includes(deal.stage));
    }

    return result;
  }, [deals, filters]);

  // Group filtered deals by stage
  const dealsByStage = useMemo(() => {
    const grouped = groupDealsByStage(filteredDeals);

    // Sort deals within each stage by priority
    const entries = Array.from(grouped.entries());
    for (const [stage, stageDeals] of entries) {
      grouped.set(stage, sortDealsByPriority(stageDeals));
    }

    return grouped;
  }, [filteredDeals]);

  // Visible stages based on filter
  const visibleStages = useMemo(() => {
    if (filters.showClosed) {
      return [...ACTIVE_STAGES, ...CLOSED_STAGES];
    }
    return ACTIVE_STAGES;
  }, [filters.showClosed]);

  // Set filters
  const setFilters = useCallback((newFilters: Partial<KanbanFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  // Optimistic stage update
  const optimisticUpdateStage = useCallback(
    (dealId: string, newStage: DealStage) => {
      setPreviousDeals(deals);
      setDeals((prev) =>
        prev.map((deal) =>
          deal.id === dealId
            ? {
                ...deal,
                stage: newStage,
                lastStageChange: new Date(),
              }
            : deal
        )
      );
    },
    [deals]
  );

  // Revert optimistic update
  const revertOptimisticUpdate = useCallback(() => {
    if (previousDeals) {
      setDeals(previousDeals);
      setPreviousDeals(null);
    }
  }, [previousDeals]);

  // Update deal stage via API
  const updateDealStage = useCallback(
    async (dealId: string, newStage: DealStage): Promise<boolean> => {
      // Optimistic update
      optimisticUpdateStage(dealId, newStage);

      try {
        const response = await fetch(`/api/deals/${dealId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: newStage }),
        });

        if (!response.ok) {
          throw new Error("Failed to update deal stage");
        }

        // Clear previous state on success
        setPreviousDeals(null);
        return true;
      } catch (err) {
        console.error("Error updating deal stage:", err);
        // Revert on error
        revertOptimisticUpdate();
        setError(err instanceof Error ? err.message : "Failed to update deal");
        return false;
      }
    },
    [optimisticUpdateStage, revertOptimisticUpdate]
  );

  // Refresh single deal
  const refreshDeal = useCallback(async (dealId: string) => {
    try {
      const response = await fetch(`/api/deals/${dealId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch deal");
      }

      const updatedDeal = await response.json();
      setDeals((prev) =>
        prev.map((deal) => (deal.id === dealId ? updatedDeal : deal))
      );
    } catch (err) {
      console.error("Error refreshing deal:", err);
    }
  }, []);

  return {
    // Data
    deals,
    filteredDeals,
    dealsByStage,
    visibleStages,

    // State
    isLoading,
    error,
    filters,

    // Actions
    setFilters,
    resetFilters,
    fetchDeals,
    updateDealStage,
    refreshDeal,

    // Optimistic updates
    optimisticUpdateStage,
    revertOptimisticUpdate,
  };
}
