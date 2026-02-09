import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { AuditAction, Prisma } from "@prisma/client";

/**
 * GET /api/admin/audit
 * List audit logs (admin only)
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
    const action = searchParams.get("action");
    const userId = searchParams.get("userId");
    const entityType = searchParams.get("entityType");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (action) {
      where.action = action as AuditAction;
    }

    if (userId) {
      where.userId = userId;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { entityType: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
