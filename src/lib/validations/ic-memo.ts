import { z } from "zod";
import {
  ICMemoStatus,
  ScoreRating,
  ICMemoRecommendation,
  ICMemoDecision,
  VoteType,
} from "@prisma/client";

// === Enum schemas ===
const scoreRatingSchema = z.nativeEnum(ScoreRating);
const memoRecommendationSchema = z.nativeEnum(ICMemoRecommendation);
const memoDecisionSchema = z.nativeEnum(ICMemoDecision);
const voteTypeSchema = z.nativeEnum(VoteType);

// === Content JSON schema (narrative sections) ===
export const icMemoContentSchema = z.object({
  // Triple-Use Analysis
  defenseApplication: z.string().optional(),
  commercialApplication: z.string().optional(),
  spaceApplication: z.string().optional(),
  tripleUseJustification: z.string().optional(),

  // WLCDIA
  scaleAnalysis: z.string().optional(),
  demandAnalysis: z.string().optional(),
  supplyChainAnalysis: z.string().optional(),

  // Team (GWC)
  founderName: z.string().optional(),
  founderBackground: z.string().optional(),
  founderTechEvidence: z.string().optional(),
  founderBusinessEvidence: z.string().optional(),
  founderDesignEvidence: z.string().optional(),
  gwcGetIt: z.string().optional(),
  gwcWantIt: z.string().optional(),
  gwcCapacity: z.string().optional(),
  teamSize: z.number().optional(),
  keyHiresAssessment: z.string().optional(),

  // Market
  marketUnderstanding: z.string().optional(),
  directCompetitors: z.string().optional(),
  adjacentPlayers: z.string().optional(),
  unfairAdvantage: z.string().optional(),
  metricsAlignment: z.string().optional(),

  // Capital Efficiency
  milestones: z.array(z.object({ description: z.string() })).optional(),
  futureFinancing: z.array(z.object({
    round: z.string(),
    amount: z.number(),
    timeline: z.string(),
    milestone: z.string(),
  })).optional(),
  contingencyPlanning: z.string().optional(),

  // Risks
  keyRisks: z.array(z.object({
    category: z.string(),
    description: z.string(),
    mitigation: z.string(),
  })).optional(),

  // Thesis Alignment
  strategicValue: z.string().optional(),
  portfolioSynergies: z.string().optional(),

  // Committee
  nextSteps: z.string().optional(),
}).passthrough(); // Allow additional fields

// === Create IC Memo schema ===
export const createICMemoSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  companyId: z.string().cuid("Invalid company ID"),
  dealId: z.string().cuid().optional().nullable(),

  // Thesis Alignment
  focusArea: z.string().max(100).optional().nullable(),
  stage: z.string().max(50).optional().nullable(), // Pre-Seed, Seed, etc.

  // Scores
  tripleUseScore: scoreRatingSchema.optional().nullable(),
  wlcdiaScore: scoreRatingSchema.optional().nullable(),
  expectedCostDecline: z.coerce.number().min(0).max(100).optional().nullable(),
  teamScore: scoreRatingSchema.optional().nullable(),
  founderTechRating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  founderBusinessRating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  founderDesignRating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  marketScore: scoreRatingSchema.optional().nullable(),
  capitalEfficiencyScore: scoreRatingSchema.optional().nullable(),

  // Market Sizing
  tam: z.coerce.number().min(0).optional().nullable(),
  sam: z.coerce.number().min(0).optional().nullable(),
  som: z.coerce.number().min(0).optional().nullable(),

  // Capital Metrics
  trlStage: z.coerce.number().int().min(1).max(9).optional().nullable(),
  monthlyBurn: z.coerce.number().min(0).optional().nullable(),
  runwayMonths: z.coerce.number().int().min(0).optional().nullable(),

  // Financial Terms (Ask)
  askAmount: z.coerce.number().min(0).optional().nullable(),
  askValuation: z.coerce.number().min(0).optional().nullable(),

  // Financial Terms (Proposed)
  preMoneyValuation: z.coerce.number().min(0).optional().nullable(),
  postMoneyValuation: z.coerce.number().min(0).optional().nullable(),
  roundSize: z.coerce.number().min(0).optional().nullable(),
  mortisInvestment: z.coerce.number().min(0).optional().nullable(),
  mortisOwnership: z.coerce.number().min(0).max(1).optional().nullable(), // 0-1 (percentage as decimal)
  followOnReserve: z.coerce.number().min(0).optional().nullable(),

  // Projections
  projectedExitYears: z.coerce.number().int().min(1).max(20).optional().nullable(),
  targetExitLow: z.coerce.number().min(0).optional().nullable(),
  targetExitHigh: z.coerce.number().min(0).optional().nullable(),
  projectedMoicLow: z.coerce.number().min(0).optional().nullable(),
  projectedMoicHigh: z.coerce.number().min(0).optional().nullable(),

  // Decision
  memoRecommendation: memoRecommendationSchema.optional().nullable(),
  decisionRationale: z.string().max(2000).optional().nullable(),

  // Narrative Content
  content: icMemoContentSchema.optional().nullable(),

  // Voting
  votingDeadline: z.coerce.date().optional().nullable(),
});

// === Update IC Memo schema (all fields optional) ===
export const updateICMemoSchema = createICMemoSchema.partial().extend({
  // Final decision can only be set during update (by IC)
  finalDecision: memoDecisionSchema.optional().nullable(),
});

// === Filter schema for GET requests ===
export const icMemoFilterSchema = z.object({
  status: z.string().optional().transform((val) => {
    if (!val) return undefined;
    const statuses = val.split(",");
    return statuses.filter((s) =>
      Object.values(ICMemoStatus).includes(s as ICMemoStatus)
    ) as ICMemoStatus[];
  }),
  companyId: z.string().cuid().optional(),
  dealId: z.string().cuid().optional(),
  authorId: z.string().cuid().optional(),
  recommendation: z.string().optional().transform((val) => {
    if (!val) return undefined;
    return Object.values(ICMemoRecommendation).includes(val as ICMemoRecommendation)
      ? (val as ICMemoRecommendation)
      : undefined;
  }),
  finalDecision: z.string().optional().transform((val) => {
    if (!val) return undefined;
    return Object.values(ICMemoDecision).includes(val as ICMemoDecision)
      ? (val as ICMemoDecision)
      : undefined;
  }),
  focusArea: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
});

// === Submit vote schema ===
export const submitVoteSchema = z.object({
  vote: voteTypeSchema,
  comment: z.string().max(1000).optional().nullable(),
});

// === Type exports ===
export type CreateICMemoInput = z.infer<typeof createICMemoSchema>;
export type UpdateICMemoInput = z.infer<typeof updateICMemoSchema>;
export type ICMemoFilterInput = z.infer<typeof icMemoFilterSchema>;
export type SubmitVoteInput = z.infer<typeof submitVoteSchema>;
export type ICMemoContent = z.infer<typeof icMemoContentSchema>;

// === Focus Area options (Mortis thesis-aligned) ===
export const FOCUS_AREA_OPTIONS = [
  "Space & Defense",
  "Autonomous Systems",
  "Robotics",
  "Power & Energy",
  "Compute Infrastructure",
  "Industry 4.0",
  "AI/ML",
  "Other",
] as const;

// === Stage options ===
export const STAGE_OPTIONS = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B+",
] as const;

// === Score rating labels ===
export const SCORE_RATING_CONFIG: Record<ScoreRating, { label: string; color: string }> = {
  STRONG: { label: "Strong", color: "bg-green-100 text-green-800" },
  MODERATE: { label: "Moderate", color: "bg-yellow-100 text-yellow-800" },
  WEAK: { label: "Weak", color: "bg-red-100 text-red-800" },
  ADEQUATE: { label: "Adequate", color: "bg-blue-100 text-blue-800" },
};

// === Recommendation labels ===
export const RECOMMENDATION_CONFIG: Record<ICMemoRecommendation, { label: string; color: string }> = {
  INVEST: { label: "Invest", color: "bg-green-100 text-green-800" },
  PASS: { label: "Pass", color: "bg-red-100 text-red-800" },
  REVISIT: { label: "Revisit", color: "bg-yellow-100 text-yellow-800" },
};

// === Decision labels ===
export const DECISION_CONFIG: Record<ICMemoDecision, { label: string; color: string }> = {
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-800" },
  DECLINED: { label: "Declined", color: "bg-red-100 text-red-800" },
  DEFERRED: { label: "Deferred", color: "bg-yellow-100 text-yellow-800" },
};

// === Status labels ===
export const STATUS_CONFIG: Record<ICMemoStatus, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-800" },
  SUBMITTED: { label: "Submitted", color: "bg-blue-100 text-blue-800" },
  UNDER_REVIEW: { label: "Under Review", color: "bg-purple-100 text-purple-800" },
  PENDING_VOTE: { label: "Pending Vote", color: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" },
  WITHDRAWN: { label: "Withdrawn", color: "bg-gray-100 text-gray-500" },
};
