"use client";

import * as React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import { PlusIcon } from "@radix-ui/react-icons";
import { DealStage } from "@prisma/client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DealWithRelations } from "@/lib/db/deals";
import { SortableDealCard, DealCardSkeleton } from "./deal-card";
import {
  STAGE_CONFIG,
  formatCurrency,
  isClosedStage,
} from "@/lib/deals/pipeline-utils";

// =============================================================================
// TYPES
// =============================================================================

export interface StageColumnProps {
  stage: DealStage;
  deals: DealWithRelations[];
  isLoading?: boolean;
  onAddDeal?: (stage: DealStage) => void;
  onViewDeal?: (deal: DealWithRelations) => void;
  compact?: boolean;
}

// =============================================================================
// STAGE COLUMN COMPONENT
// =============================================================================

export function StageColumn({
  stage,
  deals,
  isLoading = false,
  onAddDeal,
  onViewDeal,
  compact = false,
}: StageColumnProps) {
  const config = STAGE_CONFIG[stage];
  const isClosed = isClosedStage(stage);

  // Calculate column metrics
  const dealCount = deals.length;
  const totalValue = deals.reduce(
    (sum, deal) => sum + (deal.amount ? Number(deal.amount) : 0),
    0
  );

  // Droppable setup
  const { isOver, setNodeRef } = useDroppable({
    id: stage,
  });

  // Item IDs for sortable context
  const itemIds = deals.map((deal) => deal.id);

  return (
    <div
      className={cn(
        "flex flex-col h-full min-w-[280px] max-w-[320px]",
        compact && "min-w-[240px] max-w-[280px]"
      )}
    >
      {/* Column Header */}
      <div className="flex-shrink-0 mb-3">
        <Card
          variant="subtle"
          padding="sm"
          rounded="md"
          className={cn(
            "border-l-4",
            config.color === "slate" && "border-l-slate-500",
            config.color === "blue" && "border-l-blue-500",
            config.color === "indigo" && "border-l-indigo-500",
            config.color === "purple" && "border-l-purple-500",
            config.color === "amber" && "border-l-amber-500",
            config.color === "orange" && "border-l-orange-500",
            config.color === "emerald" && "border-l-emerald-500",
            config.color === "red" && "border-l-red-500"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-foreground">
                {config.shortLabel}
              </h3>
              <Badge
                size="xs"
                variant="ghost"
                className="tabular-nums"
              >
                {dealCount}
              </Badge>
            </div>

            {/* Add Deal Button */}
            {!isClosed && onAddDeal && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onAddDeal(stage)}
              >
                <PlusIcon className="size-3.5" />
              </Button>
            )}
          </div>

          {/* Total Value */}
          {totalValue > 0 && (
            <div className="mt-1.5 text-xs text-muted-foreground">
              {formatCurrency(totalValue)} total
            </div>
          )}

          {/* Probability Indicator */}
          {!isClosed && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Probability</span>
                <span>{config.probability}%</span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    config.color === "slate" && "bg-slate-500",
                    config.color === "blue" && "bg-blue-500",
                    config.color === "indigo" && "bg-indigo-500",
                    config.color === "purple" && "bg-purple-500",
                    config.color === "amber" && "bg-amber-500",
                    config.color === "orange" && "bg-orange-500",
                    config.color === "emerald" && "bg-emerald-500",
                    config.color === "red" && "bg-red-500"
                  )}
                  style={{ width: `${config.probability}%` }}
                />
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-h-[200px] rounded-lg transition-all duration-200",
          "bg-muted/20 dark:bg-muted/10",
          isOver && "bg-tactical-500/10 ring-2 ring-tactical-500/30 ring-inset"
        )}
      >
        <div className="p-2 space-y-2">
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            {/* Loading State */}
            {isLoading && (
              <div className="space-y-2">
                <DealCardSkeleton />
                <DealCardSkeleton />
              </div>
            )}

            {/* Deals */}
            {!isLoading && (
              <AnimatePresence mode="popLayout">
                {deals.map((deal) => (
                  <SortableDealCard
                    key={deal.id}
                    id={deal.id}
                    deal={deal}
                    onView={onViewDeal}
                    compact={compact}
                  />
                ))}
              </AnimatePresence>
            )}

            {/* Empty State */}
            {!isLoading && deals.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <p className="text-sm text-muted-foreground mb-2">
                  No deals in this stage
                </p>
                {!isClosed && onAddDeal && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => onAddDeal(stage)}
                  >
                    <PlusIcon className="size-3 mr-1" />
                    Add Deal
                  </Button>
                )}
              </motion.div>
            )}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// STAGE COLUMN SKELETON
// =============================================================================

export function StageColumnSkeleton() {
  return (
    <div className="flex flex-col h-full min-w-[280px] max-w-[320px]">
      {/* Header Skeleton */}
      <div className="flex-shrink-0 mb-3">
        <Card variant="subtle" padding="sm" rounded="md">
          <div className="animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-5 w-6 bg-muted/50 rounded-full" />
              </div>
            </div>
            <div className="h-3 w-16 bg-muted/50 rounded mt-2" />
          </div>
        </Card>
      </div>

      {/* Cards Skeleton */}
      <div className="flex-1 bg-muted/20 rounded-lg p-2 space-y-2">
        <DealCardSkeleton />
        <DealCardSkeleton />
        <DealCardSkeleton />
      </div>
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export { StageColumn as default };
