import { z } from "zod";
import { CompanyStage } from "@prisma/client";

// Company stage enum values
const companyStageValues = Object.values(CompanyStage) as [string, ...string[]];

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

// Sector options
export const SECTOR_OPTIONS = [
  "AI/ML",
  "Biotech",
  "CleanTech",
  "Consumer",
  "Crypto/Web3",
  "Cybersecurity",
  "E-commerce",
  "EdTech",
  "Enterprise",
  "FinTech",
  "Gaming",
  "HealthTech",
  "Infrastructure",
  "InsurTech",
  "Logistics",
  "Marketplace",
  "Media",
  "PropTech",
  "Robotics",
  "SaaS",
  "SpaceTech",
  "Other",
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
};

// Schema for creating a company
export const createCompanySchema = z.object({
  ...companyBaseSchema,
  name: z.string().min(1, "Company name is required").max(255),
});

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
