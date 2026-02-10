import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  exchangeCodeForTokens,
  getGmailUserEmail,
} from "@/lib/integrations/email";
import { encrypt } from "@/lib/security/encryption";

/**
 * GET /api/integrations/email/callback
 * Handle OAuth callback from Gmail/Office365
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      console.error("OAuth error:", error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=${encodeURIComponent(error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=missing_params`
      );
    }

    // Validate state from cookie
    const storedState = request.cookies.get("email_oauth_state")?.value;
    const userId = request.cookies.get("email_oauth_user")?.value;

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=invalid_state`
      );
    }

    if (!userId) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=session_expired`
      );
    }

    // Exchange code for tokens
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/email/callback`;
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    // Get user's email from Gmail
    const email = await getGmailUserEmail(tokens.accessToken);

    // Calculate token expiry
    const tokenExpiry = new Date(Date.now() + tokens.expiresIn * 1000);

    // Upsert email account
    await prisma.emailAccount.upsert({
      where: {
        userId_email: {
          userId,
          email,
        },
      },
      create: {
        userId,
        provider: "GMAIL",
        email,
        accessToken: encrypt(tokens.accessToken),
        refreshToken: encrypt(tokens.refreshToken),
        tokenExpiry,
        isActive: true,
      },
      update: {
        accessToken: encrypt(tokens.accessToken),
        refreshToken: encrypt(tokens.refreshToken),
        tokenExpiry,
        isActive: true,
      },
    });

    // Clear OAuth cookies
    const response = NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/settings/integrations?success=email_connected`
    );

    response.cookies.delete("email_oauth_state");
    response.cookies.delete("email_oauth_user");

    return response;
  } catch (error) {
    console.error("Error in email callback:", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/settings/integrations?error=callback_failed`
    );
  }
}
