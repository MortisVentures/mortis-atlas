import { NextRequest, NextResponse } from "next/server";
import { getICMemoById, updateICMemo, deleteICMemo } from "@/lib/db/ic-memos";
import { auth } from "@/lib/auth";
import { updateICMemoSchema } from "@/lib/validations/ic-memo";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/ic-memos/[id]
 * Get a single IC memo by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const memo = await getICMemoById(id, session.user.id);

    if (!memo) {
      return NextResponse.json({ error: "IC memo not found" }, { status: 404 });
    }

    return NextResponse.json({ data: memo }, { status: 200 });
  } catch (error) {
    console.error("Error fetching IC memo:", error);
    return NextResponse.json(
      { error: "Failed to fetch IC memo" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ic-memos/[id]
 * Update an IC memo
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateICMemoSchema.parse(body);

    const memo = await updateICMemo(session.user.id, id, validated);

    if (!memo) {
      return NextResponse.json(
        { error: "IC memo not found or cannot be updated" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: memo }, { status: 200 });
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

    console.error("Error updating IC memo:", error);
    return NextResponse.json(
      { error: "Failed to update IC memo" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ic-memos/[id]
 * Delete an IC memo (only DRAFT status)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await deleteICMemo(session.user.id, id);

    if (!deleted) {
      return NextResponse.json(
        { error: "IC memo not found or cannot be deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting IC memo:", error);
    return NextResponse.json(
      { error: "Failed to delete IC memo" },
      { status: 500 }
    );
  }
}
