"use client";

import { useState, useCallback, useEffect } from "react";

// =============================================================================
// TYPES
// =============================================================================

export interface CompanyMatch {
  id: string;
  name: string;
  website: string | null;
  confidence: number;
  matchReason: "domain" | "name" | "both";
}

export interface Proposal {
  id: string;
  email: string;
  name: string | null;
  domain: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  messageCount: number;
  threadCount: number;
  score: number;
  status: "PENDING" | "CREATED_CONTACT" | "CREATED_COMPANY" | "LINKED_EXISTING" | "DISMISSED";
  recentSubjects: string[];
  domainInfo: {
    domain: string;
    companyName: string | null;
    websiteUrl: string | null;
  };
  parsedName: {
    firstName?: string;
    lastName?: string;
  };
  companyMatches: CompanyMatch[];
  signatureInfo?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    title?: string;
    company?: string;
    phone?: string;
    linkedIn?: string;
    twitter?: string;
    website?: string;
  };
}

export interface ProposalStats {
  pending: number;
  highPriority: number;
  thisWeek: number;
}

export interface ProposalPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface UseProposalsOptions {
  status?: "PENDING" | "DISMISSED";
  limit?: number;
  minScore?: number;
  autoFetch?: boolean;
}

export interface UseProposalsReturn {
  proposals: Proposal[];
  stats: ProposalStats | null;
  pagination: ProposalPagination | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  createContact: (
    proposalId: string,
    data: {
      firstName: string;
      lastName: string;
      role?: string;
      phone?: string;
      linkedinUrl?: string;
      companyId?: string;
      createCompany?: { name: string; website?: string };
    }
  ) => Promise<{ success: boolean; contactId?: string; companyId?: string; error?: string }>;
  linkToContact: (
    proposalId: string,
    contactId: string
  ) => Promise<{ success: boolean; error?: string }>;
  dismiss: (
    proposalId: string,
    reason?: string
  ) => Promise<{ success: boolean; error?: string }>;
}

// =============================================================================
// HOOK
// =============================================================================

export function useProposals(options: UseProposalsOptions = {}): UseProposalsReturn {
  const {
    status = "PENDING",
    limit = 50,
    minScore = 0,
    autoFetch = true,
  } = options;

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState<ProposalStats | null>(null);
  const [pagination, setPagination] = useState<ProposalPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch proposals
  const fetchProposals = useCallback(
    async (offset = 0, append = false) => {
      if (!append) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams({
          status,
          limit: limit.toString(),
          offset: offset.toString(),
          minScore: minScore.toString(),
          includeStats: "true",
        });

        const response = await fetch(`/api/proposals?${params}`);

        if (!response.ok) {
          throw new Error("Failed to fetch proposals");
        }

        const data = await response.json();

        if (append) {
          setProposals((prev) => [...prev, ...data.proposals]);
        } else {
          setProposals(data.proposals);
        }

        setPagination(data.pagination);
        setStats(data.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching proposals:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [status, limit, minScore]
  );

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchProposals();
    }
  }, [autoFetch, fetchProposals]);

  // Load more
  const loadMore = useCallback(async () => {
    if (pagination && pagination.hasMore) {
      await fetchProposals(pagination.offset + pagination.limit, true);
    }
  }, [pagination, fetchProposals]);

  // Refetch
  const refetch = useCallback(async () => {
    await fetchProposals(0, false);
  }, [fetchProposals]);

  // Create contact from proposal
  const createContact = useCallback(
    async (
      proposalId: string,
      data: {
        firstName: string;
        lastName: string;
        role?: string;
        phone?: string;
        linkedinUrl?: string;
        companyId?: string;
        createCompany?: { name: string; website?: string };
      }
    ) => {
      try {
        const response = await fetch(`/api/proposals/${proposalId}/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          return { success: false, error: result.error || "Failed to create contact" };
        }

        // Remove from local state
        setProposals((prev) => prev.filter((p) => p.id !== proposalId));

        // Update stats
        if (stats) {
          setStats({
            ...stats,
            pending: Math.max(0, stats.pending - 1),
          });
        }

        return {
          success: true,
          contactId: result.contactId,
          companyId: result.companyId,
        };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "An error occurred",
        };
      }
    },
    [stats]
  );

  // Link to existing contact
  const linkToContact = useCallback(
    async (proposalId: string, contactId: string) => {
      try {
        const response = await fetch(`/api/proposals/${proposalId}/link`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contactId }),
        });

        const result = await response.json();

        if (!response.ok) {
          return { success: false, error: result.error || "Failed to link contact" };
        }

        // Remove from local state
        setProposals((prev) => prev.filter((p) => p.id !== proposalId));

        // Update stats
        if (stats) {
          setStats({
            ...stats,
            pending: Math.max(0, stats.pending - 1),
          });
        }

        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "An error occurred",
        };
      }
    },
    [stats]
  );

  // Dismiss proposal
  const dismiss = useCallback(
    async (proposalId: string, reason?: string) => {
      try {
        const response = await fetch(`/api/proposals/${proposalId}/dismiss`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        });

        const result = await response.json();

        if (!response.ok) {
          return { success: false, error: result.error || "Failed to dismiss" };
        }

        // Remove from local state
        setProposals((prev) => prev.filter((p) => p.id !== proposalId));

        // Update stats
        if (stats) {
          setStats({
            ...stats,
            pending: Math.max(0, stats.pending - 1),
          });
        }

        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "An error occurred",
        };
      }
    },
    [stats]
  );

  return {
    proposals,
    stats,
    pagination,
    isLoading,
    error,
    refetch,
    loadMore,
    createContact,
    linkToContact,
    dismiss,
  };
}
