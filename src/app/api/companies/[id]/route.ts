import { NextRequest, NextResponse } from "next/server";
import {
  getCompanyById,
  updateCompany as updateCompanyDb,
  deleteCompany as deleteCompanyDb,
} from "@/lib/db";
import { updateCompanySchema } from "@/lib/validations/company";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/companies/[id]
 * Get a single company by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }

    const company = await getCompanyById(id);

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(company, { status: 200 });
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/companies/[id]
 * Update an existing company
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validated = updateCompanySchema.parse(body);

    // Check if company exists
    const existing = await getCompanyById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Transform empty strings to null
    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(validated)) {
      if (value !== undefined) {
        updateData[key] = value === "" ? null : value;
      }
    }

    // Update company
    const company = await updateCompanyDb(id, updateData);

    return NextResponse.json(company, { status: 200 });
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

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/companies/[id]
 * Delete a company
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }

    // Check if company exists
    const existing = await getCompanyById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Delete company (cascades to related records)
    await deleteCompanyDb(id);

    return NextResponse.json(
      { message: "Company deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    console.error("Error deleting company:", error);
    return NextResponse.json(
      { error: "Failed to delete company" },
      { status: 500 }
    );
  }
}
