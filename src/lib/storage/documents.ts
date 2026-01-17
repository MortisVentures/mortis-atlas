import { createClient } from "@supabase/supabase-js";
import {
  DocumentMetadata,
  DocumentUploadOptions,
  DocumentFilter,
  DocumentVersion,
  DocumentStats,
  DocumentType,
  AccessLevel,
  FileType,
  generateStoragePath,
  getFileTypeFromMime,
  getFileTypeFromExtension,
  validateFile,
  formatFileSize,
} from "@/lib/types/documents";

// =============================================================================
// SUPABASE CLIENT
// =============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create Supabase client (will be null if env vars not set)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const BUCKET_NAME = "documents";

// =============================================================================
// UPLOAD FUNCTIONS
// =============================================================================

export interface UploadResult {
  success: boolean;
  document?: DocumentMetadata;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload a document to Supabase Storage
 */
export async function uploadDocument(
  file: File,
  options: DocumentUploadOptions,
  userId: string,
  userName: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Check if Supabase is configured
  if (!supabase) {
    // Return mock success for development without Supabase
    console.warn("Supabase not configured. Returning mock document.");
    const mockDocument = createMockDocument(file, options, userId, userName);
    return { success: true, document: mockDocument };
  }

  try {
    const fileType = getFileTypeFromMime(file.type) || getFileTypeFromExtension(file.name);
    if (!fileType) {
      return { success: false, error: "Unable to determine file type" };
    }

    // Generate storage path
    const storagePath = generateStoragePath(options.companyId, options.documentType, file.name);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    // Create document metadata
    const document: DocumentMetadata = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: options.name || file.name.replace(/\.[^/.]+$/, ""),
      originalName: file.name,
      description: options.description,
      documentType: options.documentType,
      accessLevel: options.accessLevel,
      fileUrl: urlData.publicUrl,
      fileType,
      fileSize: file.size,
      mimeType: file.type,
      storagePath,
      bucketName: BUCKET_NAME,
      companyId: options.companyId,
      dealId: options.dealId,
      icMemoId: options.icMemoId,
      currentVersion: 1,
      versions: [
        {
          id: `ver-${Date.now()}`,
          versionNumber: 1,
          fileUrl: urlData.publicUrl,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          uploadedById: userId,
          uploadedByName: userName,
          changeNotes: "Initial upload",
        },
      ],
      tags: options.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      uploadedById: userId,
      uploadedByName: userName,
      viewCount: 0,
      downloadCount: 0,
    };

    // In production, save metadata to database here
    // await saveDocumentMetadata(document);

    return { success: true, document };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Failed to upload document" };
  }
}

/**
 * Upload a new version of an existing document
 */
export async function uploadNewVersion(
  file: File,
  existingDocument: DocumentMetadata,
  userId: string,
  userName: string,
  changeNotes?: string
): Promise<UploadResult> {
  const validation = validateFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  if (!supabase) {
    // Mock version upload for development
    const newVersion: DocumentVersion = {
      id: `ver-${Date.now()}`,
      versionNumber: existingDocument.currentVersion + 1,
      fileUrl: existingDocument.fileUrl,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedById: userId,
      uploadedByName: userName,
      changeNotes,
    };

    const updatedDocument: DocumentMetadata = {
      ...existingDocument,
      currentVersion: newVersion.versionNumber,
      fileSize: file.size,
      updatedAt: new Date().toISOString(),
      versions: [...existingDocument.versions, newVersion],
    };

    return { success: true, document: updatedDocument };
  }

  try {
    const newVersionNumber = existingDocument.currentVersion + 1;
    const storagePath = `${existingDocument.storagePath.replace(/\/[^/]+$/, "")}/${newVersionNumber}-${file.name}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    const newVersion: DocumentVersion = {
      id: `ver-${Date.now()}`,
      versionNumber: newVersionNumber,
      fileUrl: urlData.publicUrl,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedById: userId,
      uploadedByName: userName,
      changeNotes,
    };

    const updatedDocument: DocumentMetadata = {
      ...existingDocument,
      fileUrl: urlData.publicUrl,
      fileSize: file.size,
      currentVersion: newVersionNumber,
      updatedAt: new Date().toISOString(),
      versions: [...existingDocument.versions, newVersion],
    };

    return { success: true, document: updatedDocument };
  } catch (error) {
    console.error("Version upload error:", error);
    return { success: false, error: "Failed to upload new version" };
  }
}

// =============================================================================
// DOWNLOAD & ACCESS FUNCTIONS
// =============================================================================

/**
 * Generate a signed URL for secure download
 */
export async function getSignedUrl(
  storagePath: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<{ url?: string; error?: string }> {
  if (!supabase) {
    return { error: "Supabase not configured" };
  }

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, expiresIn);

    if (error) {
      return { error: error.message };
    }

    return { url: data.signedUrl };
  } catch (error) {
    return { error: "Failed to generate signed URL" };
  }
}

/**
 * Generate a shareable link with expiration
 */
export async function createShareLink(
  document: DocumentMetadata,
  expiresInHours: number = 24
): Promise<{ shareLink?: string; expiresAt?: string; error?: string }> {
  const expiresIn = expiresInHours * 60 * 60;
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  const result = await getSignedUrl(document.storagePath, expiresIn);

  if (result.error) {
    return { error: result.error };
  }

  return {
    shareLink: result.url,
    expiresAt,
  };
}

/**
 * Download a document
 */
export async function downloadDocument(
  document: DocumentMetadata
): Promise<{ blob?: Blob; error?: string }> {
  if (!supabase) {
    // For development, try to fetch the URL directly
    try {
      const response = await fetch(document.fileUrl);
      if (!response.ok) throw new Error("Failed to fetch");
      const blob = await response.blob();
      return { blob };
    } catch {
      return { error: "Unable to download document" };
    }
  }

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(document.storagePath);

    if (error) {
      return { error: error.message };
    }

    return { blob: data };
  } catch (error) {
    return { error: "Failed to download document" };
  }
}

// =============================================================================
// DELETE FUNCTIONS
// =============================================================================

/**
 * Delete a document and all its versions
 */
export async function deleteDocument(
  document: DocumentMetadata
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: true }; // Mock success for development
  }

  try {
    // Delete all version files
    const filePaths = document.versions.map((v) => {
      // Extract path from URL or use stored path
      return document.storagePath;
    });

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths);

    if (error) {
      return { success: false, error: error.message };
    }

    // In production, also delete metadata from database
    // await deleteDocumentMetadata(document.id);

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete document" };
  }
}

// =============================================================================
// QUERY FUNCTIONS (MOCK FOR NOW - WOULD USE PRISMA IN PRODUCTION)
// =============================================================================

/**
 * Get documents with filtering
 */
export async function getDocuments(
  filter: DocumentFilter = {}
): Promise<DocumentMetadata[]> {
  // In production, this would query the database
  // For now, return mock data that can be filtered
  let documents = SAMPLE_DOCUMENTS;

  if (filter.documentType && filter.documentType !== "ALL") {
    documents = documents.filter((d) => d.documentType === filter.documentType);
  }

  if (filter.accessLevel && filter.accessLevel !== "ALL") {
    documents = documents.filter((d) => d.accessLevel === filter.accessLevel);
  }

  if (filter.companyId) {
    documents = documents.filter((d) => d.companyId === filter.companyId);
  }

  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase();
    documents = documents.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.description?.toLowerCase().includes(query) ||
        d.companyName?.toLowerCase().includes(query)
    );
  }

  return documents;
}

/**
 * Get documents for a specific company
 */
export async function getCompanyDocuments(
  companyId: string
): Promise<DocumentMetadata[]> {
  return getDocuments({ companyId });
}

/**
 * Get recently viewed documents
 */
export async function getRecentDocuments(
  userId: string,
  limit: number = 10
): Promise<DocumentMetadata[]> {
  // In production, query documents ordered by lastViewedAt for this user
  return SAMPLE_DOCUMENTS.slice(0, limit);
}

/**
 * Get document statistics
 */
export async function getDocumentStats(): Promise<DocumentStats> {
  const documents = await getDocuments();

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

  const byCompanyMap: Map<string, { companyName: string; count: number }> = new Map();
  let totalSize = 0;

  documents.forEach((doc) => {
    byType[doc.documentType]++;
    totalSize += doc.fileSize;

    if (doc.companyId && doc.companyName) {
      const existing = byCompanyMap.get(doc.companyId);
      if (existing) {
        existing.count++;
      } else {
        byCompanyMap.set(doc.companyId, { companyName: doc.companyName, count: 1 });
      }
    }
  });

  const byCompany = Array.from(byCompanyMap.entries()).map(([companyId, data]) => ({
    companyId,
    companyName: data.companyName,
    count: data.count,
  }));

  // Recent uploads (last 7 days)
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentUploads = documents.filter(
    (d) => new Date(d.createdAt).getTime() > weekAgo
  ).length;

  return {
    totalDocuments: documents.length,
    totalSize,
    byType,
    byCompany,
    recentUploads,
  };
}

// =============================================================================
// ACCESS LOGGING
// =============================================================================

export interface AccessLogEntry {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  action: "VIEW" | "DOWNLOAD" | "SHARE" | "EDIT" | "DELETE";
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log document access for audit trail
 */
export async function logAccess(
  documentId: string,
  userId: string,
  userName: string,
  action: AccessLogEntry["action"]
): Promise<void> {
  const logEntry: AccessLogEntry = {
    id: `log-${Date.now()}`,
    documentId,
    userId,
    userName,
    action,
    timestamp: new Date().toISOString(),
  };

  // In production, save to database
  console.log("Access logged:", logEntry);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function createMockDocument(
  file: File,
  options: DocumentUploadOptions,
  userId: string,
  userName: string
): DocumentMetadata {
  const fileType = getFileTypeFromMime(file.type) || getFileTypeFromExtension(file.name) || "pdf";

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: options.name || file.name.replace(/\.[^/.]+$/, ""),
    originalName: file.name,
    description: options.description,
    documentType: options.documentType,
    accessLevel: options.accessLevel,
    fileUrl: URL.createObjectURL(file),
    fileType: fileType as FileType,
    fileSize: file.size,
    mimeType: file.type,
    storagePath: generateStoragePath(options.companyId, options.documentType, file.name),
    bucketName: BUCKET_NAME,
    companyId: options.companyId,
    dealId: options.dealId,
    icMemoId: options.icMemoId,
    currentVersion: 1,
    versions: [
      {
        id: `ver-${Date.now()}`,
        versionNumber: 1,
        fileUrl: URL.createObjectURL(file),
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedById: userId,
        uploadedByName: userName,
        changeNotes: "Initial upload",
      },
    ],
    tags: options.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    uploadedById: userId,
    uploadedByName: userName,
    viewCount: 0,
    downloadCount: 0,
  };
}

// =============================================================================
// SAMPLE DATA
// =============================================================================

export const SAMPLE_DOCUMENTS: DocumentMetadata[] = [
  {
    id: "doc-1",
    name: "Acme Corp Series B Pitch Deck",
    originalName: "acme-pitch-deck-v3.pdf",
    description: "Latest pitch deck for Series B fundraise",
    documentType: "PITCH_DECK",
    accessLevel: "TEAM",
    fileUrl: "/samples/pitch-deck.pdf",
    fileType: "pdf",
    fileSize: 4500000,
    mimeType: "application/pdf",
    storagePath: "companies/c1/pitch_deck/acme-pitch-deck-v3.pdf",
    bucketName: BUCKET_NAME,
    companyId: "c1",
    companyName: "Acme Corp",
    dealId: "d1",
    dealName: "Series B",
    currentVersion: 3,
    versions: [
      {
        id: "ver-1",
        versionNumber: 1,
        fileUrl: "/samples/pitch-deck-v1.pdf",
        fileSize: 3800000,
        uploadedAt: "2024-01-15T10:00:00Z",
        uploadedById: "u1",
        uploadedByName: "Sarah Chen",
        changeNotes: "Initial deck",
      },
      {
        id: "ver-2",
        versionNumber: 2,
        fileUrl: "/samples/pitch-deck-v2.pdf",
        fileSize: 4200000,
        uploadedAt: "2024-01-22T14:30:00Z",
        uploadedById: "u1",
        uploadedByName: "Sarah Chen",
        changeNotes: "Updated financials",
      },
      {
        id: "ver-3",
        versionNumber: 3,
        fileUrl: "/samples/pitch-deck-v3.pdf",
        fileSize: 4500000,
        uploadedAt: "2024-02-01T09:15:00Z",
        uploadedById: "u2",
        uploadedByName: "Michael Rodriguez",
        changeNotes: "Added Q4 metrics",
      },
    ],
    tags: ["series-b", "fundraise", "2024"],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-02-01T09:15:00Z",
    uploadedById: "u1",
    uploadedByName: "Sarah Chen",
    viewCount: 45,
    downloadCount: 12,
  },
  {
    id: "doc-2",
    name: "TechFlow Financial Model",
    originalName: "techflow-model-2024.xlsx",
    description: "5-year financial projections and scenarios",
    documentType: "FINANCIAL_MODEL",
    accessLevel: "IC_MEMBERS",
    fileUrl: "/samples/financial-model.xlsx",
    fileType: "xlsx",
    fileSize: 2800000,
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    storagePath: "companies/c2/financial_model/techflow-model-2024.xlsx",
    bucketName: BUCKET_NAME,
    companyId: "c2",
    companyName: "TechFlow",
    dealId: "d2",
    dealName: "Series A",
    currentVersion: 1,
    versions: [
      {
        id: "ver-4",
        versionNumber: 1,
        fileUrl: "/samples/financial-model.xlsx",
        fileSize: 2800000,
        uploadedAt: "2024-02-10T11:00:00Z",
        uploadedById: "u3",
        uploadedByName: "Emily Thompson",
        changeNotes: "Initial model",
      },
    ],
    tags: ["financials", "projections"],
    createdAt: "2024-02-10T11:00:00Z",
    updatedAt: "2024-02-10T11:00:00Z",
    uploadedById: "u3",
    uploadedByName: "Emily Thompson",
    viewCount: 28,
    downloadCount: 8,
  },
  {
    id: "doc-3",
    name: "CloudSync IC Memo",
    originalName: "cloudsync-ic-memo-draft.pdf",
    description: "Investment committee memo with recommendation",
    documentType: "IC_MEMO",
    accessLevel: "IC_MEMBERS",
    fileUrl: "/samples/ic-memo.pdf",
    fileType: "pdf",
    fileSize: 1200000,
    mimeType: "application/pdf",
    storagePath: "companies/c4/ic_memo/cloudsync-ic-memo.pdf",
    bucketName: BUCKET_NAME,
    companyId: "c4",
    companyName: "CloudSync",
    dealId: "d3",
    dealName: "Seed",
    icMemoId: "memo-1",
    currentVersion: 2,
    versions: [
      {
        id: "ver-5",
        versionNumber: 1,
        fileUrl: "/samples/ic-memo-v1.pdf",
        fileSize: 980000,
        uploadedAt: "2024-02-05T16:00:00Z",
        uploadedById: "u1",
        uploadedByName: "Sarah Chen",
        changeNotes: "Draft memo",
      },
      {
        id: "ver-6",
        versionNumber: 2,
        fileUrl: "/samples/ic-memo-v2.pdf",
        fileSize: 1200000,
        uploadedAt: "2024-02-08T10:30:00Z",
        uploadedById: "u1",
        uploadedByName: "Sarah Chen",
        changeNotes: "Added risk assessment",
      },
    ],
    tags: ["ic-memo", "seed", "recommendation"],
    createdAt: "2024-02-05T16:00:00Z",
    updatedAt: "2024-02-08T10:30:00Z",
    uploadedById: "u1",
    uploadedByName: "Sarah Chen",
    viewCount: 15,
    downloadCount: 4,
  },
  {
    id: "doc-4",
    name: "QuantumAI Term Sheet",
    originalName: "quantumai-termsheet-v2.docx",
    description: "Series A term sheet - final negotiated version",
    documentType: "TERM_SHEET",
    accessLevel: "PRIVATE",
    fileUrl: "/samples/term-sheet.docx",
    fileType: "docx",
    fileSize: 450000,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    storagePath: "companies/c5/term_sheet/quantumai-termsheet.docx",
    bucketName: BUCKET_NAME,
    companyId: "c5",
    companyName: "QuantumAI",
    dealId: "d4",
    dealName: "Series A",
    currentVersion: 2,
    versions: [
      {
        id: "ver-7",
        versionNumber: 1,
        fileUrl: "/samples/term-sheet-v1.docx",
        fileSize: 380000,
        uploadedAt: "2024-02-12T09:00:00Z",
        uploadedById: "u4",
        uploadedByName: "James Wilson",
        changeNotes: "Initial term sheet",
      },
      {
        id: "ver-8",
        versionNumber: 2,
        fileUrl: "/samples/term-sheet-v2.docx",
        fileSize: 450000,
        uploadedAt: "2024-02-14T15:45:00Z",
        uploadedById: "u4",
        uploadedByName: "James Wilson",
        changeNotes: "Post-negotiation revisions",
      },
    ],
    tags: ["term-sheet", "series-a", "legal"],
    createdAt: "2024-02-12T09:00:00Z",
    updatedAt: "2024-02-14T15:45:00Z",
    uploadedById: "u4",
    uploadedByName: "James Wilson",
    viewCount: 8,
    downloadCount: 3,
  },
  {
    id: "doc-5",
    name: "DataVault DD Report",
    originalName: "datavault-dd-complete.pdf",
    description: "Comprehensive due diligence report",
    documentType: "DD_REPORT",
    accessLevel: "TEAM",
    fileUrl: "/samples/dd-report.pdf",
    fileType: "pdf",
    fileSize: 8500000,
    mimeType: "application/pdf",
    storagePath: "companies/c3/dd_report/datavault-dd-complete.pdf",
    bucketName: BUCKET_NAME,
    companyId: "c3",
    companyName: "DataVault",
    currentVersion: 1,
    versions: [
      {
        id: "ver-9",
        versionNumber: 1,
        fileUrl: "/samples/dd-report.pdf",
        fileSize: 8500000,
        uploadedAt: "2024-02-01T13:00:00Z",
        uploadedById: "u2",
        uploadedByName: "Michael Rodriguez",
        changeNotes: "Complete DD report",
      },
    ],
    tags: ["due-diligence", "complete"],
    createdAt: "2024-02-01T13:00:00Z",
    updatedAt: "2024-02-01T13:00:00Z",
    uploadedById: "u2",
    uploadedByName: "Michael Rodriguez",
    viewCount: 32,
    downloadCount: 10,
  },
  {
    id: "doc-6",
    name: "Q4 Board Meeting Notes",
    originalName: "board-notes-q4-2023.pdf",
    description: "Board meeting minutes and action items",
    documentType: "BOARD_NOTES",
    accessLevel: "LP_ACCESSIBLE",
    fileUrl: "/samples/board-notes.pdf",
    fileType: "pdf",
    fileSize: 650000,
    mimeType: "application/pdf",
    storagePath: "general/board_notes/q4-2023-notes.pdf",
    bucketName: BUCKET_NAME,
    currentVersion: 1,
    versions: [
      {
        id: "ver-10",
        versionNumber: 1,
        fileUrl: "/samples/board-notes.pdf",
        fileSize: 650000,
        uploadedAt: "2024-01-05T10:00:00Z",
        uploadedById: "u1",
        uploadedByName: "Sarah Chen",
        changeNotes: "Q4 board notes",
      },
    ],
    tags: ["board", "q4-2023", "minutes"],
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-05T10:00:00Z",
    uploadedById: "u1",
    uploadedByName: "Sarah Chen",
    viewCount: 56,
    downloadCount: 18,
  },
];
