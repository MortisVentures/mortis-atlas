import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDocumentStats } from "@/lib/db/documents";

// =============================================================================
// GET - Get document statistics
// =============================================================================

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getDocumentStats(session.user.id);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching document stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch document statistics" },
      { status: 500 }
    );
  }
}
