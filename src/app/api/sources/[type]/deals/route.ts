import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { DealSource, DealStage } from "@prisma/client";
import { DEAL_SOURCE_CONFIG } from "@/lib/db/deals";

interface RouteParams {
  params: Promise<{ type: string }>;
}

/**
 * GET /api/sources/[type]/deals
 * Returns all deals from a specific source type with pagination
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - stage: Filter by deal stage (optional)
 * - sort: Sort field (default: "createdAt")
 * - order: Sort order "asc" | "desc" (default: "desc")
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type: sourceTypeParam } = await params;
    const { searchParams } = new URL(request.url);

    // Validate source type
    const sourceType = sourceTypeParam.toUpperCase() as DealSource;
    if (!Object.values(DealSource).includes(sourceType)) {
      return NextResponse.json(
        {
          error: "Invalid source type",
          validTypes: Object.values(DealSource),
        },
        { status: 400 }
      );
    }

    // Parse pagination and filter params
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    );
    const skip = (page - 1) * limit;

    const stageParam = searchParams.get("stage")?.toUpperCase() as DealStage | undefined;
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";

    // Build where clause
    const whereClause: {
      userId: string;
      sourceType: DealSource;
      stage?: DealStage;
    } = {
      userId: session.user.id,
      sourceType,
    };

    if (stageParam && Object.values(DealStage).includes(stageParam)) {
      whereClause.stage = stageParam;
    }

    // Build sort clause
    const validSortFields = ["createdAt", "amount", "dealName", "stage", "lastStageChange"];
    const sortField = validSortFields.includes(sort) ? sort : "createdAt";
    const orderByClause = { [sortField]: order };

    // Get deals with pagination
    const [deals, totalCount] = await Promise.all([
      prisma.deal.findMany({
        where: whereClause,
        select: {
          id: true,
          dealName: true,
          stage: true,
          amount: true,
          priority: true,
          sourceChannel: true,
          sourceDetail: true,
          referralDate: true,
          createdAt: true,
          lastStageChange: true,
          lastActivityDate: true,
          company: {
            select: {
              id: true,
              name: true,
              sector: true,
            },
          },
          referrerContact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              company: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: orderByClause,
        skip,
        take: limit,
      }),
      prisma.deal.count({ where: whereClause }),
    ]);

    // Calculate aggregated metrics for this source type
    const [totalStats, wonStats, pendingStats] = await Promise.all([
      prisma.deal.aggregate({
        where: { userId: session.user.id, sourceType },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.deal.aggregate({
        where: { userId: session.user.id, sourceType, stage: DealStage.CLOSED_WON },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.deal.aggregate({
        where: {
          userId: session.user.id,
          sourceType,
          stage: { notIn: [DealStage.CLOSED_WON, DealStage.CLOSED_LOST] },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    const sourceConfig = DEAL_SOURCE_CONFIG[sourceType];
    const totalDeals = totalStats._count.id;
    const wonDeals = wonStats._count.id;
    const conversionRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;

    // Build pagination info
    const pagination = {
      page,
      limit,
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: page * limit < totalCount,
    };

    return NextResponse.json({
      source: {
        type: sourceType,
        label: sourceConfig.label,
        color: sourceConfig.color,
        description: sourceConfig.description,
      },
      deals: deals.map((deal) => ({
        id: deal.id,
        name: deal.dealName,
        stage: deal.stage,
        amount: deal.amount?.toNumber() || null,
        priority: deal.priority,
        sourceChannel: deal.sourceChannel,
        sourceDetail: deal.sourceDetail,
        referralDate: deal.referralDate,
        createdAt: deal.createdAt,
        lastStageChange: deal.lastStageChange,
        lastActivityDate: deal.lastActivityDate,
        company: deal.company,
        referrer: deal.referrerContact
          ? {
              id: deal.referrerContact.id,
              name: `${deal.referrerContact.firstName} ${deal.referrerContact.lastName}`,
              company: deal.referrerContact.company?.name || null,
            }
          : null,
      })),
      metrics: {
        totalDeals: totalStats._count.id,
        totalPipelineValue: totalStats._sum.amount?.toNumber() || 0,
        wonDeals: wonStats._count.id,
        wonValue: wonStats._sum.amount?.toNumber() || 0,
        pendingDeals: pendingStats._count.id,
        pendingValue: pendingStats._sum.amount?.toNumber() || 0,
        conversionRate: Math.round(conversionRate * 10) / 10,
      },
      pagination,
    });
  } catch (error) {
    console.error("Error fetching deals by source:", error);
    return NextResponse.json(
      { error: "Failed to fetch deals" },
      { status: 500 }
    );
  }
}
