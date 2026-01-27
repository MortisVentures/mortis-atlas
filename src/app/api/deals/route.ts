import { NextRequest, NextResponse } from "next/server";
import { getDeals, createDeal } from "@/lib/db/deals";
import { auth } from "@/lib/auth";
import { createDealSchema, dealFilterSchema } from "@/lib/validations/deal";
import { z } from "zod";

/**
 * GET /api/deals
 * List all deals with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Parse filters from query params
    const filters = dealFilterSchema.parse({
      search: searchParams.get("search") || undefined,
      stage: searchParams.get("stage")?.split(",") || undefined,
      priority: searchParams.get("priority") || undefined,
      sourceType: searchParams.get("sourceType") || undefined,
      companyId: searchParams.get("companyId") || undefined,
      referrerContactId: searchParams.get("referrerContactId") || undefined,
      minAmount: searchParams.get("minAmount") || undefined,
      maxAmount: searchParams.get("maxAmount") || undefined,
    });

    const deals = await getDeals({
      userId: session.user.id,
      ...filters,
    });

    return NextResponse.json({ data: deals }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid filter parameters", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error fetching deals:", error);
    return NextResponse.json(
      { error: "Failed to fetch deals" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/deals
 * Create a new deal
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createDealSchema.parse(body);

    const deal = await createDeal({
      ...validated,
      userId: session.user.id,
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    console.error("Error creating deal:", error);
    return NextResponse.json(
      { error: "Failed to create deal" },
      { status: 500 }
    );
  }
}
