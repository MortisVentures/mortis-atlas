import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getOverviewData,
  getDealFlowData,
  getOutcomeLearningData,
  getTrendsData,
} from "@/lib/db/insights";
import type { InsightsResponse, InsightSection } from "@/lib/insights/types";

// =============================================================================
// GET /api/insights
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const section = (searchParams.get("section") || "all") as InsightSection;

    const response: InsightsResponse = {
      generatedAt: new Date().toISOString(),
      dataRange: {
        start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
    };

    // Fetch data based on section parameter
    switch (section) {
      case "overview":
        response.overview = await getOverviewData(userId);
        break;

      case "deal-flow":
        response.dealFlow = await getDealFlowData(userId);
        break;

      case "outcomes":
        response.outcomes = await getOutcomeLearningData(userId);
        break;

      case "trends":
        response.trends = await getTrendsData(userId);
        break;

      case "all":
      default:
        // Fetch all sections in parallel
        const [overview, dealFlow, outcomes, trends] = await Promise.all([
          getOverviewData(userId),
          getDealFlowData(userId),
          getOutcomeLearningData(userId),
          getTrendsData(userId),
        ]);

        response.overview = overview;
        response.dealFlow = dealFlow;
        response.outcomes = outcomes;
        response.trends = trends;
        break;
    }

    return NextResponse.json({ data: response });
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights" },
      { status: 500 }
    );
  }
}
