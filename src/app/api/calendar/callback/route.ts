import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { encrypt } from "@/lib/security/encryption";
import { exchangeCodeForTokens, getGoogleUserEmail } from "@/lib/integrations/calendar/google-calendar-client";
import { createCalendarAccount } from "@/lib/db/calendar";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/calendar/callback
 * Handle OAuth callback from Google
 */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
  const redirectTo = `${baseUrl}/settings/integrations`;

  try {
    // Get session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(
        `${redirectTo}?error=session_expired`
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Check for errors from Google
    if (error) {
      console.error("[Calendar Callback] OAuth error:", error);
      return NextResponse.redirect(
        `${redirectTo}?error=${error}`
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        `${redirectTo}?error=missing_params`
      );
    }

    // Verify state parameter
    const storedState = request.cookies.get("calendar_oauth_state")?.value;
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        `${redirectTo}?error=invalid_state`
      );
    }

    // Build redirect URI (same as used for connect)
    const redirectUri = `${baseUrl}/api/calendar/callback`;

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    if (!tokens.refreshToken) {
      console.error("[Calendar Callback] No refresh token received");
      return NextResponse.redirect(
        `${redirectTo}?error=no_refresh_token`
      );
    }

    // Get user's email
    const userEmail = await getGoogleUserEmail(tokens.accessToken);

    // Check if account already exists
    const existing = await prisma.calendarAccount.findUnique({
      where: {
        userId_email: {
          userId: session.user.id,
          email: userEmail,
        },
      },
    });

    if (existing) {
      // Update existing account with new tokens
      await prisma.calendarAccount.update({
        where: { id: existing.id },
        data: {
          accessToken: encrypt(tokens.accessToken),
          refreshToken: encrypt(tokens.refreshToken),
          tokenExpiry: new Date(Date.now() + tokens.expiresIn * 1000),
          isActive: true,
        },
      });
    } else {
      // Create new account
      await createCalendarAccount({
        userId: session.user.id,
        provider: "GOOGLE",
        email: userEmail,
        accessToken: encrypt(tokens.accessToken),
        refreshToken: encrypt(tokens.refreshToken),
        tokenExpiry: new Date(Date.now() + tokens.expiresIn * 1000),
      });
    }

    // Clear the state cookie
    const response = NextResponse.redirect(
      `${redirectTo}?success=calendar_connected`
    );
    response.cookies.delete("calendar_oauth_state");

    return response;
  } catch (error) {
    console.error("[Calendar Callback] Error:", error);
    return NextResponse.redirect(
      `${redirectTo}?error=callback_failed`
    );
  }
}
