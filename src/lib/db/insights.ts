import { prisma } from "./prisma";
import {
  DealStage,
  DealSource,
  ScoreRating,
  ICMemoDecision,
} from "@prisma/client";
import { DEAL_STAGE_CONFIG, DEAL_SOURCE_CONFIG } from "./deals";
import {
  DATA_THRESHOLDS,
  getDataConfidence,
  hasEnoughData,
  getConversionSeverity,
  formatDays,
  formatCurrency,
  formatPercentage,
} from "@/lib/insights/thresholds";
import type {
  OverviewData,
  OverviewInsight,
  DealFlowData,
  SourceEffectiveness,
  StageMetrics,
  TimeInStageData,
  DealVelocity,
  OutcomeLearningData,
  FounderRatingMatrix,
  RatingCorrelation,
  ScoreEffectiveness,
  ScoreCorrelation,
  DecisionPattern,
  TrendsData,
  TrendDataPoint,
  SectorTrend,
  ValuationTrend,
} from "@/lib/insights/types";

// =============================================================================
// OVERVIEW DATA
// =============================================================================

export async function getOverviewData(userId: string): Promise<OverviewData> {
  // Fetch all deals for the user
  const deals = await prisma.deal.findMany({
    where: { userId },
    select: {
      id: true,
      stage: true,
      amount: true,
      valuation: true,
      createdAt: true,
      actualClose: true,
      stageHistory: true,
      sourceType: true,
      company: {
        select: { sector: true },
      },
    },
  });

  const totalDeals = deals.length;
  const wonDeals = deals.filter((d) => d.stage === DealStage.CLOSED_WON);
  const lostDeals = deals.filter((d) => d.stage === DealStage.CLOSED_LOST);
  const activeDeals = deals.filter(
    (d) => d.stage !== DealStage.CLOSED_WON && d.stage !== DealStage.CLOSED_LOST
  );

  // Calculate conversion rate
  const closedDeals = wonDeals.length + lostDeals.length;
  const conversionRate = closedDeals > 0 ? wonDeals.length / closedDeals : 0;

  // Calculate average time to close (for won deals)
  const timeToCloseValues = wonDeals
    .filter((d) => d.actualClose && d.createdAt)
    .map((d) => {
      const created = new Date(d.createdAt);
      const closed = new Date(d.actualClose!);
      return (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    });

  const avgTimeToClose =
    timeToCloseValues.length > 0
      ? timeToCloseValues.reduce((a, b) => a + b, 0) / timeToCloseValues.length
      : 0;

  // Calculate pipeline and portfolio values
  const pipelineValue = activeDeals.reduce(
    (sum, d) => sum + (d.amount?.toNumber() || 0),
    0
  );
  const portfolioValue = wonDeals.reduce(
    (sum, d) => sum + (d.amount?.toNumber() || 0),
    0
  );

  // Build KPIs
  const kpis: OverviewData["kpis"] = {
    totalDeals: {
      label: "Total Deals",
      value: totalDeals,
      confidence: getDataConfidence(totalDeals),
    },
    conversionRate: {
      label: "Conversion Rate",
      value: formatPercentage(conversionRate),
      confidence: getDataConfidence(closedDeals),
      trend: conversionRate >= 0.25 ? "up" : conversionRate >= 0.15 ? "neutral" : "down",
    },
    avgTimeToClose: {
      label: "Avg Time to Close",
      value: formatDays(avgTimeToClose),
      confidence: getDataConfidence(timeToCloseValues.length),
      trend:
        avgTimeToClose <= 60 ? "up" : avgTimeToClose <= 90 ? "neutral" : "down",
    },
    pipelineValue: {
      label: "Pipeline Value",
      value: formatCurrency(pipelineValue),
      confidence: getDataConfidence(activeDeals.length),
    },
    portfolioValue: {
      label: "Portfolio Value",
      value: formatCurrency(portfolioValue),
      confidence: getDataConfidence(wonDeals.length),
    },
    activeDeals: {
      label: "Active Deals",
      value: activeDeals.length,
      confidence: getDataConfidence(activeDeals.length),
    },
  };

  // Generate insights
  const insights = generateOverviewInsights(deals, wonDeals, lostDeals, activeDeals);

  return {
    kpis,
    insights,
    topSignals: insights.slice(0, 3),
  };
}

function generateOverviewInsights(
  allDeals: Array<{ id: string; stage: DealStage; sourceType: DealSource | null; company: { sector: string | null } | null }>,
  wonDeals: Array<{ id: string }>,
  lostDeals: Array<{ id: string }>,
  activeDeals: Array<{ id: string; stage: DealStage }>
): OverviewInsight[] {
  const insights: OverviewInsight[] = [];
  const totalDeals = allDeals.length;

  // Source effectiveness insight
  const sourceGroups = new Map<DealSource, { total: number; won: number }>();
  allDeals.forEach((d) => {
    if (d.sourceType) {
      const current = sourceGroups.get(d.sourceType) || { total: 0, won: 0 };
      current.total++;
      sourceGroups.set(d.sourceType, current);
    }
  });
  wonDeals.forEach((w) => {
    const deal = allDeals.find((d) => d.id === w.id);
    if (deal?.sourceType) {
      const current = sourceGroups.get(deal.sourceType)!;
      current.won++;
    }
  });

  // Find best performing source
  let bestSource: DealSource | null = null;
  let bestRate = 0;
  let bestTotal = 0;
  sourceGroups.forEach((data, source) => {
    if (data.total >= DATA_THRESHOLDS.MIN_FOR_CORRELATION) {
      const rate = data.won / data.total;
      if (rate > bestRate) {
        bestRate = rate;
        bestSource = source;
        bestTotal = data.total;
      }
    }
  });

  if (bestSource !== null && hasEnoughData(bestTotal, "MIN_FOR_CORRELATION")) {
    const source = bestSource as DealSource;
    const sourceConfig = DEAL_SOURCE_CONFIG[source];
    insights.push({
      id: "best-source",
      type: "pattern",
      title: `${sourceConfig.label} is your best source`,
      description: `${formatPercentage(bestRate)} conversion rate from ${sourceConfig.label} deals`,
      severity: getConversionSeverity(bestRate),
      confidence: getDataConfidence(bestTotal),
    });
  }

  // Stage bottleneck detection
  const stageCounts = new Map<DealStage, number>();
  activeDeals.forEach((d) => {
    stageCounts.set(d.stage, (stageCounts.get(d.stage) || 0) + 1);
  });

  let maxStage: DealStage | null = null;
  let maxCount = 0;
  stageCounts.forEach((count, stage) => {
    if (count > maxCount) {
      maxCount = count;
      maxStage = stage;
    }
  });

  if (maxStage !== null && maxCount >= 3 && activeDeals.length >= 5) {
    const percentage = maxCount / activeDeals.length;
    if (percentage > 0.4) {
      const stage = maxStage as DealStage;
      const stageConfig = DEAL_STAGE_CONFIG[stage];
      insights.push({
        id: "stage-bottleneck",
        type: "signal",
        title: `Bottleneck at ${stageConfig.label}`,
        description: `${maxCount} deals (${formatPercentage(percentage)}) stuck in ${stageConfig.label}`,
        severity: "warning",
        confidence: getDataConfidence(activeDeals.length),
      });
    }
  }

  // Sector concentration insight
  const sectorCounts = new Map<string, number>();
  allDeals.forEach((d) => {
    const sector = d.company?.sector || "Unknown";
    sectorCounts.set(sector, (sectorCounts.get(sector) || 0) + 1);
  });

  let topSector: string | null = null;
  let topSectorCount = 0;
  sectorCounts.forEach((count, sector) => {
    if (count > topSectorCount) {
      topSectorCount = count;
      topSector = sector;
    }
  });

  if (topSector && totalDeals >= 5) {
    const percentage = topSectorCount / totalDeals;
    insights.push({
      id: "sector-focus",
      type: "pattern",
      title: `${topSector} dominates your pipeline`,
      description: `${formatPercentage(percentage)} of deals are in ${topSector}`,
      severity: percentage > 0.5 ? "warning" : "info",
      confidence: getDataConfidence(totalDeals),
    });
  }

  // Low data warning
  if (totalDeals < DATA_THRESHOLDS.MIN_FOR_CORRELATION) {
    insights.push({
      id: "sparse-data",
      type: "signal",
      title: "Limited data available",
      description: `Only ${totalDeals} deals tracked. Add more deals for deeper insights.`,
      severity: "info",
      confidence: getDataConfidence(totalDeals),
    });
  }

  return insights;
}

// =============================================================================
// DEAL FLOW DATA
// =============================================================================

export async function getDealFlowData(userId: string): Promise<DealFlowData> {
  const deals = await prisma.deal.findMany({
    where: { userId },
    select: {
      id: true,
      stage: true,
      amount: true,
      sourceType: true,
      createdAt: true,
      actualClose: true,
      stageHistory: true,
    },
  });

  // Calculate source effectiveness
  const sourceEffectiveness = calculateSourceEffectiveness(deals);

  // Calculate stage metrics
  const stageMetrics = calculateStageMetrics(deals);

  // Calculate time in stage
  const timeInStage = calculateTimeInStage(deals);

  // Calculate velocity (last 6 months)
  const velocity = calculateDealVelocity(deals);

  // Calculate funnel conversion
  const funnelConversion = calculateFunnelConversion(deals);

  return {
    sourceEffectiveness,
    stageMetrics,
    timeInStage,
    velocity,
    funnelConversion,
  };
}

function calculateSourceEffectiveness(
  deals: Array<{
    id: string;
    stage: DealStage;
    amount: { toNumber(): number } | null;
    sourceType: DealSource | null;
    createdAt: Date;
    actualClose: Date | null;
  }>
): SourceEffectiveness[] {
  const sourceGroups = new Map<
    DealSource,
    {
      deals: typeof deals;
    }
  >();

  deals.forEach((deal) => {
    if (deal.sourceType) {
      const existing = sourceGroups.get(deal.sourceType) || { deals: [] };
      existing.deals.push(deal);
      sourceGroups.set(deal.sourceType, existing);
    }
  });

  const results: SourceEffectiveness[] = [];

  sourceGroups.forEach((data, source) => {
    const groupDeals = data.deals;
    const won = groupDeals.filter((d) => d.stage === DealStage.CLOSED_WON);
    const lost = groupDeals.filter((d) => d.stage === DealStage.CLOSED_LOST);
    const pending = groupDeals.filter(
      (d) => d.stage !== DealStage.CLOSED_WON && d.stage !== DealStage.CLOSED_LOST
    );

    const closedDeals = won.length + lost.length;
    const conversionRate = closedDeals > 0 ? won.length / closedDeals : 0;

    const timeToCloseValues = won
      .filter((d) => d.actualClose)
      .map((d) => {
        const created = new Date(d.createdAt);
        const closed = new Date(d.actualClose!);
        return (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      });

    const avgTimeToClose =
      timeToCloseValues.length > 0
        ? timeToCloseValues.reduce((a, b) => a + b, 0) / timeToCloseValues.length
        : 0;

    const totalInvested = won.reduce(
      (sum, d) => sum + (d.amount?.toNumber() || 0),
      0
    );

    results.push({
      source,
      label: DEAL_SOURCE_CONFIG[source].label,
      totalDeals: groupDeals.length,
      wonDeals: won.length,
      lostDeals: lost.length,
      pendingDeals: pending.length,
      conversionRate,
      avgTimeToClose,
      totalInvested,
      avgDealSize: won.length > 0 ? totalInvested / won.length : 0,
      confidence: getDataConfidence(groupDeals.length),
    });
  });

  return results.sort((a, b) => b.conversionRate - a.conversionRate);
}

function calculateStageMetrics(
  deals: Array<{
    id: string;
    stage: DealStage;
    stageHistory: unknown;
  }>
): StageMetrics[] {
  const stageOrder = [
    DealStage.INITIAL_REVIEW,
    DealStage.MEETING_SCHEDULED,
    DealStage.DEEP_DIVE,
    DealStage.PARTNER_REVIEW,
    DealStage.TERM_SHEET,
    DealStage.LEGAL_DILIGENCE,
    DealStage.CLOSED_WON,
    DealStage.CLOSED_LOST,
  ];

  const results: StageMetrics[] = [];

  stageOrder.forEach((stage, index) => {
    const dealsInStage = deals.filter((d) => d.stage === stage);
    const count = dealsInStage.length;

    // Calculate deals that passed through this stage
    const dealsPassedThrough = deals.filter((d) => {
      const history = d.stageHistory as Array<{ stage: string }> | null;
      if (!history) return d.stage === stage;
      return (
        history.some((h) => h.stage === stage) ||
        stageOrder.indexOf(d.stage) >= index
      );
    });

    // Calculate conversion to next stage
    let conversionToNext = 0;
    if (index < stageOrder.length - 2) {
      // Exclude CLOSED_WON and CLOSED_LOST from next stage calculation
      const nextStage = stageOrder[index + 1];
      const dealsReachedNext = deals.filter((d) => {
        const history = d.stageHistory as Array<{ stage: string }> | null;
        if (!history) return stageOrder.indexOf(d.stage) > index;
        return (
          history.some((h) => h.stage === nextStage) ||
          stageOrder.indexOf(d.stage) > index
        );
      });
      conversionToNext =
        dealsPassedThrough.length > 0
          ? dealsReachedNext.length / dealsPassedThrough.length
          : 0;
    }

    // Calculate dropoff rate
    const dropoff =
      dealsPassedThrough.length > 0
        ? (dealsPassedThrough.length - count) / dealsPassedThrough.length
        : 0;

    results.push({
      stage,
      label: DEAL_STAGE_CONFIG[stage].label,
      count,
      avgTimeInStage: 0, // Will be calculated from timeInStage
      conversionToNext,
      dropoffRate: Math.max(0, dropoff),
      confidence: getDataConfidence(dealsPassedThrough.length),
    });
  });

  return results;
}

function calculateTimeInStage(
  deals: Array<{
    id: string;
    stage: DealStage;
    stageHistory: unknown;
  }>
): TimeInStageData[] {
  const stageOrder = [
    DealStage.INITIAL_REVIEW,
    DealStage.MEETING_SCHEDULED,
    DealStage.DEEP_DIVE,
    DealStage.PARTNER_REVIEW,
    DealStage.TERM_SHEET,
    DealStage.LEGAL_DILIGENCE,
  ];

  const results: TimeInStageData[] = [];

  stageOrder.forEach((stage) => {
    const durations: number[] = [];

    deals.forEach((deal) => {
      const history = deal.stageHistory as Array<{
        stage: string;
        timestamp: string;
      }> | null;
      if (!history || history.length < 2) return;

      // Find entry and exit timestamps for this stage
      const entries = history.filter((h) => h.stage === stage);
      entries.forEach((entry) => {
        const entryTime = new Date(entry.timestamp).getTime();
        // Find the next stage transition
        const exitIndex = history.findIndex(
          (h, idx) =>
            idx > history.indexOf(entry) && h.stage !== stage
        );
        if (exitIndex !== -1) {
          const exitTime = new Date(history[exitIndex].timestamp).getTime();
          const days = (exitTime - entryTime) / (1000 * 60 * 60 * 24);
          if (days > 0) {
            durations.push(days);
          }
        }
      });
    });

    if (durations.length > 0) {
      durations.sort((a, b) => a - b);
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const median =
        durations.length % 2 === 0
          ? (durations[durations.length / 2 - 1] + durations[durations.length / 2]) / 2
          : durations[Math.floor(durations.length / 2)];

      results.push({
        stage,
        label: DEAL_STAGE_CONFIG[stage].label,
        avgDays: avg,
        medianDays: median,
        minDays: durations[0],
        maxDays: durations[durations.length - 1],
        dealCount: durations.length,
      });
    } else {
      results.push({
        stage,
        label: DEAL_STAGE_CONFIG[stage].label,
        avgDays: 0,
        medianDays: 0,
        minDays: 0,
        maxDays: 0,
        dealCount: 0,
      });
    }
  });

  return results;
}

function calculateDealVelocity(
  deals: Array<{
    id: string;
    stage: DealStage;
    createdAt: Date;
    actualClose: Date | null;
  }>
): DealVelocity[] {
  const months = DATA_THRESHOLDS.VELOCITY_MONTHS;
  const now = new Date();
  const results: DealVelocity[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const period = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`;

    const newDeals = deals.filter((d) => {
      const created = new Date(d.createdAt);
      return created >= monthStart && created <= monthEnd;
    }).length;

    const closedWon = deals.filter((d) => {
      if (d.stage !== DealStage.CLOSED_WON || !d.actualClose) return false;
      const closed = new Date(d.actualClose);
      return closed >= monthStart && closed <= monthEnd;
    }).length;

    const closedLost = deals.filter((d) => {
      if (d.stage !== DealStage.CLOSED_LOST || !d.actualClose) return false;
      const closed = new Date(d.actualClose);
      return closed >= monthStart && closed <= monthEnd;
    }).length;

    results.push({
      period,
      newDeals,
      closedWon,
      closedLost,
      netChange: newDeals - closedWon - closedLost,
    });
  }

  return results;
}

function calculateFunnelConversion(
  deals: Array<{ id: string; stage: DealStage; stageHistory: unknown }>
): { stage: string; count: number; percentage: number }[] {
  const stageOrder: DealStage[] = [
    DealStage.INITIAL_REVIEW,
    DealStage.MEETING_SCHEDULED,
    DealStage.DEEP_DIVE,
    DealStage.PARTNER_REVIEW,
    DealStage.TERM_SHEET,
    DealStage.LEGAL_DILIGENCE,
    DealStage.CLOSED_WON,
  ];

  const results: { stage: string; count: number; percentage: number }[] = [];
  const totalDeals = deals.length;

  stageOrder.forEach((stage, index) => {
    // Count deals that reached or passed this stage
    const reachedCount = deals.filter((d) => {
      const history = d.stageHistory as Array<{ stage: string }> | null;
      // Handle CLOSED_LOST separately - it doesn't count as reaching later stages
      if (d.stage === DealStage.CLOSED_LOST) {
        // Check if it reached this stage before being lost
        if (!history) return false;
        return history.some((h) => {
          const hIdx = stageOrder.indexOf(h.stage as DealStage);
          return hIdx >= 0 && hIdx >= index;
        });
      }
      const currentIdx = stageOrder.indexOf(d.stage);
      if (currentIdx >= 0 && currentIdx >= index) return true;
      if (!history) return false;
      return history.some((h) => {
        const hIdx = stageOrder.indexOf(h.stage as DealStage);
        return hIdx >= 0 && hIdx >= index;
      });
    }).length;

    results.push({
      stage: DEAL_STAGE_CONFIG[stage].label,
      count: reachedCount,
      percentage: totalDeals > 0 ? reachedCount / totalDeals : 0,
    });
  });

  return results;
}

// =============================================================================
// OUTCOME LEARNING DATA (IC MEMO CORRELATIONS)
// =============================================================================

export async function getOutcomeLearningData(userId: string): Promise<OutcomeLearningData> {
  // Fetch IC memos with decisions
  const memos = await prisma.iCMemo.findMany({
    where: {
      authorId: userId,
      finalDecision: { not: null },
    },
    select: {
      id: true,
      finalDecision: true,
      founderTechRating: true,
      founderBusinessRating: true,
      founderDesignRating: true,
      tripleUseScore: true,
      wlcdiaScore: true,
      teamScore: true,
      marketScore: true,
      capitalEfficiencyScore: true,
      company: {
        select: { name: true },
      },
    },
  });

  // Get all memos for summary
  const allMemos = await prisma.iCMemo.count({ where: { authorId: userId } });

  // Calculate founder rating matrix
  const founderMatrix = calculateFounderRatingMatrix(memos);

  // Calculate score effectiveness
  const scoreEffectiveness = calculateScoreEffectiveness(memos);

  // Generate patterns
  const patterns = generateDecisionPatterns(memos);

  // Summary
  const approved = memos.filter((m) => m.finalDecision === ICMemoDecision.APPROVED).length;
  const declined = memos.filter((m) => m.finalDecision === ICMemoDecision.DECLINED).length;
  const deferred = memos.filter((m) => m.finalDecision === ICMemoDecision.DEFERRED).length;

  return {
    founderMatrix,
    scoreEffectiveness,
    patterns,
    summary: {
      totalMemos: allMemos,
      withDecisions: memos.length,
      approvedCount: approved,
      declinedCount: declined,
      deferredCount: deferred,
      avgApprovalRate: memos.length > 0 ? approved / memos.length : 0,
    },
  };
}

function calculateFounderRatingMatrix(
  memos: Array<{
    id: string;
    finalDecision: ICMemoDecision | null;
    founderTechRating: number | null;
    founderBusinessRating: number | null;
    founderDesignRating: number | null;
  }>
): FounderRatingMatrix {
  const techRatings: RatingCorrelation[] = [];
  const businessRatings: RatingCorrelation[] = [];
  const designRatings: RatingCorrelation[] = [];

  [1, 2, 3, 4, 5].forEach((rating) => {
    // Tech ratings
    const techMemos = memos.filter((m) => m.founderTechRating === rating);
    techRatings.push(calculateRatingCorrelation(rating, techMemos));

    // Business ratings
    const businessMemos = memos.filter((m) => m.founderBusinessRating === rating);
    businessRatings.push(calculateRatingCorrelation(rating, businessMemos));

    // Design ratings
    const designMemos = memos.filter((m) => m.founderDesignRating === rating);
    designRatings.push(calculateRatingCorrelation(rating, designMemos));
  });

  // Generate combined insight
  const highTechApproval = techRatings
    .filter((r) => r.rating >= 4)
    .reduce((sum, r) => sum + r.approved, 0);
  const highTechTotal = techRatings
    .filter((r) => r.rating >= 4)
    .reduce((sum, r) => sum + r.total, 0);

  const highBusinessApproval = businessRatings
    .filter((r) => r.rating >= 4)
    .reduce((sum, r) => sum + r.approved, 0);
  const highBusinessTotal = businessRatings
    .filter((r) => r.rating >= 4)
    .reduce((sum, r) => sum + r.total, 0);

  let combinedInsight = "Insufficient data for founder rating insights.";
  if (highTechTotal >= 3 && highBusinessTotal >= 3) {
    const techRate = highTechTotal > 0 ? highTechApproval / highTechTotal : 0;
    const businessRate = highBusinessTotal > 0 ? highBusinessApproval / highBusinessTotal : 0;

    if (techRate > businessRate + 0.1) {
      combinedInsight = `Technical strength is the strongest predictor of approval (${formatPercentage(techRate)} vs ${formatPercentage(businessRate)} for business).`;
    } else if (businessRate > techRate + 0.1) {
      combinedInsight = `Business acumen is the strongest predictor of approval (${formatPercentage(businessRate)} vs ${formatPercentage(techRate)} for technical).`;
    } else {
      combinedInsight = `Both technical and business ratings correlate similarly with approvals (~${formatPercentage((techRate + businessRate) / 2)}).`;
    }
  }

  return {
    techRatings,
    businessRatings,
    designRatings,
    combinedInsight,
    confidence: getDataConfidence(memos.length, "IC memos"),
  };
}

function calculateRatingCorrelation(
  rating: number,
  memos: Array<{ finalDecision: ICMemoDecision | null }>
): RatingCorrelation {
  const approved = memos.filter((m) => m.finalDecision === ICMemoDecision.APPROVED).length;
  const declined = memos.filter((m) => m.finalDecision === ICMemoDecision.DECLINED).length;
  const deferred = memos.filter((m) => m.finalDecision === ICMemoDecision.DEFERRED).length;
  const total = memos.length;

  return {
    rating,
    approved,
    declined,
    deferred,
    total,
    approvalRate: total > 0 ? approved / total : 0,
  };
}

function calculateScoreEffectiveness(
  memos: Array<{
    id: string;
    finalDecision: ICMemoDecision | null;
    tripleUseScore: ScoreRating | null;
    wlcdiaScore: ScoreRating | null;
    teamScore: ScoreRating | null;
    marketScore: ScoreRating | null;
    capitalEfficiencyScore: ScoreRating | null;
  }>
): ScoreEffectiveness {
  const scores: ScoreRating[] = [
    ScoreRating.STRONG,
    ScoreRating.MODERATE,
    ScoreRating.ADEQUATE,
    ScoreRating.WEAK,
  ];

  const scoreLabels: Record<ScoreRating, string> = {
    STRONG: "Strong",
    MODERATE: "Moderate",
    ADEQUATE: "Adequate",
    WEAK: "Weak",
  };

  const calculateCorrelations = (
    field: keyof typeof memos[0]
  ): ScoreCorrelation[] => {
    return scores.map((score) => {
      const filtered = memos.filter((m) => m[field] === score);
      const approved = filtered.filter(
        (m) => m.finalDecision === ICMemoDecision.APPROVED
      ).length;
      const declined = filtered.filter(
        (m) => m.finalDecision === ICMemoDecision.DECLINED
      ).length;
      const deferred = filtered.filter(
        (m) => m.finalDecision === ICMemoDecision.DEFERRED
      ).length;
      const total = filtered.length;

      return {
        score,
        label: scoreLabels[score],
        approved,
        declined,
        deferred,
        total,
        approvalRate: total > 0 ? approved / total : 0,
      };
    });
  };

  const tripleUse = calculateCorrelations("tripleUseScore");
  const wlcdia = calculateCorrelations("wlcdiaScore");
  const team = calculateCorrelations("teamScore");
  const market = calculateCorrelations("marketScore");
  const capitalEfficiency = calculateCorrelations("capitalEfficiencyScore");

  // Find best predictor
  const calculatePredictiveStrength = (correlations: ScoreCorrelation[]): number => {
    const strongRate = correlations.find((c) => c.score === ScoreRating.STRONG)?.approvalRate || 0;
    const weakRate = correlations.find((c) => c.score === ScoreRating.WEAK)?.approvalRate || 0;
    return strongRate - weakRate;
  };

  const predictiveStrengths = [
    { name: "Triple-Use", strength: calculatePredictiveStrength(tripleUse) },
    { name: "WLCDIA", strength: calculatePredictiveStrength(wlcdia) },
    { name: "Team", strength: calculatePredictiveStrength(team) },
    { name: "Market", strength: calculatePredictiveStrength(market) },
    { name: "Capital Efficiency", strength: calculatePredictiveStrength(capitalEfficiency) },
  ].sort((a, b) => b.strength - a.strength);

  const bestPredictor =
    predictiveStrengths[0].strength > 0
      ? `${predictiveStrengths[0].name} score is the strongest predictor of outcomes`
      : "No clear predictor identified yet";

  return {
    tripleUse,
    wlcdia,
    team,
    market,
    capitalEfficiency,
    bestPredictor,
    confidence: getDataConfidence(memos.length, "IC memos"),
  };
}

function generateDecisionPatterns(
  memos: Array<{
    id: string;
    finalDecision: ICMemoDecision | null;
    founderTechRating: number | null;
    founderBusinessRating: number | null;
    tripleUseScore: ScoreRating | null;
    teamScore: ScoreRating | null;
    company: { name: string } | null;
  }>
): DecisionPattern[] {
  const patterns: DecisionPattern[] = [];

  // Pattern: High founder ratings + Strong scores = Approval
  const highRatingApprovals = memos.filter(
    (m) =>
      m.finalDecision === ICMemoDecision.APPROVED &&
      (m.founderTechRating || 0) >= 4 &&
      (m.founderBusinessRating || 0) >= 4
  );

  if (highRatingApprovals.length >= 3) {
    patterns.push({
      id: "high-rating-approval",
      pattern: "Strong founder ratings correlate with approvals",
      description: `${highRatingApprovals.length} deals with founder ratings ≥4 were approved`,
      occurrences: highRatingApprovals.length,
      outcome: "positive",
      examples: highRatingApprovals.slice(0, 3).map((m) => m.company?.name || "Unknown"),
      confidence: getDataConfidence(highRatingApprovals.length),
    });
  }

  // Pattern: Weak team score = Decline
  const weakTeamDeclines = memos.filter(
    (m) =>
      m.finalDecision === ICMemoDecision.DECLINED &&
      m.teamScore === ScoreRating.WEAK
  );

  if (weakTeamDeclines.length >= 2) {
    patterns.push({
      id: "weak-team-decline",
      pattern: "Weak team scores lead to declines",
      description: `${weakTeamDeclines.length} deals with weak team scores were declined`,
      occurrences: weakTeamDeclines.length,
      outcome: "negative",
      examples: weakTeamDeclines.slice(0, 3).map((m) => m.company?.name || "Unknown"),
      confidence: getDataConfidence(weakTeamDeclines.length),
    });
  }

  // Pattern: Strong triple-use = Approval
  const strongTripleUseApprovals = memos.filter(
    (m) =>
      m.finalDecision === ICMemoDecision.APPROVED &&
      m.tripleUseScore === ScoreRating.STRONG
  );

  if (strongTripleUseApprovals.length >= 2) {
    patterns.push({
      id: "strong-triple-use",
      pattern: "Strong Triple-Use alignment drives approvals",
      description: `${strongTripleUseApprovals.length} deals with strong Triple-Use scores were approved`,
      occurrences: strongTripleUseApprovals.length,
      outcome: "positive",
      examples: strongTripleUseApprovals.slice(0, 3).map((m) => m.company?.name || "Unknown"),
      confidence: getDataConfidence(strongTripleUseApprovals.length),
    });
  }

  return patterns;
}

// =============================================================================
// TRENDS DATA
// =============================================================================

export async function getTrendsData(userId: string): Promise<TrendsData> {
  const deals = await prisma.deal.findMany({
    where: { userId },
    select: {
      id: true,
      stage: true,
      amount: true,
      valuation: true,
      sourceType: true,
      createdAt: true,
      actualClose: true,
      company: {
        select: { sector: true },
      },
    },
  });

  // Calculate deal volume trends
  const dealVolume = calculateDealVolumeTrend(deals);

  // Calculate sector distribution
  const sectorDistribution = calculateSectorDistribution(deals);

  // Calculate valuation trends
  const valuationTrends = calculateValuationTrends(deals);

  // Calculate source shifts
  const sourceShifts = calculateSourceShifts(deals);

  // Calculate stage trends (not implemented for now - would require more complex logic)
  const stageTrends: TrendsData["stageTrends"] = [];

  return {
    dealVolume,
    sectorDistribution,
    valuationTrends,
    sourceShifts,
    stageTrends,
  };
}

function calculateDealVolumeTrend(
  deals: Array<{ createdAt: Date }>
): TrendDataPoint[] {
  const months = DATA_THRESHOLDS.TREND_MONTHS;
  const now = new Date();
  const results: TrendDataPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const period = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`;

    const count = deals.filter((d) => {
      const created = new Date(d.createdAt);
      return created >= monthStart && created <= monthEnd;
    }).length;

    results.push({
      period,
      value: count,
      label: monthStart.toLocaleString("default", { month: "short" }),
    });
  }

  return results;
}

function calculateSectorDistribution(
  deals: Array<{ company: { sector: string | null } | null }>
): SectorTrend[] {
  const sectorCounts = new Map<string, number>();
  const totalDeals = deals.length;

  deals.forEach((d) => {
    const sector = d.company?.sector || "Other";
    sectorCounts.set(sector, (sectorCounts.get(sector) || 0) + 1);
  });

  const results: SectorTrend[] = [];
  sectorCounts.forEach((count, sector) => {
    results.push({
      sector,
      dealCount: count,
      percentageOfTotal: totalDeals > 0 ? count / totalDeals : 0,
      change: 0, // Would need historical data to calculate
      avgDealSize: 0, // Would need to calculate from deals
    });
  });

  return results.sort((a, b) => b.dealCount - a.dealCount);
}

function calculateValuationTrends(
  deals: Array<{
    valuation: { toNumber(): number } | null;
    createdAt: Date;
  }>
): ValuationTrend[] {
  const months = DATA_THRESHOLDS.TREND_MONTHS;
  const now = new Date();
  const results: ValuationTrend[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const period = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`;

    const monthDeals = deals.filter((d) => {
      const created = new Date(d.createdAt);
      return created >= monthStart && created <= monthEnd && d.valuation;
    });

    if (monthDeals.length > 0) {
      const valuations = monthDeals
        .map((d) => d.valuation?.toNumber() || 0)
        .filter((v) => v > 0)
        .sort((a, b) => a - b);

      const avg =
        valuations.length > 0
          ? valuations.reduce((a, b) => a + b, 0) / valuations.length
          : 0;
      const median =
        valuations.length > 0
          ? valuations.length % 2 === 0
            ? (valuations[valuations.length / 2 - 1] + valuations[valuations.length / 2]) / 2
            : valuations[Math.floor(valuations.length / 2)]
          : 0;

      results.push({
        period,
        avgValuation: avg,
        medianValuation: median,
        dealCount: monthDeals.length,
      });
    } else {
      results.push({
        period,
        avgValuation: 0,
        medianValuation: 0,
        dealCount: 0,
      });
    }
  }

  return results;
}

function calculateSourceShifts(
  deals: Array<{
    sourceType: DealSource | null;
    createdAt: Date;
  }>
): TrendsData["sourceShifts"] {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  const recentDeals = deals.filter((d) => new Date(d.createdAt) >= threeMonthsAgo);
  const previousDeals = deals.filter((d) => {
    const created = new Date(d.createdAt);
    return created >= sixMonthsAgo && created < threeMonthsAgo;
  });

  const results: TrendsData["sourceShifts"] = [];

  Object.values(DealSource).forEach((source) => {
    const current = recentDeals.filter((d) => d.sourceType === source).length;
    const previous = previousDeals.filter((d) => d.sourceType === source).length;
    const change = previous > 0 ? (current - previous) / previous : current > 0 ? 1 : 0;

    results.push({
      source,
      label: DEAL_SOURCE_CONFIG[source].label,
      currentPeriod: current,
      previousPeriod: previous,
      change,
    });
  });

  return results.sort((a, b) => b.change - a.change);
}
