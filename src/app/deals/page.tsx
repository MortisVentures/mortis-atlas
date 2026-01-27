"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  Cross2Icon,
  ReloadIcon,
  BarChartIcon,
  TargetIcon,
  ClockIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";
import { DealStage, DealPriority, DealSource } from "@prisma/client";

import {
  DashboardLayout,
  DashboardContent,
  PageHeader,
} from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDealsKanban } from "@/hooks/use-deals-kanban";
import { KanbanBoard } from "@/components/deals/kanban-board";
import {
  STAGE_CONFIG,
  PRIORITY_CONFIG,
  SOURCE_CONFIG,
  calculatePipelineMetrics,
  formatCurrency,
  ACTIVE_STAGES,
} from "@/lib/deals/pipeline-utils";

// =============================================================================
// FILTER OPTIONS
// =============================================================================

const PRIORITY_OPTIONS = [
  { value: "ALL", label: "All Priorities" },
  { value: "HIGH", label: "High Priority" },
  { value: "MEDIUM", label: "Medium Priority" },
  { value: "LOW", label: "Low Priority" },
] as const;

const SOURCE_OPTIONS = [
  { value: "ALL", label: "All Sources" },
  ...Object.entries(SOURCE_CONFIG).map(([key, config]) => ({
    value: key,
    label: config.label,
  })),
] as const;

// =============================================================================
// DEALS PAGE COMPONENT
// =============================================================================

export default function DealsPage() {
  const router = useRouter();

  // Kanban state management
  const {
    filteredDeals,
    dealsByStage,
    visibleStages,
    isLoading,
    error,
    filters,
    setFilters,
    resetFilters,
    fetchDeals,
    updateDealStage,
  } = useDealsKanban();

  // Calculate pipeline metrics
  const metrics = React.useMemo(
    () => calculatePipelineMetrics(filteredDeals),
    [filteredDeals]
  );

  // Active filters count
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.priority !== "ALL") count++;
    if (filters.source !== "ALL") count++;
    if (filters.showClosed) count++;
    return count;
  }, [filters]);

  // Handle add deal
  const handleAddDeal = React.useCallback(
    (stage: DealStage) => {
      router.push(`/deals/new?stage=${stage}`);
    },
    [router]
  );

  // Handle view deal
  const handleViewDeal = React.useCallback(
    (deal: { id: string }) => {
      router.push(`/deals/${deal.id}`);
    },
    [router]
  );

  // Handle stage change with optimistic update
  const handleStageChange = React.useCallback(
    async (dealId: string, newStage: DealStage): Promise<boolean> => {
      return updateDealStage(dealId, newStage);
    },
    [updateDealStage]
  );

  return (
    <DashboardLayout>
      <DashboardContent>
        {/* Page Header */}
        <PageHeader
          title="Deal Pipeline"
          description="Track and manage your investment pipeline"
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchDeals()}
                disabled={isLoading}
              >
                <ReloadIcon
                  className={cn("size-4", isLoading && "animate-spin")}
                />
              </Button>
              <Link href="/deals/new">
                <Button className="gap-2">
                  <PlusIcon className="size-4" />
                  New Deal
                </Button>
              </Link>
            </div>
          }
        />

        {/* Main Content */}
        <div className="space-y-6">
          {/* Pipeline Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-4 gap-4"
          >
            {/* Total Deals */}
            <Card variant="raised" padding="md" rounded="md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <TargetIcon className="size-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.totalDeals}</div>
                  <div className="text-xs text-muted-foreground">Active Deals</div>
                </div>
              </div>
            </Card>

            {/* Total Pipeline Value */}
            <Card variant="raised" padding="md" rounded="md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <BarChartIcon className="size-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(metrics.totalValue)}
                  </div>
                  <div className="text-xs text-muted-foreground">Pipeline Value</div>
                </div>
              </div>
            </Card>

            {/* Weighted Value */}
            <Card variant="raised" padding="md" rounded="md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <ClockIcon className="size-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(metrics.weightedValue)}
                  </div>
                  <div className="text-xs text-muted-foreground">Weighted Value</div>
                </div>
              </div>
            </Card>

            {/* High Priority */}
            <Card variant="raised" padding="md" rounded="md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <CheckCircledIcon className="size-5 text-red-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {metrics.byPriority.HIGH}
                  </div>
                  <div className="text-xs text-muted-foreground">High Priority</div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center gap-3"
          >
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search deals or companies..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="pl-10"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters({ search: "" })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Cross2Icon className="size-4" />
                </button>
              )}
            </div>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters({ priority: e.target.value as DealPriority | "ALL" })
              }
              className="appearance-none bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tactical-500"
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Source Filter */}
            <select
              value={filters.source}
              onChange={(e) =>
                setFilters({ source: e.target.value as DealSource | "ALL" })
              }
              className="appearance-none bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tactical-500"
            >
              {SOURCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Show Closed Toggle */}
            <button
              onClick={() => setFilters({ showClosed: !filters.showClosed })}
              className={cn(
                "px-3 py-2 text-sm rounded-lg border transition-colors",
                filters.showClosed
                  ? "bg-tactical-500/10 border-tactical-500/30 text-tactical-400"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              Show Closed
            </button>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear ({activeFiltersCount})
              </Button>
            )}
          </motion.div>

          {/* Stage Quick Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-wrap items-center gap-2"
          >
            {ACTIVE_STAGES.map((stage) => {
              const config = STAGE_CONFIG[stage];
              const count = dealsByStage.get(stage)?.length || 0;

              return (
                <Badge
                  key={stage}
                  size="sm"
                  className={cn(
                    config.bgColor,
                    config.borderColor,
                    config.textColor,
                    "border cursor-default"
                  )}
                >
                  {config.shortLabel} ({count})
                </Badge>
              );
            })}
          </motion.div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400"
            >
              <p className="text-sm font-medium">Error loading deals</p>
              <p className="text-xs mt-1">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchDeals()}
                className="mt-2"
              >
                Try Again
              </Button>
            </motion.div>
          )}

          {/* Kanban Board */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <KanbanBoard
              dealsByStage={dealsByStage}
              visibleStages={visibleStages}
              isLoading={isLoading}
              onStageChange={handleStageChange}
              onAddDeal={handleAddDeal}
              onViewDeal={handleViewDeal}
            />
          </motion.div>

          {/* Empty State */}
          {!isLoading && !error && filteredDeals.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <TargetIcon className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No deals found</h3>
              <p className="text-muted-foreground mb-4">
                {activeFiltersCount > 0
                  ? "Try adjusting your filters"
                  : "Get started by adding your first deal"}
              </p>
              {activeFiltersCount > 0 ? (
                <Button variant="outline" onClick={resetFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Link href="/deals/new">
                  <Button>
                    <PlusIcon className="size-4 mr-2" />
                    Add Your First Deal
                  </Button>
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </DashboardContent>
    </DashboardLayout>
  );
}
