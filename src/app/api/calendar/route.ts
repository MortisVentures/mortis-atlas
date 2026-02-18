import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCalendarEvents, getUpcomingEvents } from "@/lib/db/calendar";
import { MeetingType } from "@prisma/client";

/**
 * GET /api/calendar
 * List calendar events with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Parse query params
    const upcoming = searchParams.get("upcoming") === "true";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const companyId = searchParams.get("companyId");
    const dealId = searchParams.get("dealId");
    const detectedType = searchParams.get("detectedType") as MeetingType | null;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Handle upcoming events request
    if (upcoming) {
      const events = await getUpcomingEvents(session.user.id, limit);
      return NextResponse.json({ data: events });
    }

    // Get events with filters
    const { events, total } = await getCalendarEvents(session.user.id, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      companyId: companyId || undefined,
      dealId: dealId || undefined,
      detectedType: detectedType || undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      data: events,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + events.length < total,
      },
    });
  } catch (error) {
    console.error("[Calendar GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}
