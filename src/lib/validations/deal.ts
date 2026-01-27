import { z } from "zod";

// =============================================================================
// DEAL VALIDATION SCHEMAS
// =============================================================================

export const dealStages = [
  "INITIAL_REVIEW",
  "MEETING_SCHEDULED",
  "DEEP_DIVE",
  "PARTNER_REVIEW",
  "TERM_SHEET",
  "LEGAL_DILIGENCE",
  "CLOSED_WON",
  "CLOSED_LOST",
] as const;

export const dealSources = [
  "REFERRAL",
  "DIRECT_OUTREACH",
  "INBOUND",
  "CONFERENCE",
  "ACCELERATOR",
  "NETWORK",
  "PORTFOLIO",
  "INVESTOR_NETWORK",
  "OTHER",
] as const;

export const dealPriorities = [
  "HIGH",
  "MEDIUM",
  "LOW",
] as const;

// Create deal schema
export const createDealSchema = z.object({
  dealName: z.string().min(1, "Deal name is required"),
  companyId: z.string().min(1, "Company is required"),

  // Optional fields
  amount: z.number().positive().nullish(),
  valuation: z.number().positive().nullish(),
  stage: z.enum(dealStages).default("INITIAL_REVIEW"),
  priority: z.enum(dealPriorities).default("MEDIUM"),
  probability: z.number().min(0).max(100).nullish(),
  expectedClose: z.coerce.date().nullish(),
  actualClose: z.coerce.date().nullish(),
  notes: z.string().nullish(),

  // Source Attribution
  sourceType: z.enum(dealSources).nullish(),
  sourceChannel: z.string().nullish(),
  sourceDetail: z.string().nullish(),
  referrerContactId: z.string().nullish(),
  referralDate: z.coerce.date().nullish(),

  // Financial Details
  roundSize: z.number().positive().nullish(),
  postMoneyVal: z.number().positive().nullish(),
  ownershipTarget: z.number().min(0).max(1).nullish(), // 0.05 = 5%
  proRataRights: z.boolean().default(false),

  // Primary contact for deal
  contactId: z.string().nullish(),
});

// Update deal schema (all fields optional except id)
export const updateDealSchema = z.object({
  dealName: z.string().min(1).optional(),
  companyId: z.string().min(1).optional(),

  amount: z.number().positive().nullish(),
  valuation: z.number().positive().nullish(),
  stage: z.enum(dealStages).optional(),
  priority: z.enum(dealPriorities).optional(),
  probability: z.number().min(0).max(100).nullish(),
  expectedClose: z.coerce.date().nullish(),
  actualClose: z.coerce.date().nullish(),
  notes: z.string().nullish(),

  // Source Attribution
  sourceType: z.enum(dealSources).nullish(),
  sourceChannel: z.string().nullish(),
  sourceDetail: z.string().nullish(),
  referrerContactId: z.string().nullish(),
  referralDate: z.coerce.date().nullish(),

  // Financial Details
  roundSize: z.number().positive().nullish(),
  postMoneyVal: z.number().positive().nullish(),
  ownershipTarget: z.number().min(0).max(1).nullish(),
  proRataRights: z.boolean().optional(),

  // Primary contact for deal
  contactId: z.string().nullish(),
});

// Filter/query schema
export const dealFilterSchema = z.object({
  search: z.string().optional(),
  stage: z.union([
    z.enum(dealStages),
    z.array(z.enum(dealStages)),
  ]).optional(),
  priority: z.enum(dealPriorities).optional(),
  sourceType: z.enum(dealSources).optional(),
  companyId: z.string().optional(),
  referrerContactId: z.string().optional(),
  minAmount: z.coerce.number().positive().optional(),
  maxAmount: z.coerce.number().positive().optional(),
});

// Type exports
export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
export type DealFilterInput = z.infer<typeof dealFilterSchema>;
