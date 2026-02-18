"use client";

import { useState, useEffect, useCallback } from "react";
import { MeetingType } from "@prisma/client";

interface CalendarEventAttendee {
  id: string;
  email: string;
  name: string | null;
  responseStatus: string;
  isOrganizer: boolean;
  contact: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
  } | null;
}

interface CalendarEvent {
  id: string;
  externalId: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  location: string | null;
  meetingLink: string | null;
  organizerEmail: string;
  isAllDay: boolean;
  isRecurring: boolean;
  status: string;
  detectedType: MeetingType | null;
  typeConfidence: number | null;
  companyId: string | null;
  dealId: string | null;
  isAutoLinked: boolean;
  linkConfirmed: boolean;
  company: { id: string; name: string } | null;
  deal: { id: string; dealName: string; stage: string } | null;
  attendees: CalendarEventAttendee[];
  prepBrief?: {
    id: string;
    generatedAt: string;
    viewedAt: string | null;
  } | null;
}

interface UseCalendarOptions {
  upcoming?: boolean;
  startDate?: Date;
  endDate?: Date;
  companyId?: string;
  dealId?: string;
  detectedType?: MeetingType;
  limit?: number;
}

export function useCalendar(options: UseCalendarOptions = {}) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (options.upcoming) {
        params.append("upcoming", "true");
      }
      if (options.startDate) {
        params.append("startDate", options.startDate.toISOString());
      }
      if (options.endDate) {
        params.append("endDate", options.endDate.toISOString());
      }
      if (options.companyId) {
        params.append("companyId", options.companyId);
      }
      if (options.dealId) {
        params.append("dealId", options.dealId);
      }
      if (options.detectedType) {
        params.append("detectedType", options.detectedType);
      }
      if (options.limit) {
        params.append("limit", options.limit.toString());
      }

      const response = await fetch(`/api/calendar?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch calendar events");
      }

      setEvents(data.data || []);
      setTotal(data.pagination?.total || data.data?.length || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch events");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    options.upcoming,
    options.startDate,
    options.endDate,
    options.companyId,
    options.dealId,
    options.detectedType,
    options.limit,
  ]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Update event links
  const updateEventLinks = useCallback(
    async (
      eventId: string,
      data: {
        companyId?: string | null;
        dealId?: string | null;
        detectedType?: MeetingType | null;
        linkConfirmed?: boolean;
      }
    ): Promise<CalendarEvent | null> => {
      try {
        const response = await fetch(`/api/calendar/${eventId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to update event");
        }

        // Refresh events
        await fetchEvents();

        return result.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update event");
        return null;
      }
    },
    [fetchEvents]
  );

  return {
    events,
    isLoading,
    error,
    total,
    refresh: fetchEvents,
    updateEventLinks,
  };
}

/**
 * Hook for fetching upcoming events (convenience wrapper)
 */
export function useUpcomingMeetings(limit: number = 10) {
  return useCalendar({ upcoming: true, limit });
}
