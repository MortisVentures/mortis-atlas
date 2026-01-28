import { NextRequest, NextResponse } from "next/server";
import {
  getContactById,
  updateContact,
  deleteContact,
} from "@/lib/db/contacts";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Validation schema for updating a contact
const updateContactSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("")).or(z.null()),
  phone: z.string().optional().or(z.null()),
  role: z.string().optional().or(z.null()),
  linkedinUrl: z.string().url().optional().or(z.literal("")).or(z.null()),
  notes: z.string().optional().or(z.null()),
  isPrimary: z.boolean().optional(),
  companyId: z.string().optional().or(z.null()),
});

/**
 * GET /api/contacts/[id]
 * Get a single contact by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Contact ID is required" },
        { status: 400 }
      );
    }

    const contact = await getContactById(id);

    if (!contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (contact.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to access this contact" },
        { status: 403 }
      );
    }

    return NextResponse.json(contact, { status: 200 });
  } catch (error) {
    console.error("Error fetching contact:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/contacts/[id]
 * Update an existing contact
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Contact ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = updateContactSchema.parse(body);

    // Check if contact exists
    const existing = await getContactById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to update this contact" },
        { status: 403 }
      );
    }

    // Transform empty strings to null
    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(validated)) {
      if (value !== undefined) {
        updateData[key] = value === "" ? null : value;
      }
    }

    const contact = await updateContact(id, updateData);

    return NextResponse.json(contact, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    console.error("Error updating contact:", error);
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/contacts/[id]
 * Delete a contact
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Contact ID is required" },
        { status: 400 }
      );
    }

    // Check if contact exists
    const existing = await getContactById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this contact" },
        { status: 403 }
      );
    }

    await deleteContact(id);

    return NextResponse.json(
      { message: "Contact deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    console.error("Error deleting contact:", error);
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
