import { MeetingType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { MeetingTypeDetection, MEETING_TYPE_KEYWORDS } from "./types";

// =============================================================================
// CONSTANTS
// =============================================================================

const CONFIDENCE_THRESHOLD = 0.3; // Minimum confidence to assign a type
const TITLE_WEIGHT = 0.5;
const DESCRIPTION_WEIGHT = 0.3;
const ATTENDEE_WEIGHT = 0.2;

// =============================================================================
// MEETING TYPE DETECTION
// =============================================================================

/**
 * Detect meeting type from event data
 */
export async function detectMeetingType(
  eventId: string,
  title: string,
  description: string | null,
  attendeeEmails: string[],
  userId: string,
  userEmail: string
): Promise<MeetingTypeDetection> {
  const signals: string[] = [];
  const typeScores: Record<MeetingType, number> = {
    INITIAL_PITCH: 0,
    DUE_DILIGENCE: 0,
    PARTNER_MEETING: 0,
    BOARD_MEETING: 0,
    FOLLOW_UP: 0,
    NETWORKING: 0,
    PORTFOLIO_CHECK_IN: 0,
    INVESTOR_UPDATE: 0,
    OTHER: 0,
  };

  const titleLower = title.toLowerCase();
  const descriptionLower = (description || "").toLowerCase();

  // Score each meeting type based on keywords
  for (const [type, keywords] of Object.entries(MEETING_TYPE_KEYWORDS)) {
    const meetingType = type as MeetingType;

    // Title matching (highest weight)
    for (const keyword of keywords.title) {
      if (titleLower.includes(keyword.toLowerCase())) {
        typeScores[meetingType] += TITLE_WEIGHT;
        signals.push(`Title contains "${keyword}"`);
      }
    }

    // Description matching
    if (keywords.description) {
      for (const keyword of keywords.description) {
        if (descriptionLower.includes(keyword.toLowerCase())) {
          typeScores[meetingType] += DESCRIPTION_WEIGHT;
          signals.push(`Description contains "${keyword}"`);
        }
      }
    }
  }

  // Check for PARTNER_MEETING signals (internal meeting with no external attendees)
  const isInternalOnly = await checkIfInternalMeeting(attendeeEmails, userEmail, userId);
  if (isInternalOnly && (titleLower.includes("partner") || titleLower.includes("ic"))) {
    typeScores.PARTNER_MEETING += ATTENDEE_WEIGHT;
    signals.push("Internal-only meeting with partner/IC in title");
  }

  // Check for FOLLOW_UP signals (recent meeting with same attendees)
  const hasRecentMeeting = await checkForRecentMeeting(eventId, attendeeEmails, userId);
  if (hasRecentMeeting) {
    typeScores.FOLLOW_UP += ATTENDEE_WEIGHT;
    signals.push("Recent meeting with same attendees");
  }

  // Check for NETWORKING signals (many attendees)
  if (attendeeEmails.length >= 4) {
    typeScores.NETWORKING += ATTENDEE_WEIGHT * 0.5;
    signals.push("4+ attendees");
  }

  // Check for PORTFOLIO_CHECK_IN (meeting with portfolio company)
  const isPortfolioMeeting = await checkIfPortfolioMeeting(attendeeEmails, userId);
  if (isPortfolioMeeting) {
    typeScores.PORTFOLIO_CHECK_IN += ATTENDEE_WEIGHT;
    signals.push("Attendee from portfolio company");
  }

  // Find the type with highest score
  let bestType: MeetingType = "OTHER";
  let bestScore = 0;

  for (const [type, score] of Object.entries(typeScores)) {
    if (score > bestScore) {
      bestScore = score;
      bestType = type as MeetingType;
    }
  }

  // If score is below threshold, default to OTHER
  if (bestScore < CONFIDENCE_THRESHOLD) {
    bestType = "OTHER";
    bestScore = 0;
  }

  return {
    type: bestType,
    confidence: Math.min(bestScore, 1.0),
    signals,
  };
}

/**
 * Check if meeting is internal-only (all attendees are from same org)
 */
async function checkIfInternalMeeting(
  attendeeEmails: string[],
  userEmail: string,
  userId: string
): Promise<boolean> {
  const userDomain = userEmail.split("@")[1]?.toLowerCase();
  if (!userDomain) return false;

  // Check if all attendees are from the user's domain
  return attendeeEmails.every((email) => {
    const domain = email.split("@")[1]?.toLowerCase();
    return domain === userDomain;
  });
}

/**
 * Check if there was a recent meeting with similar attendees
 */
async function checkForRecentMeeting(
  eventId: string,
  attendeeEmails: string[],
  userId: string
): Promise<boolean> {
  if (attendeeEmails.length === 0) return false;

  // Look for meetings in the last 14 days with overlapping attendees
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const recentEvents = await prisma.calendarEvent.findMany({
    where: {
      account: { userId },
      id: { not: eventId },
      startTime: { gte: twoWeeksAgo },
      status: { not: "cancelled" },
    },
    select: {
      attendeeEmails: true,
    },
    take: 50,
  });

  // Check for overlap (at least half of attendees match)
  for (const event of recentEvents) {
    const overlap = attendeeEmails.filter((email) =>
      event.attendeeEmails.some((e) => e.toLowerCase() === email.toLowerCase())
    );
    if (overlap.length >= Math.ceil(attendeeEmails.length / 2)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if meeting is with a portfolio company
 */
async function checkIfPortfolioMeeting(
  attendeeEmails: string[],
  userId: string
): Promise<boolean> {
  // Get contacts associated with portfolio companies
  const portfolioContacts = await prisma.contact.findMany({
    where: {
      userId,
      email: {
        in: attendeeEmails,
        mode: "insensitive",
      },
      company: {
        stage: "PORTFOLIO",
      },
    },
    take: 1,
  });

  return portfolioContacts.length > 0;
}

/**
 * Detect and update meeting type for an event
 */
export async function detectAndUpdateMeetingType(
  eventId: string,
  userId: string,
  userEmail: string
): Promise<MeetingTypeDetection | null> {
  const event = await prisma.calendarEvent.findFirst({
    where: {
      id: eventId,
      account: { userId },
    },
  });

  if (!event) return null;

  const detection = await detectMeetingType(
    eventId,
    event.title,
    event.description,
    event.attendeeEmails,
    userId,
    userEmail
  );

  // Update the event with detected type
  await prisma.calendarEvent.update({
    where: { id: eventId },
    data: {
      detectedType: detection.type,
      typeConfidence: detection.confidence,
    },
  });

  return detection;
}

/**
 * Run type detection for all events without a detected type
 */
export async function detectTypesForUnclassifiedEvents(
  userId: string,
  userEmail: string
): Promise<{ processed: number; classified: number }> {
  const unclassified = await prisma.calendarEvent.findMany({
    where: {
      account: { userId },
      detectedType: null,
    },
    select: {
      id: true,
      title: true,
      description: true,
      attendeeEmails: true,
    },
  });

  let classified = 0;

  for (const event of unclassified) {
    const detection = await detectMeetingType(
      event.id,
      event.title,
      event.description,
      event.attendeeEmails,
      userId,
      userEmail
    );

    await prisma.calendarEvent.update({
      where: { id: event.id },
      data: {
        detectedType: detection.type,
        typeConfidence: detection.confidence,
      },
    });

    if (detection.type !== "OTHER") {
      classified++;
    }
  }

  return {
    processed: unclassified.length,
    classified,
  };
}
