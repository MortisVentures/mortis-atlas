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

// =============================================================================
// TYPES
// =============================================================================

type MemoStatus = "DRAFT" | "PENDING_VOTE" | "APPROVED" | "REJECTED" | "ARCHIVED";

interface ICMemo {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  sector: string;
  dealId: string | null;
  status: MemoStatus;
  investmentAmount: number;
  preMoneyValuation: number;
  ownershipTarget: number;
  author: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
  votingDeadline: string | null;
  votes: {
    yes: number;
    no: number;
    abstain: number;
    total: number;
    quorum: number;
  };
  version: number;
}

// =============================================================================
// SAMPLE DATA
// =============================================================================

const sampleMemos: ICMemo[] = [];

// =============================================================================
// STATUS CONFIG
// =============================================================================

const statusConfig: Record<MemoStatus, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT: {
    label: "Draft",
    color: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    icon: <Pencil1Icon className="size-3.5" />,
  },
  PENDING_VOTE: {
    label: "Pending Vote",
    color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    icon: <ClockIcon className="size-3.5" />,
  },
  APPROVED: {
    label: "Approved",
    color: "bg-tactical-500/20 text-tactical-300 border-tactical-500/30",
    icon: <CheckCircledIcon className="size-3.5" />,
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-500/20 text-red-300 border-red-500/30",
    icon: <CrossCircledIcon className="size-3.5" />,
  },
  ARCHIVED: {
    label: "Archived",
    color: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30",
    icon: <FileTextIcon className="size-3.5" />,
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatCurrency(value: number, compact = true): string {
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
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return formatDate(dateString);
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

function StatusBadge({ status }: { status: MemoStatus }) {
  const config = statusConfig[status];
  return (
    <Badge className={cn("gap-1.5", config.color)} size="sm">
      {config.icon}
      {config.label}
    </Badge>
  );
}

function VotingProgress({ votes }: { votes: ICMemo["votes"] }) {
  const total = votes.yes + votes.no + votes.abstain;
  const quorumPercent = Math.min(100, (total / votes.quorum) * 100);
  const _yesPercent = total > 0 ? (votes.yes / total) * 100 : 0;
  const _noPercent = total > 0 ? (votes.no / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {total} of {votes.quorum} votes ({votes.quorum - total} needed)
        </span>
        <span className={cn(total >= votes.quorum ? "text-tactical-400" : "text-muted-foreground")}>
          {total >= votes.quorum ? "Quorum reached" : "Quorum pending"}
        </span>
      </div>
      {/* Quorum bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-navy-500 to-tactical-500 transition-all"
          style={{ width: `${quorumPercent}%` }}
        />
      </div>
      {/* Vote breakdown */}
      {total > 0 && (
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-tactical-500" />
            Yes: {votes.yes}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            No: {votes.no}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            Abstain: {votes.abstain}
          </span>
        </div>
      )}
    </div>
  );
}

function MemoCard({ memo }: { memo: ICMemo }) {
  const daysUntilDeadline = getDaysUntilDeadline(memo.votingDeadline);

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
                  <Badge variant="ghost" size="xs">v{memo.version}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link
                    href={`/companies/${memo.companyId}`}
                    className="hover:text-foreground transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {memo.companyName}
                  </Link>
                  <span>•</span>
                  <span>{memo.sector}</span>
                </div>
              </div>
              <StatusBadge status={memo.status} />
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-y border-border">
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Investment</div>
                <div className="font-mono font-semibold">{formatCurrency(memo.investmentAmount)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Pre-Money</div>
                <div className="font-mono font-semibold">{formatCurrency(memo.preMoneyValuation)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Target %</div>
                <div className="font-mono font-semibold">{memo.ownershipTarget}%</div>
              </div>
            </div>

            {/* Voting Progress (for pending votes) */}
            {memo.status === "PENDING_VOTE" && (
              <div className="mb-4">
                <VotingProgress votes={memo.votes} />
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-navy-500 to-tactical-500 flex items-center justify-center text-white text-[10px] font-medium">
                  {memo.author.split(" ").map((n) => n[0]).join("")}
                </div>
                <span>{memo.author}</span>
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
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { direction: "up" | "down"; value: string };
}) {
  return (
    <Card variant="raised">
      <CardContent padding="md" className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-atlas-md bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-2xl font-semibold font-mono">{value}</div>
        </div>
        {trend && (
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

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function ICMemosPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<MemoStatus | "ALL">("ALL");

  // Filter memos
  const filteredMemos = React.useMemo(() => {
    return sampleMemos.filter((memo) => {
      const matchesSearch =
        searchQuery === "" ||
        memo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memo.companyName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || memo.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  // Calculate stats
  const stats = React.useMemo(() => {
    const pending = sampleMemos.filter((m) => m.status === "PENDING_VOTE").length;
    const approved = sampleMemos.filter((m) => m.status === "APPROVED").length;
    const totalInvestment = sampleMemos
      .filter((m) => m.status === "APPROVED")
      .reduce((sum, m) => sum + m.investmentAmount, 0);

    return { pending, approved, totalInvestment };
  }, []);

  const statusCounts = React.useMemo(() => {
    return {
      ALL: sampleMemos.length,
      DRAFT: sampleMemos.filter((m) => m.status === "DRAFT").length,
      PENDING_VOTE: sampleMemos.filter((m) => m.status === "PENDING_VOTE").length,
      APPROVED: sampleMemos.filter((m) => m.status === "APPROVED").length,
      REJECTED: sampleMemos.filter((m) => m.status === "REJECTED").length,
    };
  }, []);

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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Pending Votes"
            value={stats.pending}
            icon={<ClockIcon className="size-5" />}
          />
          <StatCard
            title="Approved This Quarter"
            value={stats.approved}
            icon={<CheckCircledIcon className="size-5" />}
            trend={{ direction: "up", value: "2 vs Q3" }}
          />
          <StatCard
            title="Total Committed"
            value={formatCurrency(stats.totalInvestment)}
            icon={<FileTextIcon className="size-5" />}
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
        {filteredMemos.length > 0 ? (
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
