import { NextRequest, NextResponse } from "next/server";
// Referrers API - uses Prisma directly for optimized query
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/contacts/referrers
 * Get contacts who have made referrals, with their referral metrics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const sortBy = searchParams.get("sortBy") as
      | "totalReferralsMade"
      | "successfulReferrals"
      | "referralConversionRate"
      || "successfulReferrals";

    // Get contacts with referrals
    const referrers = await prisma.contact.findMany({
      where: {
        userId: session.user.id,
        totalReferralsMade: { gt: 0 },
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
        referredDeals: {
          select: {
            id: true,
            dealName: true,
            stage: true,
            amount: true,
            company: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
        referredCompanies: {
          select: {
            id: true,
            name: true,
            stage: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
      orderBy: sortBy === "referralConversionRate"
        ? { referralConversionRate: "desc" }
        : sortBy === "totalReferralsMade"
        ? { totalReferralsMade: "desc" }
        : { successfulReferrals: "desc" },
      take: limit,
    });

    return NextResponse.json({ data: referrers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching referrers:", error);
    return NextResponse.json(
      { error: "Failed to fetch referrers" },
      { status: 500 }
    );
  }
}
