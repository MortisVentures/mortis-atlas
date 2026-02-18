import { prisma } from "@/lib/db/prisma";

// =============================================================================
// TYPES
// =============================================================================

export interface AttendeeMatchResult {
  email: string;
  contactId: string | null;
  companyId: string | null;
  confidence: number; // 0-1
  matchType: "exact" | "domain" | "none";
}

export interface EventAutoLinkResult {
  eventId: string;
  companyId: string | null;
  dealId: string | null;
  isAutoLinked: boolean;
  confidence: number;
}

// =============================================================================
// ATTENDEE MATCHING
// =============================================================================

/**
 * Match an attendee email to a contact
 */
export async function matchAttendeeToContact(
  email: string,
  userId: string
): Promise<AttendeeMatchResult> {
  // First try exact email match
  const contact = await prisma.contact.findFirst({
    where: {
      userId,
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
    include: {
      company: { select: { id: true } },
    },
  });

  if (contact) {
    return {
      email,
      contactId: contact.id,
      companyId: contact.companyId,
      confidence: 1.0,
      matchType: "exact",
    };
  }

  // Try domain matching to company
  const domain = extractDomain(email);
  if (domain) {
    const company = await matchDomainToCompany(domain, userId);
    if (company) {
      return {
        email,
        contactId: null,
        companyId: company.id,
        confidence: 0.7,
        matchType: "domain",
      };
    }
  }

  return {
    email,
    contactId: null,
    companyId: null,
    confidence: 0,
    matchType: "none",
  };
}

/**
 * Match multiple attendees to contacts
 */
export async function matchAttendeesToContacts(
  emails: string[],
  userId: string
): Promise<AttendeeMatchResult[]> {
  const results: AttendeeMatchResult[] = [];

  for (const email of emails) {
    const result = await matchAttendeeToContact(email, userId);
    results.push(result);
  }

  return results;
}

/**
 * Match a domain to a company
 */
export async function matchDomainToCompany(
  domain: string,
  userId: string
): Promise<{ id: string; name: string } | null> {
  // Skip common public email domains
  if (isPublicEmailDomain(domain)) {
    return null;
  }

  // Try to find company by website domain
  const company = await prisma.company.findFirst({
    where: {
      userId,
      OR: [
        { website: { contains: domain, mode: "insensitive" } },
        { linkedinUrl: { contains: domain, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true },
  });

  return company;
}

// =============================================================================
// EVENT AUTO-LINKING
// =============================================================================

/**
 * Auto-link an event to a company and deal based on attendees
 */
export async function autoLinkEvent(
  eventId: string,
  attendeeEmails: string[],
  userId: string
): Promise<EventAutoLinkResult> {
  // Match all attendees
  const matches = await matchAttendeesToContacts(attendeeEmails, userId);

  // Find the best company match (highest confidence)
  const companyMatches = matches.filter((m) => m.companyId);
  let bestCompanyMatch: AttendeeMatchResult | null = null;
  let bestConfidence = 0;

  for (const match of companyMatches) {
    if (match.confidence > bestConfidence) {
      bestConfidence = match.confidence;
      bestCompanyMatch = match;
    }
  }

  if (!bestCompanyMatch || !bestCompanyMatch.companyId) {
    return {
      eventId,
      companyId: null,
      dealId: null,
      isAutoLinked: false,
      confidence: 0,
    };
  }

  // Try to find an active deal for this company
  const activeDeal = await prisma.deal.findFirst({
    where: {
      userId,
      companyId: bestCompanyMatch.companyId,
      stage: {
        notIn: ["CLOSED_WON", "CLOSED_LOST"],
      },
    },
    orderBy: { lastActivityDate: "desc" },
  });

  // Update the event with auto-links
  await prisma.calendarEvent.update({
    where: { id: eventId },
    data: {
      companyId: bestCompanyMatch.companyId,
      dealId: activeDeal?.id || null,
      isAutoLinked: true,
      linkConfirmed: false,
    },
  });

  // Update attendees with matched contact/company IDs
  for (const match of matches) {
    if (match.contactId || match.companyId) {
      await prisma.calendarAttendee.updateMany({
        where: { eventId, email: match.email },
        data: {
          contactId: match.contactId,
          companyId: match.companyId,
        },
      });
    }
  }

  return {
    eventId,
    companyId: bestCompanyMatch.companyId,
    dealId: activeDeal?.id || null,
    isAutoLinked: true,
    confidence: bestConfidence,
  };
}

/**
 * Run auto-linking for all unlinked events for a user
 */
export async function autoLinkUnlinkedEvents(
  userId: string
): Promise<{ processed: number; linked: number }> {
  // Find events without company links
  const unlinkedEvents = await prisma.calendarEvent.findMany({
    where: {
      account: { userId },
      companyId: null,
      isAutoLinked: false,
    },
    select: {
      id: true,
      attendeeEmails: true,
    },
  });

  let linked = 0;

  for (const event of unlinkedEvents) {
    const result = await autoLinkEvent(event.id, event.attendeeEmails, userId);
    if (result.isAutoLinked) {
      linked++;
    }
  }

  return {
    processed: unlinkedEvents.length,
    linked,
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Extract domain from email address
 */
function extractDomain(email: string): string | null {
  const parts = email.split("@");
  if (parts.length !== 2) return null;
  return parts[1].toLowerCase();
}

/**
 * Check if domain is a public email provider
 */
function isPublicEmailDomain(domain: string): boolean {
  const publicDomains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "live.com",
    "msn.com",
    "aol.com",
    "icloud.com",
    "me.com",
    "mac.com",
    "protonmail.com",
    "proton.me",
    "mail.com",
    "zoho.com",
    "yandex.com",
    "gmx.com",
    "gmx.net",
    "fastmail.com",
    "tutanota.com",
  ];

  return publicDomains.includes(domain.toLowerCase());
}
