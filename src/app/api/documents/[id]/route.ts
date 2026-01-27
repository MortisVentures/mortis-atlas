import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getDocumentById,
  updateDocument,
  deleteDocument,
  logDocumentAccess,
  incrementViewCount,
} from "@/lib/db/documents";
import { deleteDocument as deleteFromStorage } from "@/lib/storage/documents";
import { DocumentType, AccessLevel } from "@prisma/client";
import { FileType } from "@/lib/types/documents";
import { z } from "zod";

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const updateDocumentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  documentType: z.nativeEnum(DocumentType).optional(),
  accessLevel: z.nativeEnum(AccessLevel).optional(),
  tags: z.array(z.string()).optional(),
});

// =============================================================================
// GET - Get single document
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

    // Log view and increment count
    await Promise.all([
      incrementViewCount(id),
      logDocumentAccess(id, session.user.id, "VIEW"),
    ]);

    // Transform for response
    const response = {
      id: document.id,
      name: document.name,
      originalName: document.originalName,
      description: document.description,
      documentType: document.documentType,
      accessLevel: document.accessLevel,
      fileUrl: document.fileUrl,
      fileType: document.fileType,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      storagePath: document.storagePath,
      currentVersion: document.currentVersion,
      companyId: document.companyId,
      dealId: document.dealId,
      icMemoId: document.icMemoId,
      company: document.company,
      deal: document.deal,
      uploadedBy: document.uploadedBy,
      versions: document.versions.map((v) => ({
        id: v.id,
        versionNumber: v.versionNumber,
        fileUrl: v.fileUrl,
        fileSize: v.fileSize,
        changeNotes: v.changeNotes,
        createdAt: v.createdAt,
      })),
      tags: document.tags.map((t) => t.tag),
      viewCount: document.viewCount,
      downloadCount: document.downloadCount,
      lastViewedAt: document.lastViewedAt,
      shareLink: document.shareLink,
      shareLinkExpiry: document.shareLinkExpiry,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      _count: document._count,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

// =============================================================================
// PUT - Update document metadata
// =============================================================================

export async function PUT(
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

    // Validate input
    const validated = updateDocumentSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.issues },
        { status: 400 }
      );
    }

    const document = await updateDocument(id, session.user.id, validated.data);

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Log edit action
    await logDocumentAccess(id, session.user.id, "EDIT");

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.name,
        description: document.description,
        documentType: document.documentType,
        accessLevel: document.accessLevel,
        updatedAt: document.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

// =============================================================================
// DELETE - Delete document
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

    // Get document first for storage deletion
    const document = await getDocumentById(id, session.user.id);

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Log delete action before deleting
    await logDocumentAccess(id, session.user.id, "DELETE");

    // Delete from database
    const deleted = await deleteDocument(id, session.user.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete document" },
        { status: 500 }
      );
    }

    // Delete from storage (best effort - don't fail if this fails)
    try {
      await deleteFromStorage({
        id: document.id,
        name: document.name,
        originalName: document.originalName,
        description: document.description || undefined,
        documentType: document.documentType,
        accessLevel: document.accessLevel,
        fileUrl: document.fileUrl,
        fileType: document.fileType as FileType,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        storagePath: document.storagePath,
        bucketName: document.bucketName,
        currentVersion: document.currentVersion,
        versions: document.versions.map((v) => ({
          id: v.id,
          versionNumber: v.versionNumber,
          fileUrl: v.fileUrl,
          fileSize: v.fileSize,
          uploadedAt: v.createdAt.toISOString(),
          uploadedById: v.uploadedById,
          uploadedByName: "",
          changeNotes: v.changeNotes || undefined,
        })),
        tags: document.tags.map((t) => t.tag.name),
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
        uploadedById: document.uploadedById,
        uploadedByName: document.uploadedBy.name || "",
        viewCount: document.viewCount,
        downloadCount: document.downloadCount,
      });
    } catch (storageError) {
      console.error("Failed to delete from storage:", storageError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
