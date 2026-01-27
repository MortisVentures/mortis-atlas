import { NextRequest, NextResponse } from "next/server";
import { getDealById, updateDeal, deleteDeal } from "@/lib/db/deals";
import { auth } from "@/lib/auth";
import { updateDealSchema } from "@/lib/validations/deal";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/deals/[id]
 * Get a single deal by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deal = await getDealById(id, session.user.id);

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json(deal, { status: 200 });
  } catch (error) {
    console.error("Error fetching deal:", error);
    return NextResponse.json(
      { error: "Failed to fetch deal" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/deals/[id]
 * Update a deal
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateDealSchema.parse(body);

    const deal = await updateDeal(id, session.user.id, validated);

    if (!deal) {
      return NextResponse.json(
        { error: "Deal not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json(deal, { status: 200 });
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

    console.error("Error updating deal:", error);
    return NextResponse.json(
      { error: "Failed to update deal" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/deals/[id]
 * Delete a deal
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await deleteDeal(id, session.user.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Deal not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting deal:", error);
    return NextResponse.json(
      { error: "Failed to delete deal" },
      { status: 500 }
    );
  }
}
