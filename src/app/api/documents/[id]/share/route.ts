import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createShareLink,
  revokeShareLink,
  logDocumentAccess,
} from "@/lib/db/documents";
import { z } from "zod";

const shareSchema = z.object({
  expiresInHours: z.number().min(1).max(720).default(24), // Max 30 days
});

// =============================================================================
// POST - Create share link
// =============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const validated = shareSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.issues },
        { status: 400 }
      );
    }

    const result = await createShareLink(id, session.user.id, validated.data.expiresInHours);

    if (!result) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Log share action
    await logDocumentAccess(id, session.user.id, "SHARE");

    return NextResponse.json({
      success: true,
      shareLink: result.shareLink,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error("Error creating share link:", error);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}

// =============================================================================
// DELETE - Revoke share link
// =============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const revoked = await revokeShareLink(id, session.user.id);

    if (!revoked) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking share link:", error);
    return NextResponse.json(
      { error: "Failed to revoke share link" },
      { status: 500 }
    );
  }
}
