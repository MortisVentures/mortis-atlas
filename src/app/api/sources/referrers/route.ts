import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { DealStage } from "@prisma/client";
import { Referrer, ReferrerTier } from "@/lib/deals/source-tracking";

function calculateTier(totalReferrals: number): ReferrerTier {
  if (totalReferrals >= 10) return "PLATINUM";
  if (totalReferrals >= 5) return "GOLD";
  if (totalReferrals >= 3) return "SILVER";
  return "BRONZE";
}

/**
 * GET /api/sources/referrers
 * Returns contacts with referral activity, transformed into Referrer shape
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const contacts = await prisma.contact.findMany({
      where: {
        userId,
        totalReferralsMade: { gt: 0 },
      },
      include: {
        company: {
          select: { name: true },
        },
        referredDeals: {
          select: {
            id: true,
            stage: true,
            amount: true,
            createdAt: true,
          },
        },
      },
      orderBy: { successfulReferrals: "desc" },
    });

    const referrers: Referrer[] = contacts.map((contact) => {
      const wonDeals = contact.referredDeals.filter(
        (d) => d.stage === DealStage.CLOSED_WON
      );
      const pendingDeals = contact.referredDeals.filter(
        (d) =>
          d.stage !== DealStage.CLOSED_WON && d.stage !== DealStage.CLOSED_LOST
      );
      const totalDealsValue = wonDeals.reduce(
        (sum, d) => sum + (d.amount ? Number(d.amount) : 0),
        0
      );

      // Conversion rate: DB stores as percentage (0-100), we need 0-1
      const conversionRate = contact.referralConversionRate
        ? Number(contact.referralConversionRate) / 100
        : contact.totalReferralsMade > 0
          ? contact.successfulReferrals / contact.totalReferralsMade
          : 0;

      // Find first referral date from deals
      const sortedDeals = [...contact.referredDeals].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      const firstReferralDate = sortedDeals[0]?.createdAt.toISOString() || contact.createdAt.toISOString();

      return {
        id: contact.id,
        contactId: contact.id,
        name: `${contact.firstName} ${contact.lastName}`,
        email: contact.email || undefined,
        phone: contact.phone || undefined,
        company: contact.company?.name,
        organization: contact.company?.name,
        role: contact.role || undefined,
        type: "INDIVIDUAL" as const,
        tier: calculateTier(contact.totalReferralsMade),
        relationship: "OTHER" as const,
        totalReferrals: contact.totalReferralsMade,
        successfulReferrals: contact.successfulReferrals,
        pendingReferrals: pendingDeals.length,
        conversionRate,
        totalDealsValue,
        lastReferralDate: contact.lastReferralDate?.toISOString(),
        firstReferralDate,
        createdAt: contact.createdAt.toISOString(),
        updatedAt: contact.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({ data: referrers });
  } catch (error) {
    console.error("Error fetching referrers:", error);
    return NextResponse.json(
      { error: "Failed to fetch referrers" },
      { status: 500 }
    );
  }
}
