import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { linkToExistingContact } from "@/lib/integrations/detection";

/**
 * POST /api/proposals/[id]/link
 * Link a proposal to an existing contact
 * Body: { contactId: string }
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
    const body = await request.json();

    if (!body.contactId) {
      return NextResponse.json(
        { error: "Contact ID is required" },
        { status: 400 }
      );
    }

    const result = await linkToExistingContact(
      session.user.id,
      id,
      body.contactId
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to link contact" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      contactId: result.contactId,
      companyId: result.companyId,
    });
  } catch (error) {
    console.error("Error linking proposal to contact:", error);
    return NextResponse.json(
      { error: "Failed to link contact" },
      { status: 500 }
    );
  }
}
