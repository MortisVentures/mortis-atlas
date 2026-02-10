import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createContactFromProposal } from "@/lib/integrations/detection";

/**
 * POST /api/proposals/[id]/create
 * Create a contact from a proposal
 * Body: { firstName, lastName, role?, phone?, linkedinUrl?, companyId?, createCompany?: { name, website? } }
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

    // Validate required fields
    if (!body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    const result = await createContactFromProposal(session.user.id, id, {
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role,
      phone: body.phone,
      linkedinUrl: body.linkedinUrl,
      companyId: body.companyId,
      createCompany: body.createCompany,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create contact" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      contactId: result.contactId,
      companyId: result.companyId,
    });
  } catch (error) {
    console.error("Error creating contact from proposal:", error);
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
