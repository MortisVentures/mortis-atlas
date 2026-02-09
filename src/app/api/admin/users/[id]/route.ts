import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { logRoleChange, logUserDeactivate, logUpdate } from "@/lib/audit";

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(["ADMIN", "PARTNER", "ANALYST", "LP"]).optional(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/users/[id]
 * Get user details (admin only)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        twoFactorEnabled: true,
        twoFactorVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        lpProfile: {
          select: {
            id: true,
            entityName: true,
            entityType: true,
            commitmentAmount: true,
            calledCapital: true,
            kycVerified: true,
          },
        },
        _count: {
          select: {
            auditLogs: true,
            companies: true,
            deals: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[id]
 * Update user (admin only)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Get current user state
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true, isActive: true, name: true, email: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { name, role, isActive } = validation.data;
    const updates: Record<string, unknown> = {};

    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role as UserRole;
    if (isActive !== undefined) updates.isActive = isActive;

    // Prevent deactivating yourself
    if (id === session.user.id && isActive === false) {
      return NextResponse.json(
        { error: "You cannot deactivate your own account" },
        { status: 400 }
      );
    }

    // Prevent demoting yourself from admin
    if (id === session.user.id && role && role !== "ADMIN") {
      return NextResponse.json(
        { error: "You cannot remove your own admin role" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: updates,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    // Log role change if applicable
    if (role && role !== existingUser.role) {
      await logRoleChange(session.user.id, id, existingUser.role, role);
    }

    // Log deactivation if applicable
    if (isActive === false && existingUser.isActive) {
      await logUserDeactivate(session.user.id, id);
    }

    // Log general update
    await logUpdate(
      session.user.id,
      "User",
      id,
      {
        name: { before: existingUser.name, after: name || existingUser.name },
        role: { before: existingUser.role, after: role || existingUser.role },
        isActive: { before: existingUser.isActive, after: isActive ?? existingUser.isActive },
      },
      `Updated user ${existingUser.email}`
    );

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Deactivate user (soft delete - admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Prevent self-deactivation
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot deactivate your own account" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { email: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    await logUserDeactivate(session.user.id, id);

    return NextResponse.json({
      data: { success: true, message: "User deactivated" },
    });
  } catch (error) {
    console.error("Failed to deactivate user:", error);
    return NextResponse.json(
      { error: "Failed to deactivate user" },
      { status: 500 }
    );
  }
}
