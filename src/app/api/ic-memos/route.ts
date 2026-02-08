import { NextRequest, NextResponse } from "next/server";
import { getICMemos, createICMemo, getICMemoStats } from "@/lib/db/ic-memos";
import { auth } from "@/lib/auth";
import { createICMemoSchema, icMemoFilterSchema } from "@/lib/validations/ic-memo";
import { z } from "zod";

/**
 * GET /api/ic-memos
 * List IC memos with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Check if stats are requested
    if (searchParams.get("stats") === "true") {
      const stats = await getICMemoStats(session.user.id);
      return NextResponse.json({ data: stats }, { status: 200 });
    }

    // Parse filters from query params
    const filters = icMemoFilterSchema.parse({
      status: searchParams.get("status") || undefined,
      companyId: searchParams.get("companyId") || undefined,
      dealId: searchParams.get("dealId") || undefined,
      authorId: searchParams.get("authorId") || undefined,
      recommendation: searchParams.get("recommendation") || undefined,
      finalDecision: searchParams.get("finalDecision") || undefined,
      focusArea: searchParams.get("focusArea") || undefined,
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
    });

    const memos = await getICMemos({
      userId: session.user.id,
      ...filters,
    });

    return NextResponse.json({ data: memos }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid filter parameters", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error fetching IC memos:", error);
    return NextResponse.json(
      { error: "Failed to fetch IC memos" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ic-memos
 * Create a new IC memo
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createICMemoSchema.parse(body);

    const memo = await createICMemo(session.user.id, validated);

    return NextResponse.json({ data: memo }, { status: 201 });
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

    console.error("Error creating IC memo:", error);
    return NextResponse.json(
      { error: "Failed to create IC memo" },
      { status: 500 }
    );
  }
}
