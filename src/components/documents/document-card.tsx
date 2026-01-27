"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileTextIcon,
  FileIcon,
  TableIcon,
  ImageIcon,
  DownloadIcon,
  DotsHorizontalIcon,
  TrashIcon,
  Share1Icon,
  Pencil1Icon,
  EyeOpenIcon,
  ClockIcon,
  PersonIcon,
  LockClosedIcon,
  LockOpen1Icon,
  LayersIcon,
} from "@radix-ui/react-icons";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DocumentMetadata,
  AccessLevel,
  SourceType,
  documentTypeConfig,
  accessLevelConfig,
  sourceTypeConfig,
  formatFileSize,
} from "@/lib/types/documents";

// =============================================================================
// FILE ICON COMPONENT
// =============================================================================

interface FileIconDisplayProps {
  fileType: string;
  className?: string;
}

export function FileIconDisplay({ fileType, className }: FileIconDisplayProps) {
  const iconClass = cn("text-muted-foreground", className);

  switch (fileType) {
    case "pdf":
      return <FileTextIcon className={cn(iconClass, "text-red-400")} />;
    case "xlsx":
      return <TableIcon className={cn(iconClass, "text-green-400")} />;
    case "docx":
      return <FileTextIcon className={cn(iconClass, "text-blue-400")} />;
    case "pptx":
      return <FileIcon className={cn(iconClass, "text-amber-400")} />;
    case "png":
    case "jpg":
    case "jpeg":
      return <ImageIcon className={cn(iconClass, "text-purple-400")} />;
    default:
      return <FileIcon className={iconClass} />;
  }
}

// =============================================================================
// ACCESS ICON COMPONENT
// =============================================================================

interface AccessIconProps {
  accessLevel: AccessLevel;
  className?: string;
}

export function AccessIcon({ accessLevel, className }: AccessIconProps) {
  if (accessLevel === "PRIVATE") {
    return <LockClosedIcon className={cn("text-muted-foreground", className)} />;
  }
  return <LockOpen1Icon className={cn("text-muted-foreground", className)} />;
}

// =============================================================================
// SOURCE BADGE COMPONENT
// =============================================================================

interface SourceBadgeProps {
  source: SourceType;
  sourceName?: string;
  size?: "xs" | "sm";
  showLabel?: boolean;
}

export function SourceBadge({ source, sourceName, size = "xs", showLabel = true }: SourceBadgeProps) {
  const config = sourceTypeConfig[source];
  if (!config) return null;

  return (
    <Badge className={cn(config.color, size === "xs" ? "text-[10px] px-1.5 py-0.5" : "")} size={size}>
      {showLabel ? (sourceName || config.label) : config.label}
    </Badge>
  );
}

// =============================================================================
// DOCUMENT CARD COMPONENT
// =============================================================================

interface DocumentCardProps {
  document: DocumentMetadata;
  variant?: "default" | "compact" | "grid";
  onView?: (doc: DocumentMetadata) => void;
  onDownload?: (doc: DocumentMetadata) => void;
  onShare?: (doc: DocumentMetadata) => void;
  onEdit?: (doc: DocumentMetadata) => void;
  onDelete?: (doc: DocumentMetadata) => void;
  showCompany?: boolean;
  showVersions?: boolean;
  showSource?: boolean;
}

export function DocumentCard({
  document,
  variant = "default",
  onView,
  onDownload,
  onShare,
  onEdit,
  onDelete,
  showCompany = true,
  showVersions = true,
  showSource = true,
}: DocumentCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const typeConfig = documentTypeConfig[document.documentType];
  const accessConfig = accessLevelConfig[document.accessLevel];

  const formattedDate = new Date(document.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Compact variant for lists
  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 p-3 hover:bg-muted/30 rounded-atlas-sm transition-colors group"
      >
        <div className="w-10 h-10 rounded-atlas-sm bg-muted/50 flex items-center justify-center flex-shrink-0">
          <FileIconDisplay fileType={document.fileType} className="size-5" />
        </div>

        <div className="flex-1 min-w-0">
          <button
            onClick={() => onView?.(document)}
            className="text-sm font-medium truncate block text-left hover:text-tactical-400 transition-colors"
          >
            {document.name}
          </button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span>{formatFileSize(document.fileSize)}</span>
            <span>&middot;</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onDownload?.(document)}
            className="p-1.5 hover:bg-muted rounded-atlas-sm transition-colors"
            title="Download"
          >
            <DownloadIcon className="size-4" />
          </button>
          <button
            onClick={() => onView?.(document)}
            className="p-1.5 hover:bg-muted rounded-atlas-sm transition-colors"
            title="View"
          >
            <EyeOpenIcon className="size-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  // Grid variant for card grid
  if (variant === "grid") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -2 }}
        className="group relative bg-card border border-border rounded-atlas-md overflow-hidden hover:border-muted-foreground/30 hover:shadow-lg transition-all"
      >
        {/* Preview area */}
        <div
          className="h-32 bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center cursor-pointer"
          onClick={() => onView?.(document)}
        >
          <FileIconDisplay fileType={document.fileType} className="size-12" />
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <button
              onClick={() => onView?.(document)}
              className="text-sm font-medium line-clamp-2 text-left hover:text-tactical-400 transition-colors"
            >
              {document.name}
            </button>

            {/* Menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-muted rounded transition-all"
              >
                <DotsHorizontalIcon className="size-4" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <DocumentMenu
                    onView={() => {
                      onView?.(document);
                      setShowMenu(false);
                    }}
                    onDownload={() => {
                      onDownload?.(document);
                      setShowMenu(false);
                    }}
                    onShare={() => {
                      onShare?.(document);
                      setShowMenu(false);
                    }}
                    onEdit={() => {
                      onEdit?.(document);
                      setShowMenu(false);
                    }}
                    onDelete={() => {
                      onDelete?.(document);
                      setShowMenu(false);
                    }}
                    onClose={() => setShowMenu(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <Badge className={typeConfig.color} size="xs">
              {typeConfig.label}
            </Badge>
            <Badge variant="secondary" size="xs">
              {formatFileSize(document.fileSize)}
            </Badge>
            {showSource && document.source && (
              <SourceBadge source={document.source} sourceName={document.sourceName} size="xs" />
            )}
          </div>

          {showCompany && document.companyName && (
            <div className="text-xs text-muted-foreground mb-2">
              {document.companyName}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <AccessIcon accessLevel={document.accessLevel} className="size-3" />
              {accessConfig.label}
            </div>
            {showVersions && document.currentVersion > 1 && (
              <div className="flex items-center gap-1">
                <LayersIcon className="size-3" />
                v{document.currentVersion}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant - full card
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-card border border-border rounded-atlas-md p-4 hover:border-muted-foreground/30 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        {/* File Icon */}
        <div className="w-12 h-12 rounded-atlas-md bg-muted/50 flex items-center justify-center flex-shrink-0">
          <FileIconDisplay fileType={document.fileType} className="size-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <button
                onClick={() => onView?.(document)}
                className="text-sm font-medium truncate block text-left hover:text-tactical-400 transition-colors"
              >
                {document.name}
              </button>
              {document.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {document.description}
                </p>
              )}
            </div>

            {/* Menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-muted rounded transition-all"
              >
                <DotsHorizontalIcon className="size-4" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <DocumentMenu
                    onView={() => {
                      onView?.(document);
                      setShowMenu(false);
                    }}
                    onDownload={() => {
                      onDownload?.(document);
                      setShowMenu(false);
                    }}
                    onShare={() => {
                      onShare?.(document);
                      setShowMenu(false);
                    }}
                    onEdit={() => {
                      onEdit?.(document);
                      setShowMenu(false);
                    }}
                    onDelete={() => {
                      onDelete?.(document);
                      setShowMenu(false);
                    }}
                    onClose={() => setShowMenu(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge className={typeConfig.color} size="xs">
              {typeConfig.label}
            </Badge>
            <Badge variant="secondary" size="xs">
              {formatFileSize(document.fileSize)}
            </Badge>
            <Badge variant="ghost" size="xs" className="gap-1">
              <AccessIcon accessLevel={document.accessLevel} className="size-3" />
              {accessConfig.label}
            </Badge>
            {showSource && document.source && (
              <SourceBadge source={document.source} sourceName={document.sourceName} size="xs" />
            )}
            {showVersions && document.currentVersion > 1 && (
              <Badge variant="secondary" size="xs" className="gap-1">
                <LayersIcon className="size-3" />
                v{document.currentVersion}
              </Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {showCompany && document.companyName && (
                <Link
                  href={`/companies/${document.companyId}`}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <span className="w-4 h-4 rounded bg-navy-500/20 flex items-center justify-center text-[10px] font-bold text-navy-400">
                    {document.companyName[0]}
                  </span>
                  {document.companyName}
                </Link>
              )}
              <span className="flex items-center gap-1">
                <PersonIcon className="size-3" />
                {document.uploadedByName}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <EyeOpenIcon className="size-3" />
                {document.viewCount}
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="size-3" />
                {formattedDate}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// DOCUMENT MENU
// =============================================================================

interface DocumentMenuProps {
  onView: () => void;
  onDownload: () => void;
  onShare: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

function DocumentMenu({ onView, onDownload, onShare, onEdit, onDelete, onClose }: DocumentMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -5 }}
      className="absolute right-0 top-full mt-1 z-10 bg-card border border-border rounded-atlas-sm shadow-lg py-1 min-w-[140px]"
      onMouseLeave={onClose}
    >
      <button
        onClick={onView}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
      >
        <EyeOpenIcon className="size-4" />
        View
      </button>
      <button
        onClick={onDownload}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
      >
        <DownloadIcon className="size-4" />
        Download
      </button>
      <button
        onClick={onShare}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
      >
        <Share1Icon className="size-4" />
        Share
      </button>
      <button
        onClick={onEdit}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
      >
        <Pencil1Icon className="size-4" />
        Edit
      </button>
      <div className="border-t border-border my-1" />
      <button
        onClick={onDelete}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <TrashIcon className="size-4" />
        Delete
      </button>
    </motion.div>
  );
}

// =============================================================================
// DOCUMENT LIST COMPONENT
// =============================================================================

interface DocumentListProps {
  documents: DocumentMetadata[];
  variant?: "default" | "compact" | "grid";
  onView?: (doc: DocumentMetadata) => void;
  onDownload?: (doc: DocumentMetadata) => void;
  onShare?: (doc: DocumentMetadata) => void;
  onEdit?: (doc: DocumentMetadata) => void;
  onDelete?: (doc: DocumentMetadata) => void;
  showCompany?: boolean;
  showSource?: boolean;
  emptyMessage?: string;
}

export function DocumentList({
  documents,
  variant = "default",
  onView,
  onDownload,
  onShare,
  onEdit,
  onDelete,
  showCompany = true,
  showSource = true,
  emptyMessage = "No documents found",
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileIcon className="size-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            variant="grid"
            onView={onView}
            onDownload={onDownload}
            onShare={onShare}
            onEdit={onEdit}
            onDelete={onDelete}
            showCompany={showCompany}
            showSource={showSource}
          />
        ))}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="divide-y divide-border">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            variant="compact"
            onView={onView}
            onDownload={onDownload}
            showCompany={showCompany}
            showSource={showSource}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            variant="default"
            onView={onView}
            onDownload={onDownload}
            onShare={onShare}
            onEdit={onEdit}
            onDelete={onDelete}
            showCompany={showCompany}
            showSource={showSource}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
