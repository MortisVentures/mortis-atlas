import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { verifyTOTP, decryptSecret } from "@/lib/auth/totp";

const verifySchema = z.object({
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must be numeric"),
});

/**
 * POST /api/auth/2fa/verify
 * Verify TOTP code and enable 2FA for the user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = verifySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid code format", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { code } = validation.data;

    // Get user with 2FA secret
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorEnabled: true,
        twoFactorSecret: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.twoFactorSecret) {
      return NextResponse.json(
        { error: "2FA setup not initiated. Call /api/auth/2fa/setup first." },
        { status: 400 }
      );
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "2FA is already enabled" },
        { status: 400 }
      );
    }

    // Decrypt and verify the TOTP code
    const secret = decryptSecret(user.twoFactorSecret);
    const isValid = verifyTOTP(secret, code);

    if (!isValid) {
      // Log failed attempt
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "LOGIN_FAILED",
          entityType: "TwoFactorVerification",
          entityId: session.user.id,
          description: "Failed 2FA verification attempt during setup",
        },
      });

      return NextResponse.json(
        { error: "Invalid verification code. Please try again." },
        { status: 400 }
      );
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorVerifiedAt: new Date(),
      },
    });

    // Log successful 2FA enablement
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entityType: "TwoFactorAuthentication",
        entityId: session.user.id,
        description: "2FA enabled successfully",
      },
    });

    return NextResponse.json({
      data: {
        success: true,
        message: "Two-factor authentication has been enabled",
      },
    });
  } catch (error) {
    console.error("2FA verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify 2FA code" },
      { status: 500 }
    );
  }
}
