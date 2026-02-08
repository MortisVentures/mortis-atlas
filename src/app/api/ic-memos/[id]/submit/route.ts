import { NextRequest, NextResponse } from "next/server";
import { submitICMemo } from "@/lib/db/ic-memos";
import { auth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/ic-memos/[id]/submit
 * Submit an IC memo for review (changes status from DRAFT to SUBMITTED)
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const memo = await submitICMemo(session.user.id, id);

    if (!memo) {
      return NextResponse.json(
        { error: "IC memo not found or cannot be submitted" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: memo }, { status: 200 });
  } catch (error) {
    console.error("Error submitting IC memo:", error);
    return NextResponse.json(
      { error: "Failed to submit IC memo" },
      { status: 500 }
    );
  }
}
