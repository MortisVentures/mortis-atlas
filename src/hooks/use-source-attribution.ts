"use client";

import { useState, useCallback, useEffect } from "react";
import { DealWithSource, Referrer } from "@/lib/deals/source-tracking";

export interface UseSourceAttributionReturn {
  deals: DealWithSource[];
  referrers: Referrer[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSourceAttribution(): UseSourceAttributionReturn {
  const [deals, setDeals] = useState<DealWithSource[]>([]);
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [dealsRes, referrersRes] = await Promise.all([
        fetch("/api/sources/deals"),
        fetch("/api/sources/referrers"),
      ]);

      if (!dealsRes.ok) {
        throw new Error("Failed to fetch deals");
      }
      if (!referrersRes.ok) {
        throw new Error("Failed to fetch referrers");
      }

      const dealsData = await dealsRes.json();
      const referrersData = await referrersRes.json();

      setDeals(dealsData.data || []);
      setReferrers(referrersData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching source attribution data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    deals,
    referrers,
    isLoading,
    error,
    refetch: fetchData,
  };
}
