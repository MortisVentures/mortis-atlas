import { prisma } from "./prisma";
import {
  Document,
  DocumentVersion,
  DocumentAccessLog,
  DocumentType,
  AccessLevel,
  DocumentAction,
  Prisma,
} from "@prisma/client";

// =============================================================================
// TYPES
// =============================================================================

export interface CreateDocumentInput {
  name: string;
  originalName: string;
  description?: string;
  documentType: DocumentType;
  accessLevel: AccessLevel;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  bucketName?: string;
  companyId?: string;
  dealId?: string;
  icMemoId?: string;
  uploadedById: string;
  tags?: string[];
}

export interface UpdateDocumentInput {
  name?: string;
  description?: string;
  documentType?: DocumentType;
  accessLevel?: AccessLevel;
  tags?: string[];
}

export interface DocumentFilter {
  userId: string;
  companyId?: string;
  dealId?: string;
  icMemoId?: string;
  documentType?: DocumentType;
  accessLevel?: AccessLevel;
  searchQuery?: string;
  page?: number;
  limit?: number;
}

export interface DocumentWithRelations extends Document {
  company?: {
    id: string;
    name: string;
  } | null;
  deal?: {
    id: string;
    dealName: string;
  } | null;
  uploadedBy: {
    id: string;
    name: string | null;
  };
  versions: DocumentVersion[];
  tags: {
    tag: {
      id: string;
      name: string;
      color: string | null;
    };
  }[];
  _count: {
    versions: number;
    accessLogs: number;
  };
}

// =============================================================================
// CREATE
// =============================================================================

/**
 * Create a new document record in the database
 */
export async function createDocument(
  input: CreateDocumentInput
): Promise<Document> {
  const document = await prisma.document.create({
    data: {
      name: input.name,
      originalName: input.originalName,
      description: input.description,
      documentType: input.documentType,
      accessLevel: input.accessLevel,
      fileUrl: input.fileUrl,
      fileType: input.fileType,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      storagePath: input.storagePath,
      bucketName: input.bucketName || "documents",
      currentVersion: 1,
      companyId: input.companyId,
      dealId: input.dealId,
      icMemoId: input.icMemoId,
      uploadedById: input.uploadedById,
      versions: {
        create: {
          versionNumber: 1,
          fileUrl: input.fileUrl,
          fileSize: input.fileSize,
          changeNotes: "Initial upload",
          uploadedById: input.uploadedById,
        },
      },
    },
    include: {
      versions: true,
    },
  });

  // Add tags if provided
  if (input.tags && input.tags.length > 0) {
    await addTagsToDocument(document.id, input.tags);
  }

  return document;
}

/**
 * Add a new version to an existing document
 */
export async function createDocumentVersion(
  documentId: string,
  input: {
    fileUrl: string;
    fileSize: number;
    changeNotes?: string;
    uploadedById: string;
  }
): Promise<DocumentVersion> {
  // Get current version number
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { currentVersion: true },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  const newVersionNumber = document.currentVersion + 1;

  // Create version and update document in transaction
  const [version] = await prisma.$transaction([
    prisma.documentVersion.create({
      data: {
        documentId,
        versionNumber: newVersionNumber,
        fileUrl: input.fileUrl,
        fileSize: input.fileSize,
        changeNotes: input.changeNotes,
        uploadedById: input.uploadedById,
      },
    }),
    prisma.document.update({
      where: { id: documentId },
      data: {
        currentVersion: newVersionNumber,
        fileUrl: input.fileUrl,
        fileSize: input.fileSize,
        updatedAt: new Date(),
      },
    }),
  ]);

  return version;
}

// =============================================================================
// READ
// =============================================================================

/**
 * Get a single document by ID with full relations
 */
export async function getDocumentById(
  documentId: string,
  userId: string
): Promise<DocumentWithRelations | null> {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      uploadedById: userId,
    },
    include: {
      company: {
        select: { id: true, name: true },
      },
      deal: {
        select: { id: true, dealName: true },
      },
      uploadedBy: {
        select: { id: true, name: true },
      },
      versions: {
        orderBy: { versionNumber: "desc" },
      },
      tags: {
        include: {
          tag: {
            select: { id: true, name: true, color: true },
          },
        },
      },
      _count: {
        select: {
          versions: true,
          accessLogs: true,
        },
      },
    },
  });

  return document;
}

/**
 * Get documents with filtering and pagination
 */
export async function getDocuments(
  filter: DocumentFilter
): Promise<{ documents: DocumentWithRelations[]; total: number }> {
  const { userId, companyId, dealId, icMemoId, documentType, accessLevel, searchQuery, page = 1, limit = 20 } = filter;

  const where: Prisma.DocumentWhereInput = {
    uploadedById: userId,
  };

  if (companyId) {
    where.companyId = companyId;
  }

  if (dealId) {
    where.dealId = dealId;
  }

  if (icMemoId) {
    where.icMemoId = icMemoId;
  }

  if (documentType) {
    where.documentType = documentType;
  }

  if (accessLevel) {
    where.accessLevel = accessLevel;
  }

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
      { originalName: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const [documents, total] = await prisma.$transaction([
    prisma.document.findMany({
      where,
      include: {
        company: {
          select: { id: true, name: true },
        },
        deal: {
          select: { id: true, dealName: true },
        },
        uploadedBy: {
          select: { id: true, name: true },
        },
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1, // Only get latest version for list view
        },
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, color: true },
            },
          },
        },
        _count: {
          select: {
            versions: true,
            accessLogs: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.document.count({ where }),
  ]);

  return { documents, total };
}

/**
 * Get documents for a specific company
 */
export async function getCompanyDocuments(
  companyId: string,
  userId: string
): Promise<DocumentWithRelations[]> {
  const { documents } = await getDocuments({
    userId,
    companyId,
  });

  return documents;
}

/**
 * Get documents for a specific deal
 */
export async function getDealDocuments(
  dealId: string,
  userId: string
): Promise<DocumentWithRelations[]> {
  const { documents } = await getDocuments({
    userId,
    dealId,
  });

  return documents;
}

/**
 * Get recent documents (most recently updated)
 */
export async function getRecentDocuments(
  userId: string,
  limit: number = 10
): Promise<DocumentWithRelations[]> {
  const { documents } = await getDocuments({
    userId,
    limit,
    page: 1,
  });

  return documents;
}

/**
 * Get document statistics for the user
 */
export async function getDocumentStats(userId: string) {
  const documents = await prisma.document.findMany({
    where: { uploadedById: userId },
    select: {
      id: true,
      documentType: true,
      fileSize: true,
      companyId: true,
      createdAt: true,
      company: {
        select: { id: true, name: true },
      },
    },
  });

  const byType: Record<DocumentType, number> = {
    PITCH_DECK: 0,
    FINANCIAL_MODEL: 0,
    IC_MEMO: 0,
    TERM_SHEET: 0,
    DD_REPORT: 0,
    BOARD_NOTES: 0,
    LEGAL: 0,
    REFERENCE: 0,
  };

  const byCompanyMap = new Map<string, { companyName: string; count: number }>();
  let totalSize = 0;

  documents.forEach((doc) => {
    byType[doc.documentType]++;
    totalSize += doc.fileSize;

    if (doc.companyId && doc.company) {
      const existing = byCompanyMap.get(doc.companyId);
      if (existing) {
        existing.count++;
      } else {
        byCompanyMap.set(doc.companyId, { companyName: doc.company.name, count: 1 });
      }
    }
  });

  const byCompany = Array.from(byCompanyMap.entries()).map(([companyId, data]) => ({
    companyId,
    companyName: data.companyName,
    count: data.count,
  }));

  // Recent uploads (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentUploads = documents.filter((d) => d.createdAt > weekAgo).length;

  return {
    totalDocuments: documents.length,
    totalSize,
    byType,
    byCompany,
    recentUploads,
  };
}

// =============================================================================
// UPDATE
// =============================================================================

/**
 * Update document metadata
 */
export async function updateDocument(
  documentId: string,
  userId: string,
  input: UpdateDocumentInput
): Promise<Document | null> {
  // Verify ownership
  const existing = await prisma.document.findFirst({
    where: { id: documentId, uploadedById: userId },
  });

  if (!existing) {
    return null;
  }

  const document = await prisma.document.update({
    where: { id: documentId },
    data: {
      name: input.name,
      description: input.description,
      documentType: input.documentType,
      accessLevel: input.accessLevel,
      updatedAt: new Date(),
    },
  });

  // Update tags if provided
  if (input.tags !== undefined) {
    // Remove existing tags
    await prisma.documentTag.deleteMany({
      where: { documentId },
    });

    // Add new tags
    if (input.tags.length > 0) {
      await addTagsToDocument(documentId, input.tags);
    }
  }

  return document;
}

/**
 * Update document view count
 */
export async function incrementViewCount(documentId: string): Promise<void> {
  await prisma.document.update({
    where: { id: documentId },
    data: {
      viewCount: { increment: 1 },
      lastViewedAt: new Date(),
    },
  });
}

/**
 * Update document download count
 */
export async function incrementDownloadCount(documentId: string): Promise<void> {
  await prisma.document.update({
    where: { id: documentId },
    data: {
      downloadCount: { increment: 1 },
    },
  });
}

// =============================================================================
// DELETE
// =============================================================================

/**
 * Delete a document and all its versions
 */
export async function deleteDocument(
  documentId: string,
  userId: string
): Promise<boolean> {
  // Verify ownership
  const existing = await prisma.document.findFirst({
    where: { id: documentId, uploadedById: userId },
  });

  if (!existing) {
    return false;
  }

  // Prisma will cascade delete versions, tags, and access logs
  await prisma.document.delete({
    where: { id: documentId },
  });

  return true;
}

// =============================================================================
// ACCESS LOGGING
// =============================================================================

/**
 * Log document access for audit trail
 */
export async function logDocumentAccess(
  documentId: string,
  userId: string,
  action: DocumentAction,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<DocumentAccessLog> {
  return prisma.documentAccessLog.create({
    data: {
      documentId,
      userId,
      action,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    },
  });
}

/**
 * Get access logs for a document
 */
export async function getDocumentAccessLogs(
  documentId: string,
  limit: number = 50
): Promise<DocumentAccessLog[]> {
  return prisma.documentAccessLog.findMany({
    where: { documentId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// =============================================================================
// TAGS
// =============================================================================

/**
 * Add tags to a document (creates tags if they don't exist)
 */
async function addTagsToDocument(
  documentId: string,
  tagNames: string[]
): Promise<void> {
  for (const tagName of tagNames) {
    // Find or create the tag
    const tag = await prisma.tag.upsert({
      where: { name: tagName.toLowerCase() },
      update: {},
      create: {
        name: tagName.toLowerCase(),
        category: "document",
      },
    });

    // Create the document-tag relationship
    await prisma.documentTag.upsert({
      where: {
        documentId_tagId: {
          documentId,
          tagId: tag.id,
        },
      },
      update: {},
      create: {
        documentId,
        tagId: tag.id,
      },
    });
  }
}

/**
 * Get all tags used in documents
 */
export async function getDocumentTags(): Promise<{ id: string; name: string; count: number }[]> {
  const tags = await prisma.tag.findMany({
    where: {
      documents: {
        some: {},
      },
    },
    include: {
      _count: {
        select: { documents: true },
      },
    },
    orderBy: {
      documents: {
        _count: "desc",
      },
    },
  });

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    count: tag._count.documents,
  }));
}

// =============================================================================
// SHARE LINKS
// =============================================================================

/**
 * Create a share link for a document
 */
export async function createShareLink(
  documentId: string,
  userId: string,
  expiresInHours: number = 24
): Promise<{ shareLink: string; expiresAt: Date } | null> {
  // Verify ownership
  const existing = await prisma.document.findFirst({
    where: { id: documentId, uploadedById: userId },
  });

  if (!existing) {
    return null;
  }

  const shareLink = `share-${documentId}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  await prisma.document.update({
    where: { id: documentId },
    data: {
      shareLink,
      shareLinkExpiry: expiresAt,
    },
  });

  return { shareLink, expiresAt };
}

/**
 * Validate and get document by share link
 */
export async function getDocumentByShareLink(
  shareLink: string
): Promise<Document | null> {
  const document = await prisma.document.findFirst({
    where: {
      shareLink,
      shareLinkExpiry: { gt: new Date() },
    },
  });

  return document;
}

/**
 * Revoke share link for a document
 */
export async function revokeShareLink(
  documentId: string,
  userId: string
): Promise<boolean> {
  // Verify ownership
  const existing = await prisma.document.findFirst({
    where: { id: documentId, uploadedById: userId },
  });

  if (!existing) {
    return false;
  }

  await prisma.document.update({
    where: { id: documentId },
    data: {
      shareLink: null,
      shareLinkExpiry: null,
    },
  });

  return true;
}
