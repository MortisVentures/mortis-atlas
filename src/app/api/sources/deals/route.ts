import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { DealStage } from "@prisma/client";
import { DealWithSource } from "@/lib/deals/source-tracking";

/**
 * GET /api/sources/deals
 * Returns all deals transformed into DealWithSource shape for source attribution analytics
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const deals = await prisma.deal.findMany({
      where: { userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        referrerContact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const dealsWithSource: DealWithSource[] = deals.map((deal) => {
      // Derive outcome from stage
      let outcome: DealWithSource["outcome"] = "PENDING";
      if (deal.stage === DealStage.CLOSED_WON) {
        outcome = "WON";
      } else if (deal.stage === DealStage.CLOSED_LOST) {
        outcome = "LOST";
      }

      // Calculate time to close in days
      let timeToClose: number | undefined;
      if (deal.actualClose) {
        const created = new Date(deal.createdAt).getTime();
        const closed = new Date(deal.actualClose).getTime();
        timeToClose = Math.round((closed - created) / (1000 * 60 * 60 * 24));
      }

      // Build referrer name from contact
      const referrerName = deal.referrerContact
        ? `${deal.referrerContact.firstName} ${deal.referrerContact.lastName}`
        : undefined;

      return {
        id: deal.id,
        companyId: deal.companyId,
        companyName: deal.company.name,
        dealName: deal.dealName,
        stage: deal.stage,
        amount: deal.amount ? Number(deal.amount) : undefined,
        source: {
          id: `src-${deal.id}`,
          type: deal.sourceType || "OTHER",
          referrerContactId: deal.referrerContactId || undefined,
          referrerName,
          channel: deal.sourceChannel || undefined,
          notes: deal.sourceDetail || undefined,
          createdAt: deal.createdAt.toISOString(),
        },
        createdAt: deal.createdAt.toISOString(),
        closedAt: deal.actualClose?.toISOString(),
        outcome,
        timeToClose,
      };
    });

    return NextResponse.json({ data: dealsWithSource });
  } catch (error) {
    console.error("Error fetching deals for source attribution:", error);
    return NextResponse.json(
      { error: "Failed to fetch deals" },
      { status: 500 }
    );
  }
}
