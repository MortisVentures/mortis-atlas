import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCalendarAuthUrl, isCalendarConfigured } from "@/lib/integrations/calendar/google-calendar-client";
import crypto from "crypto";

/**
 * GET /api/calendar/connect
 * Generate OAuth URL for Google Calendar
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if calendar is configured
    if (!isCalendarConfigured()) {
      return NextResponse.json(
        { error: "Google Calendar integration is not configured" },
        { status: 500 }
      );
    }

    // Generate a secure state parameter
    const state = crypto.randomBytes(32).toString("hex");

    // Build redirect URI
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
    const redirectUri = `${baseUrl}/api/calendar/callback`;

    // Generate OAuth URL
    const authUrl = getCalendarAuthUrl(redirectUri, state);

    // Store state in a cookie for verification (expires in 10 minutes)
    const response = NextResponse.json({ authUrl });
    response.cookies.set("calendar_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Calendar Connect] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate OAuth URL" },
      { status: 500 }
    );
  }
}
