import { z } from "zod";
import { CompanyStage, DealSource } from "@prisma/client";

// Company stage enum values
const companyStageValues = Object.values(CompanyStage) as [string, ...string[]];
const dealSourceValues = Object.values(DealSource) as [string, ...string[]];

// Sources that require a referrer
const REFERRER_REQUIRED_SOURCES = ["REFERRAL", "PORTFOLIO", "INVESTOR_NETWORK"];

// Funding round options
export const FUNDING_ROUNDS = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C",
  "Series D",
  "Series E+",
  "Growth",
  "Bridge",
  "Debt",
  "IPO",
] as const;

// Employee count options
export const EMPLOYEE_COUNT_OPTIONS = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5000+",
] as const;

// Sector options - Mortis Ventures thesis-aligned sectors
export const SECTOR_OPTIONS = [
  "Triple-Use",    // Dual-use + commercial
  "Autonomy",      // Autonomous systems
  "Robotics",      // Robotics & mechatronics
  "Power",         // Energy & power systems
  "Compute",       // Computing & semiconductors
  "Industry 4.0",  // Smart manufacturing
  "AI",            // Artificial intelligence
  "Other",         // Catch-all
] as const;

// Base schema for company fields
const companyBaseSchema = {
  name: z.string().min(1, "Company name is required").max(255),
  website: z
    .string()
    .url("Invalid URL format")
    .optional()
    .nullable()
    .or(z.literal("")),
  description: z.string().max(5000).optional().nullable(),
  stage: z.enum(companyStageValues).default("PROSPECT"),
  sector: z.string().max(100).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  foundedYear: z.coerce
    .number()
    .int()
    .min(1800, "Founded year must be after 1800")
    .max(new Date().getFullYear() + 1, "Founded year cannot be in the future")
    .optional()
    .nullable(),
  employeeCount: z.string().max(50).optional().nullable(),
  fundingRound: z.string().max(50).optional().nullable(),
  fundingAmount: z.coerce
    .number()
    .nonnegative("Funding amount must be positive")
    .optional()
    .nullable(),
  valuation: z.coerce
    .number()
    .nonnegative("Valuation must be positive")
    .optional()
    .nullable(),
  linkedinUrl: z
    .string()
    .url("Invalid LinkedIn URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  twitterHandle: z
    .string()
    .max(50)
    .regex(/^@?[A-Za-z0-9_]*$/, "Invalid Twitter handle")
    .optional()
    .nullable()
    .or(z.literal("")),
  logoUrl: z
    .string()
    .url("Invalid logo URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  notes: z.string().max(10000).optional().nullable(),

  // Source Attribution
  sourceType: z.enum(dealSourceValues).optional().nullable(),
  sourceChannel: z.string().max(255).optional().nullable(),
  sourceDetail: z.string().max(1000).optional().nullable(),
  referrerContactId: z.string().optional().nullable(),
  referralDate: z.coerce.date().optional().nullable(),
};

// Schema for creating a company
export const createCompanySchema = z
  .object({
    ...companyBaseSchema,
    name: z.string().min(1, "Company name is required").max(255),
  })
  .refine(
    (data) => {
      // If source type requires a referrer, referrerContactId must be provided
      if (
        data.sourceType &&
        REFERRER_REQUIRED_SOURCES.includes(data.sourceType) &&
        !data.referrerContactId
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Referrer is required for Referral, Portfolio Referral, or Co-Investor sources",
      path: ["referrerContactId"],
    }
  );

// Schema for updating a company (all fields optional)
export const updateCompanySchema = z
  .object({
    ...companyBaseSchema,
    name: z.string().min(1).max(255).optional(),
    stage: z.enum(companyStageValues).optional(),
  })
  .partial();

// Schema for query parameters when listing companies
export const listCompaniesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  stage: z.enum(companyStageValues).optional(),
  sector: z.string().optional(),
  search: z.string().max(255).optional(),
});

// Types inferred from schemas
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type ListCompaniesQuery = z.infer<typeof listCompaniesQuerySchema>;
