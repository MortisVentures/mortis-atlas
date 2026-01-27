import { prisma } from "./prisma";
import {
  Deal,
  DealStage,
  DealSource,
  DealPriority,
  Prisma
} from "@prisma/client";

// =============================================================================
// TYPES
// =============================================================================

export interface DealInput {
  dealName: string;
  amount?: number | null;
  valuation?: number | null;
  stage?: DealStage;
  priority?: DealPriority;
  probability?: number | null;
  expectedClose?: Date | null;
  actualClose?: Date | null;
  notes?: string | null;

  // Source Attribution
  sourceType?: DealSource | null;
  sourceChannel?: string | null;
  sourceDetail?: string | null;
  referrerContactId?: string | null;
  referralDate?: Date | null;

  // Financial Details
  roundSize?: number | null;
  postMoneyVal?: number | null;
  ownershipTarget?: number | null;
  proRataRights?: boolean;

  // Relations
  companyId: string;
  contactId?: string | null;
  userId: string;
}

export interface DealFilters {
  userId: string;
  search?: string;
  stage?: DealStage | DealStage[];
  priority?: DealPriority;
  sourceType?: DealSource;
  companyId?: string;
  referrerContactId?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface DealWithRelations extends Deal {
  company: {
    id: string;
    name: string;
    sector: string | null;
    stage: string;
  };
  contact: {
    id: string;
    firstName: string;
    lastName: string;
    role: string | null;
  } | null;
  referrerContact: {
    id: string;
    firstName: string;
    lastName: string;
    referralConversionRate: Prisma.Decimal | null;
    totalReferralsMade: number;
    successfulReferrals: number;
    company: {
      name: string;
    } | null;
  } | null;
  teamMembers?: {
    id: string;
    role: string;
    assignedAt: Date;
    notes: string | null;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }[];
  _count?: {
    activities: number;
    documents: number;
  };
}

// =============================================================================
// DEAL CRUD OPERATIONS
// =============================================================================

export async function getDeals(filters: DealFilters): Promise<DealWithRelations[]> {
  const where: Prisma.DealWhereInput = {
    userId: filters.userId,
  };

  if (filters.search) {
    where.OR = [
      { dealName: { contains: filters.search, mode: "insensitive" } },
      { company: { name: { contains: filters.search, mode: "insensitive" } } },
      { notes: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.stage) {
    where.stage = Array.isArray(filters.stage)
      ? { in: filters.stage }
      : filters.stage;
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  if (filters.sourceType) {
    where.sourceType = filters.sourceType;
  }

  if (filters.companyId) {
    where.companyId = filters.companyId;
  }

  if (filters.referrerContactId) {
    where.referrerContactId = filters.referrerContactId;
  }

  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    where.amount = {};
    if (filters.minAmount !== undefined) {
      where.amount.gte = filters.minAmount;
    }
    if (filters.maxAmount !== undefined) {
      where.amount.lte = filters.maxAmount;
    }
  }

  return prisma.deal.findMany({
    where,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          sector: true,
          stage: true,
        },
      },
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
      referrerContact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          referralConversionRate: true,
          totalReferralsMade: true,
          successfulReferrals: true,
          company: {
            select: {
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          activities: true,
          documents: true,
        },
      },
    },
    orderBy: [
      { priority: "asc" },
      { updatedAt: "desc" },
    ],
  }) as Promise<DealWithRelations[]>;
}

export async function getDealById(
  id: string,
  userId: string
): Promise<DealWithRelations | null> {
  return prisma.deal.findFirst({
    where: { id, userId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          sector: true,
          stage: true,
        },
      },
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
      referrerContact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          referralConversionRate: true,
          totalReferralsMade: true,
          successfulReferrals: true,
          company: {
            select: {
              name: true,
            },
          },
        },
      },
      teamMembers: {
        select: {
          id: true,
          role: true,
          assignedAt: true,
          notes: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          assignedAt: "asc",
        },
      },
      _count: {
        select: {
          activities: true,
          documents: true,
        },
      },
    },
  }) as Promise<DealWithRelations | null>;
}

export async function createDeal(data: DealInput): Promise<Deal> {
  const stageHistory = [{
    stage: data.stage || DealStage.INITIAL_REVIEW,
    timestamp: new Date().toISOString(),
    notes: "Deal created",
  }];

  const deal = await prisma.deal.create({
    data: {
      dealName: data.dealName,
      amount: data.amount,
      valuation: data.valuation,
      stage: data.stage || DealStage.INITIAL_REVIEW,
      priority: data.priority || DealPriority.MEDIUM,
      probability: data.probability,
      expectedClose: data.expectedClose,
      actualClose: data.actualClose,
      notes: data.notes,

      // Source Attribution
      sourceType: data.sourceType,
      sourceChannel: data.sourceChannel,
      sourceDetail: data.sourceDetail,
      referrerContactId: data.referrerContactId,
      referralDate: data.referralDate,

      // Financial Details
      roundSize: data.roundSize,
      postMoneyVal: data.postMoneyVal,
      ownershipTarget: data.ownershipTarget,
      proRataRights: data.proRataRights ?? false,

      // Stage Tracking
      stageHistory,
      lastStageChange: new Date(),
      lastActivityDate: new Date(),

      // Relations
      companyId: data.companyId,
      contactId: data.contactId,
      userId: data.userId,
    },
  });

  // Update referrer contact metrics if this is a referral
  if (data.referrerContactId && data.sourceType === DealSource.REFERRAL) {
    await updateReferrerMetrics(data.referrerContactId);
  }

  return deal;
}

export async function updateDeal(
  id: string,
  userId: string,
  data: Partial<DealInput>
): Promise<Deal | null> {
  // Verify ownership
  const existing = await prisma.deal.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return null;
  }

  // Handle stage change
  let updateData: Prisma.DealUpdateInput = { ...data };

  if (data.stage && data.stage !== existing.stage) {
    // Add to stage history
    const existingHistory = (existing.stageHistory as Array<Record<string, unknown>>) || [];
    const newHistory = [
      ...existingHistory,
      {
        stage: data.stage,
        timestamp: new Date().toISOString(),
        previousStage: existing.stage,
      },
    ];

    updateData.stageHistory = newHistory as Prisma.InputJsonValue;
    updateData.lastStageChange = new Date();

    // Set actualClose if moving to CLOSED_WON or CLOSED_LOST
    if (data.stage === DealStage.CLOSED_WON || data.stage === DealStage.CLOSED_LOST) {
      updateData.actualClose = new Date();

      // Update referrer metrics if closed won
      if (data.stage === DealStage.CLOSED_WON && existing.referrerContactId) {
        await updateReferrerMetrics(existing.referrerContactId);
      }
    }
  }

  // Handle referrer change
  if (data.referrerContactId !== undefined &&
      data.referrerContactId !== existing.referrerContactId) {
    // Update old referrer metrics
    if (existing.referrerContactId) {
      await updateReferrerMetrics(existing.referrerContactId);
    }
    // Update new referrer metrics
    if (data.referrerContactId) {
      await updateReferrerMetrics(data.referrerContactId);
    }
  }

  return prisma.deal.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteDeal(id: string, userId: string): Promise<boolean> {
  const existing = await prisma.deal.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return false;
  }

  // Update referrer metrics before deletion
  if (existing.referrerContactId) {
    await prisma.deal.delete({ where: { id } });
    await updateReferrerMetrics(existing.referrerContactId);
    return true;
  }

  await prisma.deal.delete({ where: { id } });
  return true;
}

// =============================================================================
// REFERRER METRICS
// =============================================================================

export async function updateReferrerMetrics(contactId: string): Promise<void> {
  // Count all referrals (deals where this contact is the referrer)
  const referredDeals = await prisma.deal.findMany({
    where: { referrerContactId: contactId },
    select: {
      id: true,
      stage: true,
    },
  });

  const totalReferralsMade = referredDeals.length;
  const successfulReferrals = referredDeals.filter(
    d => d.stage === DealStage.CLOSED_WON
  ).length;

  // Also count referred companies
  const referredCompanies = await prisma.company.count({
    where: { referrerContactId: contactId },
  });

  const totalReferrals = totalReferralsMade + referredCompanies;
  const conversionRate = totalReferrals > 0
    ? (successfulReferrals / totalReferrals) * 100
    : null;

  // Get the most recent referral date
  const latestReferral = await prisma.deal.findFirst({
    where: { referrerContactId: contactId },
    orderBy: { referralDate: "desc" },
    select: { referralDate: true },
  });

  await prisma.contact.update({
    where: { id: contactId },
    data: {
      totalReferralsMade: totalReferrals,
      successfulReferrals,
      referralConversionRate: conversionRate,
      lastReferralDate: latestReferral?.referralDate,
    },
  });
}

export async function getTopReferrers(
  userId: string,
  limit: number = 10
): Promise<Array<{
  id: string;
  firstName: string;
  lastName: string;
  totalReferralsMade: number;
  successfulReferrals: number;
  referralConversionRate: number | null;
  company: { name: string } | null;
}>> {
  const contacts = await prisma.contact.findMany({
    where: {
      userId,
      totalReferralsMade: { gt: 0 },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      totalReferralsMade: true,
      successfulReferrals: true,
      referralConversionRate: true,
      company: {
        select: { name: true },
      },
    },
    orderBy: [
      { successfulReferrals: "desc" },
      { totalReferralsMade: "desc" },
    ],
    take: limit,
  });

  // Convert Prisma Decimal to number for referralConversionRate
  return contacts.map(c => ({
    ...c,
    referralConversionRate: c.referralConversionRate !== null
      ? Number(c.referralConversionRate)
      : null,
  }));
}

export async function getDealsReferredByContact(
  contactId: string,
  userId: string
): Promise<DealWithRelations[]> {
  return getDeals({
    userId,
    referrerContactId: contactId,
  });
}

// =============================================================================
// SOURCE ANALYTICS
// =============================================================================

export interface SourceStats {
  sourceType: DealSource;
  totalDeals: number;
  wonDeals: number;
  lostDeals: number;
  pendingDeals: number;
  conversionRate: number;
  totalInvested: number;
  avgDealSize: number;
}

export async function getSourceStats(userId: string): Promise<SourceStats[]> {
  const deals = await prisma.deal.findMany({
    where: { userId },
    select: {
      sourceType: true,
      stage: true,
      amount: true,
    },
  });

  const sourceGroups = new Map<DealSource, typeof deals>();

  deals.forEach(deal => {
    if (!deal.sourceType) return;

    const existing = sourceGroups.get(deal.sourceType) || [];
    existing.push(deal);
    sourceGroups.set(deal.sourceType, existing);
  });

  const stats: SourceStats[] = [];

  sourceGroups.forEach((groupDeals, sourceType) => {
    const wonDeals = groupDeals.filter(d => d.stage === DealStage.CLOSED_WON);
    const lostDeals = groupDeals.filter(d => d.stage === DealStage.CLOSED_LOST);
    const pendingDeals = groupDeals.filter(
      d => d.stage !== DealStage.CLOSED_WON && d.stage !== DealStage.CLOSED_LOST
    );

    const totalInvested = wonDeals.reduce(
      (sum, d) => sum + (d.amount?.toNumber() || 0),
      0
    );

    stats.push({
      sourceType,
      totalDeals: groupDeals.length,
      wonDeals: wonDeals.length,
      lostDeals: lostDeals.length,
      pendingDeals: pendingDeals.length,
      conversionRate: groupDeals.length > 0
        ? (wonDeals.length / groupDeals.length) * 100
        : 0,
      totalInvested,
      avgDealSize: wonDeals.length > 0 ? totalInvested / wonDeals.length : 0,
    });
  });

  return stats.sort((a, b) => b.conversionRate - a.conversionRate);
}

// =============================================================================
// PIPELINE HELPERS
// =============================================================================

export const DEAL_STAGE_ORDER: DealStage[] = [
  DealStage.INITIAL_REVIEW,
  DealStage.MEETING_SCHEDULED,
  DealStage.DEEP_DIVE,
  DealStage.PARTNER_REVIEW,
  DealStage.TERM_SHEET,
  DealStage.LEGAL_DILIGENCE,
  DealStage.CLOSED_WON,
  DealStage.CLOSED_LOST,
];

export const DEAL_STAGE_CONFIG: Record<DealStage, {
  label: string;
  color: string;
  description: string;
  probability: number;
}> = {
  INITIAL_REVIEW: {
    label: "Initial Review",
    color: "bg-slate-500",
    description: "First look at the opportunity",
    probability: 10,
  },
  MEETING_SCHEDULED: {
    label: "Meeting Scheduled",
    color: "bg-blue-500",
    description: "Initial meeting set up",
    probability: 20,
  },
  DEEP_DIVE: {
    label: "Deep Dive",
    color: "bg-indigo-500",
    description: "Detailed analysis in progress",
    probability: 40,
  },
  PARTNER_REVIEW: {
    label: "Partner Review",
    color: "bg-purple-500",
    description: "Internal partner discussion",
    probability: 60,
  },
  TERM_SHEET: {
    label: "Term Sheet",
    color: "bg-amber-500",
    description: "Terms being negotiated",
    probability: 75,
  },
  LEGAL_DILIGENCE: {
    label: "Legal Diligence",
    color: "bg-orange-500",
    description: "Legal review in progress",
    probability: 90,
  },
  CLOSED_WON: {
    label: "Closed Won",
    color: "bg-emerald-500",
    description: "Deal completed successfully",
    probability: 100,
  },
  CLOSED_LOST: {
    label: "Closed Lost",
    color: "bg-red-500",
    description: "Deal did not close",
    probability: 0,
  },
};

export const DEAL_SOURCE_CONFIG: Record<DealSource, {
  label: string;
  color: string;
  description: string;
}> = {
  REFERRAL: {
    label: "Referral",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    description: "Personal or professional referral",
  },
  DIRECT_OUTREACH: {
    label: "Direct Outreach",
    color: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    description: "Proactive outreach by our team",
  },
  INBOUND: {
    label: "Inbound",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    description: "Company reached out to us",
  },
  CONFERENCE: {
    label: "Conference",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    description: "Met at industry event",
  },
  ACCELERATOR: {
    label: "Accelerator",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    description: "YC, Techstars, etc.",
  },
  NETWORK: {
    label: "Network",
    color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    description: "General network connection",
  },
  PORTFOLIO: {
    label: "Portfolio",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    description: "Referred by portfolio company",
  },
  INVESTOR_NETWORK: {
    label: "Investor Network",
    color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    description: "Co-investor or LP referral",
  },
  OTHER: {
    label: "Other",
    color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    description: "Other source",
  },
};

export const DEAL_PRIORITY_CONFIG: Record<DealPriority, {
  label: string;
  color: string;
}> = {
  HIGH: {
    label: "High",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  MEDIUM: {
    label: "Medium",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  LOW: {
    label: "Low",
    color: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  },
};
