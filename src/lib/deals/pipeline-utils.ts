import { DealStage, DealPriority, DealSource } from "@prisma/client";
import { DealWithRelations } from "@/lib/db/deals";

// =============================================================================
// STAGE CONFIGURATION
// =============================================================================

export interface StageConfig {
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
  probability: number;
  icon: string;
}

export const STAGE_ORDER: DealStage[] = [
  DealStage.INITIAL_REVIEW,
  DealStage.MEETING_SCHEDULED,
  DealStage.DEEP_DIVE,
  DealStage.PARTNER_REVIEW,
  DealStage.TERM_SHEET,
  DealStage.LEGAL_DILIGENCE,
  DealStage.CLOSED_WON,
  DealStage.CLOSED_LOST,
];

// Active stages for Kanban (exclude closed)
export const ACTIVE_STAGES: DealStage[] = [
  DealStage.INITIAL_REVIEW,
  DealStage.MEETING_SCHEDULED,
  DealStage.DEEP_DIVE,
  DealStage.PARTNER_REVIEW,
  DealStage.TERM_SHEET,
  DealStage.LEGAL_DILIGENCE,
];

export const CLOSED_STAGES: DealStage[] = [
  DealStage.CLOSED_WON,
  DealStage.CLOSED_LOST,
];

export const STAGE_CONFIG: Record<DealStage, StageConfig> = {
  INITIAL_REVIEW: {
    label: "Initial Review",
    shortLabel: "Review",
    color: "slate",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
    textColor: "text-slate-400",
    description: "First look at the opportunity",
    probability: 10,
    icon: "eye",
  },
  MEETING_SCHEDULED: {
    label: "Meeting Scheduled",
    shortLabel: "Meeting",
    color: "blue",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-400",
    description: "Initial meeting set up",
    probability: 20,
    icon: "calendar",
  },
  DEEP_DIVE: {
    label: "Deep Dive",
    shortLabel: "Deep Dive",
    color: "indigo",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
    textColor: "text-indigo-400",
    description: "Detailed analysis in progress",
    probability: 40,
    icon: "search",
  },
  PARTNER_REVIEW: {
    label: "Partner Review",
    shortLabel: "Partner",
    color: "purple",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-400",
    description: "Internal partner discussion",
    probability: 60,
    icon: "users",
  },
  TERM_SHEET: {
    label: "Term Sheet",
    shortLabel: "Terms",
    color: "amber",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    textColor: "text-amber-400",
    description: "Terms being negotiated",
    probability: 75,
    icon: "file-text",
  },
  LEGAL_DILIGENCE: {
    label: "Legal Diligence",
    shortLabel: "Legal",
    color: "orange",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    textColor: "text-orange-400",
    description: "Legal review in progress",
    probability: 90,
    icon: "scale",
  },
  CLOSED_WON: {
    label: "Closed Won",
    shortLabel: "Won",
    color: "emerald",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    textColor: "text-emerald-400",
    description: "Deal completed successfully",
    probability: 100,
    icon: "check-circle",
  },
  CLOSED_LOST: {
    label: "Closed Lost",
    shortLabel: "Lost",
    color: "red",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    textColor: "text-red-400",
    description: "Deal did not close",
    probability: 0,
    icon: "x-circle",
  },
};

// =============================================================================
// PRIORITY CONFIGURATION
// =============================================================================

export interface PriorityConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
}

export const PRIORITY_CONFIG: Record<DealPriority, PriorityConfig> = {
  HIGH: {
    label: "High",
    color: "red",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    textColor: "text-red-400",
    icon: "arrow-up",
  },
  MEDIUM: {
    label: "Medium",
    color: "amber",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    textColor: "text-amber-400",
    icon: "minus",
  },
  LOW: {
    label: "Low",
    color: "slate",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
    textColor: "text-slate-400",
    icon: "arrow-down",
  },
};

// =============================================================================
// SOURCE CONFIGURATION
// =============================================================================

export interface SourceConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

export const SOURCE_CONFIG: Record<DealSource, SourceConfig> = {
  REFERRAL: {
    label: "Referral",
    color: "emerald",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    textColor: "text-emerald-400",
  },
  DIRECT_OUTREACH: {
    label: "Direct Outreach",
    color: "slate",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
    textColor: "text-slate-400",
  },
  INBOUND: {
    label: "Inbound",
    color: "blue",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-400",
  },
  CONFERENCE: {
    label: "Conference",
    color: "purple",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-400",
  },
  ACCELERATOR: {
    label: "Accelerator",
    color: "red",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    textColor: "text-red-400",
  },
  NETWORK: {
    label: "Network",
    color: "cyan",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    textColor: "text-cyan-400",
  },
  PORTFOLIO: {
    label: "Portfolio",
    color: "amber",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    textColor: "text-amber-400",
  },
  INVESTOR_NETWORK: {
    label: "Investor Network",
    color: "indigo",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
    textColor: "text-indigo-400",
  },
  OTHER: {
    label: "Other",
    color: "zinc",
    bgColor: "bg-zinc-500/10",
    borderColor: "border-zinc-500/30",
    textColor: "text-zinc-400",
  },
};

// =============================================================================
// ROUND TYPE OPTIONS
// =============================================================================

export const ROUND_TYPES = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C",
  "Series D+",
  "Bridge",
  "Convertible Note",
  "SAFE",
] as const;

export type RoundType = (typeof ROUND_TYPES)[number];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate days in current stage
 */
export function getDaysInStage(lastStageChange: Date | null): number {
  if (!lastStageChange) return 0;
  const now = new Date();
  const diff = now.getTime() - new Date(lastStageChange).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format days in stage for display
 */
export function formatDaysInStage(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""}`;
  }
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""}`;
}

/**
 * Get urgency level based on days in stage
 */
export function getUrgencyLevel(
  days: number,
  stage: DealStage
): "normal" | "warning" | "critical" {
  // Different thresholds based on stage
  const thresholds: Record<DealStage, { warning: number; critical: number }> = {
    INITIAL_REVIEW: { warning: 7, critical: 14 },
    MEETING_SCHEDULED: { warning: 5, critical: 10 },
    DEEP_DIVE: { warning: 14, critical: 21 },
    PARTNER_REVIEW: { warning: 7, critical: 14 },
    TERM_SHEET: { warning: 14, critical: 21 },
    LEGAL_DILIGENCE: { warning: 21, critical: 30 },
    CLOSED_WON: { warning: 999, critical: 999 },
    CLOSED_LOST: { warning: 999, critical: 999 },
  };

  const { warning, critical } = thresholds[stage];
  if (days >= critical) return "critical";
  if (days >= warning) return "warning";
  return "normal";
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "-";
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

/**
 * Group deals by stage
 */
export function groupDealsByStage(
  deals: DealWithRelations[]
): Map<DealStage, DealWithRelations[]> {
  const grouped = new Map<DealStage, DealWithRelations[]>();

  // Initialize all stages with empty arrays
  for (const stage of STAGE_ORDER) {
    grouped.set(stage, []);
  }

  // Group deals
  for (const deal of deals) {
    const stageDeals = grouped.get(deal.stage) || [];
    stageDeals.push(deal);
    grouped.set(deal.stage, stageDeals);
  }

  return grouped;
}

/**
 * Calculate pipeline metrics
 */
export interface PipelineMetrics {
  totalDeals: number;
  totalValue: number;
  weightedValue: number;
  avgDealSize: number;
  byStage: Record<DealStage, { count: number; value: number }>;
  byPriority: Record<DealPriority, number>;
}

export function calculatePipelineMetrics(
  deals: DealWithRelations[]
): PipelineMetrics {
  const metrics: PipelineMetrics = {
    totalDeals: deals.length,
    totalValue: 0,
    weightedValue: 0,
    avgDealSize: 0,
    byStage: {} as Record<DealStage, { count: number; value: number }>,
    byPriority: {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    },
  };

  // Initialize stage metrics
  for (const stage of STAGE_ORDER) {
    metrics.byStage[stage] = { count: 0, value: 0 };
  }

  let dealsWithValue = 0;

  for (const deal of deals) {
    const amount = deal.amount ? Number(deal.amount) : 0;

    // Total value
    metrics.totalValue += amount;
    if (amount > 0) dealsWithValue++;

    // Weighted value (by probability)
    const probability = STAGE_CONFIG[deal.stage].probability / 100;
    metrics.weightedValue += amount * probability;

    // By stage
    metrics.byStage[deal.stage].count++;
    metrics.byStage[deal.stage].value += amount;

    // By priority
    metrics.byPriority[deal.priority]++;
  }

  // Average deal size
  metrics.avgDealSize = dealsWithValue > 0 ? metrics.totalValue / dealsWithValue : 0;

  return metrics;
}

/**
 * Get next stage in pipeline
 */
export function getNextStage(currentStage: DealStage): DealStage | null {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex >= STAGE_ORDER.length - 1) {
    return null;
  }
  return STAGE_ORDER[currentIndex + 1];
}

/**
 * Get previous stage in pipeline
 */
export function getPreviousStage(currentStage: DealStage): DealStage | null {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  if (currentIndex <= 0) {
    return null;
  }
  return STAGE_ORDER[currentIndex - 1];
}

/**
 * Check if stage is a closed state
 */
export function isClosedStage(stage: DealStage): boolean {
  return CLOSED_STAGES.includes(stage);
}

/**
 * Sort deals by priority and then by days in stage
 */
export function sortDealsByPriority(deals: DealWithRelations[]): DealWithRelations[] {
  const priorityOrder: Record<DealPriority, number> = {
    HIGH: 0,
    MEDIUM: 1,
    LOW: 2,
  };

  return [...deals].sort((a, b) => {
    // First by priority
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by days in stage (longer = higher priority)
    const daysA = getDaysInStage(a.lastStageChange);
    const daysB = getDaysInStage(b.lastStageChange);
    return daysB - daysA;
  });
}
