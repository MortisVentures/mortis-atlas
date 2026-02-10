// =============================================================================
// INSIGHTS ENGINE - THRESHOLDS & CONFIDENCE
// =============================================================================

import type { ConfidenceLevel, DataConfidence } from "./types";

// =============================================================================
// DATA THRESHOLDS
// =============================================================================

/**
 * Minimum data points required before showing certain insights.
 * These thresholds help prevent misleading patterns from sparse data.
 */
export const DATA_THRESHOLDS = {
  /** Minimum deals to show any pattern */
  MIN_FOR_PATTERN: 3,

  /** Minimum deals before calculating correlations */
  MIN_FOR_CORRELATION: 5,

  /** Minimum deals for "low confidence" indicator */
  LOW_CONFIDENCE: 5,

  /** Minimum deals for "medium confidence" indicator */
  MEDIUM_CONFIDENCE: 10,

  /** Minimum deals for "high confidence" indicator */
  HIGH_CONFIDENCE: 20,

  /** Minimum IC memos with decisions for outcome learning */
  MIN_MEMOS_FOR_OUTCOMES: 5,

  /** Minimum data points for trend analysis */
  MIN_FOR_TRENDS: 6,

  /** Time periods to include in velocity charts (months) */
  VELOCITY_MONTHS: 6,

  /** Time periods for trend analysis (months) */
  TREND_MONTHS: 12,
} as const;

// =============================================================================
// CONFIDENCE CALCULATION
// =============================================================================

/**
 * Calculate confidence level based on sample size
 */
export function getConfidence(sampleSize: number): ConfidenceLevel {
  if (sampleSize >= DATA_THRESHOLDS.HIGH_CONFIDENCE) return "high";
  if (sampleSize >= DATA_THRESHOLDS.MEDIUM_CONFIDENCE) return "medium";
  return "low";
}

/**
 * Get full confidence object with message
 */
export function getDataConfidence(sampleSize: number, dataType = "deals"): DataConfidence {
  const level = getConfidence(sampleSize);

  const messages: Record<ConfidenceLevel, string> = {
    low: `Based on ${sampleSize} ${dataType} — results may vary with more data`,
    medium: `Based on ${sampleSize} ${dataType} — patterns are emerging`,
    high: `Based on ${sampleSize} ${dataType} — high confidence in results`,
  };

  return {
    level,
    sampleSize,
    message: messages[level],
  };
}

/**
 * Check if we have enough data to show a metric
 */
export function hasEnoughData(
  sampleSize: number,
  threshold: keyof typeof DATA_THRESHOLDS = "MIN_FOR_PATTERN"
): boolean {
  return sampleSize >= DATA_THRESHOLDS[threshold];
}

// =============================================================================
// INSIGHT SEVERITY THRESHOLDS
// =============================================================================

/**
 * Thresholds for conversion rate signals
 */
export const CONVERSION_THRESHOLDS = {
  EXCELLENT: 0.4, // 40%+
  GOOD: 0.25,     // 25%+
  AVERAGE: 0.15,  // 15%+
  POOR: 0.10,     // 10%+
  // Below 10% is "very poor"
} as const;

/**
 * Thresholds for time-to-close signals (days)
 */
export const TIME_TO_CLOSE_THRESHOLDS = {
  FAST: 45,    // Under 45 days is fast
  NORMAL: 90,  // 45-90 days is normal
  SLOW: 120,   // 90-120 is slow
  // Over 120 days is very slow
} as const;

/**
 * Thresholds for stage bottleneck detection (days)
 */
export const BOTTLENECK_THRESHOLDS = {
  INITIAL_REVIEW: 14,
  MEETING_SCHEDULED: 21,
  DEEP_DIVE: 30,
  PARTNER_REVIEW: 14,
  TERM_SHEET: 21,
  LEGAL_DILIGENCE: 30,
} as const;

// =============================================================================
// PATTERN DETECTION THRESHOLDS
// =============================================================================

/**
 * Thresholds for detecting significant patterns
 */
export const PATTERN_THRESHOLDS = {
  /** Minimum approval rate difference to flag a pattern */
  APPROVAL_RATE_DIFF: 0.2, // 20% difference

  /** Minimum occurrence percentage to consider a pattern significant */
  SIGNIFICANT_OCCURRENCE: 0.3, // 30% of cases

  /** Maximum relative standard deviation for consistent patterns */
  CONSISTENCY_THRESHOLD: 0.3, // 30% RSD
} as const;

// =============================================================================
// SPARSE DATA MESSAGES
// =============================================================================

export const SPARSE_DATA_MESSAGES = {
  NO_DATA: "No data available yet. Start tracking deals to see insights.",

  INSUFFICIENT_DEALS: (count: number) =>
    `Only ${count} deals tracked. Add more deals for meaningful insights.`,

  INSUFFICIENT_MEMOS: (count: number) =>
    `Only ${count} IC memos with decisions. Complete more IC reviews for outcome patterns.`,

  INSUFFICIENT_HISTORY: (months: number) =>
    `Only ${months} months of data. Trends require at least ${DATA_THRESHOLDS.MIN_FOR_TRENDS} months.`,

  SOURCE_INSUFFICIENT: (source: string, count: number) =>
    `Only ${count} deals from ${source}. Need ${DATA_THRESHOLDS.MIN_FOR_CORRELATION} for reliable metrics.`,

  CORRELATION_INSUFFICIENT: (field: string, count: number) =>
    `Only ${count} memos have ${field} data. More data needed for correlations.`,
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

/**
 * Format days for display
 */
export function formatDays(days: number): string {
  if (days < 1) return "< 1 day";
  if (days === 1) return "1 day";
  if (days < 30) return `${Math.round(days)} days`;
  if (days < 60) return "~1 month";
  if (days < 365) return `${Math.round(days / 30)} months`;
  return `${(days / 365).toFixed(1)} years`;
}

/**
 * Get severity based on conversion rate
 */
export function getConversionSeverity(rate: number): "success" | "info" | "warning" | "alert" {
  if (rate >= CONVERSION_THRESHOLDS.EXCELLENT) return "success";
  if (rate >= CONVERSION_THRESHOLDS.GOOD) return "info";
  if (rate >= CONVERSION_THRESHOLDS.AVERAGE) return "warning";
  return "alert";
}

/**
 * Get severity based on time to close
 */
export function getTimeSeverity(days: number): "success" | "info" | "warning" | "alert" {
  if (days <= TIME_TO_CLOSE_THRESHOLDS.FAST) return "success";
  if (days <= TIME_TO_CLOSE_THRESHOLDS.NORMAL) return "info";
  if (days <= TIME_TO_CLOSE_THRESHOLDS.SLOW) return "warning";
  return "alert";
}
