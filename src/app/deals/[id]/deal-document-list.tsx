"use client";

import * as React from "react";
import Link from "next/link";
import { FileIcon, PlusIcon } from "@radix-ui/react-icons";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocumentList } from "@/components/documents/document-card";
import { DocumentMetadata, FileType } from "@/lib/types/documents";

// =============================================================================
// TYPES
// =============================================================================

interface DealDocumentListProps {
  dealId: string;
  initialCount?: number;
}

interface ApiDocument {
  id: string;
  name: string;
  originalName: string;
  description?: string;
  documentType: string;
  accessLevel: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  currentVersion: number;
  companyId?: string;
  dealId?: string;
  company?: { id: string; name: string };
  deal?: { id: string; dealName: string };
  uploadedBy?: { id: string; name: string };
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  tags: { id: string; name: string }[];
}

// =============================================================================
// DEAL DOCUMENT LIST
// =============================================================================

export function DealDocumentList({
  dealId,
  initialCount = 0,
}: DealDocumentListProps) {
  const [documents, setDocuments] = React.useState<DocumentMetadata[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    async function fetchDocuments() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/documents?dealId=${dealId}&limit=50`);

        if (!response.ok) {
          throw new Error("Failed to fetch documents");
        }

        const data = await response.json();

        // Transform API documents to DocumentMetadata format
        const transformedDocuments: DocumentMetadata[] = (data.documents || []).map(
          (doc: ApiDocument) => ({
            id: doc.id,
            name: doc.name,
            originalName: doc.originalName,
            description: doc.description,
            documentType: doc.documentType as DocumentMetadata["documentType"],
            accessLevel: doc.accessLevel as DocumentMetadata["accessLevel"],
            fileUrl: doc.fileUrl,
            fileType: doc.fileType as FileType,
            fileSize: doc.fileSize,
            mimeType: doc.mimeType,
            storagePath: "",
            bucketName: "",
            companyId: doc.companyId,
            companyName: doc.company?.name,
            dealId: doc.dealId,
            dealName: doc.deal?.dealName,
            currentVersion: doc.currentVersion,
            versions: [],
            tags: doc.tags?.map((t) => t.name) || [],
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            uploadedById: doc.uploadedBy?.id || "",
            uploadedByName: doc.uploadedBy?.name || "Unknown",
            viewCount: doc.viewCount || 0,
            downloadCount: doc.downloadCount || 0,
          })
        );

        setDocuments(transformedDocuments);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching documents:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocuments();
  }, [dealId]);

  const handleViewDocument = (doc: DocumentMetadata) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, "_blank");
    }
  };

  const handleDownloadDocument = (doc: DocumentMetadata) => {
    if (doc.fileUrl) {
      const link = document.createElement("a");
      link.href = doc.fileUrl;
      link.download = doc.originalName || doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Don't render if no documents and initialCount is 0
  if (!isLoading && documents.length === 0 && initialCount === 0) {
    return null;
  }

  return (
    <Card variant="raised" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 font-display font-semibold hover:text-tactical-400 transition-colors"
        >
          <FileIcon className="size-4" />
          Documents
          {documents.length > 0 && (
            <span className="text-xs font-mono text-muted-foreground">
              ({documents.length})
            </span>
          )}
        </button>
        <Link href={`/documents/upload?dealId=${dealId}`}>
          <Button variant="outline" size="sm">
            <PlusIcon className="size-4 mr-1" />
            Add
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="w-10 h-10 rounded bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 text-center text-muted-foreground">
          <p>Failed to load documents</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileIcon className="size-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No documents yet</p>
          <Link href={`/documents/upload?dealId=${dealId}`}>
            <Button variant="ghost" size="sm" className="mt-2">
              Upload your first document
            </Button>
          </Link>
        </div>
      ) : (
        <div className={isExpanded ? "" : "max-h-[300px] overflow-hidden"}>
          <DocumentList
            documents={isExpanded ? documents : documents.slice(0, 5)}
            variant="compact"
            onView={handleViewDocument}
            onDownload={handleDownloadDocument}
            showCompany={false}
            showSource={false}
          />
          {!isExpanded && documents.length > 5 && (
            <div className="pt-2 border-t border-border mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => setIsExpanded(true)}
              >
                View all {documents.length} documents
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
