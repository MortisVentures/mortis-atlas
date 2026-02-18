import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCalendarEventById, updateEventLinks } from "@/lib/db/calendar";
import { MeetingType } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/calendar/[id]
 * Get a single calendar event with full details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const event = await getCalendarEventById(id, session.user.id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ data: event });
  } catch (error) {
    console.error("[Calendar Event GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar event" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/calendar/[id]
 * Update a calendar event's CRM links
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const { companyId, dealId, detectedType, linkConfirmed } = body as {
      companyId?: string | null;
      dealId?: string | null;
      detectedType?: MeetingType | null;
      linkConfirmed?: boolean;
    };

    const updated = await updateEventLinks(id, session.user.id, {
      companyId,
      dealId,
      detectedType,
      linkConfirmed,
    });

    if (!updated) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[Calendar Event PUT] Error:", error);
    return NextResponse.json(
      { error: "Failed to update calendar event" },
      { status: 500 }
    );
  }
}
