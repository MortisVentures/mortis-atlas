import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateMeetingPrepBrief } from "@/lib/integrations/calendar/meeting-prep";
import { markPrepBriefViewed } from "@/lib/db/calendar";
import { prisma } from "@/lib/db/prisma";

interface RouteParams {
  params: Promise<{ eventId: string }>;
}

/**
 * GET /api/calendar/prep/[eventId]
 * Get or generate a meeting prep brief for an event
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;
    const { searchParams } = new URL(request.url);
    const regenerate = searchParams.get("regenerate") === "true";

    // Verify event belongs to user
    const event = await prisma.calendarEvent.findFirst({
      where: {
        id: eventId,
        account: { userId: session.user.id },
      },
      include: {
        prepBrief: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if we have an existing brief that's recent
    const hasRecentBrief = event.prepBrief && !regenerate &&
      (Date.now() - event.prepBrief.generatedAt.getTime()) < 24 * 60 * 60 * 1000; // 24 hours

    if (hasRecentBrief && event.prepBrief) {
      // Mark as viewed
      await markPrepBriefViewed(eventId);

      return NextResponse.json({
        data: {
          id: event.prepBrief.id,
          eventId: event.prepBrief.eventId,
          generatedAt: event.prepBrief.generatedAt,
          viewedAt: new Date(), // Updated now
          dealContext: event.prepBrief.dealContext,
          companyContext: event.prepBrief.companyContext,
          attendeeProfiles: event.prepBrief.attendeeProfiles,
          relationshipSignals: event.prepBrief.relationshipSignals,
          suggestedTalkingPoints: event.prepBrief.suggestedTalkingPoints,
          openQuestions: event.prepBrief.openQuestions,
          recentInteractions: event.prepBrief.recentInteractions,
        },
      });
    }

    // Generate new brief
    const briefData = await generateMeetingPrepBrief(eventId, session.user.id);

    // Get the saved brief
    const savedBrief = await prisma.meetingPrepBrief.findUnique({
      where: { eventId },
    });

    // Mark as viewed
    await markPrepBriefViewed(eventId);

    return NextResponse.json({
      data: {
        id: savedBrief?.id,
        eventId,
        generatedAt: savedBrief?.generatedAt,
        viewedAt: new Date(),
        ...briefData,
      },
    });
  } catch (error) {
    console.error("[Calendar Prep GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to get meeting prep brief" },
      { status: 500 }
    );
  }
}
