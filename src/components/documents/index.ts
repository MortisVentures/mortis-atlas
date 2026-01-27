export * from "./document-card";
export * from "./document-uploader";
export * from "./document-upload-form";
export * from "./document-viewer";

// Re-export types from lib
export type {
  DocumentMetadata,
  DocumentType,
  AccessLevel,
  DocumentVersion,
  DocumentUploadOptions,
  DocumentFilter,
  DocumentStats,
} from "@/lib/types/documents";

export {
  documentTypeConfig,
  accessLevelConfig,
  formatFileSize,
  validateFile,
  MAX_FILE_SIZE,
} from "@/lib/types/documents";
