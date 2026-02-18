"use client";

import { useState, useEffect, useCallback } from "react";
import { RelationshipHeat } from "@prisma/client";

interface RelationshipMetrics {
  heat: RelationshipHeat;
  heatScore: number;
  trendDirection: number;
  meetingsLast30d: number;
  meetingsLast90d: number;
  daysSinceLastMeeting: number | null;
  totalMeetings: number;
  lastMeetingDate: string | null;
}

export function useRelationshipHeat(entityType: "company" | "contact", entityId: string | null) {
  const [metrics, setMetrics] = useState<RelationshipMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (!entityId) {
      setMetrics(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const endpoint = entityType === "company"
        ? `/api/companies/${entityId}/metrics`
        : `/api/contacts/${entityId}/metrics`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch metrics");
      }

      setMetrics(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch metrics");
      setMetrics(null);
    } finally {
      setIsLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refresh: fetchMetrics,
  };
}

interface HeatDistribution {
  HOT: number;
  WARM: number;
  COOLING: number;
  COLD: number;
}

export function useHeatDistribution(entityType: "company" | "contact") {
  const [distribution, setDistribution] = useState<HeatDistribution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        const response = await fetch(`/api/calendar/insights?section=heat&entityType=${entityType}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch distribution");
        }

        setDistribution(data.data?.distribution || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDistribution();
  }, [entityType]);

  return { distribution, isLoading, error };
}
