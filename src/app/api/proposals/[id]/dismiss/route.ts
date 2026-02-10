import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dismissProposal } from "@/lib/integrations/detection";

/**
 * POST /api/proposals/[id]/dismiss
 * Dismiss a contact proposal
 * Body: { reason?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const result = await dismissProposal(
      session.user.id,
      id,
      body.reason
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to dismiss proposal" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error dismissing proposal:", error);
    return NextResponse.json(
      { error: "Failed to dismiss proposal" },
      { status: 500 }
    );
  }
}
