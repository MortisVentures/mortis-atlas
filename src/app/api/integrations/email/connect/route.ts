import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGmailAuthUrl, isGmailConfigured } from "@/lib/integrations/email";
import crypto from "crypto";

/**
 * GET /api/integrations/email/connect
 * Start OAuth flow for connecting email account
 * Query params: provider=gmail|office365
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider") || "gmail";

    if (provider === "gmail") {
      if (!isGmailConfigured()) {
        return NextResponse.json(
          { error: "Gmail integration is not configured" },
          { status: 503 }
        );
      }

      // Generate state with user ID for CSRF protection
      const state = crypto
        .createHash("sha256")
        .update(`${session.user.id}:${Date.now()}:${crypto.randomBytes(16).toString("hex")}`)
        .digest("hex");

      // Store state in cookie for validation
      const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/email/callback`;
      const authUrl = getGmailAuthUrl(redirectUri, state);

      const response = NextResponse.json({ authUrl });

      // Set state cookie (expires in 10 minutes)
      response.cookies.set("email_oauth_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 600, // 10 minutes
        path: "/",
      });

      // Also store user ID in cookie for callback
      response.cookies.set("email_oauth_user", session.user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 600,
        path: "/",
      });

      return response;
    }

    if (provider === "office365") {
      return NextResponse.json(
        { error: "Office 365 integration coming soon" },
        { status: 501 }
      );
    }

    return NextResponse.json(
      { error: "Invalid provider. Supported: gmail, office365" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error initiating email connect:", error);
    return NextResponse.json(
      { error: "Failed to initiate connection" },
      { status: 500 }
    );
  }
}
