import { NextRequest, NextResponse } from "next/server";
import { getCompanyStats, getUniqueSectors } from "@/lib/db";

// Temporary user ID until auth is implemented
const TEMP_USER_ID = "temp-user-id";

/**
 * GET /api/companies/stats
 * Get aggregate statistics for companies
 */
export async function GET(_request: NextRequest) {
  try {
    // Fetch stats and sectors in parallel
    const [stats, sectors] = await Promise.all([
      getCompanyStats(TEMP_USER_ID),
      getUniqueSectors(TEMP_USER_ID),
    ]);

    return NextResponse.json(
      {
        ...stats,
        availableSectors: sectors,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching company stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch company statistics" },
      { status: 500 }
    );
  }
}
