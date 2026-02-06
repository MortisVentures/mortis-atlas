"use client";

import { useState, useCallback, useEffect } from "react";
import { Meeting } from "@/components/activities";

// =============================================================================
// TYPES
// =============================================================================

export interface UseMeetingsOptions {
  companyId?: string;
  dealId?: string;
  contactId?: string;
  limit?: number;
  autoFetch?: boolean;
}

export interface UseMeetingsReturn {
  meetings: Meeting[];
  isLoading: boolean;
  error: string | null;
  fetchMeetings: () => Promise<void>;
  markComplete: (id: string, completed: boolean) => Promise<boolean>;
  refetch: () => Promise<void>;
}

// =============================================================================
// HOOK
// =============================================================================

export function useMeetings(options: UseMeetingsOptions = {}): UseMeetingsReturn {
  const { companyId, dealId, contactId, limit = 20, autoFetch = true } = options;

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build query string
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    params.append("type", "MEETING");
    if (companyId) params.append("companyId", companyId);
    if (dealId) params.append("dealId", dealId);
    if (contactId) params.append("contactId", contactId);
    if (limit) params.append("limit", limit.toString());
    return params.toString();
  }, [companyId, dealId, contactId, limit]);

  // Fetch meetings from API
  const fetchMeetings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryString = buildQueryString();
      const response = await fetch(`/api/activities?${queryString}`);

      if (!response.ok) {
        throw new Error("Failed to fetch meetings");
      }

      const data = await response.json();

      // Transform API response to Meeting format
      const transformedMeetings: Meeting[] = (data.data || []).map(
        (activity: {
          id: string;
          subject: string;
          description: string | null;
          activityDate: string;
          completed: boolean;
          company: { id: string; name: string } | null;
          deal: { id: string; dealName: string } | null;
          contact: { id: string; firstName: string; lastName: string } | null;
        }) => ({
          id: activity.id,
          subject: activity.subject,
          description: activity.description,
          activityDate: activity.activityDate,
          completed: activity.completed,
          company: activity.company,
          deal: activity.deal,
          contact: activity.contact,
        })
      );

      setMeetings(transformedMeetings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching meetings:", err);
    } finally {
      setIsLoading(false);
    }
  }, [buildQueryString]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchMeetings();
    }
  }, [autoFetch, fetchMeetings]);

  // Mark meeting as complete
  const markComplete = useCallback(
    async (id: string, completed: boolean): Promise<boolean> => {
      // Optimistic update
      setMeetings((prev) =>
        prev.map((meeting) =>
          meeting.id === id ? { ...meeting, completed } : meeting
        )
      );

      try {
        const response = await fetch(`/api/activities/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed }),
        });

        if (!response.ok) {
          throw new Error("Failed to update meeting");
        }

        return true;
      } catch (err) {
        console.error("Error marking meeting complete:", err);
        // Revert on error
        setMeetings((prev) =>
          prev.map((meeting) =>
            meeting.id === id ? { ...meeting, completed: !completed } : meeting
          )
        );
        setError(err instanceof Error ? err.message : "Failed to update");
        return false;
      }
    },
    []
  );

  // Refetch is just an alias for fetchMeetings
  const refetch = fetchMeetings;

  return {
    meetings,
    isLoading,
    error,
    fetchMeetings,
    markComplete,
    refetch,
  };
}
