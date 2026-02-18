import { prisma } from "@/lib/db/prisma";
import {
  MeetingPrepBriefData,
  DealContext,
  CompanyContext,
  AttendeeProfile,
  RelationshipSignal,
  RecentInteraction,
} from "./types";

// =============================================================================
// TALKING POINTS BY STAGE
// =============================================================================

const TALKING_POINTS_BY_STAGE: Record<string, string[]> = {
  INITIAL_REVIEW: [
    "Understand the company's core technology and value proposition",
    "Discuss the founding team's background and motivation",
    "Learn about the target market and customer segments",
    "Explore the competitive landscape and differentiation",
  ],
  MEETING_SCHEDULED: [
    "Deep dive into the product and technology stack",
    "Review key metrics and traction to date",
    "Discuss the go-to-market strategy",
    "Understand the business model and unit economics",
  ],
  DEEP_DIVE: [
    "Review detailed financial model and projections",
    "Discuss customer references and case studies",
    "Understand the technology roadmap",
    "Explore potential partnership opportunities",
  ],
  PARTNER_REVIEW: [
    "Present key findings from due diligence",
    "Discuss investment thesis and conviction level",
    "Review deal terms and valuation expectations",
    "Identify any outstanding concerns or questions",
  ],
  TERM_SHEET: [
    "Review and discuss term sheet details",
    "Align on board representation and governance",
    "Discuss milestone expectations",
    "Confirm timeline to closing",
  ],
  LEGAL_DILIGENCE: [
    "Review legal documentation status",
    "Discuss any outstanding legal issues",
    "Confirm final closing mechanics",
    "Align on post-close integration plan",
  ],
  CLOSED_WON: [
    "Discuss board meeting cadence and expectations",
    "Review key quarterly metrics to track",
    "Identify near-term support needs",
    "Discuss upcoming fundraising plans",
  ],
};

const TALKING_POINTS_BY_TYPE: Record<string, string[]> = {
  INITIAL_PITCH: [
    "Learn about the founding story and team",
    "Understand the problem being solved",
    "Discuss market opportunity and timing",
    "Explore potential fit with fund thesis",
  ],
  DUE_DILIGENCE: [
    "Review detailed metrics and financials",
    "Discuss technology and product roadmap",
    "Understand competitive positioning",
    "Explore customer feedback and retention",
  ],
  PARTNER_MEETING: [
    "Present investment recommendation",
    "Review deal terms and valuation",
    "Discuss risk factors and mitigations",
    "Align on next steps and decision timeline",
  ],
  BOARD_MEETING: [
    "Review quarterly performance vs plan",
    "Discuss strategic priorities",
    "Address any governance matters",
    "Align on near-term initiatives",
  ],
  PORTFOLIO_CHECK_IN: [
    "Review progress against milestones",
    "Discuss any challenges or blockers",
    "Explore ways to provide support",
    "Update on key metrics and runway",
  ],
  FOLLOW_UP: [
    "Address any open questions from last meeting",
    "Review progress on discussed items",
    "Discuss next steps and timeline",
  ],
  NETWORKING: [
    "Learn about the other person's background",
    "Explore potential collaboration opportunities",
    "Discuss market trends and insights",
  ],
  INVESTOR_UPDATE: [
    "Share portfolio performance highlights",
    "Discuss new investments and pipeline",
    "Address LP questions and concerns",
  ],
};

// =============================================================================
// MEETING PREP GENERATOR
// =============================================================================

/**
 * Generate a meeting prep brief for an event
 */
export async function generateMeetingPrepBrief(
  eventId: string,
  userId: string
): Promise<MeetingPrepBriefData> {
  // Get event with all related data
  const event = await prisma.calendarEvent.findFirst({
    where: {
      id: eventId,
      account: { userId },
    },
    include: {
      company: {
        include: {
          deals: {
            where: { stage: { notIn: ["CLOSED_WON", "CLOSED_LOST"] } },
            orderBy: { lastActivityDate: "desc" },
            take: 1,
          },
        },
      },
      deal: {
        include: {
          company: true,
          teamMembers: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      },
      attendees: {
        include: {
          contact: {
            include: {
              company: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  // Generate each section
  const dealContext = await generateDealContext(event.deal, event.company?.deals[0], userId);
  const companyContext = await generateCompanyContext(event.company, event.deal?.company, userId);
  const attendeeProfiles = await generateAttendeeProfiles(event.attendees, userId);
  const relationshipSignals = await generateRelationshipSignals(event.companyId, event.dealId, userId);
  const suggestedTalkingPoints = generateTalkingPoints(event.deal?.stage, event.detectedType);
  const openQuestions = await generateOpenQuestions(event.companyId, event.dealId, userId);
  const recentInteractions = await getRecentInteractions(event.companyId, event.dealId, userId);

  const briefData: MeetingPrepBriefData = {
    dealContext,
    companyContext,
    attendeeProfiles,
    relationshipSignals,
    suggestedTalkingPoints,
    openQuestions,
    recentInteractions,
  };

  // Save the brief to the database
  await prisma.meetingPrepBrief.upsert({
    where: { eventId },
    create: {
      eventId,
      dealContext: dealContext ? JSON.parse(JSON.stringify(dealContext)) : null,
      companyContext: companyContext ? JSON.parse(JSON.stringify(companyContext)) : null,
      attendeeProfiles: JSON.parse(JSON.stringify(attendeeProfiles)),
      relationshipSignals: JSON.parse(JSON.stringify(relationshipSignals)),
      suggestedTalkingPoints,
      openQuestions,
      recentInteractions: JSON.parse(JSON.stringify(recentInteractions)),
    },
    update: {
      dealContext: dealContext ? JSON.parse(JSON.stringify(dealContext)) : null,
      companyContext: companyContext ? JSON.parse(JSON.stringify(companyContext)) : null,
      attendeeProfiles: JSON.parse(JSON.stringify(attendeeProfiles)),
      relationshipSignals: JSON.parse(JSON.stringify(relationshipSignals)),
      suggestedTalkingPoints,
      openQuestions,
      recentInteractions: JSON.parse(JSON.stringify(recentInteractions)),
      generatedAt: new Date(),
    },
  });

  return briefData;
}

/**
 * Generate deal context
 */
async function generateDealContext(
  deal: {
    id: string;
    dealName: string;
    stage: string;
    amount: unknown;
    probability: number | null;
    lastStageChange: Date | null;
    teamMembers: { user: { id: string; name: string | null; email: string | null } }[];
  } | null,
  fallbackDeal: { id: string; dealName: string; stage: string; amount: unknown } | null | undefined,
  userId: string
): Promise<DealContext | null> {
  const targetDeal = deal || fallbackDeal;
  if (!targetDeal) return null;

  const amount = targetDeal.amount;
  const numAmount = amount && typeof amount === "object" && "toNumber" in amount
    ? (amount as { toNumber: () => number }).toNumber()
    : typeof amount === "number"
    ? amount
    : null;

  return {
    id: targetDeal.id,
    name: targetDeal.dealName,
    stage: targetDeal.stage,
    amount: numAmount,
    probability: deal?.probability || null,
    teamMembers: deal?.teamMembers?.map((tm) => tm.user.name || tm.user.email || "Unknown") || [],
    lastStageChange: deal?.lastStageChange || null,
    nextMilestone: getNextMilestone(targetDeal.stage),
  };
}

/**
 * Generate company context
 */
async function generateCompanyContext(
  company: { id: string; name: string; sector: string | null; stage: string; valuation: unknown; fundingRound: string | null } | null,
  fallbackCompany: { id: string; name: string; sector: string | null; stage: string } | null | undefined,
  userId: string
): Promise<CompanyContext | null> {
  const targetCompany = company || fallbackCompany;
  if (!targetCompany) return null;

  // Get meeting count
  const meetingsCount = await prisma.calendarEvent.count({
    where: {
      account: { userId },
      companyId: targetCompany.id,
      startTime: { lt: new Date() },
    },
  });

  // Get last meeting date
  const lastMeeting = await prisma.calendarEvent.findFirst({
    where: {
      account: { userId },
      companyId: targetCompany.id,
      startTime: { lt: new Date() },
    },
    orderBy: { startTime: "desc" },
  });

  const valuation = company?.valuation;
  const numValuation = valuation && typeof valuation === "object" && "toNumber" in valuation
    ? (valuation as { toNumber: () => number }).toNumber()
    : typeof valuation === "number"
    ? valuation
    : null;

  return {
    id: targetCompany.id,
    name: targetCompany.name,
    sector: targetCompany.sector,
    stage: targetCompany.stage,
    valuation: numValuation,
    fundingRound: company?.fundingRound || null,
    previousMeetingsCount: meetingsCount,
    lastMeetingDate: lastMeeting?.startTime || null,
  };
}

/**
 * Generate attendee profiles
 */
async function generateAttendeeProfiles(
  attendees: {
    email: string;
    name: string | null;
    contact: {
      id: string;
      firstName: string;
      lastName: string;
      role: string | null;
      linkedinUrl: string | null;
      company: { id: string; name: string } | null;
    } | null;
  }[],
  userId: string
): Promise<AttendeeProfile[]> {
  const profiles: AttendeeProfile[] = [];

  for (const attendee of attendees) {
    // Get interaction count
    let interactionCount = 0;
    let lastInteraction: Date | null = null;

    if (attendee.contact) {
      const activities = await prisma.activity.findMany({
        where: {
          userId,
          contactId: attendee.contact.id,
        },
        orderBy: { activityDate: "desc" },
        take: 1,
        select: { activityDate: true },
      });

      // Count all activities
      interactionCount = await prisma.activity.count({
        where: {
          userId,
          contactId: attendee.contact.id,
        },
      });

      lastInteraction = activities[0]?.activityDate || null;
    }

    profiles.push({
      email: attendee.email,
      name: attendee.contact
        ? `${attendee.contact.firstName} ${attendee.contact.lastName}`
        : attendee.name,
      role: attendee.contact?.role || null,
      company: attendee.contact?.company?.name || null,
      linkedinUrl: attendee.contact?.linkedinUrl || null,
      contactId: attendee.contact?.id || null,
      interactionCount,
      lastInteraction,
    });
  }

  return profiles;
}

/**
 * Generate relationship signals
 */
async function generateRelationshipSignals(
  companyId: string | null,
  dealId: string | null,
  userId: string
): Promise<RelationshipSignal[]> {
  const signals: RelationshipSignal[] = [];

  if (!companyId) return signals;

  // Get meeting frequency
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const [meetingsLast30, meetingsLast90] = await Promise.all([
    prisma.calendarEvent.count({
      where: {
        account: { userId },
        companyId,
        startTime: { gte: thirtyDaysAgo, lt: new Date() },
      },
    }),
    prisma.calendarEvent.count({
      where: {
        account: { userId },
        companyId,
        startTime: { gte: ninetyDaysAgo, lt: new Date() },
      },
    }),
  ]);

  // Frequency signal
  if (meetingsLast30 >= 3) {
    signals.push({
      type: "frequency",
      label: "High Meeting Frequency",
      value: `${meetingsLast30} meetings in last 30 days`,
      sentiment: "positive",
    });
  } else if (meetingsLast90 === 0) {
    signals.push({
      type: "frequency",
      label: "No Recent Meetings",
      value: "No meetings in last 90 days",
      sentiment: "negative",
    });
  }

  // Get last meeting
  const lastMeeting = await prisma.calendarEvent.findFirst({
    where: {
      account: { userId },
      companyId,
      startTime: { lt: new Date() },
    },
    orderBy: { startTime: "desc" },
  });

  if (lastMeeting) {
    const daysSince = Math.floor(
      (Date.now() - lastMeeting.startTime.getTime()) / (24 * 60 * 60 * 1000)
    );

    signals.push({
      type: "recency",
      label: "Last Meeting",
      value: daysSince === 0 ? "Today" : `${daysSince} days ago`,
      sentiment: daysSince <= 14 ? "positive" : daysSince <= 30 ? "neutral" : "negative",
    });
  }

  return signals;
}

/**
 * Generate suggested talking points
 */
function generateTalkingPoints(
  dealStage: string | null | undefined,
  meetingType: string | null
): string[] {
  // First try deal stage
  if (dealStage && TALKING_POINTS_BY_STAGE[dealStage]) {
    return TALKING_POINTS_BY_STAGE[dealStage];
  }

  // Then try meeting type
  if (meetingType && TALKING_POINTS_BY_TYPE[meetingType]) {
    return TALKING_POINTS_BY_TYPE[meetingType];
  }

  // Default talking points
  return [
    "Review the agenda and key objectives",
    "Discuss any updates since last conversation",
    "Identify next steps and action items",
    "Confirm follow-up timeline",
  ];
}

/**
 * Generate open questions from notes/activities
 */
async function generateOpenQuestions(
  companyId: string | null,
  dealId: string | null,
  userId: string
): Promise<string[]> {
  const questions: string[] = [];

  // Get recent activities with notes that might contain questions
  const activities = await prisma.activity.findMany({
    where: {
      userId,
      OR: [
        { companyId: companyId || undefined },
        { dealId: dealId || undefined },
      ],
      description: { not: null },
    },
    orderBy: { activityDate: "desc" },
    take: 10,
    select: { description: true },
  });

  // Look for questions in notes (sentences ending with ?)
  for (const activity of activities) {
    if (activity.description) {
      const matches = activity.description.match(/[^.!?]*\?/g);
      if (matches) {
        for (const match of matches) {
          const cleaned = match.trim();
          if (cleaned.length > 10 && cleaned.length < 200 && !questions.includes(cleaned)) {
            questions.push(cleaned);
          }
        }
      }
    }
  }

  return questions.slice(0, 5);
}

/**
 * Get recent interactions
 */
async function getRecentInteractions(
  companyId: string | null,
  dealId: string | null,
  userId: string
): Promise<RecentInteraction[]> {
  const activities = await prisma.activity.findMany({
    where: {
      userId,
      OR: [
        { companyId: companyId || undefined },
        { dealId: dealId || undefined },
      ],
    },
    orderBy: { activityDate: "desc" },
    take: 5,
    select: {
      type: true,
      subject: true,
      description: true,
      activityDate: true,
    },
  });

  return activities.map((a) => ({
    type: a.type,
    subject: a.subject,
    date: a.activityDate,
    description: a.description,
  }));
}

/**
 * Get next milestone based on stage
 */
function getNextMilestone(stage: string): string | null {
  const milestones: Record<string, string> = {
    INITIAL_REVIEW: "Schedule first meeting",
    MEETING_SCHEDULED: "Complete initial assessment",
    DEEP_DIVE: "Partner review presentation",
    PARTNER_REVIEW: "Issue term sheet",
    TERM_SHEET: "Complete legal diligence",
    LEGAL_DILIGENCE: "Close deal",
    CLOSED_WON: "First board meeting",
  };

  return milestones[stage] || null;
}
