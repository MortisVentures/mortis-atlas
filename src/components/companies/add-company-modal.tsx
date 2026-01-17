"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CompanyStage } from "@prisma/client";
import { toast } from "sonner";
import { PlusIcon } from "@radix-ui/react-icons";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
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

import { SECTOR_OPTIONS } from "@/lib/validations/company";
import { z } from "zod";

// Simplified schema for the quick add modal
const quickAddCompanySchema = z.object({
  name: z.string().min(1, "Company name is required").max(255),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().max(5000).optional(),
  stage: z.string(),
  sector: z.string().optional(),
  location: z.string().max(255).optional(),
});

type QuickAddCompanyInput = z.infer<typeof quickAddCompanySchema>;

// =============================================================================
// TYPES
// =============================================================================

export interface AddCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (company: { id: string; name: string }) => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STAGE_OPTIONS: { value: CompanyStage; label: string }[] = [
  { value: "PROSPECT", label: "Prospect" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "ENGAGED", label: "Engaged" },
  { value: "DUE_DILIGENCE", label: "Due Diligence" },
];

// =============================================================================
// ADD COMPANY MODAL
// =============================================================================

export function AddCompanyModal({
  open,
  onOpenChange,
  onSuccess,
}: AddCompanyModalProps) {
  const router = useRouter();

  const form = useForm<QuickAddCompanyInput>({
    resolver: zodResolver(quickAddCompanySchema),
    defaultValues: {
      name: "",
      website: "",
      description: "",
      stage: "PROSPECT",
      sector: "",
      location: "",
    },
  });

  const { isSubmitting } = form.formState;

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  async function onSubmit(data: QuickAddCompanyInput) {
    try {
      // Clean up empty strings to null
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === "" ? null : value,
        ])
      );

      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create company");
      }

      const result = await response.json();

      toast.success(`${result.name} has been added successfully`);

      // Close modal
      onOpenChange(false);

      // Callback for parent component
      onSuccess?.(result);

      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create company"
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <PlusIcon className="size-5 text-tactical-500" />
            Add New Company
          </DialogTitle>
          <DialogDescription>
            Add a new company to your pipeline. Fill in the essential details below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Company Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Company Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Acme Inc."
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Website */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stage + Sector Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Stage */}
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STAGE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sector */}
              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sector</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sector" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SECTOR_OPTIONS.map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="San Francisco, CA"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
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
                      placeholder="Brief description of the company..."
                      className="min-h-[80px] resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Adding...
                  </>
                ) : (
                  "Add Company"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// KEYBOARD SHORTCUT HOOK
// =============================================================================

export function useAddCompanyShortcut(
  onOpen: () => void,
  enabled: boolean = true
) {
  React.useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+N (Mac) or Ctrl+N (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        // Don't trigger if user is typing in an input
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }

        e.preventDefault();
        onOpen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpen, enabled]);
}

// =============================================================================
// ADD COMPANY PROVIDER (for global access)
// =============================================================================

interface AddCompanyContextValue {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const AddCompanyContext = React.createContext<AddCompanyContextValue | null>(null);

export function AddCompanyProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => setIsOpen(false), []);

  // Register keyboard shortcut
  useAddCompanyShortcut(openModal);

  const value = React.useMemo(
    () => ({ isOpen, openModal, closeModal }),
    [isOpen, openModal, closeModal]
  );

  return (
    <AddCompanyContext.Provider value={value}>
      {children}
      <AddCompanyModal open={isOpen} onOpenChange={setIsOpen} />
    </AddCompanyContext.Provider>
  );
}

export function useAddCompany() {
  const context = React.useContext(AddCompanyContext);
  if (!context) {
    throw new Error("useAddCompany must be used within AddCompanyProvider");
  }
  return context;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default AddCompanyModal;
