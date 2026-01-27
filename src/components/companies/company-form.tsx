"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Company, CompanyStage } from "@prisma/client";
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
  createCompanySchema,
  updateCompanySchema,
  CreateCompanyInput,
  UpdateCompanyInput,
  FUNDING_ROUNDS,
  EMPLOYEE_COUNT_OPTIONS,
  SECTOR_OPTIONS,
} from "@/lib/validations/company";

// Stage options for select
const STAGE_OPTIONS: { value: CompanyStage; label: string }[] = [
  { value: "PROSPECT", label: "Prospect" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "ENGAGED", label: "Engaged" },
  { value: "DUE_DILIGENCE", label: "Due Diligence" },
  { value: "PASSED", label: "Passed" },
  { value: "PORTFOLIO", label: "Portfolio" },
  { value: "EXITED", label: "Exited" },
];

interface CompanyFormProps {
  company?: Company;
  mode: "create" | "edit";
}

// Format number to currency display
function formatCurrencyInput(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "";
  return value.toString();
}

// Parse currency input to number
function parseCurrencyInput(value: string): number | null {
  if (!value) return null;
  const parsed = parseFloat(value.replace(/[^0-9.]/g, ""));
  return isNaN(parsed) ? null : parsed;
}

export function CompanyForm({ company, mode }: CompanyFormProps) {
  const router = useRouter();
  const isEditing = mode === "edit";

  // Use appropriate schema based on mode
  const schema = isEditing ? updateCompanySchema : createCompanySchema;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<CreateCompanyInput | UpdateCompanyInput>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: company?.name ?? "",
      website: company?.website ?? "",
      description: company?.description ?? "",
      stage: company?.stage ?? "PROSPECT",
      sector: company?.sector ?? "",
      location: company?.location ?? "",
      foundedYear: company?.foundedYear ?? undefined,
      employeeCount: company?.employeeCount ?? "",
      fundingRound: company?.fundingRound ?? "",
      fundingAmount: company?.fundingAmount ? Number(company.fundingAmount) : undefined,
      valuation: company?.valuation ? Number(company.valuation) : undefined,
      linkedinUrl: company?.linkedinUrl ?? "",
      twitterHandle: company?.twitterHandle ?? "",
      notes: company?.notes ?? "",
      // Source Attribution
      sourceType: (company as Record<string, unknown>)?.sourceType as string ?? undefined,
      sourceChannel: (company as Record<string, unknown>)?.sourceChannel as string ?? "",
      sourceDetail: (company as Record<string, unknown>)?.sourceDetail as string ?? "",
      referrerContactId: (company as Record<string, unknown>)?.referrerContactId as string ?? undefined,
      referralDate: (company as Record<string, unknown>)?.referralDate as Date ?? undefined,
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: CreateCompanyInput | UpdateCompanyInput) {
    try {
      const endpoint = isEditing
        ? `/api/companies/${company?.id}`
        : "/api/companies";
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
        isEditing ? "Company updated successfully" : "Company created successfully"
      );

      // Navigate to company detail or list
      router.push(isEditing ? `/companies/${company?.id}` : `/companies/${result.id}`);
      router.refresh();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save company"
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        {...field}
                        className="bg-background"
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
                        className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      className="min-h-[100px] bg-background resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief overview of what the company does
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stage */}
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pipeline Stage</FormLabel>
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
                        <SelectTrigger className="bg-background">
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
          </CardContent>
        </Card>

        {/* Funding Information */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle>Funding Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Funding Round */}
              <FormField
                control={form.control}
                name="fundingRound"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funding Round</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select round" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FUNDING_ROUNDS.map((round) => (
                          <SelectItem key={round} value={round}>
                            {round}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Funding Amount */}
              <FormField
                control={form.control}
                name="fundingAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funding Amount ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          placeholder="10000000"
                          className="bg-background pl-7"
                          {...field}
                          value={formatCurrencyInput(field.value as number)}
                          onChange={(e) =>
                            field.onChange(parseCurrencyInput(e.target.value))
                          }
                        />
                      </div>
                    </FormControl>
                    <FormDescription>Total funding raised</FormDescription>
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
                    <FormLabel>Valuation ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          placeholder="50000000"
                          className="bg-background pl-7"
                          {...field}
                          value={formatCurrencyInput(field.value as number)}
                          onChange={(e) =>
                            field.onChange(parseCurrencyInput(e.target.value))
                          }
                        />
                      </div>
                    </FormControl>
                    <FormDescription>Current company valuation</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Details */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Founded Year */}
              <FormField
                control={form.control}
                name="foundedYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Founded Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2020"
                        min={1800}
                        max={new Date().getFullYear() + 1}
                        className="bg-background"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Employee Count */}
              <FormField
                control={form.control}
                name="employeeCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Count</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EMPLOYEE_COUNT_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LinkedIn URL */}
              <FormField
                control={form.control}
                name="linkedinUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://linkedin.com/company/..."
                        {...field}
                        value={field.value ?? ""}
                        className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Twitter Handle */}
              <FormField
                control={form.control}
                name="twitterHandle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter Handle</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          @
                        </span>
                        <Input
                          placeholder="companyname"
                          className="bg-background pl-7"
                          {...field}
                          value={(field.value ?? "").replace(/^@/, "")}
                          onChange={(e) => {
                            const value = e.target.value.replace(/^@/, "");
                            field.onChange(value ? `@${value}` : "");
                          }}
                        />
                      </div>
                    </FormControl>
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
                      placeholder="Internal notes about this company..."
                      className="min-h-[150px] bg-background resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Private notes visible only to your team
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Source Attribution */}
        <SourceAttributionFields entityType="company" />

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
              "Update Company"
            ) : (
              "Create Company"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
