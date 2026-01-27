import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createDocument,
  getDocuments,
  CreateDocumentInput,
} from "@/lib/db/documents";
import { uploadDocument as uploadToStorage } from "@/lib/storage/documents";
import { DocumentType, AccessLevel } from "@prisma/client";
import { z } from "zod";

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const documentUploadSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  description: z.string().optional(),
  documentType: z.nativeEnum(DocumentType),
  accessLevel: z.nativeEnum(AccessLevel).default("TEAM"),
  companyId: z.string().optional(),
  dealId: z.string().optional(),
  icMemoId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const documentFilterSchema = z.object({
  companyId: z.string().optional(),
  dealId: z.string().optional(),
  icMemoId: z.string().optional(),
  documentType: z.nativeEnum(DocumentType).optional(),
  accessLevel: z.nativeEnum(AccessLevel).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// =============================================================================
// GET - List documents with filtering
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validated = documentFilterSchema.safeParse(params);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validated.error.issues },
        { status: 400 }
      );
    }

    const { companyId, dealId, icMemoId, documentType, accessLevel, search, page, limit } = validated.data;

    const { documents, total } = await getDocuments({
      userId: session.user.id,
      companyId,
      dealId,
      icMemoId,
      documentType,
      accessLevel,
      searchQuery: search,
      page,
      limit,
    });

    // Transform documents for response
    const transformedDocuments = documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      originalName: doc.originalName,
      description: doc.description,
      documentType: doc.documentType,
      accessLevel: doc.accessLevel,
      fileUrl: doc.fileUrl,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      currentVersion: doc.currentVersion,
      companyId: doc.companyId,
      dealId: doc.dealId,
      icMemoId: doc.icMemoId,
      company: doc.company,
      deal: doc.deal,
      uploadedBy: doc.uploadedBy,
      viewCount: doc.viewCount,
      downloadCount: doc.downloadCount,
      lastViewedAt: doc.lastViewedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      tags: doc.tags.map((t) => t.tag),
      _count: doc._count,
    }));

    return NextResponse.json({
      documents: transformedDocuments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST - Upload a new document
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Parse metadata from form data
    const metadata = {
      name: formData.get("name") as string || file.name.replace(/\.[^/.]+$/, ""),
      description: formData.get("description") as string || undefined,
      documentType: formData.get("documentType") as DocumentType || "REFERENCE",
      accessLevel: formData.get("accessLevel") as AccessLevel || "TEAM",
      companyId: formData.get("companyId") as string || undefined,
      dealId: formData.get("dealId") as string || undefined,
      icMemoId: formData.get("icMemoId") as string || undefined,
      tags: formData.get("tags") ? JSON.parse(formData.get("tags") as string) : undefined,
    };

    // Validate metadata
    const validated = documentUploadSchema.safeParse(metadata);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid metadata", details: validated.error.issues },
        { status: 400 }
      );
    }

    // Upload file to Supabase Storage
    const uploadResult = await uploadToStorage(
      file,
      {
        name: validated.data.name,
        description: validated.data.description,
        documentType: validated.data.documentType,
        accessLevel: validated.data.accessLevel,
        companyId: validated.data.companyId,
        dealId: validated.data.dealId,
        icMemoId: validated.data.icMemoId,
        tags: validated.data.tags,
      },
      session.user.id,
      session.user.name || "Unknown"
    );

    if (!uploadResult.success || !uploadResult.document) {
      return NextResponse.json(
        { error: uploadResult.error || "Upload failed" },
        { status: 500 }
      );
    }

    // Create document record in database
    const documentInput: CreateDocumentInput = {
      name: validated.data.name,
      originalName: file.name,
      description: validated.data.description,
      documentType: validated.data.documentType,
      accessLevel: validated.data.accessLevel,
      fileUrl: uploadResult.document.fileUrl,
      fileType: uploadResult.document.fileType,
      fileSize: file.size,
      mimeType: file.type,
      storagePath: uploadResult.document.storagePath,
      bucketName: uploadResult.document.bucketName,
      companyId: validated.data.companyId,
      dealId: validated.data.dealId,
      icMemoId: validated.data.icMemoId,
      uploadedById: session.user.id,
      tags: validated.data.tags,
    };

    const document = await createDocument(documentInput);

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.name,
        originalName: document.originalName,
        documentType: document.documentType,
        fileUrl: document.fileUrl,
        fileSize: document.fileSize,
        companyId: document.companyId,
        dealId: document.dealId,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
