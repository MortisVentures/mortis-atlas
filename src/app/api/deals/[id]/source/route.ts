import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { DEAL_SOURCE_CONFIG } from "@/lib/db/deals";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/deals/[id]/source
 * Returns source attribution metadata for a specific deal
 * Includes referrer contact details and source analytics
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: dealId } = await params;

    // Get deal with full source attribution data
    const deal = await prisma.deal.findFirst({
      where: {
        id: dealId,
        userId: session.user.id,
      },
      select: {
        id: true,
        dealName: true,
        stage: true,
        amount: true,
        createdAt: true,

        // Source attribution fields
        sourceType: true,
        sourceChannel: true,
        sourceDetail: true,
        referralDate: true,

        // Company info
        company: {
          select: {
            id: true,
            name: true,
            sector: true,
          },
        },

        // Referrer contact with full details
        referrerContact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            linkedinUrl: true,
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
        },
      },
    });

    if (!deal) {
      return NextResponse.json(
        { error: "Deal not found" },
        { status: 404 }
      );
    }

    // Get source type metadata
    const sourceTypeConfig = deal.sourceType
      ? DEAL_SOURCE_CONFIG[deal.sourceType]
      : null;

    // If there's a referrer, get their other referrals for context
    let referrerHistory = null;
    if (deal.referrerContact) {
      const otherReferrals = await prisma.deal.findMany({
        where: {
          referrerContactId: deal.referrerContact.id,
          userId: session.user.id,
          id: { not: dealId }, // Exclude current deal
        },
        select: {
          id: true,
          dealName: true,
          stage: true,
          amount: true,
          createdAt: true,
          company: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      referrerHistory = {
        recentReferrals: otherReferrals.map((r) => ({
          ...r,
          amount: r.amount?.toNumber() || null,
        })),
        totalReferrals: deal.referrerContact.totalReferralsMade,
        successfulReferrals: deal.referrerContact.successfulReferrals,
        conversionRate: deal.referrerContact.referralConversionRate
          ? Number(deal.referrerContact.referralConversionRate)
          : null,
      };
    }

    // Calculate time since referral
    const referralAge = deal.referralDate
      ? Math.floor(
          (Date.now() - new Date(deal.referralDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

    return NextResponse.json({
      deal: {
        id: deal.id,
        name: deal.dealName,
        stage: deal.stage,
        amount: deal.amount?.toNumber() || null,
        company: deal.company,
        createdAt: deal.createdAt,
      },
      source: {
        type: deal.sourceType,
        typeLabel: sourceTypeConfig?.label || null,
        typeColor: sourceTypeConfig?.color || null,
        typeDescription: sourceTypeConfig?.description || null,
        channel: deal.sourceChannel,
        detail: deal.sourceDetail,
        referralDate: deal.referralDate,
        referralAgeDays: referralAge,
      },
      referrer: deal.referrerContact
        ? {
            id: deal.referrerContact.id,
            name: `${deal.referrerContact.firstName} ${deal.referrerContact.lastName}`,
            email: deal.referrerContact.email,
            phone: deal.referrerContact.phone,
            role: deal.referrerContact.role,
            linkedinUrl: deal.referrerContact.linkedinUrl,
            company: deal.referrerContact.company,
            history: referrerHistory,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching deal source:", error);
    return NextResponse.json(
      { error: "Failed to fetch deal source" },
      { status: 500 }
    );
  }
}
