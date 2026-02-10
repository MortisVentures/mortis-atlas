import { prisma } from "@/lib/db/prisma";
import { UnknownSender, UnknownSenderStatus } from "@prisma/client";
import { calculateSenderScore } from "./scoring";
import { parseNameFromEmail, ParsedSignature } from "./signature-parser";
import {
  findCompanyMatches,
  getDomainInfo,
  CompanyMatch,
} from "./company-matcher";

// =============================================================================
// TYPES
// =============================================================================

export interface UnknownSenderWithDetails extends UnknownSender {
  domainInfo: ReturnType<typeof getDomainInfo>;
  parsedName: { firstName?: string; lastName?: string };
  companyMatches: CompanyMatch[];
  signatureInfo?: ParsedSignature;
}

export interface ProposalActionResult {
  success: boolean;
  contactId?: string;
  companyId?: string;
  error?: string;
}

// =============================================================================
// DETECTION & SCORING
// =============================================================================

/**
 * Process and score all pending unknown senders for a user
 */
export async function processUnknownSenders(userId: string): Promise<number> {
  // Get all pending unknown senders
  const senders = await prisma.unknownSender.findMany({
    where: {
      userId,
      status: "PENDING",
    },
  });

  let updated = 0;

  for (const sender of senders) {
    // Recalculate score
    const score = calculateSenderScore({
      messageCount: sender.messageCount,
      threadCount: sender.threadCount,
      lastSeenAt: sender.lastSeenAt,
      firstSeenAt: sender.firstSeenAt,
      domain: sender.domain,
      recentSubjects: sender.recentSubjects,
    });

    // Update if score changed
    if (score !== sender.score) {
      await prisma.unknownSender.update({
        where: { id: sender.id },
        data: { score },
      });
      updated++;
    }
  }

  return updated;
}

/**
 * Get unknown senders with enriched details
 */
export async function getUnknownSendersWithDetails(
  userId: string,
  options: {
    status?: UnknownSenderStatus;
    limit?: number;
    offset?: number;
    minScore?: number;
  } = {}
): Promise<{ senders: UnknownSenderWithDetails[]; total: number }> {
  const { status = "PENDING", limit = 50, offset = 0, minScore = 0 } = options;

  // Get total count
  const total = await prisma.unknownSender.count({
    where: {
      userId,
      status,
      score: { gte: minScore },
    },
  });

  // Get senders
  const senders = await prisma.unknownSender.findMany({
    where: {
      userId,
      status,
      score: { gte: minScore },
    },
    orderBy: { score: "desc" },
    take: limit,
    skip: offset,
  });

  // Enrich with details
  const enriched = await Promise.all(
    senders.map(async (sender) => {
      const domainInfo = getDomainInfo(sender.email);
      const parsedName = parseNameFromEmail(sender.name, sender.email);

      // Find company matches
      const companyMatches = sender.domain
        ? await findCompanyMatches(userId, sender.domain)
        : [];

      // Get signature info from metadata if available
      const signatureInfo = sender.metadata
        ? (sender.metadata as ParsedSignature)
        : undefined;

      return {
        ...sender,
        domainInfo,
        parsedName,
        companyMatches,
        signatureInfo,
      };
    })
  );

  return { senders: enriched, total };
}

/**
 * Get a single unknown sender with details
 */
export async function getUnknownSenderDetails(
  userId: string,
  senderId: string
): Promise<UnknownSenderWithDetails | null> {
  const sender = await prisma.unknownSender.findFirst({
    where: {
      id: senderId,
      userId,
    },
  });

  if (!sender) {
    return null;
  }

  const domainInfo = getDomainInfo(sender.email);
  const parsedName = parseNameFromEmail(sender.name, sender.email);

  const companyMatches = sender.domain
    ? await findCompanyMatches(userId, sender.domain)
    : [];

  const signatureInfo = sender.metadata
    ? (sender.metadata as ParsedSignature)
    : undefined;

  return {
    ...sender,
    domainInfo,
    parsedName,
    companyMatches,
    signatureInfo,
  };
}

// =============================================================================
// PROPOSAL ACTIONS
// =============================================================================

/**
 * Create a contact from an unknown sender proposal
 */
export async function createContactFromProposal(
  userId: string,
  senderId: string,
  data: {
    firstName: string;
    lastName: string;
    role?: string;
    phone?: string;
    linkedinUrl?: string;
    companyId?: string; // Link to existing company
    createCompany?: {
      name: string;
      website?: string;
    };
  }
): Promise<ProposalActionResult> {
  try {
    // Get the unknown sender
    const sender = await prisma.unknownSender.findFirst({
      where: { id: senderId, userId },
    });

    if (!sender) {
      return { success: false, error: "Sender not found" };
    }

    let companyId = data.companyId;

    // Create new company if requested
    if (data.createCompany) {
      const company = await prisma.company.create({
        data: {
          userId,
          name: data.createCompany.name,
          website: data.createCompany.website,
          stage: "PROSPECT",
        },
      });
      companyId = company.id;
    }

    // Create the contact
    const contact = await prisma.contact.create({
      data: {
        userId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: sender.email,
        role: data.role,
        phone: data.phone,
        linkedinUrl: data.linkedinUrl,
        companyId,
      },
    });

    // Update unknown sender status
    await prisma.unknownSender.update({
      where: { id: senderId },
      data: {
        status: companyId ? "CREATED_CONTACT" : "CREATED_CONTACT",
        createdContactId: contact.id,
        createdCompanyId: data.createCompany ? companyId : undefined,
      },
    });

    return {
      success: true,
      contactId: contact.id,
      companyId,
    };
  } catch (error) {
    console.error("Error creating contact from proposal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create contact",
    };
  }
}

/**
 * Link an unknown sender to an existing contact
 */
export async function linkToExistingContact(
  userId: string,
  senderId: string,
  contactId: string
): Promise<ProposalActionResult> {
  try {
    // Verify ownership
    const sender = await prisma.unknownSender.findFirst({
      where: { id: senderId, userId },
    });

    if (!sender) {
      return { success: false, error: "Sender not found" };
    }

    const contact = await prisma.contact.findFirst({
      where: { id: contactId, userId },
    });

    if (!contact) {
      return { success: false, error: "Contact not found" };
    }

    // Update contact email if not set
    if (!contact.email) {
      await prisma.contact.update({
        where: { id: contactId },
        data: { email: sender.email },
      });
    }

    // Update unknown sender status
    await prisma.unknownSender.update({
      where: { id: senderId },
      data: {
        status: "LINKED_EXISTING",
        linkedContactId: contactId,
      },
    });

    return {
      success: true,
      contactId,
      companyId: contact.companyId || undefined,
    };
  } catch (error) {
    console.error("Error linking to existing contact:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to link contact",
    };
  }
}

/**
 * Dismiss an unknown sender proposal
 */
export async function dismissProposal(
  userId: string,
  senderId: string,
  reason?: string
): Promise<ProposalActionResult> {
  try {
    const sender = await prisma.unknownSender.findFirst({
      where: { id: senderId, userId },
    });

    if (!sender) {
      return { success: false, error: "Sender not found" };
    }

    await prisma.unknownSender.update({
      where: { id: senderId },
      data: {
        status: "DISMISSED",
        dismissedReason: reason,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error dismissing proposal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to dismiss",
    };
  }
}

// =============================================================================
// STATS
// =============================================================================

/**
 * Get proposal statistics for a user
 */
export async function getProposalStats(userId: string): Promise<{
  pending: number;
  highPriority: number;
  thisWeek: number;
}> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [pending, highPriority, thisWeek] = await Promise.all([
    prisma.unknownSender.count({
      where: { userId, status: "PENDING" },
    }),
    prisma.unknownSender.count({
      where: { userId, status: "PENDING", score: { gte: 50 } },
    }),
    prisma.unknownSender.count({
      where: {
        userId,
        status: "PENDING",
        firstSeenAt: { gte: oneWeekAgo },
      },
    }),
  ]);

  return { pending, highPriority, thisWeek };
}
