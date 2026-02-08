import { NextRequest, NextResponse } from "next/server";
import { getVotesForMemo, castVote, getUserVote, deleteVote } from "@/lib/db/ic-memos";
import { auth } from "@/lib/auth";
import { submitVoteSchema } from "@/lib/validations/ic-memo";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/ic-memos/[id]/votes
 * Get all votes for an IC memo
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

    const { id: memoId } = await params;
    const [votes, userVote] = await Promise.all([
      getVotesForMemo(memoId),
      getUserVote(memoId, session.user.id),
    ]);

    return NextResponse.json({
      data: {
        votes,
        userVote,
        summary: {
          total: votes.length,
          yes: votes.filter((v) => v.vote === "YES").length,
          no: votes.filter((v) => v.vote === "NO").length,
          abstain: votes.filter((v) => v.vote === "ABSTAIN").length,
        },
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json(
      { error: "Failed to fetch votes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ic-memos/[id]/votes
 * Cast or update a vote on an IC memo
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

    const { id: memoId } = await params;
    const body = await request.json();
    const validated = submitVoteSchema.parse(body);

    const vote = await castVote(
      session.user.id,
      memoId,
      validated.vote,
      validated.comment
    );

    return NextResponse.json({ data: vote }, { status: 201 });
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

    console.error("Error casting vote:", error);
    return NextResponse.json(
      { error: "Failed to cast vote" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ic-memos/[id]/votes
 * Delete the user's vote on an IC memo
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

    const { id: memoId } = await params;
    const deleted = await deleteVote(memoId, session.user.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Vote not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting vote:", error);
    return NextResponse.json(
      { error: "Failed to delete vote" },
      { status: 500 }
    );
  }
}
