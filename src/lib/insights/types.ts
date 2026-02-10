// =============================================================================
// INSIGHTS ENGINE - TYPES
// =============================================================================

import { DealStage, DealSource, ScoreRating } from "@prisma/client";

// =============================================================================
// CONFIDENCE & DATA QUALITY
// =============================================================================

export type ConfidenceLevel = "low" | "medium" | "high";

export interface DataConfidence {
  level: ConfidenceLevel;
  sampleSize: number;
  message: string;
}

// =============================================================================
// OVERVIEW INSIGHTS
// =============================================================================

export interface OverviewKPI {
  label: string;
  value: number | string;
  change?: number; // Percentage change from previous period
  changeLabel?: string;
  trend?: "up" | "down" | "neutral";
  confidence: DataConfidence;
}

export interface OverviewInsight {
  id: string;
  type: "signal" | "pattern" | "recommendation";
  title: string;
  description: string;
  severity: "info" | "warning" | "success" | "alert";
  confidence: DataConfidence;
  relatedDeals?: string[];
  actionUrl?: string;
}

export interface OverviewData {
  kpis: {
    totalDeals: OverviewKPI;
    conversionRate: OverviewKPI;
    avgTimeToClose: OverviewKPI;
    pipelineValue: OverviewKPI;
    portfolioValue: OverviewKPI;
    activeDeals: OverviewKPI;
  };
  insights: OverviewInsight[];
  topSignals: OverviewInsight[];
}

// =============================================================================
// DEAL FLOW ANALYTICS
// =============================================================================

export interface SourceEffectiveness {
  source: DealSource;
  label: string;
  totalDeals: number;
  wonDeals: number;
  lostDeals: number;
  pendingDeals: number;
  conversionRate: number;
  avgTimeToClose: number;
  totalInvested: number;
  avgDealSize: number;
  confidence: DataConfidence;
}

export interface StageMetrics {
  stage: DealStage;
  label: string;
  count: number;
  avgTimeInStage: number; // Days
  conversionToNext: number; // Percentage
  dropoffRate: number; // Percentage
  confidence: DataConfidence;
}

export interface TimeInStageData {
  stage: DealStage;
  label: string;
  avgDays: number;
  medianDays: number;
  minDays: number;
  maxDays: number;
  dealCount: number;
}

export interface DealVelocity {
  period: string; // "2024-01", "2024-02", etc.
  newDeals: number;
  closedWon: number;
  closedLost: number;
  netChange: number;
}

export interface DealFlowData {
  sourceEffectiveness: SourceEffectiveness[];
  stageMetrics: StageMetrics[];
  timeInStage: TimeInStageData[];
  velocity: DealVelocity[];
  funnelConversion: {
    stage: string;
    count: number;
    percentage: number;
  }[];
}

// =============================================================================
// OUTCOME LEARNING (IC MEMO CORRELATIONS)
// =============================================================================

export interface RatingCorrelation {
  rating: number; // 1-5
  approved: number;
  declined: number;
  deferred: number;
  total: number;
  approvalRate: number;
}

export interface FounderRatingMatrix {
  techRatings: RatingCorrelation[];
  businessRatings: RatingCorrelation[];
  designRatings: RatingCorrelation[];
  combinedInsight: string;
  confidence: DataConfidence;
}

export interface ScoreCorrelation {
  score: ScoreRating;
  label: string;
  approved: number;
  declined: number;
  deferred: number;
  total: number;
  approvalRate: number;
}

export interface ScoreEffectiveness {
  tripleUse: ScoreCorrelation[];
  wlcdia: ScoreCorrelation[];
  team: ScoreCorrelation[];
  market: ScoreCorrelation[];
  capitalEfficiency: ScoreCorrelation[];
  bestPredictor: string;
  confidence: DataConfidence;
}

export interface DecisionPattern {
  id: string;
  pattern: string;
  description: string;
  occurrences: number;
  outcome: "positive" | "negative" | "neutral";
  examples: string[];
  confidence: DataConfidence;
}

export interface OutcomeLearningData {
  founderMatrix: FounderRatingMatrix;
  scoreEffectiveness: ScoreEffectiveness;
  patterns: DecisionPattern[];
  summary: {
    totalMemos: number;
    withDecisions: number;
    approvedCount: number;
    declinedCount: number;
    deferredCount: number;
    avgApprovalRate: number;
  };
}

// =============================================================================
// TRENDS
// =============================================================================

export interface TrendDataPoint {
  period: string;
  value: number;
  label?: string;
}

export interface SectorTrend {
  sector: string;
  dealCount: number;
  percentageOfTotal: number;
  change: number; // Change from previous period
  avgDealSize: number;
}

export interface ValuationTrend {
  period: string;
  avgValuation: number;
  medianValuation: number;
  dealCount: number;
}

export interface TrendsData {
  dealVolume: TrendDataPoint[];
  sectorDistribution: SectorTrend[];
  valuationTrends: ValuationTrend[];
  sourceShifts: {
    source: DealSource;
    label: string;
    currentPeriod: number;
    previousPeriod: number;
    change: number;
  }[];
  stageTrends: {
    stage: DealStage;
    label: string;
    trend: TrendDataPoint[];
  }[];
}

// =============================================================================
// COMBINED INSIGHTS RESPONSE
// =============================================================================

export interface InsightsResponse {
  overview?: OverviewData;
  dealFlow?: DealFlowData;
  outcomes?: OutcomeLearningData;
  trends?: TrendsData;
  generatedAt: string;
  dataRange: {
    start: string;
    end: string;
  };
}

// =============================================================================
// API SECTION TYPE
// =============================================================================

export type InsightSection = "overview" | "deal-flow" | "outcomes" | "trends" | "all";
