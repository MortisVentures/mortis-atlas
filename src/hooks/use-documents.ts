"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DocumentMetadata,
  DocumentType,
  AccessLevel,
  FileType,
} from "@/lib/types/documents";

// =============================================================================
// TYPES
// =============================================================================

export interface UseDocumentsOptions {
  companyId?: string;
  dealId?: string;
  documentType?: DocumentType;
  accessLevel?: AccessLevel;
  search?: string;
  limit?: number;
  page?: number;
  autoFetch?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UseDocumentsReturn {
  documents: DocumentMetadata[];
  isLoading: boolean;
  error: string | null;
  pagination: Pagination;
  fetchDocuments: () => Promise<void>;
  deleteDocument: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

// API response types
interface ApiDocument {
  id: string;
  name: string;
  originalName: string;
  description: string | null;
  documentType: DocumentType;
  accessLevel: AccessLevel;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  currentVersion: number;
  companyId: string | null;
  dealId: string | null;
  company: { id: string; name: string } | null;
  deal: { id: string; dealName: string } | null;
  uploadedBy: { id: string; name: string | null };
  viewCount: number;
  downloadCount: number;
  lastViewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: { id: string; name: string }[];
}

// =============================================================================
// HOOK
// =============================================================================

export function useDocuments(options: UseDocumentsOptions = {}): UseDocumentsReturn {
  const {
    companyId,
    dealId,
    documentType,
    accessLevel,
    search,
    limit = 50,
    page = 1,
    autoFetch = true,
  } = options;

  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  // Build query string
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (companyId) params.append("companyId", companyId);
    if (dealId) params.append("dealId", dealId);
    if (documentType) params.append("documentType", documentType);
    if (accessLevel) params.append("accessLevel", accessLevel);
    if (search) params.append("search", search);
    if (limit) params.append("limit", limit.toString());
    if (page) params.append("page", page.toString());
    return params.toString();
  }, [companyId, dealId, documentType, accessLevel, search, limit, page]);

  // Transform API document to DocumentMetadata format
  const transformDocument = useCallback((doc: ApiDocument): DocumentMetadata => {
    return {
      id: doc.id,
      name: doc.name,
      originalName: doc.originalName,
      description: doc.description || undefined,
      documentType: doc.documentType,
      accessLevel: doc.accessLevel,
      fileUrl: doc.fileUrl,
      fileType: doc.fileType as FileType,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      storagePath: "", // Not exposed in list API
      bucketName: "", // Not exposed in list API
      companyId: doc.companyId || undefined,
      companyName: doc.company?.name,
      dealId: doc.dealId || undefined,
      dealName: doc.deal?.dealName,
      currentVersion: doc.currentVersion,
      versions: [], // Only latest version returned in list
      tags: doc.tags?.map((t) => t.name) || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      uploadedById: doc.uploadedBy?.id || "",
      uploadedByName: doc.uploadedBy?.name || "Unknown",
      viewCount: doc.viewCount || 0,
      downloadCount: doc.downloadCount || 0,
      lastViewedAt: doc.lastViewedAt || undefined,
    };
  }, []);

  // Fetch documents from API
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryString = buildQueryString();
      const response = await fetch(`/api/documents?${queryString}`);

      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data = await response.json();

      // Transform API response
      const transformedDocuments = (data.documents || []).map(transformDocument);

      setDocuments(transformedDocuments);
      setPagination(
        data.pagination || {
          page: 1,
          limit: 50,
          total: transformedDocuments.length,
          totalPages: 1,
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching documents:", err);
    } finally {
      setIsLoading(false);
    }
  }, [buildQueryString, transformDocument]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchDocuments();
    }
  }, [autoFetch, fetchDocuments]);

  // Delete a document
  const deleteDocument = useCallback(
    async (id: string): Promise<boolean> => {
      // Optimistic update
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));

      try {
        const response = await fetch(`/api/documents/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete document");
        }

        return true;
      } catch (err) {
        console.error("Error deleting document:", err);
        // Revert on error - refetch to restore state
        await fetchDocuments();
        setError(err instanceof Error ? err.message : "Failed to delete");
        return false;
      }
    },
    [fetchDocuments]
  );

  // Refetch is an alias for fetchDocuments
  const refetch = fetchDocuments;

  return {
    documents,
    isLoading,
    error,
    pagination,
    fetchDocuments,
    deleteDocument,
    refetch,
  };
}
