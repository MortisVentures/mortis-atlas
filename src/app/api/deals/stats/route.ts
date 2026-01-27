import { NextRequest, NextResponse } from "next/server";
import { getSourceStats, getTopReferrers } from "@/lib/db/deals";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { DealStage } from "@prisma/client";

/**
 * GET /api/deals/stats
 * Get deal statistics including source analytics and pipeline metrics
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get source attribution stats
    const sourceStats = await getSourceStats(userId);

    // Get top referrers
    const topReferrers = await getTopReferrers(userId, 5);

    // Get pipeline summary
    const pipelineStats = await prisma.deal.groupBy({
      by: ["stage"],
      where: { userId },
      _count: { id: true },
      _sum: { amount: true },
    });

    // Get priority breakdown
    const priorityStats = await prisma.deal.groupBy({
      by: ["priority"],
      where: { userId },
      _count: { id: true },
    });

    // Get total counts
    const totalDeals = await prisma.deal.count({ where: { userId } });
    const activeDeals = await prisma.deal.count({
      where: {
        userId,
        stage: {
          notIn: [DealStage.CLOSED_WON, DealStage.CLOSED_LOST],
        },
      },
    });
    const wonDeals = await prisma.deal.count({
      where: { userId, stage: DealStage.CLOSED_WON },
    });

    // Get total invested (won deals)
    const totalInvested = await prisma.deal.aggregate({
      where: { userId, stage: DealStage.CLOSED_WON },
      _sum: { amount: true },
    });

    // Get active pipeline value
    const activePipelineValue = await prisma.deal.aggregate({
      where: {
        userId,
        stage: {
          notIn: [DealStage.CLOSED_WON, DealStage.CLOSED_LOST],
        },
      },
      _sum: { amount: true },
    });

    return NextResponse.json({
      sourceStats,
      topReferrers,
      pipeline: pipelineStats.map(s => ({
        stage: s.stage,
        count: s._count.id,
        totalAmount: s._sum.amount?.toNumber() || 0,
      })),
      priority: priorityStats.map(s => ({
        priority: s.priority,
        count: s._count.id,
      })),
      summary: {
        totalDeals,
        activeDeals,
        wonDeals,
        conversionRate: totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0,
        totalInvested: totalInvested._sum.amount?.toNumber() || 0,
        activePipelineValue: activePipelineValue._sum.amount?.toNumber() || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching deal stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch deal statistics" },
      { status: 500 }
    );
  }
}
