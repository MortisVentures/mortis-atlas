"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EnvelopeClosedIcon,
  PersonIcon,
  CalendarIcon,
  BackpackIcon,
  RocketIcon,
  PaperPlaneIcon,
  LightningBoltIcon,
  ArchiveIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@radix-ui/react-icons";

import { Card } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  SourceType,
  DealSource,
  sourceTypeConfig,
  ACCELERATORS,
  UNIVERSITIES,
  SAMPLE_REFERRERS,
  Referrer,
} from "@/lib/deals/source-tracking";

// =============================================================================
// ICON MAPPING
// =============================================================================

const sourceIcons: Record<SourceType, React.ReactNode> = {
  INBOUND: <EnvelopeClosedIcon className="size-4" />,
  REFERRAL: <PersonIcon className="size-4" />,
  CONFERENCE: <CalendarIcon className="size-4" />,
  CO_INVESTOR: <BackpackIcon className="size-4" />,
  PORTFOLIO_REFERRAL: <RocketIcon className="size-4" />,
  COLD_OUTREACH: <PaperPlaneIcon className="size-4" />,
  ACCELERATOR: <LightningBoltIcon className="size-4" />,
  UNIVERSITY: <ArchiveIcon className="size-4" />,
};

// =============================================================================
// SOURCE INPUT COMPONENT
// =============================================================================

interface SourceInputProps {
  value?: Partial<DealSource>;
  onChange: (source: Partial<DealSource>) => void;
  portfolioCompanies?: { id: string; name: string }[];
}

export function SourceInput({
  value,
  onChange,
  portfolioCompanies = [],
}: SourceInputProps) {
  const [selectedType, setSelectedType] = React.useState<SourceType | null>(value?.type || null);
  const [showReferrerSearch, setShowReferrerSearch] = React.useState(false);
  const [referrerSearch, setReferrerSearch] = React.useState("");

  const handleTypeSelect = (type: SourceType) => {
    setSelectedType(type);
    onChange({ ...value, type, id: `src-${Date.now()}`, createdAt: new Date().toISOString() });
  };

  const handleReferrerSelect = (referrer: Referrer) => {
    onChange({
      ...value,
      referrerContactId: referrer.id,
      referrerName: referrer.name,
    });
    setShowReferrerSearch(false);
  };

  const filteredReferrers = SAMPLE_REFERRERS.filter(r =>
    r.name.toLowerCase().includes(referrerSearch.toLowerCase()) ||
    r.company?.toLowerCase().includes(referrerSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Source Type Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">How did this deal come to us?</label>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(sourceTypeConfig) as SourceType[]).map((type) => {
            const config = sourceTypeConfig[type];
            const isSelected = selectedType === type;

            return (
              <button
                key={type}
                onClick={() => handleTypeSelect(type)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-atlas-md border transition-all text-center",
                  isSelected
                    ? config.color
                    : "border-border hover:border-muted-foreground text-muted-foreground hover:text-foreground"
                )}
              >
                {sourceIcons[type]}
                <span className="text-xs font-medium">{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Type-specific fields */}
      <AnimatePresence mode="wait">
        {selectedType && (
          <motion.div
            key={selectedType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 p-4 bg-muted/20 rounded-atlas-md border border-border"
          >
            {/* INBOUND */}
            {selectedType === "INBOUND" && (
              <div>
                <label className="block text-sm font-medium mb-2">Channel</label>
                <div className="flex flex-wrap gap-2">
                  {["Website", "Email", "LinkedIn", "Twitter", "Other"].map((channel) => (
                    <button
                      key={channel}
                      onClick={() => onChange({ ...value, channel })}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-atlas-sm border transition-all",
                        value?.channel === channel
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : "border-border text-muted-foreground hover:border-muted-foreground"
                      )}
                    >
                      {channel}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* REFERRAL */}
            {selectedType === "REFERRAL" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Referrer</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowReferrerSearch(!showReferrerSearch)}
                      className="w-full flex items-center justify-between bg-background border border-input rounded-atlas-md px-4 py-2 text-sm"
                    >
                      <span className={value?.referrerName ? "" : "text-muted-foreground"}>
                        {value?.referrerName || "Select or add referrer..."}
                      </span>
                      <ChevronDownIcon className="size-4 text-muted-foreground" />
                    </button>

                    <AnimatePresence>
                      {showReferrerSearch && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-atlas-md shadow-lg z-10 overflow-hidden"
                        >
                          <div className="p-2 border-b border-border">
                            <div className="relative">
                              <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                              <input
                                type="text"
                                value={referrerSearch}
                                onChange={(e) => setReferrerSearch(e.target.value)}
                                placeholder="Search referrers..."
                                className="w-full bg-muted/50 rounded pl-8 pr-3 py-1.5 text-sm focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredReferrers.map((referrer) => (
                              <button
                                key={referrer.id}
                                onClick={() => handleReferrerSelect(referrer)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                              >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-xs font-medium">
                                  {referrer.name.split(" ").map(n => n[0]).join("")}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{referrer.name}</div>
                                  <div className="text-xs text-muted-foreground truncate">{referrer.company}</div>
                                </div>
                                <Badge variant="secondary" size="xs">
                                  {referrer.successfulReferrals} won
                                </Badge>
                              </button>
                            ))}
                            <button
                              onClick={() => {
                                onChange({ ...value, referrerName: referrerSearch });
                                setShowReferrerSearch(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-tactical-400 hover:bg-muted transition-colors"
                            >
                              <PlusIcon className="size-4" />
                              Add &quot;{referrerSearch}&quot; as new referrer
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {/* CONFERENCE */}
            {selectedType === "CONFERENCE" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Event Name</label>
                  <Input
                    value={value?.eventName || ""}
                    onChange={(e) => onChange({ ...value, eventName: e.target.value })}
                    placeholder="e.g., TechCrunch Disrupt"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Event Date</label>
                  <input
                    type="date"
                    value={value?.eventDate?.split("T")[0] || ""}
                    onChange={(e) => onChange({ ...value, eventDate: e.target.value })}
                    className="w-full bg-background border border-input rounded-atlas-md px-4 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            {/* CO_INVESTOR */}
            {selectedType === "CO_INVESTOR" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Fund Name</label>
                  <Input
                    value={value?.coInvestorFund || ""}
                    onChange={(e) => onChange({ ...value, coInvestorFund: e.target.value })}
                    placeholder="e.g., Sequoia Capital"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Person (optional)</label>
                  <Input
                    value={value?.referrerName || ""}
                    onChange={(e) => onChange({ ...value, referrerName: e.target.value })}
                    placeholder="e.g., Partner name"
                  />
                </div>
              </div>
            )}

            {/* PORTFOLIO_REFERRAL */}
            {selectedType === "PORTFOLIO_REFERRAL" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Portfolio Company</label>
                  <div className="relative">
                    <select
                      value={value?.portfolioCompanyId || ""}
                      onChange={(e) => {
                        const selected = portfolioCompanies.find(c => c.id === e.target.value);
                        onChange({
                          ...value,
                          portfolioCompanyId: e.target.value,
                          portfolioCompanyName: selected?.name,
                        });
                      }}
                      className="w-full appearance-none bg-background border border-input rounded-atlas-md px-4 py-2 pr-8 text-sm"
                    >
                      <option value="">Select portfolio company...</option>
                      {portfolioCompanies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Referrer Name</label>
                  <Input
                    value={value?.referrerName || ""}
                    onChange={(e) => onChange({ ...value, referrerName: e.target.value })}
                    placeholder="e.g., CEO name"
                  />
                </div>
              </div>
            )}

            {/* COLD_OUTREACH */}
            {selectedType === "COLD_OUTREACH" && (
              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <textarea
                  value={value?.notes || ""}
                  onChange={(e) => onChange({ ...value, notes: e.target.value })}
                  placeholder="How did you find this company?"
                  rows={2}
                  className="w-full bg-background border border-input rounded-atlas-md px-4 py-2 text-sm resize-none"
                />
              </div>
            )}

            {/* ACCELERATOR */}
            {selectedType === "ACCELERATOR" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Accelerator</label>
                  <div className="relative">
                    <select
                      value={value?.acceleratorName || ""}
                      onChange={(e) => onChange({ ...value, acceleratorName: e.target.value })}
                      className="w-full appearance-none bg-background border border-input rounded-atlas-md px-4 py-2 pr-8 text-sm"
                    >
                      <option value="">Select accelerator...</option>
                      {ACCELERATORS.map((acc) => (
                        <option key={acc} value={acc}>
                          {acc}
                        </option>
                      ))}
                      <option value="other">Other</option>
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Batch/Cohort</label>
                  <Input
                    value={value?.acceleratorBatch || ""}
                    onChange={(e) => onChange({ ...value, acceleratorBatch: e.target.value })}
                    placeholder="e.g., W24, Boulder 2024"
                  />
                </div>
              </div>
            )}

            {/* UNIVERSITY */}
            {selectedType === "UNIVERSITY" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">University</label>
                  <div className="relative">
                    <select
                      value={value?.universityName || ""}
                      onChange={(e) => onChange({ ...value, universityName: e.target.value })}
                      className="w-full appearance-none bg-background border border-input rounded-atlas-md px-4 py-2 pr-8 text-sm"
                    >
                      <option value="">Select university...</option>
                      {UNIVERSITIES.map((uni) => (
                        <option key={uni} value={uni}>
                          {uni}
                        </option>
                      ))}
                      <option value="other">Other</option>
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Faculty Contact (optional)</label>
                  <Input
                    value={value?.referrerName || ""}
                    onChange={(e) => onChange({ ...value, referrerName: e.target.value })}
                    placeholder="e.g., Professor name"
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// SOURCE BADGE COMPONENT
// =============================================================================

interface SourceBadgeProps {
  source: DealSource;
  showDetails?: boolean;
  size?: "sm" | "md";
}

export function SourceBadge({ source, showDetails = false, size = "sm" }: SourceBadgeProps) {
  const config = sourceTypeConfig[source.type];

  const getDetailText = () => {
    switch (source.type) {
      case "REFERRAL":
        return source.referrerName;
      case "CONFERENCE":
        return source.eventName;
      case "CO_INVESTOR":
        return source.coInvestorFund;
      case "PORTFOLIO_REFERRAL":
        return source.portfolioCompanyName;
      case "ACCELERATOR":
        return source.acceleratorName;
      case "UNIVERSITY":
        return source.universityName;
      case "INBOUND":
        return source.channel;
      default:
        return null;
    }
  };

  const detail = getDetailText();

  return (
    <div className={cn("flex items-center gap-2", size === "md" && "text-base")}>
      <Badge className={config.color} size={size === "sm" ? "xs" : "sm"}>
        {sourceIcons[source.type]}
        <span className="ml-1">{config.label}</span>
      </Badge>
      {showDetails && detail && (
        <span className={cn("text-muted-foreground", size === "sm" ? "text-xs" : "text-sm")}>
          via {detail}
        </span>
      )}
    </div>
  );
}

// =============================================================================
// SOURCE SUMMARY CARD
// =============================================================================

interface SourceSummaryCardProps {
  source: DealSource;
  dealCount?: number;
  conversionRate?: number;
  onClick?: () => void;
}

export function SourceSummaryCard({ source, dealCount = 0, conversionRate = 0, onClick }: SourceSummaryCardProps) {
  const config = sourceTypeConfig[source.type];

  return (
    <Card
      variant="raised"
      className={cn("p-4 cursor-pointer transition-all hover:shadow-md", onClick && "hover:scale-[1.02]")}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-atlas-sm flex items-center justify-center", config.color)}>
          {sourceIcons[source.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{config.label}</div>
          {source.referrerName && (
            <div className="text-xs text-muted-foreground truncate">{source.referrerName}</div>
          )}
          {source.eventName && (
            <div className="text-xs text-muted-foreground truncate">{source.eventName}</div>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="text-muted-foreground">{dealCount} deals</span>
            <span className={cn(conversionRate >= 0.3 ? "text-emerald-400" : "text-muted-foreground")}>
              {(conversionRate * 100).toFixed(0)}% conversion
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
