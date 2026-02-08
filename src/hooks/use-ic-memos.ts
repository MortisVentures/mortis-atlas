"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ICMemoStatus,
  ICMemoRecommendation,
  ICMemoDecision,
  VoteType,
  ScoreRating,
} from "@prisma/client";
import type { ICMemoContent } from "@/lib/validations/ic-memo";

// =============================================================================
// TYPES
// =============================================================================

export interface ICMemoFromAPI {
  id: string;
  title: string;
  status: ICMemoStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  votingDeadline: string | null;

  // Thesis Alignment
  focusArea: string | null;
  stage: string | null;

  // Scores
  tripleUseScore: ScoreRating | null;
  wlcdiaScore: ScoreRating | null;
  expectedCostDecline: string | null;
  teamScore: ScoreRating | null;
  founderTechRating: number | null;
  founderBusinessRating: number | null;
  founderDesignRating: number | null;
  marketScore: ScoreRating | null;
  capitalEfficiencyScore: ScoreRating | null;

  // Market Sizing
  tam: string | null;
  sam: string | null;
  som: string | null;

  // Capital Metrics
  trlStage: number | null;
  monthlyBurn: string | null;
  runwayMonths: number | null;

  // Financial Terms
  askAmount: string | null;
  askValuation: string | null;
  preMoneyValuation: string | null;
  postMoneyValuation: string | null;
  roundSize: string | null;
  mortisInvestment: string | null;
  mortisOwnership: string | null;
  followOnReserve: string | null;

  // Projections
  projectedExitYears: number | null;
  targetExitLow: string | null;
  targetExitHigh: string | null;
  projectedMoicLow: string | null;
  projectedMoicHigh: string | null;

  // Decision
  memoRecommendation: ICMemoRecommendation | null;
  decisionRationale: string | null;
  finalDecision: ICMemoDecision | null;

  // Content
  content: ICMemoContent | null;

  // Relations
  company: {
    id: string;
    name: string;
    sector: string | null;
  };
  deal: {
    id: string;
    dealName: string;
  } | null;
  author: {
    id: string;
    name: string | null;
    email: string | null;
  };
  votes: Array<{
    id: string;
    vote: VoteType;
    comment: string | null;
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      email: string | null;
    };
  }>;
  _count: {
    votes: number;
    documents: number;
  };
}

export interface ICMemoStats {
  total: number;
  byStatus: Record<ICMemoStatus, number>;
  byRecommendation: Record<ICMemoRecommendation, number>;
  byDecision: Record<ICMemoDecision, number>;
}

export interface VoteSummary {
  total: number;
  yes: number;
  no: number;
  abstain: number;
}

export interface UseICMemosOptions {
  status?: ICMemoStatus | ICMemoStatus[];
  companyId?: string;
  dealId?: string;
  authorId?: string;
  recommendation?: ICMemoRecommendation;
  finalDecision?: ICMemoDecision;
  focusArea?: string;
  search?: string;
  limit?: number;
  offset?: number;
  autoFetch?: boolean;
}

export interface UseICMemosReturn {
  memos: ICMemoFromAPI[];
  isLoading: boolean;
  error: string | null;
  stats: ICMemoStats | null;
  fetchMemos: () => Promise<void>;
  fetchStats: () => Promise<void>;
  refetch: () => Promise<void>;
}

export interface UseICMemoDetailReturn {
  memo: ICMemoFromAPI | null;
  isLoading: boolean;
  error: string | null;
  votes: ICMemoFromAPI["votes"];
  voteSummary: VoteSummary;
  userVote: { id: string; vote: VoteType; comment: string | null } | null;
  castVote: (vote: VoteType, comment?: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

// =============================================================================
// useICMemos HOOK - List IC Memos
// =============================================================================

export function useICMemos(options: UseICMemosOptions = {}): UseICMemosReturn {
  const {
    status,
    companyId,
    dealId,
    authorId,
    recommendation,
    finalDecision,
    focusArea,
    search,
    limit = 50,
    offset = 0,
    autoFetch = true,
  } = options;

  const [memos, setMemos] = useState<ICMemoFromAPI[]>([]);
  const [stats, setStats] = useState<ICMemoStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build query string
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (status) {
      params.append("status", Array.isArray(status) ? status.join(",") : status);
    }
    if (companyId) params.append("companyId", companyId);
    if (dealId) params.append("dealId", dealId);
    if (authorId) params.append("authorId", authorId);
    if (recommendation) params.append("recommendation", recommendation);
    if (finalDecision) params.append("finalDecision", finalDecision);
    if (focusArea) params.append("focusArea", focusArea);
    if (search) params.append("search", search);
    if (limit) params.append("limit", limit.toString());
    if (offset) params.append("offset", offset.toString());
    return params.toString();
  }, [status, companyId, dealId, authorId, recommendation, finalDecision, focusArea, search, limit, offset]);

  // Fetch memos from API
  const fetchMemos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryString = buildQueryString();
      const response = await fetch(`/api/ic-memos?${queryString}`);

      if (!response.ok) {
        throw new Error("Failed to fetch IC memos");
      }

      const data = await response.json();
      setMemos(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching IC memos:", err);
    } finally {
      setIsLoading(false);
    }
  }, [buildQueryString]);

  // Fetch stats from API
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/ic-memos?stats=true");

      if (!response.ok) {
        throw new Error("Failed to fetch IC memo stats");
      }

      const data = await response.json();
      setStats(data.data || null);
    } catch (err) {
      console.error("Error fetching IC memo stats:", err);
    }
  }, []);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchMemos();
      fetchStats();
    }
  }, [autoFetch, fetchMemos, fetchStats]);

  // Refetch is an alias for fetchMemos + fetchStats
  const refetch = useCallback(async () => {
    await Promise.all([fetchMemos(), fetchStats()]);
  }, [fetchMemos, fetchStats]);

  return {
    memos,
    isLoading,
    error,
    stats,
    fetchMemos,
    fetchStats,
    refetch,
  };
}

// =============================================================================
// useICMemoDetail HOOK - Single IC Memo with Voting
// =============================================================================

export function useICMemoDetail(id: string | null): UseICMemoDetailReturn {
  const [memo, setMemo] = useState<ICMemoFromAPI | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<{ id: string; vote: VoteType; comment: string | null } | null>(null);

  // Fetch memo from API
  const fetchMemo = useCallback(async () => {
    if (!id) {
      setMemo(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [memoRes, votesRes] = await Promise.all([
        fetch(`/api/ic-memos/${id}`),
        fetch(`/api/ic-memos/${id}/votes`),
      ]);

      if (!memoRes.ok) {
        throw new Error("Failed to fetch IC memo");
      }

      const memoData = await memoRes.json();
      setMemo(memoData.data || null);

      if (votesRes.ok) {
        const votesData = await votesRes.json();
        setUserVote(votesData.data?.userVote || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching IC memo:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Auto-fetch on mount and when id changes
  useEffect(() => {
    fetchMemo();
  }, [fetchMemo]);

  // Calculate vote summary
  const voteSummary = useMemo((): VoteSummary => {
    if (!memo?.votes) {
      return { total: 0, yes: 0, no: 0, abstain: 0 };
    }
    return {
      total: memo.votes.length,
      yes: memo.votes.filter((v) => v.vote === "YES").length,
      no: memo.votes.filter((v) => v.vote === "NO").length,
      abstain: memo.votes.filter((v) => v.vote === "ABSTAIN").length,
    };
  }, [memo?.votes]);

  // Cast a vote
  const castVote = useCallback(async (vote: VoteType, comment?: string): Promise<boolean> => {
    if (!id) return false;

    try {
      const response = await fetch(`/api/ic-memos/${id}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote, comment }),
      });

      if (!response.ok) {
        throw new Error("Failed to cast vote");
      }

      // Refetch to get updated data
      await fetchMemo();
      return true;
    } catch (err) {
      console.error("Error casting vote:", err);
      return false;
    }
  }, [id, fetchMemo]);

  return {
    memo,
    isLoading,
    error,
    votes: memo?.votes || [],
    voteSummary,
    userVote,
    castVote,
    refetch: fetchMemo,
  };
}

// =============================================================================
// useCreateICMemo HOOK - Create/Update IC Memo
// =============================================================================

export interface CreateICMemoData {
  title: string;
  companyId: string;
  dealId?: string | null;
  focusArea?: string | null;
  stage?: string | null;
  tripleUseScore?: ScoreRating | null;
  wlcdiaScore?: ScoreRating | null;
  expectedCostDecline?: number | null;
  teamScore?: ScoreRating | null;
  founderTechRating?: number | null;
  founderBusinessRating?: number | null;
  founderDesignRating?: number | null;
  marketScore?: ScoreRating | null;
  capitalEfficiencyScore?: ScoreRating | null;
  tam?: number | null;
  sam?: number | null;
  som?: number | null;
  trlStage?: number | null;
  monthlyBurn?: number | null;
  runwayMonths?: number | null;
  askAmount?: number | null;
  askValuation?: number | null;
  preMoneyValuation?: number | null;
  postMoneyValuation?: number | null;
  roundSize?: number | null;
  mortisInvestment?: number | null;
  mortisOwnership?: number | null;
  followOnReserve?: number | null;
  projectedExitYears?: number | null;
  targetExitLow?: number | null;
  targetExitHigh?: number | null;
  projectedMoicLow?: number | null;
  projectedMoicHigh?: number | null;
  memoRecommendation?: ICMemoRecommendation | null;
  decisionRationale?: string | null;
  content?: ICMemoContent | null;
  votingDeadline?: Date | null;
}

export interface UseCreateICMemoReturn {
  isCreating: boolean;
  isSubmitting: boolean;
  error: string | null;
  createMemo: (data: CreateICMemoData) => Promise<{ id: string } | null>;
  updateMemo: (id: string, data: Partial<CreateICMemoData>) => Promise<boolean>;
  submitMemo: (id: string) => Promise<boolean>;
  deleteMemo: (id: string) => Promise<boolean>;
}

export function useCreateICMemo(): UseCreateICMemoReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMemo = useCallback(async (data: CreateICMemoData): Promise<{ id: string } | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/ic-memos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to create IC memo");
      }

      const result = await response.json();
      return { id: result.data.id };
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      console.error("Error creating IC memo:", err);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const updateMemo = useCallback(async (id: string, data: Partial<CreateICMemoData>): Promise<boolean> => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch(`/api/ic-memos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update IC memo");
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      console.error("Error updating IC memo:", err);
      return false;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const submitMemo = useCallback(async (id: string): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/ic-memos/${id}/submit`, {
        method: "POST",
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to submit IC memo");
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      console.error("Error submitting IC memo:", err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const deleteMemo = useCallback(async (id: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await fetch(`/api/ic-memos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to delete IC memo");
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      console.error("Error deleting IC memo:", err);
      return false;
    }
  }, []);

  return {
    isCreating,
    isSubmitting,
    error,
    createMemo,
    updateMemo,
    submitMemo,
    deleteMemo,
  };
}
