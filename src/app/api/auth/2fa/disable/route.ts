import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { verifyTOTP, decryptSecret, verifyBackupCode } from "@/lib/auth/totp";

const disableSchema = z.object({
  password: z.string().min(1, "Password is required"),
  code: z.string().optional(), // TOTP code or backup code
});

/**
 * POST /api/auth/2fa/disable
 * Disable 2FA for the user (requires password + TOTP or backup code)
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
    const validation = disableSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { password, code } = validation.data;

    // Get user with 2FA data and password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        password: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        backupCodes: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "2FA is not enabled" },
        { status: 400 }
      );
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json(
        { error: "Password authentication not available for this account" },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "LOGIN_FAILED",
          entityType: "TwoFactorDisable",
          entityId: session.user.id,
          description: "Failed password verification when disabling 2FA",
        },
      });

      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Verify TOTP code if provided
    if (code && user.twoFactorSecret) {
      const secret = decryptSecret(user.twoFactorSecret);
      const isTOTPValid = verifyTOTP(secret, code);

      if (!isTOTPValid) {
        // Check if it's a backup code
        const decryptedBackupCodes = user.backupCodes.map((c) =>
          decryptSecret(c)
        );
        const backupIndex = verifyBackupCode(code, decryptedBackupCodes);

        if (backupIndex === -1) {
          await prisma.auditLog.create({
            data: {
              userId: session.user.id,
              action: "LOGIN_FAILED",
              entityType: "TwoFactorDisable",
              entityId: session.user.id,
              description: "Failed 2FA verification when disabling 2FA",
            },
          });

          return NextResponse.json(
            { error: "Invalid verification code" },
            { status: 400 }
          );
        }
      }
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorVerifiedAt: null,
        backupCodes: [],
      },
    });

    // Log 2FA disable
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entityType: "TwoFactorAuthentication",
        entityId: session.user.id,
        description: "2FA disabled",
      },
    });

    return NextResponse.json({
      data: {
        success: true,
        message: "Two-factor authentication has been disabled",
      },
    });
  } catch (error) {
    console.error("2FA disable error:", error);
    return NextResponse.json(
      { error: "Failed to disable 2FA" },
      { status: 500 }
    );
  }
}
