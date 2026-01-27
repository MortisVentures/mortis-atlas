import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { DealStage, Prisma } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/contacts/[id]/referrals
 * Returns all deals and companies referred by this contact with aggregated metrics
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - type: "deals" | "companies" | "all" (default: "all")
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: contactId } = await params;
    const { searchParams } = new URL(request.url);

    // Parse pagination params
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const type = searchParams.get("type") || "all";
    const skip = (page - 1) * limit;

    // Verify the contact exists and belongs to the user
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        userId: session.user.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        totalReferralsMade: true,
        successfulReferrals: true,
        referralConversionRate: true,
        lastReferralDate: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    // Build response based on type filter
    let referredDeals: Array<{
      id: string;
      dealName: string;
      stage: DealStage;
      amount: Prisma.Decimal | null;
      referralDate: Date | null;
      company: { id: string; name: string };
      createdAt: Date;
    }> = [];
    let referredCompanies: Array<{
      id: string;
      name: string;
      stage: string;
      sector: string | null;
      createdAt: Date;
    }> = [];
    let totalDeals = 0;
    let totalCompanies = 0;

    if (type === "all" || type === "deals") {
      // Get referred deals with pagination
      [referredDeals, totalDeals] = await Promise.all([
        prisma.deal.findMany({
          where: {
            referrerContactId: contactId,
            userId: session.user.id,
          },
          select: {
            id: true,
            dealName: true,
            stage: true,
            amount: true,
            referralDate: true,
            createdAt: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: type === "deals" ? skip : 0,
          take: type === "deals" ? limit : 10,
        }),
        prisma.deal.count({
          where: {
            referrerContactId: contactId,
            userId: session.user.id,
          },
        }),
      ]);
    }

    if (type === "all" || type === "companies") {
      // Get referred companies with pagination
      [referredCompanies, totalCompanies] = await Promise.all([
        prisma.company.findMany({
          where: {
            referrerContactId: contactId,
            userId: session.user.id,
          },
          select: {
            id: true,
            name: true,
            stage: true,
            sector: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          skip: type === "companies" ? skip : 0,
          take: type === "companies" ? limit : 10,
        }),
        prisma.company.count({
          where: {
            referrerContactId: contactId,
            userId: session.user.id,
          },
        }),
      ]);
    }

    // Calculate aggregated metrics
    const dealMetrics = await prisma.deal.aggregate({
      where: {
        referrerContactId: contactId,
        userId: session.user.id,
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    const wonDeals = await prisma.deal.aggregate({
      where: {
        referrerContactId: contactId,
        userId: session.user.id,
        stage: DealStage.CLOSED_WON,
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    const pendingDeals = await prisma.deal.count({
      where: {
        referrerContactId: contactId,
        userId: session.user.id,
        stage: {
          notIn: [DealStage.CLOSED_WON, DealStage.CLOSED_LOST],
        },
      },
    });

    // Calculate pipeline value (pending deals)
    const pipelineValue = await prisma.deal.aggregate({
      where: {
        referrerContactId: contactId,
        userId: session.user.id,
        stage: {
          notIn: [DealStage.CLOSED_WON, DealStage.CLOSED_LOST],
        },
      },
      _sum: { amount: true },
    });

    const metrics = {
      totalReferrals: contact.totalReferralsMade,
      successfulReferrals: contact.successfulReferrals,
      conversionRate: contact.referralConversionRate
        ? Number(contact.referralConversionRate)
        : null,
      lastReferralDate: contact.lastReferralDate,
      totalDealsReferred: totalDeals,
      totalCompaniesReferred: totalCompanies,
      totalPipelineValue: dealMetrics._sum.amount?.toNumber() || 0,
      wonDealsValue: wonDeals._sum.amount?.toNumber() || 0,
      wonDealsCount: wonDeals._count.id,
      pendingDealsCount: pendingDeals,
      pendingPipelineValue: pipelineValue._sum.amount?.toNumber() || 0,
    };

    // Build pagination info
    const totalItems = type === "deals" ? totalDeals : type === "companies" ? totalCompanies : totalDeals + totalCompanies;
    const pagination = {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      hasMore: page * limit < totalItems,
    };

    return NextResponse.json({
      contact: {
        id: contact.id,
        name: `${contact.firstName} ${contact.lastName}`,
        email: contact.email,
        role: contact.role,
        company: contact.company,
      },
      referrals: {
        deals: referredDeals.map((d) => ({
          ...d,
          amount: d.amount ? Number(d.amount) : null,
        })),
        companies: referredCompanies,
      },
      metrics,
      pagination,
    });
  } catch (error) {
    console.error("Error fetching contact referrals:", error);
    return NextResponse.json(
      { error: "Failed to fetch referrals" },
      { status: 500 }
    );
  }
}
