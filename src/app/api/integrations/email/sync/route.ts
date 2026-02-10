import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { syncEmailAccount, syncUserEmailAccounts } from "@/lib/integrations/email";

/**
 * POST /api/integrations/email/sync
 * Trigger email sync for connected accounts
 * Body: { accountId?: string } - if not provided, syncs all accounts
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { accountId } = body as { accountId?: string };

    if (accountId) {
      // Sync specific account
      const account = await prisma.emailAccount.findFirst({
        where: {
          id: accountId,
          userId: session.user.id,
          isActive: true,
        },
      });

      if (!account) {
        return NextResponse.json(
          { error: "Account not found or inactive" },
          { status: 404 }
        );
      }

      const result = await syncEmailAccount(accountId);
      return NextResponse.json({ results: [result] });
    }

    // Sync all accounts
    const results = await syncUserEmailAccounts(session.user.id);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error syncing emails:", error);
    return NextResponse.json(
      { error: "Failed to sync emails" },
      { status: 500 }
    );
  }
}
