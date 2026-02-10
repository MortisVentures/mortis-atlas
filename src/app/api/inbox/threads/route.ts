import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

/**
 * GET /api/inbox/threads
 * Get email threads for the current user
 * Query params: page, limit, search, accountId, linked (true/false)
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search");
    const accountId = searchParams.get("accountId");
    const linked = searchParams.get("linked");

    // Get user's email accounts
    const accounts = await prisma.emailAccount.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
        ...(accountId && { id: accountId }),
      },
      select: { id: true },
    });

    if (accounts.length === 0) {
      return NextResponse.json({
        threads: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      });
    }

    const accountIds = accounts.map((a) => a.id);

    // Build where clause
    const where: Prisma.EmailThreadWhereInput = {
      accountId: { in: accountIds },
      isArchived: false,
    };

    // Search filter
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: "insensitive" } },
        { snippet: { contains: search, mode: "insensitive" } },
        { participantEmails: { has: search.toLowerCase() } },
      ];
    }

    // Linked filter
    if (linked === "true") {
      where.OR = [
        { companyId: { not: null } },
        { contactId: { not: null } },
        { dealId: { not: null } },
      ];
    } else if (linked === "false") {
      where.companyId = null;
      where.contactId = null;
      where.dealId = null;
    }

    // Get total count
    const total = await prisma.emailThread.count({ where });

    // Get threads
    const threads = await prisma.emailThread.findMany({
      where,
      include: {
        account: {
          select: { email: true, provider: true },
        },
        messages: {
          orderBy: { sentAt: "desc" },
          take: 1,
          select: {
            fromEmail: true,
            fromName: true,
            sentAt: true,
            isInbound: true,
            bodyPreview: true,
          },
        },
      },
      orderBy: { lastMessageAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      threads: threads.map((t) => ({
        id: t.id,
        subject: t.subject,
        snippet: t.snippet,
        participantEmails: t.participantEmails,
        lastMessageAt: t.lastMessageAt,
        messageCount: t.messageCount,
        account: t.account,
        latestMessage: t.messages[0] || null,
        companyId: t.companyId,
        contactId: t.contactId,
        dealId: t.dealId,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching email threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch email threads" },
      { status: 500 }
    );
  }
}
