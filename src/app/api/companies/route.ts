import { NextRequest, NextResponse } from "next/server";
import { getCompanies, createCompany as createCompanyDb } from "@/lib/db";
import {
  createCompanySchema,
  listCompaniesQuerySchema,
} from "@/lib/validations/company";
import { ZodError } from "zod";
import { CompanyStage } from "@prisma/client";

// Temporary user ID until auth is implemented
const TEMP_USER_ID = "temp-user-id";

/**
 * GET /api/companies
 * List all companies with optional filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const query = listCompaniesQuerySchema.parse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
      stage: searchParams.get("stage") || undefined,
      sector: searchParams.get("sector") || undefined,
      search: searchParams.get("search") || undefined,
    });

    // Fetch companies with filters and pagination
    const result = await getCompanies(
      {
        stage: query.stage as CompanyStage | undefined,
        sector: query.sector,
        search: query.search,
        userId: TEMP_USER_ID,
      },
      {
        page: query.page,
        limit: query.limit,
      }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/companies
 * Create a new company
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validated = createCompanySchema.parse(body);

    // Transform empty strings to null
    const companyData = {
      ...validated,
      website: validated.website || null,
      description: validated.description || null,
      sector: validated.sector || null,
      location: validated.location || null,
      foundedYear: validated.foundedYear || null,
      employeeCount: validated.employeeCount || null,
      fundingRound: validated.fundingRound || null,
      fundingAmount: validated.fundingAmount || null,
      valuation: validated.valuation || null,
      linkedinUrl: validated.linkedinUrl || null,
      twitterHandle: validated.twitterHandle || null,
      logoUrl: validated.logoUrl || null,
      notes: validated.notes || null,
      userId: TEMP_USER_ID,
    };

    // Create company
    const company = await createCompanyDb(companyData);

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}
