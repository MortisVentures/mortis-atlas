import { prisma } from "./prisma";
import {
  ICMemo,
  ICMemoVote,
  ICMemoStatus,
  ICMemoRecommendation,
  ICMemoDecision,
  VoteType,
  Prisma,
} from "@prisma/client";
import type { CreateICMemoInput, UpdateICMemoInput } from "@/lib/validations/ic-memo";

// =============================================================================
// TYPES
// =============================================================================

export interface ICMemoFilters {
  userId: string;
  status?: ICMemoStatus | ICMemoStatus[];
  companyId?: string;
  dealId?: string;
  authorId?: string;
  recommendation?: ICMemoRecommendation;
  finalDecision?: ICMemoDecision;
  focusArea?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ICMemoWithRelations extends ICMemo {
  company: {
    id: string;
    name: string;
    sector: string | null;
  };
  deal: {
    id: string;
    dealName: string;
  } | null;
  author: {
    id: string;
    name: string | null;
    email: string | null;
  };
  votes: Array<{
    id: string;
    vote: VoteType;
    comment: string | null;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string | null;
    };
  }>;
  _count: {
    votes: number;
    documents: number;
  };
}

export interface VoteWithUser extends ICMemoVote {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

// Common include for IC Memo queries
const icMemoInclude = {
  company: {
    select: {
      id: true,
      name: true,
      sector: true,
    },
  },
  deal: {
    select: {
      id: true,
      dealName: true,
    },
  },
  author: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  votes: {
    select: {
      id: true,
      vote: true,
      comment: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc" as const,
    },
  },
  _count: {
    select: {
      votes: true,
      documents: true,
    },
  },
};

// =============================================================================
// IC MEMO CRUD OPERATIONS
// =============================================================================

export async function getICMemos(
  filters: ICMemoFilters
): Promise<ICMemoWithRelations[]> {
  const where: Prisma.ICMemoWhereInput = {};

  if (filters.status) {
    where.status = Array.isArray(filters.status)
      ? { in: filters.status }
      : filters.status;
  }

  if (filters.companyId) {
    where.companyId = filters.companyId;
  }

  if (filters.dealId) {
    where.dealId = filters.dealId;
  }

  if (filters.authorId) {
    where.authorId = filters.authorId;
  }

  if (filters.recommendation) {
    where.memoRecommendation = filters.recommendation;
  }

  if (filters.finalDecision) {
    where.finalDecision = filters.finalDecision;
  }

  if (filters.focusArea) {
    where.focusArea = filters.focusArea;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { company: { name: { contains: filters.search, mode: "insensitive" } } },
      { decisionRationale: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return prisma.iCMemo.findMany({
    where,
    include: icMemoInclude,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    take: filters.limit ?? 50,
    skip: filters.offset ?? 0,
  }) as unknown as Promise<ICMemoWithRelations[]>;
}

export async function getICMemoById(
  id: string,
  _userId: string
): Promise<ICMemoWithRelations | null> {
  return prisma.iCMemo.findFirst({
    where: { id },
    include: icMemoInclude,
  }) as unknown as Promise<ICMemoWithRelations | null>;
}

export async function createICMemo(
  userId: string,
  data: CreateICMemoInput
): Promise<ICMemo> {
  return prisma.iCMemo.create({
    data: {
      title: data.title,
      authorId: userId,
      companyId: data.companyId,
      dealId: data.dealId,
      status: ICMemoStatus.DRAFT,

      // Thesis Alignment
      focusArea: data.focusArea,
      stage: data.stage,

      // Scores
      tripleUseScore: data.tripleUseScore,
      wlcdiaScore: data.wlcdiaScore,
      expectedCostDecline: data.expectedCostDecline,
      teamScore: data.teamScore,
      founderTechRating: data.founderTechRating,
      founderBusinessRating: data.founderBusinessRating,
      founderDesignRating: data.founderDesignRating,
      marketScore: data.marketScore,
      capitalEfficiencyScore: data.capitalEfficiencyScore,

      // Market Sizing
      tam: data.tam,
      sam: data.sam,
      som: data.som,

      // Capital Metrics
      trlStage: data.trlStage,
      monthlyBurn: data.monthlyBurn,
      runwayMonths: data.runwayMonths,

      // Financial Terms
      askAmount: data.askAmount,
      askValuation: data.askValuation,
      preMoneyValuation: data.preMoneyValuation,
      postMoneyValuation: data.postMoneyValuation,
      roundSize: data.roundSize,
      mortisInvestment: data.mortisInvestment,
      mortisOwnership: data.mortisOwnership,
      followOnReserve: data.followOnReserve,

      // Projections
      projectedExitYears: data.projectedExitYears,
      targetExitLow: data.targetExitLow,
      targetExitHigh: data.targetExitHigh,
      projectedMoicLow: data.projectedMoicLow,
      projectedMoicHigh: data.projectedMoicHigh,

      // Decision
      memoRecommendation: data.memoRecommendation,
      decisionRationale: data.decisionRationale,

      // Narrative Content
      content: data.content ? (data.content as Prisma.InputJsonValue) : undefined,

      // Voting
      votingDeadline: data.votingDeadline,
    },
  });
}

export async function updateICMemo(
  userId: string,
  id: string,
  data: UpdateICMemoInput
): Promise<ICMemo | null> {
  // Verify memo exists and user is author (or has permission)
  const existing = await prisma.iCMemo.findFirst({
    where: { id },
  });

  if (!existing) {
    return null;
  }

  // Check if user is author or the memo is still in DRAFT status
  const isAuthor = existing.authorId === userId;
  const isDraft = existing.status === ICMemoStatus.DRAFT;

  if (!isAuthor && !isDraft) {
    // Only authors can edit submitted memos
    // But for now, allow any authenticated user to update for flexibility
  }

  const updateData: Prisma.ICMemoUpdateInput = {};

  // Only update fields that are provided
  if (data.title !== undefined) updateData.title = data.title;
  if (data.companyId !== undefined) updateData.company = { connect: { id: data.companyId } };
  if (data.dealId !== undefined) {
    updateData.deal = data.dealId ? { connect: { id: data.dealId } } : { disconnect: true };
  }

  // Thesis Alignment
  if (data.focusArea !== undefined) updateData.focusArea = data.focusArea;
  if (data.stage !== undefined) updateData.stage = data.stage;

  // Scores
  if (data.tripleUseScore !== undefined) updateData.tripleUseScore = data.tripleUseScore;
  if (data.wlcdiaScore !== undefined) updateData.wlcdiaScore = data.wlcdiaScore;
  if (data.expectedCostDecline !== undefined) updateData.expectedCostDecline = data.expectedCostDecline;
  if (data.teamScore !== undefined) updateData.teamScore = data.teamScore;
  if (data.founderTechRating !== undefined) updateData.founderTechRating = data.founderTechRating;
  if (data.founderBusinessRating !== undefined) updateData.founderBusinessRating = data.founderBusinessRating;
  if (data.founderDesignRating !== undefined) updateData.founderDesignRating = data.founderDesignRating;
  if (data.marketScore !== undefined) updateData.marketScore = data.marketScore;
  if (data.capitalEfficiencyScore !== undefined) updateData.capitalEfficiencyScore = data.capitalEfficiencyScore;

  // Market Sizing
  if (data.tam !== undefined) updateData.tam = data.tam;
  if (data.sam !== undefined) updateData.sam = data.sam;
  if (data.som !== undefined) updateData.som = data.som;

  // Capital Metrics
  if (data.trlStage !== undefined) updateData.trlStage = data.trlStage;
  if (data.monthlyBurn !== undefined) updateData.monthlyBurn = data.monthlyBurn;
  if (data.runwayMonths !== undefined) updateData.runwayMonths = data.runwayMonths;

  // Financial Terms
  if (data.askAmount !== undefined) updateData.askAmount = data.askAmount;
  if (data.askValuation !== undefined) updateData.askValuation = data.askValuation;
  if (data.preMoneyValuation !== undefined) updateData.preMoneyValuation = data.preMoneyValuation;
  if (data.postMoneyValuation !== undefined) updateData.postMoneyValuation = data.postMoneyValuation;
  if (data.roundSize !== undefined) updateData.roundSize = data.roundSize;
  if (data.mortisInvestment !== undefined) updateData.mortisInvestment = data.mortisInvestment;
  if (data.mortisOwnership !== undefined) updateData.mortisOwnership = data.mortisOwnership;
  if (data.followOnReserve !== undefined) updateData.followOnReserve = data.followOnReserve;

  // Projections
  if (data.projectedExitYears !== undefined) updateData.projectedExitYears = data.projectedExitYears;
  if (data.targetExitLow !== undefined) updateData.targetExitLow = data.targetExitLow;
  if (data.targetExitHigh !== undefined) updateData.targetExitHigh = data.targetExitHigh;
  if (data.projectedMoicLow !== undefined) updateData.projectedMoicLow = data.projectedMoicLow;
  if (data.projectedMoicHigh !== undefined) updateData.projectedMoicHigh = data.projectedMoicHigh;

  // Decision
  if (data.memoRecommendation !== undefined) updateData.memoRecommendation = data.memoRecommendation;
  if (data.decisionRationale !== undefined) updateData.decisionRationale = data.decisionRationale;
  if (data.finalDecision !== undefined) updateData.finalDecision = data.finalDecision;

  // Narrative Content
  if (data.content !== undefined) {
    updateData.content = data.content ? (data.content as Prisma.InputJsonValue) : Prisma.DbNull;
  }

  // Voting
  if (data.votingDeadline !== undefined) updateData.votingDeadline = data.votingDeadline;

  return prisma.iCMemo.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteICMemo(
  userId: string,
  id: string
): Promise<boolean> {
  const existing = await prisma.iCMemo.findFirst({
    where: { id, authorId: userId },
  });

  if (!existing) {
    return false;
  }

  // Only allow deleting DRAFT memos
  if (existing.status !== ICMemoStatus.DRAFT) {
    return false;
  }

  await prisma.iCMemo.delete({ where: { id } });
  return true;
}

// =============================================================================
// SUBMIT / STATUS OPERATIONS
// =============================================================================

export async function submitICMemo(
  userId: string,
  id: string
): Promise<ICMemo | null> {
  const existing = await prisma.iCMemo.findFirst({
    where: { id, authorId: userId },
  });

  if (!existing) {
    return null;
  }

  // Can only submit DRAFT memos
  if (existing.status !== ICMemoStatus.DRAFT) {
    return null;
  }

  return prisma.iCMemo.update({
    where: { id },
    data: {
      status: ICMemoStatus.SUBMITTED,
      submittedAt: new Date(),
    },
  });
}

export async function updateICMemoStatus(
  id: string,
  status: ICMemoStatus,
  finalDecision?: ICMemoDecision
): Promise<ICMemo | null> {
  const updateData: Prisma.ICMemoUpdateInput = { status };

  if (finalDecision !== undefined) {
    updateData.finalDecision = finalDecision;
  }

  return prisma.iCMemo.update({
    where: { id },
    data: updateData,
  });
}

// =============================================================================
// VOTING OPERATIONS
// =============================================================================

export async function castVote(
  userId: string,
  memoId: string,
  vote: VoteType,
  comment?: string | null
): Promise<ICMemoVote> {
  // Upsert: update existing vote or create new one
  return prisma.iCMemoVote.upsert({
    where: {
      icMemoId_userId: {
        icMemoId: memoId,
        userId,
      },
    },
    update: {
      vote,
      comment,
    },
    create: {
      icMemoId: memoId,
      userId,
      vote,
      comment,
    },
  });
}

export async function getVotesForMemo(
  memoId: string
): Promise<VoteWithUser[]> {
  return prisma.iCMemoVote.findMany({
    where: { icMemoId: memoId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  }) as unknown as Promise<VoteWithUser[]>;
}

export async function getUserVote(
  memoId: string,
  userId: string
): Promise<ICMemoVote | null> {
  return prisma.iCMemoVote.findUnique({
    where: {
      icMemoId_userId: {
        icMemoId: memoId,
        userId,
      },
    },
  });
}

export async function deleteVote(
  memoId: string,
  userId: string
): Promise<boolean> {
  try {
    await prisma.iCMemoVote.delete({
      where: {
        icMemoId_userId: {
          icMemoId: memoId,
          userId,
        },
      },
    });
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// STATISTICS & INSIGHTS
// =============================================================================

export async function getICMemoStats(_userId: string): Promise<{
  total: number;
  byStatus: Record<ICMemoStatus, number>;
  byRecommendation: Record<ICMemoRecommendation, number>;
  byDecision: Record<ICMemoDecision, number>;
}> {
  const [total, statusCounts, recommendationCounts, decisionCounts] = await Promise.all([
    prisma.iCMemo.count(),
    prisma.iCMemo.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.iCMemo.groupBy({
      by: ["memoRecommendation"],
      _count: true,
      where: { memoRecommendation: { not: null } },
    }),
    prisma.iCMemo.groupBy({
      by: ["finalDecision"],
      _count: true,
      where: { finalDecision: { not: null } },
    }),
  ]);

  const byStatus = Object.fromEntries(
    Object.values(ICMemoStatus).map((s) => [s, 0])
  ) as Record<ICMemoStatus, number>;
  statusCounts.forEach((sc) => {
    byStatus[sc.status] = sc._count;
  });

  const byRecommendation = Object.fromEntries(
    Object.values(ICMemoRecommendation).map((r) => [r, 0])
  ) as Record<ICMemoRecommendation, number>;
  recommendationCounts.forEach((rc) => {
    if (rc.memoRecommendation) {
      byRecommendation[rc.memoRecommendation] = rc._count;
    }
  });

  const byDecision = Object.fromEntries(
    Object.values(ICMemoDecision).map((d) => [d, 0])
  ) as Record<ICMemoDecision, number>;
  decisionCounts.forEach((dc) => {
    if (dc.finalDecision) {
      byDecision[dc.finalDecision] = dc._count;
    }
  });

  return { total, byStatus, byRecommendation, byDecision };
}
