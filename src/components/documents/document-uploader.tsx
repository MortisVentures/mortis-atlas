"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadIcon,
  Cross2Icon,
  FileIcon,
  FileTextIcon,
  TableIcon,
  ImageIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ReloadIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";

// Card components not used in this file
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DocumentType,
  AccessLevel,
  DocumentUploadOptions,
  documentTypeConfig,
  accessLevelConfig,
  allowedFileTypes,
  validateFile,
  formatFileSize,
  MAX_FILE_SIZE,
} from "@/lib/types/documents";
import { uploadDocument, UploadResult } from "@/lib/storage/documents";

// =============================================================================
// TYPES
// =============================================================================

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

interface UploadQueueItem {
  file: FileWithPreview;
  options: DocumentUploadOptions;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
  result?: UploadResult;
}

interface DocumentUploaderProps {
  companyId?: string;
  companyName?: string;
  dealId?: string;
  icMemoId?: string;
  defaultType?: DocumentType;
  defaultAccess?: AccessLevel;
  onUploadComplete?: (results: UploadResult[]) => void;
  onClose?: () => void;
  maxFiles?: number;
  variant?: "modal" | "inline" | "dropzone";
}

// =============================================================================
// FILE ICON HELPER
// =============================================================================

function getFileIcon(fileType: string) {
  if (fileType.includes("pdf")) return <FileTextIcon className="size-8" />;
  if (fileType.includes("sheet") || fileType.includes("xlsx")) return <TableIcon className="size-8" />;
  if (fileType.includes("image")) return <ImageIcon className="size-8" />;
  return <FileIcon className="size-8" />;
}

function getFileTypeLabel(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf": return "PDF";
    case "xlsx": return "Excel";
    case "docx": return "Word";
    case "pptx": return "PowerPoint";
    case "png":
    case "jpg":
    case "jpeg": return "Image";
    default: return "File";
  }
}

// =============================================================================
// DOCUMENT UPLOADER COMPONENT
// =============================================================================

export function DocumentUploader({
  companyId,
  companyName,
  dealId,
  icMemoId,
  defaultType = "REFERENCE",
  defaultAccess = "TEAM",
  onUploadComplete,
  onClose,
  maxFiles = 10,
  variant = "modal",
}: DocumentUploaderProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [uploadQueue, setUploadQueue] = React.useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Global options for all files in queue
  const [globalOptions, setGlobalOptions] = React.useState<{
    documentType: DocumentType;
    accessLevel: AccessLevel;
  }>({
    documentType: defaultType,
    accessLevel: defaultAccess,
  });

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    addFilesToQueue(files);
  };

  // Handle file input
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    addFilesToQueue(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Add files to queue
  const addFilesToQueue = (files: File[]) => {
    const newItems: UploadQueueItem[] = files.slice(0, maxFiles - uploadQueue.length).map((file) => {
      const validation = validateFile(file);
      const fileWithId: FileWithPreview = Object.assign(file, {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      });

      return {
        file: fileWithId,
        options: {
          documentType: globalOptions.documentType,
          accessLevel: globalOptions.accessLevel,
          companyId,
          dealId,
          icMemoId,
        },
        status: validation.valid ? "pending" : "error",
        progress: 0,
        error: validation.error,
      };
    });

    setUploadQueue((prev) => [...prev, ...newItems]);
  };

  // Remove file from queue
  const removeFromQueue = (fileId: string) => {
    setUploadQueue((prev) => prev.filter((item) => item.file.id !== fileId));
  };

  // Update individual file options
  const updateFileOptions = (fileId: string, options: Partial<DocumentUploadOptions>) => {
    setUploadQueue((prev) =>
      prev.map((item) =>
        item.file.id === fileId
          ? { ...item, options: { ...item.options, ...options } }
          : item
      )
    );
  };

  // Update file name
  const updateFileName = (fileId: string, name: string) => {
    setUploadQueue((prev) =>
      prev.map((item) =>
        item.file.id === fileId
          ? { ...item, options: { ...item.options, name } }
          : item
      )
    );
  };

  // Start upload
  const startUpload = async () => {
    setIsUploading(true);

    const pendingItems = uploadQueue.filter((item) => item.status === "pending");
    const results: UploadResult[] = [];

    for (const item of pendingItems) {
      // Update status to uploading
      setUploadQueue((prev) =>
        prev.map((i) =>
          i.file.id === item.file.id ? { ...i, status: "uploading" } : i
        )
      );

      // Simulate progress (real implementation would use onProgress callback)
      const progressInterval = setInterval(() => {
        setUploadQueue((prev) =>
          prev.map((i) =>
            i.file.id === item.file.id && i.status === "uploading"
              ? { ...i, progress: Math.min(i.progress + 10, 90) }
              : i
          )
        );
      }, 200);

      // Upload the file
      const result = await uploadDocument(
        item.file,
        item.options,
        "u1", // Current user ID (would come from auth context)
        "Sarah Chen" // Current user name (would come from auth context)
      );

      clearInterval(progressInterval);

      // Update status based on result
      setUploadQueue((prev) =>
        prev.map((i) =>
          i.file.id === item.file.id
            ? {
                ...i,
                status: result.success ? "success" : "error",
                progress: 100,
                error: result.error,
                result,
              }
            : i
        )
      );

      results.push(result);
    }

    setIsUploading(false);
    onUploadComplete?.(results);
  };

  // Cleanup previews on unmount
  React.useEffect(() => {
    return () => {
      uploadQueue.forEach((item) => {
        if (item.file.preview) {
          URL.revokeObjectURL(item.file.preview);
        }
      });
    };
  }, []);

  const pendingCount = uploadQueue.filter((i) => i.status === "pending").length;
  const successCount = uploadQueue.filter((i) => i.status === "success").length;
  const errorCount = uploadQueue.filter((i) => i.status === "error").length;

  // Dropzone only variant
  if (variant === "dropzone") {
    return (
      <DropzoneArea
        isDragOver={isDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        fileInputRef={fileInputRef}
        onFileInput={handleFileInput}
      />
    );
  }

  return (
    <div className={cn("space-y-4", variant === "modal" && "min-w-[500px]")}>
      {/* Header */}
      {variant === "modal" && (
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Upload Documents</h2>
            {companyName && (
              <p className="text-sm text-muted-foreground">to {companyName}</p>
            )}
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-atlas-sm">
              <Cross2Icon className="size-4" />
            </button>
          )}
        </div>
      )}

      {/* Global Options */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Document Type</label>
          <div className="relative">
            <select
              value={globalOptions.documentType}
              onChange={(e) => setGlobalOptions((prev) => ({ ...prev, documentType: e.target.value as DocumentType }))}
              className="w-full appearance-none bg-background border border-input rounded-atlas-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-tactical-500"
            >
              {Object.entries(documentTypeConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Access Level</label>
          <div className="relative">
            <select
              value={globalOptions.accessLevel}
              onChange={(e) => setGlobalOptions((prev) => ({ ...prev, accessLevel: e.target.value as AccessLevel }))}
              className="w-full appearance-none bg-background border border-input rounded-atlas-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-tactical-500"
            >
              {Object.entries(accessLevelConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <DropzoneArea
        isDragOver={isDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        fileInputRef={fileInputRef}
        onFileInput={handleFileInput}
      />

      {/* File Queue */}
      {uploadQueue.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {uploadQueue.length} file{uploadQueue.length !== 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {successCount > 0 && (
                <span className="text-tactical-400">{successCount} uploaded</span>
              )}
              {errorCount > 0 && (
                <span className="text-red-400">{errorCount} failed</span>
              )}
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            <AnimatePresence>
              {uploadQueue.map((item) => (
                <FileQueueItem
                  key={item.file.id}
                  item={item}
                  onRemove={() => removeFromQueue(item.file.id)}
                  onUpdateName={(name) => updateFileName(item.file.id, name)}
                  onUpdateOptions={(options) => updateFileOptions(item.file.id, options)}
                  disabled={isUploading}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          Max {formatFileSize(MAX_FILE_SIZE)} per file
        </div>
        <div className="flex items-center gap-3">
          {onClose && (
            <Button variant="ghost" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
          )}
          <Button
            onClick={startUpload}
            disabled={pendingCount === 0 || isUploading}
            className="min-w-[120px]"
          >
            {isUploading ? (
              <>
                <ReloadIcon className="size-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadIcon className="size-4 mr-2" />
                Upload {pendingCount > 0 && `(${pendingCount})`}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// DROPZONE AREA
// =============================================================================

interface DropzoneAreaProps {
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function DropzoneArea({
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  fileInputRef,
  onFileInput,
}: DropzoneAreaProps) {
  return (
    <motion.div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      animate={{
        borderColor: isDragOver ? "var(--tactical-500)" : "var(--border)",
        backgroundColor: isDragOver ? "rgba(16, 185, 129, 0.05)" : "transparent",
      }}
      className={cn(
        "relative border-2 border-dashed rounded-atlas-lg p-8 text-center cursor-pointer transition-colors",
        "hover:border-muted-foreground hover:bg-muted/20"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.xlsx,.docx,.pptx,.png,.jpg,.jpeg"
        onChange={onFileInput}
        className="hidden"
      />

      <motion.div
        animate={{ scale: isDragOver ? 1.05 : 1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="space-y-3"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
          <UploadIcon className="size-8 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">
            {isDragOver ? "Drop files here" : "Drag and drop files here"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            or <span className="text-tactical-400">click to browse</span>
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
          {Object.values(allowedFileTypes).map((type) => (
            <Badge key={type.extension} variant="secondary" size="xs">
              {type.extension}
            </Badge>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// FILE QUEUE ITEM
// =============================================================================

interface FileQueueItemProps {
  item: UploadQueueItem;
  onRemove: () => void;
  onUpdateName: (name: string) => void;
  onUpdateOptions: (_options: Partial<DocumentUploadOptions>) => void;
  disabled: boolean;
}

function FileQueueItem({ item, onRemove, onUpdateName, onUpdateOptions: _onUpdateOptions, disabled }: FileQueueItemProps) {
  const [isEditing, setIsEditing] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-atlas-md border",
        item.status === "error" && "border-red-500/30 bg-red-500/5",
        item.status === "success" && "border-tactical-500/30 bg-tactical-500/5",
        item.status === "pending" && "border-border bg-card",
        item.status === "uploading" && "border-blue-500/30 bg-blue-500/5"
      )}
    >
      {/* File Icon */}
      <div className="w-10 h-10 rounded-atlas-sm bg-muted/50 flex items-center justify-center text-muted-foreground flex-shrink-0">
        {getFileIcon(item.file.type)}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={item.options.name || item.file.name.replace(/\.[^/.]+$/, "")}
            onChange={(e) => onUpdateName(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
            autoFocus
            className="h-7 text-sm"
          />
        ) : (
          <button
            onClick={() => !disabled && setIsEditing(true)}
            className="text-sm font-medium truncate block text-left hover:text-tactical-400 transition-colors"
            disabled={disabled}
          >
            {item.options.name || item.file.name.replace(/\.[^/.]+$/, "")}
          </button>
        )}

        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="secondary" size="xs">
            {getFileTypeLabel(item.file.name)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatFileSize(item.file.size)}
          </span>
          {item.status === "uploading" && (
            <span className="text-xs text-blue-400">{item.progress}%</span>
          )}
          {item.error && (
            <span className="text-xs text-red-400 truncate">{item.error}</span>
          )}
        </div>

        {/* Progress Bar */}
        {item.status === "uploading" && (
          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.progress}%` }}
              className="h-full bg-blue-500"
            />
          </div>
        )}
      </div>

      {/* Status Icon */}
      <div className="flex-shrink-0">
        {item.status === "success" && (
          <CheckCircledIcon className="size-5 text-tactical-400" />
        )}
        {item.status === "error" && (
          <CrossCircledIcon className="size-5 text-red-400" />
        )}
        {item.status === "uploading" && (
          <ReloadIcon className="size-5 text-blue-400 animate-spin" />
        )}
        {item.status === "pending" && !disabled && (
          <button
            onClick={onRemove}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <Cross2Icon className="size-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================================
// UPLOAD MODAL WRAPPER
// =============================================================================

interface DocumentUploadModalProps extends DocumentUploaderProps {
  isOpen: boolean;
}

export function DocumentUploadModal({ isOpen, onClose, ...props }: DocumentUploadModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-atlas-lg shadow-2xl z-50 p-6 max-h-[85vh] overflow-y-auto"
          >
            <DocumentUploader {...props} onClose={onClose} variant="modal" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
