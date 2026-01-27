import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getDocumentById,
  logDocumentAccess,
  incrementDownloadCount,
} from "@/lib/db/documents";
import { getSignedUrl } from "@/lib/storage/documents";

// =============================================================================
// GET - Get signed download URL
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const document = await getDocumentById(id, session.user.id);

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Log download and increment count
    await Promise.all([
      incrementDownloadCount(id),
      logDocumentAccess(id, session.user.id, "DOWNLOAD"),
    ]);

    // Get signed URL for download
    const { url, error } = await getSignedUrl(document.storagePath, 3600);

    if (error || !url) {
      // Fallback to direct URL if signed URL fails (e.g., Supabase not configured)
      return NextResponse.json({
        downloadUrl: document.fileUrl,
        fileName: document.originalName,
        expiresIn: null,
      });
    }

    return NextResponse.json({
      downloadUrl: url,
      fileName: document.originalName,
      expiresIn: 3600, // 1 hour
    });
  } catch (error) {
    console.error("Error getting download URL:", error);
    return NextResponse.json(
      { error: "Failed to get download URL" },
      { status: 500 }
    );
  }
}
