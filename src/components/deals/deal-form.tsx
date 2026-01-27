"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Deal, DealStage, DealPriority } from "@prisma/client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceAttributionFields } from "@/components/forms";

import {
  createDealSchema,
  updateDealSchema,
  CreateDealInput,
  UpdateDealInput,
  dealStages,
  dealPriorities,
} from "@/lib/validations/deal";

// =============================================================================
// COMPANY TYPE
// =============================================================================

interface CompanyOption {
  id: string;
  name: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STAGE_OPTIONS: { value: DealStage; label: string }[] = [
  { value: "INITIAL_REVIEW", label: "Initial Review" },
  { value: "MEETING_SCHEDULED", label: "Meeting Scheduled" },
  { value: "DEEP_DIVE", label: "Deep Dive" },
  { value: "PARTNER_REVIEW", label: "Partner Review" },
  { value: "TERM_SHEET", label: "Term Sheet" },
  { value: "LEGAL_DILIGENCE", label: "Legal Diligence" },
  { value: "CLOSED_WON", label: "Closed Won" },
  { value: "CLOSED_LOST", label: "Closed Lost" },
];

const PRIORITY_OPTIONS: { value: DealPriority; label: string }[] = [
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

// =============================================================================
// TYPES
// =============================================================================

interface DealFormProps {
  deal?: Deal & { company?: { id: string; name: string } };
  companyId?: string;
  companyName?: string;
  mode: "create" | "edit";
}

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrencyInput(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "";
  return value.toString();
}

function parseCurrencyInput(value: string): number | null {
  if (!value) return null;
  const parsed = parseFloat(value.replace(/[^0-9.]/g, ""));
  return isNaN(parsed) ? null : parsed;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function DealForm({ deal, companyId, companyName, mode }: DealFormProps) {
  const router = useRouter();
  const isEditing = mode === "edit";
  const [companies, setCompanies] = React.useState<CompanyOption[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = React.useState(false);

  // Fetch companies on mount
  React.useEffect(() => {
    async function fetchCompanies() {
      if (companyId && companyName) return; // Skip if company already provided

      setIsLoadingCompanies(true);
      try {
        const response = await fetch("/api/companies?limit=100");
        if (response.ok) {
          const result = await response.json();
          // API returns { data: Company[], pagination: {...} }
          const companiesData = result.data || result;
          setCompanies(companiesData.map((c: { id: string; name: string }) => ({
            id: c.id,
            name: c.name,
          })));
        }
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      } finally {
        setIsLoadingCompanies(false);
      }
    }
    fetchCompanies();
  }, [companyId, companyName]);

  const schema = isEditing ? updateDealSchema : createDealSchema;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<CreateDealInput | UpdateDealInput>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      dealName: deal?.dealName ?? "",
      companyId: deal?.companyId ?? companyId ?? "",
      amount: deal?.amount ? Number(deal.amount) : undefined,
      valuation: deal?.valuation ? Number(deal.valuation) : undefined,
      stage: deal?.stage ?? "INITIAL_REVIEW",
      priority: deal?.priority ?? "MEDIUM",
      probability: deal?.probability ?? undefined,
      expectedClose: deal?.expectedClose ?? undefined,
      notes: deal?.notes ?? "",
      // Source Attribution
      sourceType: deal?.sourceType ?? undefined,
      sourceChannel: deal?.sourceChannel ?? "",
      sourceDetail: deal?.sourceDetail ?? "",
      referrerContactId: deal?.referrerContactId ?? undefined,
      referralDate: deal?.referralDate ?? undefined,
      // Financial Details
      roundSize: deal?.roundSize ? Number(deal.roundSize) : undefined,
      postMoneyVal: deal?.postMoneyVal ? Number(deal.postMoneyVal) : undefined,
      ownershipTarget: deal?.ownershipTarget ? Number(deal.ownershipTarget) : undefined,
      proRataRights: deal?.proRataRights ?? false,
      contactId: deal?.contactId ?? undefined,
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: CreateDealInput | UpdateDealInput) {
    try {
      const endpoint = isEditing
        ? `/api/deals/${deal?.id}`
        : "/api/deals";
      const method = isEditing ? "PUT" : "POST";

      // Clean up empty strings to null
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === "" ? null : value,
        ])
      );

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Something went wrong");
      }

      const result = await response.json();

      toast.success(
        isEditing ? "Deal updated successfully" : "Deal created successfully"
      );

      router.push(isEditing ? `/deals/${deal?.id}` : `/deals/${result.id}`);
      router.refresh();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save deal"
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle>Deal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Deal Name */}
              <FormField
                control={form.control}
                name="dealName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Deal Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Series A Investment"
                        {...field}
                        className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Company Selector */}
              {companyName ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Company</label>
                  <div className="px-3 py-2 rounded-md bg-muted text-sm">
                    {companyName}
                  </div>
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Company <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoadingCompanies}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder={isLoadingCompanies ? "Loading companies..." : "Select a company"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the company for this deal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <SelectTrigger className="bg-background">
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

              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((option) => (
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

              {/* Probability */}
              <FormField
                control={form.control}
                name="probability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Probability (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="50"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Expected Close */}
            <FormField
              control={form.control}
              name="expectedClose"
              render={({ field }) => (
                <FormItem className="max-w-xs">
                  <FormLabel>Expected Close Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="bg-background"
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? new Date(e.target.value) : null
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Financial Details */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle>Investment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Investment Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Amount ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          placeholder="5000000"
                          className="bg-background pl-7"
                          {...field}
                          value={formatCurrencyInput(field.value as number)}
                          onChange={(e) =>
                            field.onChange(parseCurrencyInput(e.target.value))
                          }
                        />
                      </div>
                    </FormControl>
                    <FormDescription>Our investment amount</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Valuation */}
              <FormField
                control={form.control}
                name="valuation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pre-Money Valuation ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          placeholder="40000000"
                          className="bg-background pl-7"
                          {...field}
                          value={formatCurrencyInput(field.value as number)}
                          onChange={(e) =>
                            field.onChange(parseCurrencyInput(e.target.value))
                          }
                        />
                      </div>
                    </FormControl>
                    <FormDescription>Pre-money valuation</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Round Size */}
              <FormField
                control={form.control}
                name="roundSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Round Size ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          placeholder="15000000"
                          className="bg-background pl-7"
                          {...field}
                          value={formatCurrencyInput(field.value as number)}
                          onChange={(e) =>
                            field.onChange(parseCurrencyInput(e.target.value))
                          }
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Post-Money */}
              <FormField
                control={form.control}
                name="postMoneyVal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post-Money ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          placeholder="55000000"
                          className="bg-background pl-7"
                          {...field}
                          value={formatCurrencyInput(field.value as number)}
                          onChange={(e) =>
                            field.onChange(parseCurrencyInput(e.target.value))
                          }
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ownership Target */}
              <FormField
                control={form.control}
                name="ownershipTarget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ownership Target (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        max={100}
                        placeholder="10"
                        className="bg-background"
                        {...field}
                        value={
                          field.value !== null && field.value !== undefined
                            ? (Number(field.value) * 100).toFixed(2)
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseFloat(e.target.value) / 100
                              : null
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>Target ownership %</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Investment thesis, key concerns, etc..."
                      className="min-h-[150px] bg-background resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Internal notes about this deal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Source Attribution */}
        <SourceAttributionFields entityType="deal" />

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
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
                Saving...
              </>
            ) : isEditing ? (
              "Update Deal"
            ) : (
              "Create Deal"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
