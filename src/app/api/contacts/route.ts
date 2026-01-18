import { NextRequest, NextResponse } from "next/server";
import { getContacts, createContact } from "@/lib/db/contacts";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Validation schema for creating a contact
const createContactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  role: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
  isPrimary: z.boolean().optional(),
  companyId: z.string().optional(),
});

/**
 * GET /api/contacts
 * List all contacts with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const companyId = searchParams.get("companyId") || undefined;

    const contacts = await getContacts({
      userId: session.user.id,
      search,
      companyId,
    });

    return NextResponse.json({ data: contacts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contacts
 * Create a new contact
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createContactSchema.parse(body);

    // Transform empty strings to null
    const contactData = {
      firstName: validated.firstName,
      lastName: validated.lastName,
      email: validated.email || null,
      phone: validated.phone || null,
      role: validated.role || null,
      linkedinUrl: validated.linkedinUrl || null,
      notes: validated.notes || null,
      isPrimary: validated.isPrimary ?? false,
      companyId: validated.companyId || null,
      userId: session.user.id,
    };

    const contact = await createContact(contactData);

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    console.error("Error creating contact:", error);
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
