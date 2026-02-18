import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCalendarAccounts, deleteCalendarAccount } from "@/lib/db/calendar";

/**
 * GET /api/calendar/accounts
 * List all connected calendar accounts for the current user
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await getCalendarAccounts(session.user.id);

    // Return accounts without sensitive token data
    const safeAccounts = accounts.map((account) => ({
      id: account.id,
      provider: account.provider,
      email: account.email,
      calendarId: account.calendarId,
      lastSyncAt: account.lastSyncAt,
      isActive: account.isActive,
      createdAt: account.createdAt,
    }));

    return NextResponse.json({ data: safeAccounts });
  } catch (error) {
    console.error("[Calendar Accounts GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar accounts" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calendar/accounts
 * Disconnect a calendar account
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("id");

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    const deleted = await deleteCalendarAccount(accountId, session.user.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error("[Calendar Accounts DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect calendar account" },
      { status: 500 }
    );
  }
}
