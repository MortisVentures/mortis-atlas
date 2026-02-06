import { NextRequest, NextResponse } from "next/server";
import { getActivities, createActivity } from "@/lib/db/activities";
import { auth } from "@/lib/auth";
import { createActivitySchema, activityFilterSchema } from "@/lib/validations/activity";
import { z } from "zod";

/**
 * GET /api/activities
 * List activities with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Parse filters from query params
    const filters = activityFilterSchema.parse({
      companyId: searchParams.get("companyId") || undefined,
      dealId: searchParams.get("dealId") || undefined,
      contactId: searchParams.get("contactId") || undefined,
      type: searchParams.get("type") || undefined,
      completed: searchParams.get("completed") || undefined,
      upcoming: searchParams.get("upcoming") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
    });

    const activities = await getActivities({
      userId: session.user.id,
      ...filters,
    });

    return NextResponse.json({ data: activities }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid filter parameters", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/activities
 * Create a new activity
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createActivitySchema.parse(body);

    const activity = await createActivity({
      ...validated,
      userId: session.user.id,
    });

    return NextResponse.json(activity, { status: 201 });
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

    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}
