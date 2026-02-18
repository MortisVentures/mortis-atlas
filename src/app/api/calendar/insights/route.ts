import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { getHeatDistribution, getHotRelationships, getCoolingRelationships } from "@/lib/db/relationship-metrics";

/**
 * GET /api/calendar/insights
 * Get calendar analytics and insights
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") || "all";
    const entityType = searchParams.get("entityType") as "company" | "contact" | null;

    const userId = session.user.id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const data: Record<string, unknown> = {};

    // KPIs
    if (section === "all" || section === "kpis") {
      const [totalMeetings30d, totalMeetings90d, upcomingMeetings] = await Promise.all([
        prisma.calendarEvent.count({
          where: {
            account: { userId },
            startTime: { gte: thirtyDaysAgo, lt: now },
            status: { not: "cancelled" },
          },
        }),
        prisma.calendarEvent.count({
          where: {
            account: { userId },
            startTime: { gte: ninetyDaysAgo, lt: now },
            status: { not: "cancelled" },
          },
        }),
        prisma.calendarEvent.count({
          where: {
            account: { userId },
            startTime: { gte: now },
            status: { not: "cancelled" },
          },
        }),
      ]);

      data.kpis = {
        totalMeetings30d,
        totalMeetings90d,
        meetingsPerWeek: totalMeetings30d / 4.3,
        upcomingMeetings,
      };
    }

    // Heat distribution
    if (section === "all" || section === "heat") {
      const type = entityType || "company";
      const distribution = await getHeatDistribution(userId, type);
      const hotRelationships = await getHotRelationships(userId);
      const coolingRelationships = await getCoolingRelationships(userId);

      data.heat = {
        distribution,
        hotRelationships,
        coolingRelationships,
      };
    }

    // Meeting velocity by stage
    if (section === "all" || section === "velocity") {
      const meetingsWithDeals = await prisma.calendarEvent.findMany({
        where: {
          account: { userId },
          dealId: { not: null },
          startTime: { gte: ninetyDaysAgo },
          status: { not: "cancelled" },
        },
        select: {
          deal: {
            select: { stage: true },
          },
        },
      });

      const stageCount: Record<string, number> = {};
      for (const meeting of meetingsWithDeals) {
        const stage = meeting.deal?.stage || "Unknown";
        stageCount[stage] = (stageCount[stage] || 0) + 1;
      }

      data.velocity = {
        byStage: Object.entries(stageCount).map(([stage, count]) => ({
          stage,
          count,
          avgPerMonth: count / 3,
        })),
      };
    }

    // Meeting type distribution
    if (section === "all" || section === "types") {
      const typeDistribution = await prisma.calendarEvent.groupBy({
        by: ["detectedType"],
        where: {
          account: { userId },
          startTime: { gte: ninetyDaysAgo },
          status: { not: "cancelled" },
        },
        _count: { id: true },
      });

      data.types = typeDistribution.map((t) => ({
        type: t.detectedType || "Unclassified",
        count: t._count.id,
      }));
    }

    // Monthly trends
    if (section === "all" || section === "trends") {
      const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      const meetings = await prisma.calendarEvent.findMany({
        where: {
          account: { userId },
          startTime: { gte: sixMonthsAgo, lt: now },
          status: { not: "cancelled" },
        },
        select: {
          startTime: true,
        },
      });

      // Group by month
      const monthlyData: Record<string, number> = {};
      for (const meeting of meetings) {
        const monthKey = meeting.startTime.toISOString().slice(0, 7); // YYYY-MM
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      }

      data.trends = {
        monthly: Object.entries(monthlyData)
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => a.month.localeCompare(b.month)),
      };
    }

    // Attendee patterns
    if (section === "all" || section === "patterns") {
      // Get deals with most meetings and their outcomes
      const dealsWithMeetingCounts = await prisma.deal.findMany({
        where: { userId },
        select: {
          id: true,
          stage: true,
          amount: true,
          _count: {
            select: {
              calendarEvents: {
                where: { status: { not: "cancelled" } },
              },
            },
          },
        },
      });

      // Calculate meeting frequency correlations
      const closedWonDeals = dealsWithMeetingCounts.filter((d) => d.stage === "CLOSED_WON");
      const closedLostDeals = dealsWithMeetingCounts.filter((d) => d.stage === "CLOSED_LOST");

      const avgMeetingsWon = closedWonDeals.length > 0
        ? closedWonDeals.reduce((sum, d) => sum + d._count.calendarEvents, 0) / closedWonDeals.length
        : 0;

      const avgMeetingsLost = closedLostDeals.length > 0
        ? closedLostDeals.reduce((sum, d) => sum + d._count.calendarEvents, 0) / closedLostDeals.length
        : 0;

      data.patterns = {
        avgMeetingsForWonDeals: avgMeetingsWon,
        avgMeetingsForLostDeals: avgMeetingsLost,
        closedWonCount: closedWonDeals.length,
        closedLostCount: closedLostDeals.length,
        insight: avgMeetingsWon > avgMeetingsLost
          ? "Deals that closed successfully had more meetings on average"
          : null,
      };
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[Calendar Insights] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar insights" },
      { status: 500 }
    );
  }
}
