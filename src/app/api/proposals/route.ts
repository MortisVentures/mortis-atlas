import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUnknownSendersWithDetails,
  getProposalStats,
} from "@/lib/integrations/detection";

/**
 * GET /api/proposals
 * Get contact proposals (unknown senders with enriched details)
 * Query params: status, limit, offset, minScore
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as "PENDING" | "DISMISSED" | null;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const minScore = parseInt(searchParams.get("minScore") || "0");
    const includeStats = searchParams.get("includeStats") === "true";

    // Get proposals
    const { senders, total } = await getUnknownSendersWithDetails(
      session.user.id,
      {
        status: status || "PENDING",
        limit,
        offset,
        minScore,
      }
    );

    // Get stats if requested
    let stats = null;
    if (includeStats) {
      stats = await getProposalStats(session.user.id);
    }

    return NextResponse.json({
      proposals: senders.map((s) => ({
        id: s.id,
        email: s.email,
        name: s.name,
        domain: s.domain,
        firstSeenAt: s.firstSeenAt,
        lastSeenAt: s.lastSeenAt,
        messageCount: s.messageCount,
        threadCount: s.threadCount,
        score: s.score,
        status: s.status,
        recentSubjects: s.recentSubjects,
        // Enriched data
        domainInfo: s.domainInfo,
        parsedName: s.parsedName,
        companyMatches: s.companyMatches,
        signatureInfo: s.signatureInfo,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      stats,
    });
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposals" },
      { status: 500 }
    );
  }
}
