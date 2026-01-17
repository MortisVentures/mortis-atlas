// =============================================================================
// DOCUMENT TYPES AND INTERFACES
// =============================================================================

export type DocumentType =
  | "PITCH_DECK"
  | "FINANCIAL_MODEL"
  | "IC_MEMO"
  | "TERM_SHEET"
  | "DD_REPORT"
  | "BOARD_NOTES"
  | "LEGAL"
  | "REFERENCE";

export type AccessLevel =
  | "PRIVATE"       // Uploader only
  | "TEAM"          // All fund members
  | "IC_MEMBERS"    // IC members only
  | "LP_ACCESSIBLE"; // LPs can view

export type FileType = "pdf" | "xlsx" | "docx" | "pptx" | "png" | "jpg" | "jpeg";

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  uploadedById: string;
  uploadedByName: string;
  changeNotes?: string;
}

export interface DocumentMetadata {
  id: string;
  name: string;
  originalName: string;
  description?: string;
  documentType: DocumentType;
  accessLevel: AccessLevel;

  // File info
  fileUrl: string;
  fileType: FileType;
  fileSize: number;
  mimeType: string;

  // Storage info
  storagePath: string;
  bucketName: string;

  // Relations
  companyId?: string;
  companyName?: string;
  dealId?: string;
  dealName?: string;
  icMemoId?: string;

  // Versions
  currentVersion: number;
  versions: DocumentVersion[];

  // Metadata
  tags: string[];
  createdAt: string;
  updatedAt: string;
  uploadedById: string;
  uploadedByName: string;

  // Access tracking
  lastViewedAt?: string;
  viewCount: number;
  downloadCount: number;

  // Share link
  shareLink?: string;
  shareLinkExpiresAt?: string;
}

export interface DocumentUploadOptions {
  name?: string;
  description?: string;
  documentType: DocumentType;
  accessLevel: AccessLevel;
  companyId?: string;
  dealId?: string;
  icMemoId?: string;
  tags?: string[];
  isNewVersion?: boolean;
  existingDocumentId?: string;
  changeNotes?: string;
}

export interface DocumentFilter {
  documentType?: DocumentType | "ALL";
  accessLevel?: AccessLevel | "ALL";
  companyId?: string;
  dealId?: string;
  uploadedById?: string;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

export interface DocumentStats {
  totalDocuments: number;
  totalSize: number;
  byType: Record<DocumentType, number>;
  byCompany: { companyId: string; companyName: string; count: number }[];
  recentUploads: number;
}

// =============================================================================
// DOCUMENT TYPE CONFIG
// =============================================================================

export const documentTypeConfig: Record<
  DocumentType,
  { label: string; icon: string; color: string; description: string }
> = {
  PITCH_DECK: {
    label: "Pitch Deck",
    icon: "presentation",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    description: "Company presentation and pitch materials",
  },
  FINANCIAL_MODEL: {
    label: "Financial Model",
    icon: "spreadsheet",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    description: "Financial projections and models",
  },
  IC_MEMO: {
    label: "IC Memo",
    icon: "document",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    description: "Investment committee memos",
  },
  TERM_SHEET: {
    label: "Term Sheet",
    icon: "contract",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    description: "Investment term sheets",
  },
  DD_REPORT: {
    label: "DD Report",
    icon: "search",
    color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    description: "Due diligence reports and findings",
  },
  BOARD_NOTES: {
    label: "Board Notes",
    icon: "notes",
    color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    description: "Board meeting notes and minutes",
  },
  LEGAL: {
    label: "Legal Document",
    icon: "legal",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    description: "Legal agreements and contracts",
  },
  REFERENCE: {
    label: "Reference",
    icon: "bookmark",
    color: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    description: "Reference materials and other documents",
  },
};

export const accessLevelConfig: Record<
  AccessLevel,
  { label: string; icon: string; color: string; description: string }
> = {
  PRIVATE: {
    label: "Private",
    icon: "lock",
    color: "bg-slate-500/20 text-slate-400",
    description: "Only you can view this document",
  },
  TEAM: {
    label: "Team",
    icon: "users",
    color: "bg-blue-500/20 text-blue-400",
    description: "All fund team members can view",
  },
  IC_MEMBERS: {
    label: "IC Members",
    icon: "shield",
    color: "bg-purple-500/20 text-purple-400",
    description: "Investment committee members only",
  },
  LP_ACCESSIBLE: {
    label: "LP Accessible",
    icon: "globe",
    color: "bg-green-500/20 text-green-400",
    description: "Limited partners can also view",
  },
};

export const allowedFileTypes: Record<FileType, { mimeType: string; extension: string }> = {
  pdf: { mimeType: "application/pdf", extension: ".pdf" },
  xlsx: { mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", extension: ".xlsx" },
  docx: { mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", extension: ".docx" },
  pptx: { mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", extension: ".pptx" },
  png: { mimeType: "image/png", extension: ".png" },
  jpg: { mimeType: "image/jpeg", extension: ".jpg" },
  jpeg: { mimeType: "image/jpeg", extension: ".jpeg" },
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileTypeFromMime(mimeType: string): FileType | null {
  for (const [type, config] of Object.entries(allowedFileTypes)) {
    if (config.mimeType === mimeType) {
      return type as FileType;
    }
  }
  return null;
}

export function getFileTypeFromExtension(filename: string): FileType | null {
  const ext = filename.toLowerCase().split(".").pop();
  if (!ext) return null;

  for (const [type, config] of Object.entries(allowedFileTypes)) {
    if (config.extension === `.${ext}`) {
      return type as FileType;
    }
  }
  return null;
}

export function isAllowedFileType(file: File): boolean {
  const fileType = getFileTypeFromMime(file.type) || getFileTypeFromExtension(file.name);
  return fileType !== null;
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!isAllowedFileType(file)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${Object.values(allowedFileTypes)
        .map((t) => t.extension)
        .join(", ")}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`,
    };
  }

  return { valid: true };
}

export function generateStoragePath(
  companyId: string | undefined,
  documentType: DocumentType,
  filename: string
): string {
  const timestamp = Date.now();
  const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");

  if (companyId) {
    return `companies/${companyId}/${documentType.toLowerCase()}/${timestamp}-${sanitizedName}`;
  }

  return `general/${documentType.toLowerCase()}/${timestamp}-${sanitizedName}`;
}

export function enforceNamingConvention(
  name: string,
  documentType: DocumentType,
  companyName?: string
): string {
  const date = new Date().toISOString().split("T")[0];
  const typePrefix = documentTypeConfig[documentType].label.replace(/\s+/g, "-");
  const cleanName = name.replace(/[^a-zA-Z0-9\s-]/g, "").trim();

  if (companyName) {
    return `${companyName}_${typePrefix}_${cleanName}_${date}`;
  }

  return `${typePrefix}_${cleanName}_${date}`;
}
