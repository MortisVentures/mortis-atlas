"use client";

import { useState, useEffect, useCallback } from "react";
import { MeetingPrepBriefData } from "@/lib/integrations/calendar/types";

interface MeetingPrepBrief extends MeetingPrepBriefData {
  id: string;
  eventId: string;
  generatedAt: string;
  viewedAt: string | null;
}

export function useMeetingPrep(eventId: string | null) {
  const [brief, setBrief] = useState<MeetingPrepBrief | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBrief = useCallback(async (regenerate: boolean = false) => {
    if (!eventId) {
      setBrief(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = regenerate ? "?regenerate=true" : "";
      const response = await fetch(`/api/calendar/prep/${eventId}${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch meeting prep");
      }

      setBrief(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prep");
      setBrief(null);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchBrief();
  }, [fetchBrief]);

  const regenerate = useCallback(() => {
    return fetchBrief(true);
  }, [fetchBrief]);

  return {
    brief,
    isLoading,
    error,
    regenerate,
    refresh: fetchBrief,
  };
}
