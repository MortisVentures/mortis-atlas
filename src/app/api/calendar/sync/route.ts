import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { syncCalendarAccount, syncAllUserCalendars } from "@/lib/integrations/calendar/sync";

/**
 * POST /api/calendar/sync
 * Trigger a calendar sync for one or all accounts
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { accountId } = body as { accountId?: string };

    if (accountId) {
      // Sync specific account
      const result = await syncCalendarAccount(accountId);
      return NextResponse.json({ data: result });
    } else {
      // Sync all accounts
      const results = await syncAllUserCalendars(session.user.id);
      return NextResponse.json({ data: results });
    }
  } catch (error) {
    console.error("[Calendar Sync] Error:", error);
    return NextResponse.json(
      { error: "Failed to sync calendar" },
      { status: 500 }
    );
  }
}
