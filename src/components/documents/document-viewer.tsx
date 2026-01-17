"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cross2Icon,
  DownloadIcon,
  Share1Icon,
  ZoomInIcon,
  ZoomOutIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  LayersIcon,
  ClockIcon,
  PersonIcon,
  FileTextIcon,
  ChevronDownIcon,
  CopyIcon,
  CheckIcon,
  ExternalLinkIcon,
} from "@radix-ui/react-icons";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DocumentMetadata,
  DocumentVersion,
  documentTypeConfig,
  accessLevelConfig,
  formatFileSize,
} from "@/lib/types/documents";
import { createShareLink, downloadDocument, logAccess } from "@/lib/storage/documents";
import { FileIconDisplay } from "./document-card";

// =============================================================================
// TYPES
// =============================================================================

interface DocumentViewerProps {
  document: DocumentMetadata;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (doc: DocumentMetadata) => void;
  onShare?: (doc: DocumentMetadata) => void;
}

// =============================================================================
// DOCUMENT VIEWER COMPONENT
// =============================================================================

export function DocumentViewer({
  document,
  isOpen,
  onClose,
  onDownload,
  onShare,
}: DocumentViewerProps) {
  const [zoom, setZoom] = React.useState(100);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showVersions, setShowVersions] = React.useState(false);
  const [selectedVersion, setSelectedVersion] = React.useState<DocumentVersion | null>(null);
  const [shareLink, setShareLink] = React.useState<string | null>(null);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const viewerRef = React.useRef<HTMLDivElement>(null);

  const currentVersion = selectedVersion || document.versions[document.versions.length - 1];
  const typeConfig = documentTypeConfig[document.documentType];
  const accessConfig = accessLevelConfig[document.accessLevel];

  // Log view access
  React.useEffect(() => {
    if (isOpen) {
      logAccess(document.id, "u1", "Sarah Chen", "VIEW");
    }
  }, [isOpen, document.id]);

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      viewerRef.current?.requestFullscreen?.();
    } else {
      globalThis.document?.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Handle download
  const handleDownload = async () => {
    logAccess(document.id, "u1", "Sarah Chen", "DOWNLOAD");
    onDownload?.(document);

    // Trigger browser download
    const result = await downloadDocument(document);
    if (result.blob) {
      const url = URL.createObjectURL(result.blob);
      const a = globalThis.document.createElement("a");
      a.href = url;
      a.download = document.originalName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Handle share
  const handleShare = async () => {
    logAccess(document.id, "u1", "Sarah Chen", "SHARE");
    const result = await createShareLink(document, 24);
    if (result.shareLink) {
      setShareLink(result.shareLink);
      setShowShareModal(true);
    }
    onShare?.(document);
  };

  // Copy share link
  const copyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Zoom controls
  const zoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));

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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Viewer */}
          <motion.div
            ref={viewerRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "fixed z-50 bg-background flex flex-col",
              isFullscreen
                ? "inset-0"
                : "inset-4 md:inset-8 rounded-atlas-lg border border-border shadow-2xl overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-atlas-sm bg-muted/50 flex items-center justify-center flex-shrink-0">
                  <FileIconDisplay fileType={document.fileType} className="size-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-medium text-sm truncate">{document.name}</h2>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge className={typeConfig.color} size="xs">
                      {typeConfig.label}
                    </Badge>
                    <span>{formatFileSize(document.fileSize)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-muted/30 rounded-atlas-sm px-2 py-1">
                  <button
                    onClick={zoomOut}
                    disabled={zoom <= 50}
                    className="p-1 hover:bg-muted rounded disabled:opacity-50"
                  >
                    <ZoomOutIcon className="size-4" />
                  </button>
                  <span className="text-xs w-12 text-center">{zoom}%</span>
                  <button
                    onClick={zoomIn}
                    disabled={zoom >= 200}
                    className="p-1 hover:bg-muted rounded disabled:opacity-50"
                  >
                    <ZoomInIcon className="size-4" />
                  </button>
                </div>

                {/* Version Selector */}
                {document.versions.length > 1 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowVersions(!showVersions)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 hover:bg-muted rounded-atlas-sm text-sm"
                    >
                      <LayersIcon className="size-4" />
                      v{currentVersion.versionNumber}
                      <ChevronDownIcon className="size-4" />
                    </button>

                    <AnimatePresence>
                      {showVersions && (
                        <VersionSelector
                          versions={document.versions}
                          currentVersion={currentVersion}
                          onSelect={(v) => {
                            setSelectedVersion(v);
                            setShowVersions(false);
                          }}
                          onClose={() => setShowVersions(false)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Actions */}
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share1Icon className="size-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDownload}>
                  <DownloadIcon className="size-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <ExitFullScreenIcon className="size-4" />
                  ) : (
                    <EnterFullScreenIcon className="size-4" />
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <Cross2Icon className="size-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Main Preview */}
              <div className="flex-1 overflow-auto bg-muted/20 p-4">
                <div
                  className="h-full flex items-center justify-center"
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}
                >
                  <DocumentPreview document={document} version={currentVersion} />
                </div>
              </div>

              {/* Sidebar */}
              <div className="w-80 border-l border-border bg-card overflow-y-auto hidden lg:block">
                <DocumentSidebar document={document} version={currentVersion} />
              </div>
            </div>
          </motion.div>

          {/* Share Modal */}
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            shareLink={shareLink}
            documentName={document.name}
            onCopy={copyShareLink}
            copied={copied}
          />
        </>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// DOCUMENT PREVIEW
// =============================================================================

interface DocumentPreviewProps {
  document: DocumentMetadata;
  version: DocumentVersion;
}

function DocumentPreview({ document, version }: DocumentPreviewProps) {
  const isPDF = document.fileType === "pdf";
  const isImage = ["png", "jpg", "jpeg"].includes(document.fileType);

  if (isPDF) {
    return (
      <div className="w-full h-full min-h-[600px] bg-white rounded-atlas-md shadow-lg overflow-hidden">
        {/* In production, use react-pdf or PDF.js for actual PDF rendering */}
        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-8">
          <FileTextIcon className="size-16 mb-4 text-red-400" />
          <p className="text-lg font-medium text-foreground mb-2">{document.name}</p>
          <p className="text-sm mb-4">PDF Preview</p>
          <p className="text-xs text-center max-w-md">
            In production, this would render the PDF using react-pdf or PDF.js.
            For now, use the download button to view the file.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => window.open(version.fileUrl, "_blank")}>
            <ExternalLinkIcon className="size-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="max-w-full max-h-full rounded-atlas-md shadow-lg overflow-hidden bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={version.fileUrl}
          alt={document.name}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }

  // Non-previewable files
  return (
    <Card variant="neumorphic" className="w-96 p-8 text-center">
      <FileIconDisplay fileType={document.fileType} className="size-16 mx-auto mb-4" />
      <h3 className="font-medium mb-2">{document.name}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Preview not available for {document.fileType.toUpperCase()} files
      </p>
      <Button onClick={() => window.open(version.fileUrl, "_blank")}>
        <DownloadIcon className="size-4 mr-2" />
        Download to View
      </Button>
    </Card>
  );
}

// =============================================================================
// DOCUMENT SIDEBAR
// =============================================================================

interface DocumentSidebarProps {
  document: DocumentMetadata;
  version: DocumentVersion;
}

function DocumentSidebar({ document, version }: DocumentSidebarProps) {
  const typeConfig = documentTypeConfig[document.documentType];
  const accessConfig = accessLevelConfig[document.accessLevel];

  return (
    <div className="p-4 space-y-6">
      {/* Details */}
      <div>
        <h3 className="text-sm font-medium mb-3">Details</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Type</dt>
            <dd>
              <Badge className={typeConfig.color} size="xs">
                {typeConfig.label}
              </Badge>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Size</dt>
            <dd>{formatFileSize(document.fileSize)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Access</dt>
            <dd>{accessConfig.label}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Version</dt>
            <dd>v{document.currentVersion}</dd>
          </div>
        </dl>
      </div>

      {/* Company / Deal */}
      {(document.companyName || document.dealName) && (
        <div>
          <h3 className="text-sm font-medium mb-3">Related To</h3>
          <div className="space-y-2">
            {document.companyName && (
              <div className="flex items-center gap-2 text-sm">
                <span className="w-6 h-6 rounded bg-navy-500/20 flex items-center justify-center text-[10px] font-bold text-navy-400">
                  {document.companyName[0]}
                </span>
                {document.companyName}
              </div>
            )}
            {document.dealName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileTextIcon className="size-4" />
                {document.dealName}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Info */}
      <div>
        <h3 className="text-sm font-medium mb-3">Uploaded By</h3>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-500 to-tactical-500 flex items-center justify-center text-white text-xs font-medium">
            {document.uploadedByName.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <div className="text-sm">{document.uploadedByName}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(document.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Current Version Info */}
      <div>
        <h3 className="text-sm font-medium mb-3">Current Version</h3>
        <div className="bg-muted/30 rounded-atlas-sm p-3 text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">v{version.versionNumber}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(version.uploadedAt).toLocaleDateString()}
            </span>
          </div>
          {version.changeNotes && (
            <p className="text-xs text-muted-foreground">{version.changeNotes}</p>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            by {version.uploadedByName}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div>
        <h3 className="text-sm font-medium mb-3">Activity</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 rounded-atlas-sm p-3 text-center">
            <div className="text-lg font-bold">{document.viewCount}</div>
            <div className="text-xs text-muted-foreground">Views</div>
          </div>
          <div className="bg-muted/30 rounded-atlas-sm p-3 text-center">
            <div className="text-lg font-bold">{document.downloadCount}</div>
            <div className="text-xs text-muted-foreground">Downloads</div>
          </div>
        </div>
      </div>

      {/* Tags */}
      {document.tags.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {document.tags.map((tag) => (
              <Badge key={tag} variant="secondary" size="xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// VERSION SELECTOR
// =============================================================================

interface VersionSelectorProps {
  versions: DocumentVersion[];
  currentVersion: DocumentVersion;
  onSelect: (version: DocumentVersion) => void;
  onClose: () => void;
}

function VersionSelector({ versions, currentVersion, onSelect, onClose }: VersionSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="absolute right-0 top-full mt-1 z-10 bg-card border border-border rounded-atlas-md shadow-lg py-1 min-w-[200px] max-h-64 overflow-y-auto"
      onMouseLeave={onClose}
    >
      {[...versions].reverse().map((version) => (
        <button
          key={version.id}
          onClick={() => onSelect(version)}
          className={cn(
            "w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors",
            version.id === currentVersion.id && "bg-muted/50"
          )}
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="font-medium">Version {version.versionNumber}</span>
            <span className="text-xs text-muted-foreground">
              {formatFileSize(version.fileSize)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(version.uploadedAt).toLocaleDateString()} by {version.uploadedByName}
          </div>
          {version.changeNotes && (
            <div className="text-xs text-muted-foreground mt-0.5 truncate">
              {version.changeNotes}
            </div>
          )}
        </button>
      ))}
    </motion.div>
  );
}

// =============================================================================
// SHARE MODAL
// =============================================================================

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareLink: string | null;
  documentName: string;
  onCopy: () => void;
  copied: boolean;
}

function ShareModal({ isOpen, onClose, shareLink, documentName, onCopy, copied }: ShareModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-atlas-lg shadow-2xl z-[60] p-6 w-[400px]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Share Document</h3>
              <button onClick={onClose} className="p-1 hover:bg-muted rounded-atlas-sm">
                <Cross2Icon className="size-4" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Share "{documentName}" with a secure link that expires in 24 hours.
            </p>

            {shareLink ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 bg-muted/50 border border-border rounded-atlas-sm px-3 py-2 text-sm"
                  />
                  <Button onClick={onCopy} size="sm" className="flex-shrink-0">
                    {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This link will expire in 24 hours
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Unable to generate share link. Please try again.
              </p>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
