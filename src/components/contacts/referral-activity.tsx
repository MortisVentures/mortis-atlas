"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  EnvelopeClosedIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ClockIcon,
  ReloadIcon,
  Share1Icon,
  HeartIcon,
  RocketIcon,
  TargetIcon,
} from "@radix-ui/react-icons";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface ReferredDeal {
  id: string;
  dealName: string;
  stage: string;
  amount: number | null;
  referralDate: string | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
  };
}

interface ReferredCompany {
  id: string;
  name: string;
  stage: string;
  sector: string | null;
  createdAt: string;
}

interface ReferralMetrics {
  totalReferrals: number;
  successfulReferrals: number;
  conversionRate: number | null;
  lastReferralDate: string | null;
  totalDealsReferred: number;
  totalCompaniesReferred: number;
  totalPipelineValue: number;
  wonDealsValue: number;
  wonDealsCount: number;
  pendingDealsCount: number;
  pendingPipelineValue: number;
}

interface ReferralData {
  contact: {
    id: string;
    name: string;
    email: string | null;
    role: string | null;
    company: { id: string; name: string } | null;
  };
  referrals: {
    deals: ReferredDeal[];
    companies: ReferredCompany[];
  };
  metrics: ReferralMetrics;
}

interface ReferralActivityProps {
  contactId: string;
  contactEmail?: string | null;
  contactName?: string;
}

// =============================================================================
// CONFIGS
// =============================================================================

const dealStageConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  INITIAL_REVIEW: { label: "Initial Review", color: "bg-slate-500/20 text-slate-400 border-slate-500/30", icon: <ClockIcon className="size-3" /> },
  MEETING_SCHEDULED: { label: "Meeting", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <ClockIcon className="size-3" /> },
  DEEP_DIVE: { label: "Deep Dive", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30", icon: <ClockIcon className="size-3" /> },
  PARTNER_REVIEW: { label: "Partner Review", color: "bg-violet-500/20 text-violet-400 border-violet-500/30", icon: <ClockIcon className="size-3" /> },
  TERM_SHEET: { label: "Term Sheet", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: <ClockIcon className="size-3" /> },
  LEGAL_DILIGENCE: { label: "Legal DD", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: <ClockIcon className="size-3" /> },
  CLOSED_WON: { label: "Closed Won", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: <CheckCircledIcon className="size-3" /> },
  CLOSED_LOST: { label: "Passed", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <CrossCircledIcon className="size-3" /> },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatCurrency(value: number | null | undefined, compact = true): string {
  if (value == null || value === 0) return "$0";
  if (compact) {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function MetricCard({
  label,
  value,
  subValue,
  icon,
  className,
}: {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("p-4 rounded-atlas-sm bg-muted/30", className)}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        {icon}
        <span className="uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-semibold font-mono">{value}</div>
      {subValue && <div className="text-xs text-muted-foreground mt-0.5">{subValue}</div>}
    </div>
  );
}

function ReferredDealItem({ deal }: { deal: ReferredDeal }) {
  const config = dealStageConfig[deal.stage] || {
    label: deal.stage,
    color: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    icon: <ClockIcon className="size-3" />,
  };

  const isWon = deal.stage === "CLOSED_WON";
  const isLost = deal.stage === "CLOSED_LOST";
  const isPending = !isWon && !isLost;

  return (
    <Link href={`/deals/${deal.id}`}>
      <div className="flex items-center gap-3 p-3 rounded-atlas-sm bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isWon && "bg-green-500/20 text-green-400",
          isLost && "bg-red-500/20 text-red-400",
          isPending && "bg-amber-500/20 text-amber-400"
        )}>
          {isWon && <CheckCircledIcon className="size-4" />}
          {isLost && <CrossCircledIcon className="size-4" />}
          {isPending && <ClockIcon className="size-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link href={`/companies/${deal.company.id}`} className="font-medium text-sm hover:text-tactical-400 transition-colors">
              {deal.company.name}
            </Link>
            <Badge variant="outline" size="xs" className={config.color}>
              {config.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span>{deal.dealName}</span>
            {deal.amount && <span>{formatCurrency(deal.amount)}</span>}
          </div>
        </div>
        <ChevronRightIcon className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}

function ReferredCompanyItem({ company }: { company: ReferredCompany }) {
  return (
    <Link href={`/companies/${company.id}`}>
      <div className="flex items-center gap-3 p-3 rounded-atlas-sm bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group">
        <div className="w-8 h-8 rounded-atlas-sm bg-navy-600/50 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
          {company.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{company.name}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {company.sector && <span>{company.sector}</span>}
            <span>Added {formatDate(company.createdAt)}</span>
          </div>
        </div>
        <ChevronRightIcon className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}

function EmptyState({ type }: { type: "deals" | "all" }) {
  return (
    <div className="text-center py-8">
      <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
        <Share1Icon className="size-6 text-muted-foreground" />
      </div>
      <h3 className="font-medium mb-1">No Referrals Yet</h3>
      <p className="text-sm text-muted-foreground">
        {type === "deals"
          ? "This contact hasn't referred any deals yet."
          : "Track referrals from this contact to measure their impact."}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <ReloadIcon className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
        <CrossCircledIcon className="size-6 text-red-400" />
      </div>
      <h3 className="font-medium mb-1">Failed to Load Referrals</h3>
      <p className="text-sm text-muted-foreground mb-4">
        There was an error loading referral data.
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <ReloadIcon className="size-4 mr-2" />
        Retry
      </Button>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ReferralActivity({ contactId, contactEmail, contactName }: ReferralActivityProps) {
  const [data, setData] = React.useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(true);

  const fetchReferrals = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/contacts/${contactId}/referrals?limit=10`);
      if (!response.ok) {
        throw new Error("Failed to fetch referrals");
      }
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [contactId]);

  React.useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const handleRequestReferral = () => {
    if (!contactEmail) return;
    const subject = encodeURIComponent("Introduction Request");
    const body = encodeURIComponent(
      `Hi ${contactName || "there"},\n\nI hope you're doing well! I wanted to reach out to see if you might know anyone who would be a good fit for...`
    );
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  const handleSendThankYou = () => {
    if (!contactEmail) return;
    const subject = encodeURIComponent("Thank You!");
    const body = encodeURIComponent(
      `Hi ${contactName || "there"},\n\nI wanted to take a moment to thank you for the recent introduction. Your referral has been incredibly valuable...`
    );
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  const hasReferrals = data && (data.metrics.totalDealsReferred > 0 || data.metrics.totalCompaniesReferred > 0);
  const hasSuccessfulReferrals = data && data.metrics.successfulReferrals > 0;

  return (
    <Card variant="raised">
      <CardHeader layout="row" withBorder>
        <div className="flex items-center gap-2">
          <TargetIcon className="size-5 text-tactical-400" />
          <CardTitle size="lg">Referral Activity</CardTitle>
          {data && data.metrics.totalReferrals > 0 && (
            <Badge variant="tactical" size="sm">
              {data.metrics.totalReferrals} referral{data.metrics.totalReferrals !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          {isExpanded ? <ChevronDownIcon className="size-5" /> : <ChevronRightIcon className="size-5" />}
        </button>
      </CardHeader>

      {isExpanded && (
        <CardContent padding="lg">
          {isLoading && <LoadingState />}

          {error && <ErrorState onRetry={fetchReferrals} />}

          {!isLoading && !error && data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard
                  label="Total Referrals"
                  value={data.metrics.totalReferrals}
                  icon={<Share1Icon className="size-3" />}
                />
                <MetricCard
                  label="Successful"
                  value={data.metrics.successfulReferrals}
                  subValue={data.metrics.conversionRate ? `${data.metrics.conversionRate.toFixed(0)}% conversion` : undefined}
                  icon={<CheckCircledIcon className="size-3" />}
                  className={data.metrics.successfulReferrals > 0 ? "bg-green-500/10" : undefined}
                />
                <MetricCard
                  label="Pipeline Generated"
                  value={formatCurrency(data.metrics.totalPipelineValue)}
                  subValue={data.metrics.pendingDealsCount > 0 ? `${data.metrics.pendingDealsCount} active` : undefined}
                  icon={<RocketIcon className="size-3" />}
                />
                <MetricCard
                  label="Won Value"
                  value={formatCurrency(data.metrics.wonDealsValue)}
                  subValue={data.metrics.wonDealsCount > 0 ? `${data.metrics.wonDealsCount} deals closed` : undefined}
                  icon={<TargetIcon className="size-3" />}
                  className={data.metrics.wonDealsValue > 0 ? "bg-green-500/10" : undefined}
                />
              </div>

              {/* Referred Deals */}
              {hasReferrals ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground">Referred Companies</h4>
                    {data.metrics.lastReferralDate && (
                      <span className="text-xs text-muted-foreground">
                        Last referral: {formatDate(data.metrics.lastReferralDate)}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {data.referrals.deals.map((deal) => (
                      <ReferredDealItem key={deal.id} deal={deal} />
                    ))}
                    {data.referrals.companies.length > 0 && data.referrals.deals.length === 0 && (
                      data.referrals.companies.map((company) => (
                        <ReferredCompanyItem key={company.id} company={company} />
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <EmptyState type="all" />
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRequestReferral}
                  disabled={!contactEmail}
                  className="flex-1"
                >
                  <EnvelopeClosedIcon className="size-4 mr-2" />
                  Request Referral
                </Button>
                {hasSuccessfulReferrals && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendThankYou}
                    disabled={!contactEmail}
                    className="flex-1"
                  >
                    <HeartIcon className="size-4 mr-2" />
                    Send Thank You
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
