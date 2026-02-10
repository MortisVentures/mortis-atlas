"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  EnvelopeClosedIcon,
  PersonIcon,
  Link2Icon,
  Cross2Icon,
  PlusIcon,
  ChatBubbleIcon,
} from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Proposal } from "@/hooks/use-proposals";
import { getScoreTier } from "@/lib/integrations/detection/scoring";

// =============================================================================
// SCHEMA
// =============================================================================

const contactProposalSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.string().optional(),
  phone: z.string().optional(),
  linkedinUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  companyOption: z.enum(["existing", "create", "none"]),
  existingCompanyId: z.string().optional(),
  newCompanyName: z.string().optional(),
  newCompanyWebsite: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type ContactProposalFormData = z.infer<typeof contactProposalSchema>;

// =============================================================================
// TYPES
// =============================================================================

interface ContactProposalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: Proposal | null;
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    role?: string;
    phone?: string;
    linkedinUrl?: string;
    companyId?: string;
    createCompany?: { name: string; website?: string };
  }) => void;
  onDismiss: () => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ContactProposalModal({
  open,
  onOpenChange,
  proposal,
  onSubmit,
  onDismiss,
}: ContactProposalModalProps) {
  const form = useForm<ContactProposalFormData>({
    resolver: zodResolver(contactProposalSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      role: "",
      phone: "",
      linkedinUrl: "",
      companyOption: "none",
      existingCompanyId: "",
      newCompanyName: "",
      newCompanyWebsite: "",
    },
  });

  const { isSubmitting } = form.formState;
  const companyOption = form.watch("companyOption");

  // Reset form when proposal changes
  React.useEffect(() => {
    if (proposal) {
      const firstName =
        proposal.signatureInfo?.firstName ||
        proposal.parsedName.firstName ||
        proposal.name?.split(" ")[0] ||
        "";
      const lastName =
        proposal.signatureInfo?.lastName ||
        proposal.parsedName.lastName ||
        proposal.name?.split(" ").slice(1).join(" ") ||
        "";

      const hasCompanyMatch = proposal.companyMatches.length > 0;
      const hasDomainInfo = proposal.domainInfo.companyName;

      form.reset({
        firstName,
        lastName,
        role: proposal.signatureInfo?.title || "",
        phone: proposal.signatureInfo?.phone || "",
        linkedinUrl: proposal.signatureInfo?.linkedIn || "",
        companyOption: hasCompanyMatch ? "existing" : hasDomainInfo ? "create" : "none",
        existingCompanyId: hasCompanyMatch ? proposal.companyMatches[0].id : "",
        newCompanyName: proposal.domainInfo.companyName || "",
        newCompanyWebsite: proposal.domainInfo.websiteUrl || "",
      });
    }
  }, [proposal, form]);

  // Handle submit
  const handleSubmit = (data: ContactProposalFormData) => {
    const submitData: Parameters<typeof onSubmit>[0] = {
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || undefined,
      phone: data.phone || undefined,
      linkedinUrl: data.linkedinUrl || undefined,
    };

    if (data.companyOption === "existing" && data.existingCompanyId) {
      submitData.companyId = data.existingCompanyId;
    } else if (data.companyOption === "create" && data.newCompanyName) {
      submitData.createCompany = {
        name: data.newCompanyName,
        website: data.newCompanyWebsite || undefined,
      };
    }

    onSubmit(submitData);
  };

  if (!proposal) return null;

  const tier = getScoreTier(proposal.score);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-white dark:bg-neutral-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PersonIcon className="size-5 text-tactical-500" />
            New Contact Suggestion
          </DialogTitle>
          <DialogDescription>
            Create a new contact from email activity
          </DialogDescription>
        </DialogHeader>

        {/* Email Info Header */}
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-700">
                <EnvelopeClosedIcon className="size-5 text-neutral-500" />
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {proposal.email}
                </p>
                <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
                  <span>{proposal.messageCount} emails</span>
                  <span>·</span>
                  <span>Last: {new Date(proposal.lastSeenAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                tier === "high" && "border-green-500 text-green-600",
                tier === "medium" && "border-yellow-500 text-yellow-600"
              )}
            >
              Score: {proposal.score}
            </Badge>
          </div>

          {/* Recent Subject */}
          {proposal.recentSubjects[0] && (
            <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <ChatBubbleIcon className="size-3.5" />
                <span className="font-medium">Recent:</span>
                <span className="truncate">{proposal.recentSubjects[0]}</span>
              </div>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      First Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Last Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="CEO, Partner, Engineer..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone & LinkedIn */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="linkedinUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://linkedin.com/in/..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Company Selection */}
            <div className="space-y-3 pt-2">
              <Label className="text-sm font-medium">Company</Label>
              <FormField
                control={form.control}
                name="companyOption"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="space-y-2"
                  >
                    {/* Link to Existing */}
                    {proposal.companyMatches.length > 0 && (
                      <div className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        <RadioGroupItem value="existing" id="existing" />
                        <div className="flex-1">
                          <Label htmlFor="existing" className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <Link2Icon className="size-4 text-green-500" />
                              <span>Link to existing company</span>
                            </div>
                          </Label>
                          {companyOption === "existing" && (
                            <FormField
                              control={form.control}
                              name="existingCompanyId"
                              render={({ field: selectField }) => (
                                <Select
                                  value={selectField.value}
                                  onValueChange={selectField.onChange}
                                >
                                  <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Select company" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {proposal.companyMatches.map((match) => (
                                      <SelectItem key={match.id} value={match.id}>
                                        {match.name}
                                        <span className="text-neutral-400 ml-2">
                                          ({match.confidence}% match)
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Create New */}
                    <div className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <RadioGroupItem value="create" id="create" />
                      <div className="flex-1">
                        <Label htmlFor="create" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <PlusIcon className="size-4 text-blue-500" />
                            <span>Create new company</span>
                          </div>
                        </Label>
                        {companyOption === "create" && (
                          <div className="mt-2 space-y-2">
                            <FormField
                              control={form.control}
                              name="newCompanyName"
                              render={({ field: nameField }) => (
                                <Input
                                  placeholder="Company name"
                                  {...nameField}
                                />
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="newCompanyWebsite"
                              render={({ field: websiteField }) => (
                                <Input
                                  placeholder="https://example.com"
                                  {...websiteField}
                                />
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* No Company */}
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <RadioGroupItem value="none" id="none" />
                      <Label htmlFor="none" className="cursor-pointer">
                        No company
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <Button
                type="button"
                variant="ghost"
                onClick={onDismiss}
                className="text-neutral-500 hover:text-red-600"
              >
                <Cross2Icon className="size-4 mr-2" />
                Dismiss
              </Button>
              <div className="flex gap-2">
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
                      Creating...
                    </>
                  ) : (
                    "Create Contact"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
