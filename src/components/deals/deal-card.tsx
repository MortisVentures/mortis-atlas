"use client";

import * as React from "react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import {
  ClockIcon,
  DotsHorizontalIcon,
  ExternalLinkIcon,
  PersonIcon,
  TargetIcon,
} from "@radix-ui/react-icons";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DealWithRelations } from "@/lib/db/deals";
import {
  STAGE_CONFIG,
  PRIORITY_CONFIG,
  SOURCE_CONFIG,
  getDaysInStage,
  formatDaysInStage,
  getUrgencyLevel,
  formatCurrency,
} from "@/lib/deals/pipeline-utils";

// =============================================================================
// TYPES
// =============================================================================

export interface DealCardProps {
  deal: DealWithRelations;
  isDragging?: boolean;
  isOverlay?: boolean;
  onView?: (deal: DealWithRelations) => void;
  onEdit?: (deal: DealWithRelations) => void;
  compact?: boolean;
}

// =============================================================================
// DEAL CARD COMPONENT
// =============================================================================

export function DealCard({
  deal,
  isDragging = false,
  isOverlay = false,
  onView,
  compact = false,
}: DealCardProps) {
  const priorityConfig = PRIORITY_CONFIG[deal.priority];
  const sourceConfig = deal.sourceType ? SOURCE_CONFIG[deal.sourceType] : null;
  const daysInStage = getDaysInStage(deal.lastStageChange);
  const urgency = getUrgencyLevel(daysInStage, deal.stage);
  const amount = deal.amount ? Number(deal.amount) : null;

  // Urgency indicator colors
  const urgencyColors = {
    normal: "text-muted-foreground",
    warning: "text-amber-400",
    critical: "text-red-400",
  };

  return (
    <Card
      variant="raised"
      padding="none"
      rounded="md"
      className={cn(
        "group relative cursor-grab active:cursor-grabbing transition-all duration-200",
        "hover:shadow-neu-raised-hover dark:hover:shadow-neu-dark-raised-hover",
        isDragging && "opacity-50 shadow-lg scale-105 rotate-2",
        isOverlay && "shadow-2xl scale-105 cursor-grabbing"
      )}
    >
      <div className={cn("p-3", compact && "p-2.5")}>
        {/* Header: Company + Actions */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <Link
              href={`/deals/${deal.id}`}
              className="font-medium text-sm text-foreground hover:text-tactical-400 transition-colors line-clamp-1"
              onClick={(e) => e.stopPropagation()}
            >
              {deal.company.name}
            </Link>
            {!compact && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {deal.dealName}
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              href={`/deals/${deal.id}`}
              className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLinkIcon className="size-3.5" />
            </Link>
            <button
              className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onView?.(deal);
              }}
            >
              <DotsHorizontalIcon className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Badges Row: Priority + Source */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {/* Priority Badge */}
          <Badge
            size="xs"
            className={cn(
              priorityConfig.bgColor,
              priorityConfig.borderColor,
              priorityConfig.textColor,
              "border"
            )}
          >
            {priorityConfig.label}
          </Badge>

          {/* Source Badge */}
          {sourceConfig && (
            <Badge
              size="xs"
              className={cn(
                sourceConfig.bgColor,
                sourceConfig.borderColor,
                sourceConfig.textColor,
                "border"
              )}
            >
              {sourceConfig.label}
            </Badge>
          )}
        </div>

        {/* Amount Row */}
        {amount !== null && (
          <div className="flex items-center gap-2 mb-2">
            <TargetIcon className="size-3 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(amount)}
            </span>
            {deal.company.sector && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground truncate">
                  {deal.company.sector}
                </span>
              </>
            )}
          </div>
        )}

        {/* Footer: Days in Stage + Contact */}
        <div className="flex items-center justify-between text-xs">
          {/* Days in Stage */}
          <div className={cn("flex items-center gap-1", urgencyColors[urgency])}>
            <ClockIcon className="size-3" />
            <span>{formatDaysInStage(daysInStage)}</span>
          </div>

          {/* Contact */}
          {deal.contact && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <PersonIcon className="size-3" />
              <span className="truncate max-w-[80px]">
                {deal.contact.firstName} {deal.contact.lastName.charAt(0)}.
              </span>
            </div>
          )}

          {/* Referrer if exists */}
          {!deal.contact && deal.referrerContact && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="text-tactical-400">via</span>
              <span className="truncate max-w-[80px]">
                {deal.referrerContact.firstName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Urgency Indicator Bar */}
      {urgency !== "normal" && (
        <div
          className={cn(
            "h-0.5 w-full",
            urgency === "warning" && "bg-amber-500",
            urgency === "critical" && "bg-red-500"
          )}
        />
      )}
    </Card>
  );
}

// =============================================================================
// SORTABLE DEAL CARD (for DnD)
// =============================================================================

export interface SortableDealCardProps extends DealCardProps {
  id: string;
}

export function SortableDealCard({
  id,
  deal,
  ...props
}: SortableDealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <DealCard deal={deal} isDragging={isDragging} {...props} />
    </motion.div>
  );
}

// =============================================================================
// DEAL CARD SKELETON
// =============================================================================

export function DealCardSkeleton() {
  return (
    <Card variant="raised" padding="none" rounded="md">
      <div className="p-3 animate-pulse">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-3 w-32 bg-muted/50 rounded mt-1" />
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="h-5 w-12 bg-muted rounded-full" />
          <div className="h-5 w-16 bg-muted rounded-full" />
        </div>

        {/* Amount */}
        <div className="h-4 w-20 bg-muted rounded mb-2" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 bg-muted/50 rounded" />
          <div className="h-3 w-20 bg-muted/50 rounded" />
        </div>
      </div>
    </Card>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export { DealCard as default };
