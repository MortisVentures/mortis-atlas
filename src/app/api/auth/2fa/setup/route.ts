import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  createTOTPSetup,
  encryptSecret,
} from "@/lib/auth/totp";

/**
 * POST /api/auth/2fa/setup
 * Generate 2FA setup data (secret, QR code, backup codes)
 * Does NOT enable 2FA - that requires verification
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user already has 2FA enabled
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, twoFactorEnabled: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "2FA is already enabled. Disable it first to reconfigure." },
        { status: 400 }
      );
    }

    // Generate 2FA setup data
    const setupData = await createTOTPSetup(user.email || session.user.id);

    // Store the encrypted secret temporarily (user must verify before enabled)
    // We store it but don't enable 2FA until verification
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorSecret: encryptSecret(setupData.secret),
        // Encrypt and store backup codes (not visible until verified)
        backupCodes: setupData.backupCodes.map((code) => encryptSecret(code)),
      },
    });

    // Log the setup attempt
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entityType: "TwoFactorSetup",
        entityId: session.user.id,
        description: "Initiated 2FA setup",
      },
    });

    return NextResponse.json({
      data: {
        qrCode: setupData.qrCode,
        uri: setupData.uri,
        // Show backup codes only during setup (user should save these)
        backupCodes: setupData.backupCodes,
      },
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { error: "Failed to generate 2FA setup" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/2fa/setup
 * Check current 2FA status
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorEnabled: true,
        twoFactorVerifiedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        enabled: user.twoFactorEnabled,
        verifiedAt: user.twoFactorVerifiedAt,
      },
    });
  } catch (error) {
    console.error("2FA status error:", error);
    return NextResponse.json(
      { error: "Failed to get 2FA status" },
      { status: 500 }
    );
  }
}
