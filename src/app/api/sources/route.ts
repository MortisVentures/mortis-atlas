import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { DealSource, DealStage } from "@prisma/client";
import { DEAL_SOURCE_CONFIG } from "@/lib/db/deals";

/**
 * GET /api/sources
 * Returns aggregated statistics for all source types
 * Includes deal counts, conversion rates, and pipeline values
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all deals grouped by source type
    const dealsBySource = await prisma.deal.groupBy({
      by: ["sourceType"],
      where: { userId },
      _count: { id: true },
      _sum: { amount: true },
    });

    // Get won deals by source
    const wonDealsBySource = await prisma.deal.groupBy({
      by: ["sourceType"],
      where: {
        userId,
        stage: DealStage.CLOSED_WON,
      },
      _count: { id: true },
      _sum: { amount: true },
    });

    // Get pending deals by source
    const pendingDealsBySource = await prisma.deal.groupBy({
      by: ["sourceType"],
      where: {
        userId,
        stage: {
          notIn: [DealStage.CLOSED_WON, DealStage.CLOSED_LOST],
        },
      },
      _count: { id: true },
      _sum: { amount: true },
    });

    // Build comprehensive stats for each source type
    const sourceStats = Object.values(DealSource).map((sourceType) => {
      const totalData = dealsBySource.find((d) => d.sourceType === sourceType);
      const wonData = wonDealsBySource.find((d) => d.sourceType === sourceType);
      const pendingData = pendingDealsBySource.find((d) => d.sourceType === sourceType);

      const totalDeals = totalData?._count.id || 0;
      const wonDeals = wonData?._count.id || 0;
      const pendingDeals = pendingData?._count.id || 0;
      const lostDeals = totalDeals - wonDeals - pendingDeals;

      const totalPipelineValue = totalData?._sum.amount?.toNumber() || 0;
      const wonValue = wonData?._sum.amount?.toNumber() || 0;
      const pendingValue = pendingData?._sum.amount?.toNumber() || 0;

      const conversionRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;
      const avgDealSize = wonDeals > 0 ? wonValue / wonDeals : 0;

      const config = DEAL_SOURCE_CONFIG[sourceType];

      return {
        sourceType,
        label: config.label,
        color: config.color,
        description: config.description,
        metrics: {
          totalDeals,
          wonDeals,
          lostDeals,
          pendingDeals,
          conversionRate: Math.round(conversionRate * 10) / 10,
          totalPipelineValue,
          wonValue,
          pendingValue,
          avgDealSize: Math.round(avgDealSize),
        },
      };
    });

    // Filter out sources with no deals and sort by won deals
    const activeSourceStats = sourceStats
      .filter((s) => s.metrics.totalDeals > 0)
      .sort((a, b) => b.metrics.wonDeals - a.metrics.wonDeals);

    // Calculate overall totals
    const totalDeals = sourceStats.reduce((sum, s) => sum + s.metrics.totalDeals, 0);
    const wonDeals = sourceStats.reduce((sum, s) => sum + s.metrics.wonDeals, 0);

    const overallTotals = {
      totalDeals,
      wonDeals,
      pendingDeals: sourceStats.reduce((sum, s) => sum + s.metrics.pendingDeals, 0),
      totalPipelineValue: sourceStats.reduce((sum, s) => sum + s.metrics.totalPipelineValue, 0),
      wonValue: sourceStats.reduce((sum, s) => sum + s.metrics.wonValue, 0),
      pendingValue: sourceStats.reduce((sum, s) => sum + s.metrics.pendingValue, 0),
      conversionRate: totalDeals > 0
        ? Math.round((wonDeals / totalDeals) * 1000) / 10
        : 0,
    };

    // Get top referrers across all sources
    const topReferrers = await prisma.contact.findMany({
      where: {
        userId,
        totalReferralsMade: { gt: 0 },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        totalReferralsMade: true,
        successfulReferrals: true,
        referralConversionRate: true,
        company: {
          select: { name: true },
        },
      },
      orderBy: { successfulReferrals: "desc" },
      take: 5,
    });

    return NextResponse.json({
      sources: activeSourceStats,
      allSources: sourceStats,
      totals: overallTotals,
      topReferrers: topReferrers.map((r) => ({
        id: r.id,
        name: `${r.firstName} ${r.lastName}`,
        company: r.company?.name || null,
        totalReferrals: r.totalReferralsMade,
        successfulReferrals: r.successfulReferrals,
        conversionRate: r.referralConversionRate
          ? Number(r.referralConversionRate)
          : null,
      })),
    });
  } catch (error) {
    console.error("Error fetching source stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch source statistics" },
      { status: 500 }
    );
  }
}
