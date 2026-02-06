"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  UploadIcon,
  Cross2Icon,
  FileIcon,
  FileTextIcon,
  TableIcon,
  CheckCircledIcon,
  ReloadIcon,
  Link2Icon,
} from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  DocumentType,
  AccessLevel,
  documentTypeConfig,
  accessLevelConfig,
  allowedFileTypes,
  validateFile,
  formatFileSize,
  MAX_FILE_SIZE,
} from "@/lib/types/documents";

// =============================================================================
// SCHEMA
// =============================================================================

const documentUploadSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  description: z.string().optional(),
  documentType: z.enum([
    "PITCH_DECK",
    "FINANCIAL_MODEL",
    "IC_MEMO",
    "TERM_SHEET",
    "DD_REPORT",
    "BOARD_NOTES",
    "LEGAL",
    "REFERENCE",
  ]),
  accessLevel: z.enum(["PRIVATE", "TEAM", "IC_MEMBERS", "LP_ACCESSIBLE"]),
  companyId: z.string().optional(),
  dealId: z.string().optional(),
  tags: z.string().optional(),
});

type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;

// =============================================================================
// TYPES
// =============================================================================

interface Company {
  id: string;
  name: string;
  stage?: string;
  sourceType?: string;
}

interface Deal {
  id: string;
  dealName: string;
  stage?: string;
  company?: { id: string; name: string };
}

interface DocumentUploadFormProps {
  /** Pre-selected company */
  company?: Company | null;
  /** Pre-selected deal */
  deal?: Deal | null;
  /** Callback when upload completes */
  onUploadComplete?: (document: { id: string; name: string }) => void;
  /** Callback when cancelled */
  onCancel?: () => void;
  /** Layout variant */
  variant?: "page" | "modal" | "inline";
}

// =============================================================================
// FILE ICON HELPER
// =============================================================================

function getFileIcon(mimeType: string) {
  if (mimeType.includes("pdf")) return <FileTextIcon className="size-6" />;
  if (mimeType.includes("sheet") || mimeType.includes("xlsx"))
    return <TableIcon className="size-6" />;
  return <FileIcon className="size-6" />;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function DocumentUploadForm({
  company: initialCompany,
  deal: initialDeal,
  onUploadComplete,
  onCancel,
  variant = "page",
}: DocumentUploadFormProps) {
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Company/Deal selection
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [selectedCompany, setSelectedCompany] = React.useState<Company | null>(
    initialCompany || null
  );
  const [selectedDeal, setSelectedDeal] = React.useState<Deal | null>(
    initialDeal || null
  );
  const [_isLoadingCompanies, setIsLoadingCompanies] = React.useState(false);
  const [isLoadingDeals, setIsLoadingDeals] = React.useState(false);

  // Form
  const form = useForm<DocumentUploadFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(documentUploadSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      documentType: "REFERENCE",
      accessLevel: "TEAM",
      companyId: initialCompany?.id,
      dealId: initialDeal?.id,
      tags: "",
    },
  });

  // Load companies
  React.useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        const response = await fetch("/api/companies?limit=100");
        if (response.ok) {
          const json = await response.json();
          setCompanies(json.data || []);
        }
      } catch (error) {
        console.error("Error loading companies:", error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  // Load deals for selected company
  React.useEffect(() => {
    const fetchDeals = async () => {
      if (!selectedCompany) {
        setDeals([]);
        return;
      }

      setIsLoadingDeals(true);
      try {
        const response = await fetch(
          `/api/deals?companyId=${selectedCompany.id}&limit=50`
        );
        if (response.ok) {
          const json = await response.json();
          setDeals(json.data || []);
        }
      } catch (error) {
        console.error("Error loading deals:", error);
      } finally {
        setIsLoadingDeals(false);
      }
    };
    fetchDeals();
  }, [selectedCompany]);

  // Handle file selection
  const handleFileSelect = (selectedFile: File) => {
    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      setFileError(validation.error || "Invalid file");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setFileError(null);

    // Auto-populate name from filename
    if (!form.getValues("name")) {
      form.setValue("name", selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  // Drag handlers
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
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle company selection
  const handleCompanySelect = (companyId: string) => {
    const actualValue = companyId === "__none__" ? "" : companyId;
    const company = companies.find((c) => c.id === actualValue) || null;
    setSelectedCompany(company);
    setSelectedDeal(null);
    form.setValue("companyId", actualValue || undefined);
    form.setValue("dealId", undefined);
  };

  // Handle deal selection
  const handleDealSelect = (dealId: string) => {
    const actualValue = dealId === "__none__" ? "" : dealId;
    const deal = deals.find((d) => d.id === actualValue) || null;
    setSelectedDeal(deal);
    form.setValue("dealId", actualValue || undefined);
  };

  // Submit form
  const onSubmit = async (data: DocumentUploadFormData) => {
    if (!file) {
      setFileError("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", data.name);
      if (data.description) formData.append("description", data.description);
      formData.append("documentType", data.documentType);
      formData.append("accessLevel", data.accessLevel);
      if (data.companyId) formData.append("companyId", data.companyId);
      if (data.dealId) formData.append("dealId", data.dealId);
      if (data.tags) {
        const tagsArray = data.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        formData.append("tags", JSON.stringify(tagsArray));
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Upload
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      setUploadProgress(100);
      const result = await response.json();

      // Success callback
      if (onUploadComplete) {
        onUploadComplete(result.document);
      } else {
        router.push("/documents");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload document"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* File Drop Zone */}
        <Card>
          <CardContent className="p-6">
            {file ? (
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="w-12 h-12 rounded-lg bg-tactical-500/20 flex items-center justify-center text-tactical-400">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{file.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setFileError(null);
                    form.setValue("name", "");
                  }}
                  disabled={isUploading}
                >
                  <Cross2Icon className="size-4" />
                </Button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragOver
                    ? "border-tactical-500 bg-tactical-500/5"
                    : "border-border hover:border-muted-foreground hover:bg-muted/20"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.xlsx,.docx,.pptx,.png,.jpg,.jpeg"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                    <UploadIcon className="size-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {isDragOver
                        ? "Drop file here"
                        : "Drag and drop a file here"}
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
                  <p className="text-xs text-muted-foreground">
                    Max {formatFileSize(MAX_FILE_SIZE)}
                  </p>
                </div>
              </div>
            )}

            {fileError && (
              <p className="mt-2 text-sm text-destructive">{fileError}</p>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-tactical-500"
                  />
                </div>
              </div>
            )}

            {uploadError && (
              <p className="mt-2 text-sm text-destructive">{uploadError}</p>
            )}
          </CardContent>
        </Card>

        {/* Document Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileTextIcon className="size-5 text-tactical-400" />
              Document Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Series A Pitch Deck"
                      className="bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for the document
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the document..."
                      className="bg-background resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Document Type */}
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(documentTypeConfig).map(
                          ([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {documentTypeConfig[field.value as DocumentType]?.description ||
                        "Categorize the document"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Access Level */}
              <FormField
                control={form.control}
                name="accessLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select access" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(accessLevelConfig).map(
                          ([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {accessLevelConfig[field.value as AccessLevel]?.description ||
                        "Who can access this document"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., series-a, financials, 2026"
                      className="bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated tags for easier filtering
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Entity Linking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2Icon className="size-5 text-tactical-400" />
              Link to Company or Deal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Connect this document to a specific company or deal for better organization.
            </p>

            {/* Company Selection */}
            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <Select
                    onValueChange={handleCompanySelect}
                    value={field.value || "__none__"}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select a company (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">No company selected</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCompany && (
                    <div className="flex items-center gap-2 mt-2 p-2 rounded bg-muted/30">
                      <CheckCircledIcon className="size-4 text-tactical-400" />
                      <span className="text-sm">
                        Linked to <strong>{selectedCompany.name}</strong>
                        {selectedCompany.sourceType && (
                          <span className="text-muted-foreground">
                            {" "}
                            (Source: {selectedCompany.sourceType})
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deal Selection (only if company is selected) */}
            {selectedCompany && (
              <FormField
                control={form.control}
                name="dealId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal</FormLabel>
                    <Select
                      onValueChange={handleDealSelect}
                      value={field.value || "__none__"}
                      disabled={isLoadingDeals}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue
                            placeholder={
                              isLoadingDeals
                                ? "Loading deals..."
                                : deals.length === 0
                                ? "No deals for this company"
                                : "Select a deal (optional)"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">No deal selected</SelectItem>
                        {deals.map((deal) => (
                          <SelectItem key={deal.id} value={deal.id}>
                            {deal.dealName}
                            {deal.stage && (
                              <span className="text-muted-foreground">
                                {" "}
                                ({deal.stage})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedDeal && (
                      <div className="flex items-center gap-2 mt-2 p-2 rounded bg-muted/30">
                        <CheckCircledIcon className="size-4 text-tactical-400" />
                        <span className="text-sm">
                          Linked to deal: <strong>{selectedDeal.dealName}</strong>
                        </span>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div
          className={cn(
            "flex items-center gap-3",
            variant === "page" ? "justify-end" : "justify-between"
          )}
        >
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isUploading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={!file || isUploading}
            className="min-w-[140px]"
          >
            {isUploading ? (
              <>
                <ReloadIcon className="size-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadIcon className="size-4 mr-2" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
