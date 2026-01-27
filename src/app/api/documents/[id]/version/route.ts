import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getDocumentById,
  createDocumentVersion,
  logDocumentAccess,
} from "@/lib/db/documents";
import { uploadNewVersion as uploadVersionToStorage } from "@/lib/storage/documents";
import { FileType } from "@/lib/types/documents";

// =============================================================================
// POST - Upload a new version
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

    // Get existing document
    const existingDocument = await getDocumentById(id, session.user.id);

    if (!existingDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const changeNotes = formData.get("changeNotes") as string || undefined;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload new version to storage
    const uploadResult = await uploadVersionToStorage(
      file,
      {
        id: existingDocument.id,
        name: existingDocument.name,
        originalName: existingDocument.originalName,
        description: existingDocument.description || undefined,
        documentType: existingDocument.documentType,
        accessLevel: existingDocument.accessLevel,
        fileUrl: existingDocument.fileUrl,
        fileType: existingDocument.fileType as FileType,
        fileSize: existingDocument.fileSize,
        mimeType: existingDocument.mimeType,
        storagePath: existingDocument.storagePath,
        bucketName: existingDocument.bucketName,
        currentVersion: existingDocument.currentVersion,
        versions: existingDocument.versions.map((v) => ({
          id: v.id,
          versionNumber: v.versionNumber,
          fileUrl: v.fileUrl,
          fileSize: v.fileSize,
          uploadedAt: v.createdAt.toISOString(),
          uploadedById: v.uploadedById,
          uploadedByName: "",
          changeNotes: v.changeNotes || undefined,
        })),
        tags: existingDocument.tags.map((t) => t.tag.name),
        createdAt: existingDocument.createdAt.toISOString(),
        updatedAt: existingDocument.updatedAt.toISOString(),
        uploadedById: existingDocument.uploadedById,
        uploadedByName: existingDocument.uploadedBy.name || "",
        viewCount: existingDocument.viewCount,
        downloadCount: existingDocument.downloadCount,
      },
      session.user.id,
      session.user.name || "Unknown",
      changeNotes
    );

    if (!uploadResult.success || !uploadResult.document) {
      return NextResponse.json(
        { error: uploadResult.error || "Version upload failed" },
        { status: 500 }
      );
    }

    // Create version record in database
    const version = await createDocumentVersion(id, {
      fileUrl: uploadResult.document.fileUrl,
      fileSize: file.size,
      changeNotes,
      uploadedById: session.user.id,
    });

    // Log edit action
    await logDocumentAccess(id, session.user.id, "EDIT");

    return NextResponse.json({
      success: true,
      version: {
        id: version.id,
        versionNumber: version.versionNumber,
        fileUrl: version.fileUrl,
        fileSize: version.fileSize,
        changeNotes: version.changeNotes,
        createdAt: version.createdAt,
      },
    });
  } catch (error) {
    console.error("Error uploading document version:", error);
    return NextResponse.json(
      { error: "Failed to upload new version" },
      { status: 500 }
    );
  }
}
