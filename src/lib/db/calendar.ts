import { prisma } from "./prisma";
import { CalendarProvider, MeetingType, Prisma } from "@prisma/client";

// =============================================================================
// CALENDAR ACCOUNT HELPERS
// =============================================================================

/**
 * Get all calendar accounts for a user
 */
export async function getCalendarAccounts(userId: string) {
  return prisma.calendarAccount.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get a calendar account by ID
 */
export async function getCalendarAccountById(id: string, userId: string) {
  return prisma.calendarAccount.findFirst({
    where: { id, userId },
  });
}

/**
 * Create a calendar account
 */
export async function createCalendarAccount(data: {
  userId: string;
  provider: CalendarProvider;
  email: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;
  calendarId?: string;
}) {
  return prisma.calendarAccount.create({
    data: {
      userId: data.userId,
      provider: data.provider,
      email: data.email,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      tokenExpiry: data.tokenExpiry,
      calendarId: data.calendarId || "primary",
    },
  });
}

/**
 * Delete a calendar account and its events
 */
export async function deleteCalendarAccount(id: string, userId: string) {
  // First verify ownership
  const account = await prisma.calendarAccount.findFirst({
    where: { id, userId },
  });

  if (!account) {
    return null;
  }

  // Delete account (cascades to events and attendees)
  return prisma.calendarAccount.delete({
    where: { id },
  });
}

// =============================================================================
// CALENDAR EVENT HELPERS
// =============================================================================

export interface GetEventsOptions {
  startDate?: Date;
  endDate?: Date;
  companyId?: string;
  dealId?: string;
  detectedType?: MeetingType;
  limit?: number;
  offset?: number;
}

/**
 * Get calendar events for a user with filters
 */
export async function getCalendarEvents(userId: string, options: GetEventsOptions = {}) {
  const { startDate, endDate, companyId, dealId, detectedType, limit = 50, offset = 0 } = options;

  const where: Prisma.CalendarEventWhereInput = {
    account: { userId },
    status: { not: "cancelled" },
  };

  if (startDate) {
    where.startTime = { gte: startDate };
  }
  if (endDate) {
    where.endTime = where.endTime || {};
    (where.endTime as Prisma.DateTimeFilter).lte = endDate;
  }
  if (companyId) {
    where.companyId = companyId;
  }
  if (dealId) {
    where.dealId = dealId;
  }
  if (detectedType) {
    where.detectedType = detectedType;
  }

  const [events, total] = await Promise.all([
    prisma.calendarEvent.findMany({
      where,
      include: {
        company: { select: { id: true, name: true } },
        deal: { select: { id: true, dealName: true, stage: true } },
        attendees: {
          include: {
            contact: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
      orderBy: { startTime: "asc" },
      take: limit,
      skip: offset,
    }),
    prisma.calendarEvent.count({ where }),
  ]);

  return { events, total };
}

/**
 * Get upcoming events for a user
 */
export async function getUpcomingEvents(userId: string, limit: number = 10) {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return prisma.calendarEvent.findMany({
    where: {
      account: { userId },
      startTime: { gte: now, lte: nextWeek },
      status: { not: "cancelled" },
    },
    include: {
      company: { select: { id: true, name: true } },
      deal: { select: { id: true, dealName: true, stage: true } },
      attendees: {
        include: {
          contact: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      prepBrief: true,
    },
    orderBy: { startTime: "asc" },
    take: limit,
  });
}

/**
 * Get a single event with full details
 */
export async function getCalendarEventById(id: string, userId: string) {
  return prisma.calendarEvent.findFirst({
    where: {
      id,
      account: { userId },
    },
    include: {
      account: { select: { id: true, email: true, provider: true } },
      company: true,
      deal: {
        include: {
          company: { select: { id: true, name: true } },
          teamMembers: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      },
      activity: true,
      attendees: {
        include: {
          contact: {
            include: {
              company: { select: { id: true, name: true } },
            },
          },
        },
      },
      prepBrief: true,
    },
  });
}

/**
 * Update event CRM links
 */
export async function updateEventLinks(
  eventId: string,
  userId: string,
  data: {
    companyId?: string | null;
    dealId?: string | null;
    detectedType?: MeetingType | null;
    linkConfirmed?: boolean;
  }
) {
  // Verify ownership
  const event = await prisma.calendarEvent.findFirst({
    where: {
      id: eventId,
      account: { userId },
    },
  });

  if (!event) {
    return null;
  }

  return prisma.calendarEvent.update({
    where: { id: eventId },
    data: {
      companyId: data.companyId,
      dealId: data.dealId,
      detectedType: data.detectedType,
      linkConfirmed: data.linkConfirmed,
    },
    include: {
      company: { select: { id: true, name: true } },
      deal: { select: { id: true, dealName: true } },
    },
  });
}

// =============================================================================
// MEETING PREP BRIEF HELPERS
// =============================================================================

/**
 * Get or create a meeting prep brief for an event
 */
export async function getOrCreatePrepBrief(eventId: string) {
  const existing = await prisma.meetingPrepBrief.findUnique({
    where: { eventId },
  });

  if (existing) {
    return existing;
  }

  // Create empty brief (will be populated by the prep generator)
  return prisma.meetingPrepBrief.create({
    data: {
      eventId,
      suggestedTalkingPoints: [],
      openQuestions: [],
    },
  });
}

/**
 * Update a meeting prep brief
 */
export async function updatePrepBrief(
  eventId: string,
  data: {
    dealContext?: Prisma.InputJsonValue;
    companyContext?: Prisma.InputJsonValue;
    attendeeProfiles?: Prisma.InputJsonValue;
    relationshipSignals?: Prisma.InputJsonValue;
    suggestedTalkingPoints?: string[];
    openQuestions?: string[];
    recentInteractions?: Prisma.InputJsonValue;
  }
) {
  return prisma.meetingPrepBrief.upsert({
    where: { eventId },
    create: {
      eventId,
      ...data,
      suggestedTalkingPoints: data.suggestedTalkingPoints || [],
      openQuestions: data.openQuestions || [],
    },
    update: {
      ...data,
      generatedAt: new Date(),
    },
  });
}

/**
 * Mark a prep brief as viewed
 */
export async function markPrepBriefViewed(eventId: string) {
  return prisma.meetingPrepBrief.update({
    where: { eventId },
    data: { viewedAt: new Date() },
  });
}

// =============================================================================
// ANALYTICS HELPERS
// =============================================================================

/**
 * Get meeting counts by type for a user
 */
export async function getMeetingCountsByType(userId: string, days: number = 90) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const counts = await prisma.calendarEvent.groupBy({
    by: ["detectedType"],
    where: {
      account: { userId },
      startTime: { gte: since },
      status: { not: "cancelled" },
    },
    _count: { id: true },
  });

  return counts.map((c) => ({
    type: c.detectedType,
    count: c._count.id,
  }));
}

/**
 * Get meetings for a company
 */
export async function getMeetingsForCompany(companyId: string, userId: string) {
  return prisma.calendarEvent.findMany({
    where: {
      companyId,
      account: { userId },
      status: { not: "cancelled" },
    },
    orderBy: { startTime: "desc" },
    include: {
      attendees: {
        include: {
          contact: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });
}

/**
 * Get meetings for a deal
 */
export async function getMeetingsForDeal(dealId: string, userId: string) {
  return prisma.calendarEvent.findMany({
    where: {
      dealId,
      account: { userId },
      status: { not: "cancelled" },
    },
    orderBy: { startTime: "desc" },
    include: {
      attendees: {
        include: {
          contact: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });
}
