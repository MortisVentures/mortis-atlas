"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { createCompany, updateCompany } from "@/app/actions/company";
import { Company, CompanyStage } from "@prisma/client";

const stages: { value: CompanyStage; label: string }[] = [
  { value: "PROSPECT", label: "Prospect" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "ENGAGED", label: "Engaged" },
  { value: "DUE_DILIGENCE", label: "Due Diligence" },
  { value: "PASSED", label: "Passed" },
  { value: "PORTFOLIO", label: "Portfolio" },
  { value: "EXITED", label: "Exited" },
];

const employeeCounts = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

interface CompanyFormProps {
  company?: Company;
}

export function CompanyForm({ company }: CompanyFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      if (company) {
        await updateCompany(company.id, formData);
      } else {
        await createCompany(formData);
      }
    });
  };

  return (
    <form action={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Acme Corp"
                  defaultValue={company?.name || ""}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stage">Stage</Label>
                  <Select
                    name="stage"
                    defaultValue={company?.stage || "PROSPECT"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sector">Sector</Label>
                  <Input
                    id="sector"
                    name="sector"
                    placeholder="e.g., FinTech, HealthTech"
                    defaultValue={company?.sector || ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Brief description of the company..."
                  rows={3}
                  defaultValue={company?.description || ""}
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://example.com"
                  defaultValue={company?.website || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn</Label>
                <Input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="url"
                  placeholder="https://linkedin.com/company/..."
                  defaultValue={company?.linkedinUrl || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="San Francisco, CA"
                  defaultValue={company?.location || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="foundedYear">Founded Year</Label>
                <Input
                  id="foundedYear"
                  name="foundedYear"
                  type="number"
                  placeholder="2020"
                  min={1900}
                  max={2100}
                  defaultValue={company?.foundedYear || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeCount">Employee Count</Label>
                <Select
                  name="employeeCount"
                  defaultValue={company?.employeeCount || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    {employeeCounts.map((count) => (
                      <SelectItem key={count} value={count}>
                        {count}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notes</h3>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Internal notes about this company..."
              rows={4}
              defaultValue={company?.notes || ""}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : company
                  ? "Update Company"
                  : "Create Company"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <a href="/companies">Cancel</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
