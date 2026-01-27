"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileIcon,
  UploadIcon,
  MagnifyingGlassIcon,
  GridIcon,
  ListBulletIcon,
  ChevronDownIcon,
  ClockIcon,
  BarChartIcon,
} from "@radix-ui/react-icons";

import { PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DocumentType,
  AccessLevel,
  SourceType,
  DocumentMetadata,
  documentTypeConfig,
  accessLevelConfig,
  sourceTypeConfig,
  formatFileSize,
} from "@/lib/types/documents";
import { SAMPLE_DOCUMENTS } from "@/lib/storage/documents";
import { DocumentList } from "@/components/documents/document-card";
import { DocumentViewer } from "@/components/documents/document-viewer";
import { DocumentUploadModal } from "@/components/documents/document-uploader";

// =============================================================================
// DOCUMENTS PAGE
// =============================================================================

export default function DocumentsPage() {
  const [documents, setDocuments] = React.useState<DocumentMetadata[]>(SAMPLE_DOCUMENTS);
  const [filteredDocs, setFilteredDocs] = React.useState<DocumentMetadata[]>(SAMPLE_DOCUMENTS);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<DocumentType | "ALL">("ALL");
  const [accessFilter, setAccessFilter] = React.useState<AccessLevel | "ALL">("ALL");
  const [sourceFilter, setSourceFilter] = React.useState<SourceType | "ALL">("ALL");
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("grid");
  const [sortBy, setSortBy] = React.useState<"date" | "name" | "size">("date");

  // Modal states
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [viewingDocument, setViewingDocument] = React.useState<DocumentMetadata | null>(null);

  // Stats
  const stats = React.useMemo(() => {
    const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
    const byType: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    documents.forEach((doc) => {
      byType[doc.documentType] = (byType[doc.documentType] || 0) + 1;
      if (doc.source) {
        bySource[doc.source] = (bySource[doc.source] || 0) + 1;
      }
    });

    return {
      total: documents.length,
      totalSize,
      byType,
      bySource,
      recent: documents.filter((d) => {
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return new Date(d.createdAt).getTime() > weekAgo;
      }).length,
    };
  }, [documents]);

  // Filter and sort documents
  React.useEffect(() => {
    let result = [...documents];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.name.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query) ||
          doc.companyName?.toLowerCase().includes(query) ||
          doc.sourceName?.toLowerCase().includes(query) ||
          doc.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply type filter
    if (typeFilter !== "ALL") {
      result = result.filter((doc) => doc.documentType === typeFilter);
    }

    // Apply access filter
    if (accessFilter !== "ALL") {
      result = result.filter((doc) => doc.accessLevel === accessFilter);
    }

    // Apply source filter
    if (sourceFilter !== "ALL") {
      result = result.filter((doc) => doc.source === sourceFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "size":
          return b.fileSize - a.fileSize;
        case "date":
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    setFilteredDocs(result);
  }, [documents, searchQuery, typeFilter, accessFilter, sourceFilter, sortBy]);

  // Handlers
  const handleView = (doc: DocumentMetadata) => {
    setViewingDocument(doc);
  };

  const handleDownload = (doc: DocumentMetadata) => {
    // In production, trigger actual download
    console.log("Downloading:", doc.name);
  };

  const handleShare = (doc: DocumentMetadata) => {
    // Share handled by viewer
    setViewingDocument(doc);
  };

  const handleDelete = (doc: DocumentMetadata) => {
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  };

  const handleUploadComplete = (results: any[]) => {
    const successfulUploads = results
      .filter((r) => r.success && r.document)
      .map((r) => r.document);
    setDocuments((prev) => [...successfulUploads, ...prev]);
    setShowUploadModal(false);
  };

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title="Documents"
        description="Manage and organize all your fund documents"
        actions={
          <div className="flex gap-2">
            <Link href="/documents/upload">
              <Button variant="outline" className="gap-2">
                <UploadIcon className="size-4" />
                New Upload
              </Button>
            </Link>
            <Button onClick={() => setShowUploadModal(true)} className="gap-2">
              <UploadIcon className="size-4" />
              Quick Upload
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <div className="space-y-6">
        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-4 mb-8"
        >
          <Card variant="neumorphic" className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-atlas-sm bg-blue-500/20 flex items-center justify-center">
                <FileIcon className="size-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Documents</div>
              </div>
            </div>
          </Card>

          <Card variant="neumorphic" className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-atlas-sm bg-purple-500/20 flex items-center justify-center">
                <BarChartIcon className="size-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
                <div className="text-xs text-muted-foreground">Total Storage</div>
              </div>
            </div>
          </Card>

          <Card variant="neumorphic" className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-atlas-sm bg-green-500/20 flex items-center justify-center">
                <ClockIcon className="size-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.recent}</div>
                <div className="text-xs text-muted-foreground">This Week</div>
              </div>
            </div>
          </Card>

          <Card variant="neumorphic" className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-atlas-sm bg-amber-500/20 flex items-center justify-center">
                <GridIcon className="size-5 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{Object.keys(stats.byType).length}</div>
                <div className="text-xs text-muted-foreground">Document Types</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Filters & Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 mb-6"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search documents, companies, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as DocumentType | "ALL")}
              className="appearance-none bg-card border border-border rounded-atlas-sm px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-tactical-500"
            >
              <option value="ALL">All Types</option>
              {Object.entries(documentTypeConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Access Filter */}
          <div className="relative">
            <select
              value={accessFilter}
              onChange={(e) => setAccessFilter(e.target.value as AccessLevel | "ALL")}
              className="appearance-none bg-card border border-border rounded-atlas-sm px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-tactical-500"
            >
              <option value="ALL">All Access Levels</option>
              {Object.entries(accessLevelConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Source Filter */}
          <div className="relative">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as SourceType | "ALL")}
              className="appearance-none bg-card border border-border rounded-atlas-sm px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-tactical-500"
            >
              <option value="ALL">All Sources</option>
              {Object.entries(sourceTypeConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "name" | "size")}
              className="appearance-none bg-card border border-border rounded-atlas-sm px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-tactical-500"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-atlas-sm">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-atlas-sm transition-all",
                viewMode === "list" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ListBulletIcon className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-atlas-sm transition-all",
                viewMode === "grid" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <GridIcon className="size-4" />
            </button>
          </div>
        </motion.div>

        {/* Document Type Quick Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap items-center gap-2 mb-4"
        >
          <span className="text-xs text-muted-foreground font-medium mr-1">Type:</span>
          <button
            onClick={() => setTypeFilter("ALL")}
            className={cn(
              "px-3 py-1.5 text-sm rounded-atlas-sm border transition-all",
              typeFilter === "ALL"
                ? "bg-tactical-500/20 border-tactical-500/30 text-tactical-400"
                : "border-border text-muted-foreground hover:border-muted-foreground"
            )}
          >
            All ({documents.length})
          </button>
          {Object.entries(documentTypeConfig).map(([key, config]) => {
            const count = stats.byType[key] || 0;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setTypeFilter(key as DocumentType)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-atlas-sm border transition-all",
                  typeFilter === key
                    ? config.color
                    : "border-border text-muted-foreground hover:border-muted-foreground"
                )}
              >
                {config.label} ({count})
              </button>
            );
          })}
        </motion.div>

        {/* Source Quick Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="flex flex-wrap items-center gap-2 mb-6"
        >
          <span className="text-xs text-muted-foreground font-medium mr-1">Source:</span>
          <button
            onClick={() => setSourceFilter("ALL")}
            className={cn(
              "px-3 py-1.5 text-sm rounded-atlas-sm border transition-all",
              sourceFilter === "ALL"
                ? "bg-tactical-500/20 border-tactical-500/30 text-tactical-400"
                : "border-border text-muted-foreground hover:border-muted-foreground"
            )}
          >
            All Sources
          </button>
          {Object.entries(sourceTypeConfig).map(([key, config]) => {
            const count = stats.bySource[key] || 0;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setSourceFilter(key as SourceType)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-atlas-sm border transition-all",
                  sourceFilter === key
                    ? config.color
                    : "border-border text-muted-foreground hover:border-muted-foreground"
                )}
              >
                {config.label} ({count})
              </button>
            );
          })}
        </motion.div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            {filteredDocs.length} document{filteredDocs.length !== 1 ? "s" : ""}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
        </div>

        {/* Document List/Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <DocumentList
            documents={filteredDocs}
            variant={viewMode === "grid" ? "grid" : "default"}
            onView={handleView}
            onDownload={handleDownload}
            onShare={handleShare}
            onDelete={handleDelete}
            emptyMessage={
              searchQuery
                ? "No documents match your search"
                : "No documents uploaded yet"
            }
          />
        </motion.div>
      </div>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={handleUploadComplete}
      />

      {/* Document Viewer */}
      {viewingDocument && (
        <DocumentViewer
          document={viewingDocument}
          isOpen={!!viewingDocument}
          onClose={() => setViewingDocument(null)}
          onDownload={handleDownload}
          onShare={handleShare}
        />
      )}
    </>
  );
}
