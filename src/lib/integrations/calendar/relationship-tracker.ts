import { prisma } from "@/lib/db/prisma";
import { RelationshipHeat } from "@prisma/client";
import {
  RelationshipHeatData,
  HEAT_THRESHOLDS,
  HEAT_SCORE_WEIGHTS,
} from "./types";

// =============================================================================
// RELATIONSHIP HEAT CALCULATION
// =============================================================================

/**
 * Calculate relationship heat for a company
 */
export async function calculateCompanyHeat(
  companyId: string,
  userId: string
): Promise<RelationshipHeatData> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Get meeting counts
  const [meetingsLast30d, meetingsLast90d, totalMeetings, lastMeeting] = await Promise.all([
    prisma.calendarEvent.count({
      where: {
        account: { userId },
        companyId,
        startTime: { gte: thirtyDaysAgo, lt: now },
        status: { not: "cancelled" },
      },
    }),
    prisma.calendarEvent.count({
      where: {
        account: { userId },
        companyId,
        startTime: { gte: ninetyDaysAgo, lt: now },
        status: { not: "cancelled" },
      },
    }),
    prisma.calendarEvent.count({
      where: {
        account: { userId },
        companyId,
        status: { not: "cancelled" },
      },
    }),
    prisma.calendarEvent.findFirst({
      where: {
        account: { userId },
        companyId,
        startTime: { lt: now },
        status: { not: "cancelled" },
      },
      orderBy: { startTime: "desc" },
    }),
  ]);

  // Calculate days since last meeting
  const daysSinceLastMeeting = lastMeeting
    ? Math.floor((now.getTime() - lastMeeting.startTime.getTime()) / (24 * 60 * 60 * 1000))
    : null;

  // Calculate average meetings per month (last 90 days)
  const avgMeetingsPerMonth = (meetingsLast90d / 3);

  // Calculate trend direction (compare last 30 days to previous 30 days)
  const meetingsPrevious30d = await prisma.calendarEvent.count({
    where: {
      account: { userId },
      companyId,
      startTime: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      status: { not: "cancelled" },
    },
  });

  // Trend: positive means increasing, negative means decreasing
  const trendDirection = meetingsPrevious30d > 0
    ? (meetingsLast30d - meetingsPrevious30d) / meetingsPrevious30d
    : meetingsLast30d > 0 ? 1 : 0;

  // Calculate heat score (0-100)
  const heatScore = calculateHeatScore(daysSinceLastMeeting, avgMeetingsPerMonth, trendDirection);

  // Determine heat level
  const heat = determineHeatLevel(heatScore, trendDirection);

  return {
    heat,
    heatScore,
    trendDirection,
    meetingsLast30d,
    meetingsLast90d,
    daysSinceLastMeeting,
    totalMeetings,
  };
}

/**
 * Calculate relationship heat for a contact
 */
export async function calculateContactHeat(
  contactId: string,
  userId: string
): Promise<RelationshipHeatData> {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { email: true },
  });

  if (!contact?.email) {
    return {
      heat: "COLD",
      heatScore: 0,
      trendDirection: 0,
      meetingsLast30d: 0,
      meetingsLast90d: 0,
      daysSinceLastMeeting: null,
      totalMeetings: 0,
    };
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Get meeting counts for events where contact is an attendee
  const [meetingsLast30d, meetingsLast90d, totalMeetings, lastMeeting] = await Promise.all([
    prisma.calendarEvent.count({
      where: {
        account: { userId },
        attendees: { some: { email: { equals: contact.email, mode: "insensitive" } } },
        startTime: { gte: thirtyDaysAgo, lt: now },
        status: { not: "cancelled" },
      },
    }),
    prisma.calendarEvent.count({
      where: {
        account: { userId },
        attendees: { some: { email: { equals: contact.email, mode: "insensitive" } } },
        startTime: { gte: ninetyDaysAgo, lt: now },
        status: { not: "cancelled" },
      },
    }),
    prisma.calendarEvent.count({
      where: {
        account: { userId },
        attendees: { some: { email: { equals: contact.email, mode: "insensitive" } } },
        status: { not: "cancelled" },
      },
    }),
    prisma.calendarEvent.findFirst({
      where: {
        account: { userId },
        attendees: { some: { email: { equals: contact.email, mode: "insensitive" } } },
        startTime: { lt: now },
        status: { not: "cancelled" },
      },
      orderBy: { startTime: "desc" },
    }),
  ]);

  const daysSinceLastMeeting = lastMeeting
    ? Math.floor((now.getTime() - lastMeeting.startTime.getTime()) / (24 * 60 * 60 * 1000))
    : null;

  const avgMeetingsPerMonth = (meetingsLast90d / 3);

  const meetingsPrevious30d = await prisma.calendarEvent.count({
    where: {
      account: { userId },
      attendees: { some: { email: { equals: contact.email, mode: "insensitive" } } },
      startTime: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      status: { not: "cancelled" },
    },
  });

  const trendDirection = meetingsPrevious30d > 0
    ? (meetingsLast30d - meetingsPrevious30d) / meetingsPrevious30d
    : meetingsLast30d > 0 ? 1 : 0;

  const heatScore = calculateHeatScore(daysSinceLastMeeting, avgMeetingsPerMonth, trendDirection);
  const heat = determineHeatLevel(heatScore, trendDirection);

  return {
    heat,
    heatScore,
    trendDirection,
    meetingsLast30d,
    meetingsLast90d,
    daysSinceLastMeeting,
    totalMeetings,
  };
}

/**
 * Calculate heat score (0-100)
 */
function calculateHeatScore(
  daysSinceLastMeeting: number | null,
  avgMeetingsPerMonth: number,
  trendDirection: number
): number {
  let score = 0;

  // Recency points (max 40)
  if (daysSinceLastMeeting !== null) {
    if (daysSinceLastMeeting <= 7) {
      score += HEAT_SCORE_WEIGHTS.RECENCY.LAST_7_DAYS;
    } else if (daysSinceLastMeeting <= 14) {
      score += HEAT_SCORE_WEIGHTS.RECENCY.LAST_14_DAYS;
    } else if (daysSinceLastMeeting <= 30) {
      score += HEAT_SCORE_WEIGHTS.RECENCY.LAST_30_DAYS;
    } else if (daysSinceLastMeeting <= 60) {
      score += HEAT_SCORE_WEIGHTS.RECENCY.LAST_60_DAYS;
    } else if (daysSinceLastMeeting <= 90) {
      score += HEAT_SCORE_WEIGHTS.RECENCY.LAST_90_DAYS;
    }
  }

  // Frequency points (max 35)
  if (avgMeetingsPerMonth >= 4) {
    score += HEAT_SCORE_WEIGHTS.FREQUENCY.FOUR_PER_MONTH;
  } else if (avgMeetingsPerMonth >= 2) {
    score += HEAT_SCORE_WEIGHTS.FREQUENCY.TWO_PER_MONTH;
  } else if (avgMeetingsPerMonth >= 1) {
    score += HEAT_SCORE_WEIGHTS.FREQUENCY.ONE_PER_MONTH;
  } else if (avgMeetingsPerMonth >= 0.5) {
    score += HEAT_SCORE_WEIGHTS.FREQUENCY.HALF_PER_MONTH;
  }

  // Trend points (max 25)
  if (trendDirection >= HEAT_THRESHOLDS.RISING_TREND) {
    score += HEAT_SCORE_WEIGHTS.TREND.RISING;
  } else if (trendDirection >= HEAT_THRESHOLDS.SLIGHTLY_RISING) {
    score += HEAT_SCORE_WEIGHTS.TREND.SLIGHTLY_RISING;
  } else if (trendDirection >= 0) {
    score += HEAT_SCORE_WEIGHTS.TREND.STABLE;
  } else {
    score += HEAT_SCORE_WEIGHTS.TREND.DECLINING;
  }

  return Math.min(score, 100);
}

/**
 * Determine heat level from score and trend
 */
function determineHeatLevel(heatScore: number, trendDirection: number): RelationshipHeat {
  if (heatScore >= HEAT_THRESHOLDS.HOT_MIN_SCORE && trendDirection >= 0) {
    return "HOT";
  }
  if (heatScore >= HEAT_THRESHOLDS.WARM_MIN_SCORE) {
    return "WARM";
  }
  if (heatScore >= HEAT_THRESHOLDS.COOLING_MIN_SCORE) {
    return "COOLING";
  }
  return "COLD";
}

// =============================================================================
// METRICS PERSISTENCE
// =============================================================================

/**
 * Update relationship metrics for a company in the database
 */
export async function updateCompanyMetrics(
  companyId: string,
  userId: string
): Promise<void> {
  const heatData = await calculateCompanyHeat(companyId, userId);

  // Get last meeting date
  const lastMeeting = await prisma.calendarEvent.findFirst({
    where: {
      account: { userId },
      companyId,
      startTime: { lt: new Date() },
      status: { not: "cancelled" },
    },
    orderBy: { startTime: "desc" },
    select: { startTime: true },
  });

  await prisma.relationshipMetrics.upsert({
    where: {
      userId_entityType_entityId: {
        userId,
        entityType: "company",
        entityId: companyId,
      },
    },
    create: {
      userId,
      entityType: "company",
      entityId: companyId,
      meetingsLast30d: heatData.meetingsLast30d,
      meetingsLast90d: heatData.meetingsLast90d,
      avgMeetingsPerMonth: heatData.meetingsLast90d / 3,
      daysSinceLastMeeting: heatData.daysSinceLastMeeting,
      lastMeetingDate: lastMeeting?.startTime || null,
      heat: heatData.heat,
      heatScore: heatData.heatScore,
      trendDirection: heatData.trendDirection,
      totalMeetings: heatData.totalMeetings,
      lastCalculatedAt: new Date(),
    },
    update: {
      meetingsLast30d: heatData.meetingsLast30d,
      meetingsLast90d: heatData.meetingsLast90d,
      avgMeetingsPerMonth: heatData.meetingsLast90d / 3,
      daysSinceLastMeeting: heatData.daysSinceLastMeeting,
      lastMeetingDate: lastMeeting?.startTime || null,
      heat: heatData.heat,
      heatScore: heatData.heatScore,
      trendDirection: heatData.trendDirection,
      totalMeetings: heatData.totalMeetings,
      lastCalculatedAt: new Date(),
    },
  });
}

/**
 * Update relationship metrics for a contact
 */
export async function updateContactMetrics(
  contactId: string,
  userId: string
): Promise<void> {
  const heatData = await calculateContactHeat(contactId, userId);

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { email: true },
  });

  let lastMeetingDate: Date | null = null;
  if (contact?.email) {
    const lastMeeting = await prisma.calendarEvent.findFirst({
      where: {
        account: { userId },
        attendees: { some: { email: { equals: contact.email, mode: "insensitive" } } },
        startTime: { lt: new Date() },
        status: { not: "cancelled" },
      },
      orderBy: { startTime: "desc" },
      select: { startTime: true },
    });
    lastMeetingDate = lastMeeting?.startTime || null;
  }

  await prisma.relationshipMetrics.upsert({
    where: {
      userId_entityType_entityId: {
        userId,
        entityType: "contact",
        entityId: contactId,
      },
    },
    create: {
      userId,
      entityType: "contact",
      entityId: contactId,
      meetingsLast30d: heatData.meetingsLast30d,
      meetingsLast90d: heatData.meetingsLast90d,
      avgMeetingsPerMonth: heatData.meetingsLast90d / 3,
      daysSinceLastMeeting: heatData.daysSinceLastMeeting,
      lastMeetingDate,
      heat: heatData.heat,
      heatScore: heatData.heatScore,
      trendDirection: heatData.trendDirection,
      totalMeetings: heatData.totalMeetings,
      lastCalculatedAt: new Date(),
    },
    update: {
      meetingsLast30d: heatData.meetingsLast30d,
      meetingsLast90d: heatData.meetingsLast90d,
      avgMeetingsPerMonth: heatData.meetingsLast90d / 3,
      daysSinceLastMeeting: heatData.daysSinceLastMeeting,
      lastMeetingDate,
      heat: heatData.heat,
      heatScore: heatData.heatScore,
      trendDirection: heatData.trendDirection,
      totalMeetings: heatData.totalMeetings,
      lastCalculatedAt: new Date(),
    },
  });
}

/**
 * Refresh all relationship metrics for a user
 */
export async function refreshAllMetrics(userId: string): Promise<{
  companies: number;
  contacts: number;
}> {
  // Get all companies with calendar events
  const companiesWithEvents = await prisma.calendarEvent.findMany({
    where: {
      account: { userId },
      companyId: { not: null },
    },
    select: { companyId: true },
    distinct: ["companyId"],
  });

  // Update each company
  for (const event of companiesWithEvents) {
    if (event.companyId) {
      await updateCompanyMetrics(event.companyId, userId);
    }
  }

  // Get all contacts with calendar events
  const contactsWithEvents = await prisma.calendarAttendee.findMany({
    where: {
      event: { account: { userId } },
      contactId: { not: null },
    },
    select: { contactId: true },
    distinct: ["contactId"],
  });

  // Update each contact
  for (const attendee of contactsWithEvents) {
    if (attendee.contactId) {
      await updateContactMetrics(attendee.contactId, userId);
    }
  }

  return {
    companies: companiesWithEvents.length,
    contacts: contactsWithEvents.length,
  };
}
