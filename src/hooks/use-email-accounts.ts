"use client";

import { useState, useCallback, useEffect } from "react";
import { EmailProvider } from "@prisma/client";

// =============================================================================
// TYPES
// =============================================================================

export interface EmailAccount {
  id: string;
  provider: EmailProvider;
  email: string;
  lastSyncAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface UseEmailAccountsReturn {
  accounts: EmailAccount[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  connect: (provider: "gmail" | "office365") => Promise<string | null>;
  disconnect: (accountId: string) => Promise<boolean>;
  sync: (accountId?: string) => Promise<boolean>;
  isSyncing: boolean;
}

// =============================================================================
// HOOK
// =============================================================================

export function useEmailAccounts(): UseEmailAccountsReturn {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch accounts
  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/integrations/email/accounts");

      if (!response.ok) {
        throw new Error("Failed to fetch email accounts");
      }

      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching email accounts:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Connect new account - returns auth URL
  const connect = useCallback(async (provider: "gmail" | "office365"): Promise<string | null> => {
    try {
      const response = await fetch(
        `/api/integrations/email/connect?provider=${provider}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to initiate connection");
      }

      const data = await response.json();
      return data.authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error connecting email account:", err);
      return null;
    }
  }, []);

  // Disconnect account
  const disconnect = useCallback(async (accountId: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/integrations/email/accounts?id=${accountId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to disconnect account");
      }

      // Optimistic update
      setAccounts((prev) => prev.filter((a) => a.id !== accountId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error disconnecting email account:", err);
      await refetch(); // Revert
      return false;
    }
  }, [refetch]);

  // Sync emails
  const sync = useCallback(async (accountId?: string): Promise<boolean> => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/integrations/email/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });

      if (!response.ok) {
        throw new Error("Failed to sync emails");
      }

      // Refetch accounts to update lastSyncAt
      await refetch();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error syncing emails:", err);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [refetch]);

  return {
    accounts,
    isLoading,
    error,
    refetch,
    connect,
    disconnect,
    sync,
    isSyncing,
  };
}
