"use client";

import { useState, useEffect } from "react";
import { MeetingType } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MeetingTypeBadge, MeetingTypeSelector } from "./meeting-type-badge";
import { cn } from "@/lib/utils";

interface Company {
  id: string;
  name: string;
}

interface Deal {
  id: string;
  dealName: string;
  stage: string;
}

interface CalendarLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
  currentCompanyId: string | null;
  currentDealId: string | null;
  currentType: MeetingType | null;
  currentConfidence: number | null;
  onSave: (data: {
    companyId: string | null;
    dealId: string | null;
    detectedType: MeetingType | null;
    linkConfirmed: boolean;
  }) => Promise<void>;
}

export function CalendarLinkDialog({
  open,
  onOpenChange,
  eventId,
  eventTitle,
  currentCompanyId,
  currentDealId,
  currentType,
  currentConfidence,
  onSave,
}: CalendarLinkDialogProps) {
  const [companyId, setCompanyId] = useState<string | null>(currentCompanyId);
  const [dealId, setDealId] = useState<string | null>(currentDealId);
  const [meetingType, setMeetingType] = useState<MeetingType | null>(currentType);
  const [isSaving, setIsSaving] = useState(false);

  // Search state
  const [companySearch, setCompanySearch] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [isLoadingDeals, setIsLoadingDeals] = useState(false);

  // Selected company/deal names for display
  const [selectedCompanyName, setSelectedCompanyName] = useState<string | null>(null);
  const [selectedDealName, setSelectedDealName] = useState<string | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setCompanyId(currentCompanyId);
      setDealId(currentDealId);
      setMeetingType(currentType);
      setSelectedCompanyName(null);
      setSelectedDealName(null);
    }
  }, [open, currentCompanyId, currentDealId, currentType]);

  // Search companies
  useEffect(() => {
    const searchCompanies = async () => {
      if (!companySearch || companySearch.length < 2) {
        setCompanies([]);
        return;
      }

      setIsLoadingCompanies(true);
      try {
        const response = await fetch(`/api/companies?search=${encodeURIComponent(companySearch)}&limit=10`);
        const data = await response.json();
        setCompanies(data.data || []);
      } catch (error) {
        console.error("Failed to search companies:", error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    const debounce = setTimeout(searchCompanies, 300);
    return () => clearTimeout(debounce);
  }, [companySearch]);

  // Load deals for selected company
  useEffect(() => {
    const loadDeals = async () => {
      if (!companyId) {
        setDeals([]);
        return;
      }

      setIsLoadingDeals(true);
      try {
        const response = await fetch(`/api/deals?companyId=${companyId}&limit=10`);
        const data = await response.json();
        setDeals(data.data || []);
      } catch (error) {
        console.error("Failed to load deals:", error);
      } finally {
        setIsLoadingDeals(false);
      }
    };

    loadDeals();
  }, [companyId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        companyId,
        dealId,
        detectedType: meetingType,
        linkConfirmed: true,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save links:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompanySelect = (company: Company) => {
    setCompanyId(company.id);
    setSelectedCompanyName(company.name);
    setCompanySearch("");
    setCompanies([]);
    // Reset deal when company changes
    setDealId(null);
    setSelectedDealName(null);
  };

  const handleDealSelect = (deal: Deal) => {
    setDealId(deal.id);
    setSelectedDealName(deal.dealName);
  };

  const handleClearCompany = () => {
    setCompanyId(null);
    setSelectedCompanyName(null);
    setDealId(null);
    setSelectedDealName(null);
    setDeals([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Link Meeting</DialogTitle>
          <DialogDescription className="truncate">
            {eventTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Meeting Type */}
          <div className="space-y-2">
            <Label>Meeting Type</Label>
            {currentType && currentConfidence !== null && currentConfidence > 0 && (
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                <span>Auto-detected:</span>
                <MeetingTypeBadge type={currentType} confidence={currentConfidence} showConfidence />
              </div>
            )}
            <MeetingTypeSelector
              value={meetingType}
              onChange={setMeetingType}
              disabled={isSaving}
            />
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label>Company</Label>
            {companyId && selectedCompanyName ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <span className="font-medium">{selectedCompanyName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCompany}
                  disabled={isSaving}
                >
                  Clear
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  placeholder="Search companies..."
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  disabled={isSaving}
                />
                {companies.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-48 overflow-auto">
                    {companies.map((company) => (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => handleCompanySelect(company)}
                        className="w-full px-4 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        {company.name}
                      </button>
                    ))}
                  </div>
                )}
                {isLoadingCompanies && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 p-2 text-sm text-neutral-500 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    Searching...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Deal */}
          {companyId && (
            <div className="space-y-2">
              <Label>Deal (Optional)</Label>
              {isLoadingDeals ? (
                <div className="text-sm text-neutral-500">Loading deals...</div>
              ) : deals.length === 0 ? (
                <div className="text-sm text-neutral-500">No active deals for this company</div>
              ) : (
                <div className="space-y-2">
                  {deals.map((deal) => (
                    <button
                      key={deal.id}
                      type="button"
                      onClick={() => handleDealSelect(deal)}
                      disabled={isSaving}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors",
                        dealId === deal.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      )}
                    >
                      <span className="font-medium">{deal.dealName}</span>
                      <span className="text-sm text-neutral-500">{deal.stage}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
