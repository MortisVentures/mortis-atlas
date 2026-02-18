"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarProvider } from "@prisma/client";

interface CalendarAccount {
  id: string;
  provider: CalendarProvider;
  email: string;
  calendarId: string;
  lastSyncAt: string | null;
  isActive: boolean;
  createdAt: string;
}

interface SyncResult {
  eventsProcessed: number;
  eventsCreated: number;
  eventsUpdated: number;
  attendeesMatched: number;
  errors: string[];
}

export function useCalendarAccounts() {
  const [accounts, setAccounts] = useState<CalendarAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch accounts
  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/calendar/accounts");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch calendar accounts");
      }

      setAccounts(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch accounts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load accounts on mount
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Connect a new calendar account
  const connect = useCallback(async (provider: "google" | "office365"): Promise<string | null> => {
    try {
      setError(null);

      // Only Google is supported for now
      if (provider !== "google") {
        setError("Only Google Calendar is currently supported");
        return null;
      }

      const response = await fetch("/api/calendar/connect");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate OAuth URL");
      }

      return data.authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
      return null;
    }
  }, []);

  // Disconnect a calendar account
  const disconnect = useCallback(async (accountId: string): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch(`/api/calendar/accounts?id=${accountId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to disconnect account");
      }

      // Refresh accounts list
      await fetchAccounts();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect");
      return false;
    }
  }, [fetchAccounts]);

  // Sync calendar accounts
  const sync = useCallback(async (accountId?: string): Promise<SyncResult | null> => {
    try {
      setIsSyncing(true);
      setError(null);

      const response = await fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync calendar");
      }

      // Refresh accounts list to get updated lastSyncAt
      await fetchAccounts();

      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync");
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [fetchAccounts]);

  return {
    accounts,
    isLoading,
    error,
    isSyncing,
    connect,
    disconnect,
    sync,
    refresh: fetchAccounts,
  };
}
