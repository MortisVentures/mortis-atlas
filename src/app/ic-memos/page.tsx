"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FileTextIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ClockIcon,
  Pencil1Icon,
  DownloadIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";

import {
  DashboardLayout,
  DashboardContent,
  PageHeader,
} from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useICMemos, type ICMemoFromAPI } from "@/hooks/use-ic-memos";
import { ICMemoStatus } from "@prisma/client";
import {
  STATUS_CONFIG,
  RECOMMENDATION_CONFIG,
} from "@/lib/validations/ic-memo";

// =============================================================================
// STATUS CONFIG
// =============================================================================

const statusIconMap: Record<ICMemoStatus, React.ReactNode> = {
  DRAFT: <Pencil1Icon className="size-3.5" />,
  SUBMITTED: <ClockIcon className="size-3.5" />,
  UNDER_REVIEW: <ClockIcon className="size-3.5" />,
  PENDING_VOTE: <ClockIcon className="size-3.5" />,
  APPROVED: <CheckCircledIcon className="size-3.5" />,
  REJECTED: <CrossCircledIcon className="size-3.5" />,
  WITHDRAWN: <FileTextIcon className="size-3.5" />,
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatCurrency(value: number | string | null | undefined, compact = true): string {
  if (value === null || value === undefined) return "-";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "-";

  if (compact) {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(num);
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  const now = new Date();
  const deadlineDate = new Date(deadline);
  return Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// =============================================================================
// COMPONENTS
// =============================================================================

function StatusBadge({ status }: { status: ICMemoStatus }) {
  const config = STATUS_CONFIG[status];
  const icon = statusIconMap[status];
  return (
    <Badge className={cn("gap-1.5", config.color)} size="sm">
      {icon}
      {config.label}
    </Badge>
  );
}

function VotingProgress({ votes }: { votes: ICMemoFromAPI["votes"] }) {
  const yes = votes.filter((v) => v.vote === "YES").length;
  const no = votes.filter((v) => v.vote === "NO").length;
  const abstain = votes.filter((v) => v.vote === "ABSTAIN").length;
  const total = votes.length;
  const quorum = 3; // Configurable quorum

  const quorumPercent = Math.min(100, (total / quorum) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {total} of {quorum} votes ({Math.max(0, quorum - total)} needed)
        </span>
        <span className={cn(total >= quorum ? "text-tactical-400" : "text-muted-foreground")}>
          {total >= quorum ? "Quorum reached" : "Quorum pending"}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-navy-500 to-tactical-500 transition-all"
          style={{ width: `${quorumPercent}%` }}
        />
      </div>
      {total > 0 && (
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-tactical-500" />
            Yes: {yes}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            No: {no}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            Abstain: {abstain}
          </span>
        </div>
      )}
    </div>
  );
}

function MemoCard({ memo }: { memo: ICMemoFromAPI }) {
  const daysUntilDeadline = getDaysUntilDeadline(memo.votingDeadline);
  const authorName = memo.author.name || memo.author.email || "Unknown";
  const authorInitials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/ic-memos/${memo.id}`}>
        <Card
          variant="raised"
          interactive
          className="hover:shadow-lg transition-shadow"
        >
          <CardContent padding="lg">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{memo.title}</h3>
                  {memo.memoRecommendation && (
                    <Badge
                      className={cn("text-xs", RECOMMENDATION_CONFIG[memo.memoRecommendation].color)}
                      size="xs"
                    >
                      {RECOMMENDATION_CONFIG[memo.memoRecommendation].label}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link
                    href={`/companies/${memo.company.id}`}
                    className="hover:text-foreground transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {memo.company.name}
                  </Link>
                  {memo.company.sector && (
                    <>
                      <span>•</span>
                      <span>{memo.company.sector}</span>
                    </>
                  )}
                  {memo.focusArea && (
                    <>
                      <span>•</span>
                      <span>{memo.focusArea}</span>
                    </>
                  )}
                </div>
              </div>
              <StatusBadge status={memo.status} />
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-y border-border">
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Investment</div>
                <div className="font-mono font-semibold">{formatCurrency(memo.mortisInvestment)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Pre-Money</div>
                <div className="font-mono font-semibold">{formatCurrency(memo.preMoneyValuation)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Ownership</div>
                <div className="font-mono font-semibold">
                  {memo.mortisOwnership
                    ? `${(parseFloat(memo.mortisOwnership) * 100).toFixed(1)}%`
                    : "-"}
                </div>
              </div>
            </div>

            {/* Voting Progress (for pending votes) */}
            {(memo.status === "PENDING_VOTE" || memo.status === "SUBMITTED" || memo.status === "UNDER_REVIEW") && memo.votes.length > 0 && (
              <div className="mb-4">
                <VotingProgress votes={memo.votes} />
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-navy-500 to-tactical-500 flex items-center justify-center text-white text-[10px] font-medium">
                  {authorInitials}
                </div>
                <span>{authorName}</span>
              </div>
              <div className="flex items-center gap-3">
                {memo.status === "PENDING_VOTE" && daysUntilDeadline !== null && (
                  <span
                    className={cn(
                      "font-medium",
                      daysUntilDeadline <= 2 ? "text-red-400" : "text-amber-400"
                    )}
                  >
                    {daysUntilDeadline} days left
                  </span>
                )}
                <span>Updated {formatRelativeDate(memo.updatedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { direction: "up" | "down"; value: string };
  isLoading?: boolean;
}) {
  return (
    <Card variant="raised">
      <CardContent padding="md" className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-atlas-md bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          {isLoading ? (
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          ) : (
            <div className="text-2xl font-semibold font-mono">{value}</div>
          )}
        </div>
        {trend && !isLoading && (
          <div
            className={cn(
              "ml-auto text-sm font-medium",
              trend.direction === "up" ? "text-tactical-400" : "text-red-400"
            )}
          >
            {trend.direction === "up" ? "↑" : "↓"} {trend.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FilterTab({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-atlas-sm transition-all flex items-center gap-2",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            "px-1.5 py-0.5 rounded text-xs font-mono",
            active ? "bg-white/20" : "bg-muted"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} variant="raised">
          <CardContent padding="lg">
            <div className="animate-pulse space-y-4">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-48 bg-muted rounded" />
                  <div className="h-4 w-32 bg-muted rounded" />
                </div>
                <div className="h-6 w-20 bg-muted rounded" />
              </div>
              <div className="grid grid-cols-3 gap-4 py-3 border-y border-border">
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-muted rounded" />
                  <div className="h-5 w-20 bg-muted rounded" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-muted rounded" />
                  <div className="h-5 w-20 bg-muted rounded" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-muted rounded" />
                  <div className="h-5 w-20 bg-muted rounded" />
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
                <div className="h-4 w-20 bg-muted rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function ICMemosPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ICMemoStatus | "ALL">("ALL");

  const { memos, isLoading, error, stats: _stats, refetch } = useICMemos({
    search: searchQuery || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  // Filter memos client-side for immediate feedback while typing
  const filteredMemos = React.useMemo(() => {
    if (!searchQuery) return memos;
    const query = searchQuery.toLowerCase();
    return memos.filter(
      (memo) =>
        memo.title.toLowerCase().includes(query) ||
        memo.company.name.toLowerCase().includes(query)
    );
  }, [memos, searchQuery]);

  // Calculate stats from fetched data
  const calculatedStats = React.useMemo(() => {
    const pending = memos.filter((m) =>
      ["PENDING_VOTE", "SUBMITTED", "UNDER_REVIEW"].includes(m.status)
    ).length;
    const approved = memos.filter((m) => m.status === "APPROVED").length;
    const totalInvestment = memos
      .filter((m) => m.status === "APPROVED")
      .reduce((sum, m) => {
        const investment = m.mortisInvestment ? parseFloat(m.mortisInvestment) : 0;
        return sum + investment;
      }, 0);

    return { pending, approved, totalInvestment };
  }, [memos]);

  const statusCounts = React.useMemo(() => {
    return {
      ALL: memos.length,
      DRAFT: memos.filter((m) => m.status === "DRAFT").length,
      SUBMITTED: memos.filter((m) => ["SUBMITTED", "UNDER_REVIEW"].includes(m.status)).length,
      PENDING_VOTE: memos.filter((m) => m.status === "PENDING_VOTE").length,
      APPROVED: memos.filter((m) => m.status === "APPROVED").length,
      REJECTED: memos.filter((m) => m.status === "REJECTED").length,
    };
  }, [memos]);

  return (
    <DashboardLayout>
      <DashboardContent>
        <PageHeader
          title="IC Memos"
          description="Investment Committee memos and voting"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "IC Memos" },
          ]}
        />

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-atlas-md text-red-400 flex items-center justify-between">
            <span>Error loading IC memos: {error}</span>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <ReloadIcon className="size-4 mr-2" />
              Retry
            </Button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Pending Votes"
            value={calculatedStats.pending}
            icon={<ClockIcon className="size-5" />}
            isLoading={isLoading}
          />
          <StatCard
            title="Approved This Quarter"
            value={calculatedStats.approved}
            icon={<CheckCircledIcon className="size-5" />}
            isLoading={isLoading}
          />
          <StatCard
            title="Total Committed"
            value={formatCurrency(calculatedStats.totalInvestment)}
            icon={<FileTextIcon className="size-5" />}
            isLoading={isLoading}
          />
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search memos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <DownloadIcon className="size-4 mr-2" />
              Export
            </Button>
            <Link href="/ic-memos/new">
              <Button size="sm">
                <PlusIcon className="size-4 mr-2" />
                New IC Memo
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-muted/30 rounded-atlas-md w-fit">
          <FilterTab
            active={statusFilter === "ALL"}
            onClick={() => setStatusFilter("ALL")}
            count={statusCounts.ALL}
          >
            All
          </FilterTab>
          <FilterTab
            active={statusFilter === "DRAFT"}
            onClick={() => setStatusFilter("DRAFT")}
            count={statusCounts.DRAFT}
          >
            Drafts
          </FilterTab>
          <FilterTab
            active={statusFilter === "PENDING_VOTE"}
            onClick={() => setStatusFilter("PENDING_VOTE")}
            count={statusCounts.PENDING_VOTE}
          >
            Pending Vote
          </FilterTab>
          <FilterTab
            active={statusFilter === "APPROVED"}
            onClick={() => setStatusFilter("APPROVED")}
            count={statusCounts.APPROVED}
          >
            Approved
          </FilterTab>
          <FilterTab
            active={statusFilter === "REJECTED"}
            onClick={() => setStatusFilter("REJECTED")}
            count={statusCounts.REJECTED}
          >
            Rejected
          </FilterTab>
        </div>

        {/* Memo List */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredMemos.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMemos.map((memo) => (
              <MemoCard key={memo.id} memo={memo} />
            ))}
          </div>
        ) : (
          <Card variant="raised">
            <CardContent padding="lg" className="text-center py-12">
              <FileTextIcon className="size-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No memos found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Create your first IC memo to get started"}
              </p>
              <Link href="/ic-memos/new">
                <Button>
                  <PlusIcon className="size-4 mr-2" />
                  Create IC Memo
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </DashboardContent>
    </DashboardLayout>
  );
}
