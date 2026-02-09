import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { Prisma, UserRole } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { logUserInvite, logCreate } from "@/lib/audit";

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(["ADMIN", "PARTNER", "ANALYST", "LP"]),
  password: z.string().min(12).optional(),
});

/**
 * GET /api/admin/users
 * List all users (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where: Prisma.UserWhereInput = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (role) {
      where.role = role as UserRole;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Create a new user (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, email, role, password } = validation.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Generate password hash if provided, otherwise generate a random one
    const passwordToHash = password || Math.random().toString(36).slice(-12) + "A1!";
    const hashedPassword = await bcrypt.hash(passwordToHash, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: role as UserRole,
        password: hashedPassword,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Log the user creation
    await logUserInvite(session.user.id, email, role);
    await logCreate(session.user.id, "User", user.id, `Created user ${email}`);

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
