"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

// =============================================================================
// TYPES
// =============================================================================

export type PipelineStageKey =
  | "INITIAL_REVIEW"
  | "FIRST_MEETING"
  | "DUE_DILIGENCE"
  | "PARTNER_REVIEW"
  | "INVESTMENT_COMMITTEE"
  | "TERM_SHEET"
  | "LEGAL_DILIGENCE"
  | "CLOSED_WON";

export interface PipelineStage {
  key: PipelineStageKey;
  label: string;
  count: number;
  value?: number; // Dollar value in this stage
  color: {
    bg: string;
    text: string;
    border: string;
    bar: string;
  };
}

export interface ConversionRate {
  from: PipelineStageKey;
  to: PipelineStageKey;
  rate: number;
}

// =============================================================================
// STAGE CONFIGURATION
// =============================================================================

export const stageConfig: Record<PipelineStageKey, { label: string; color: PipelineStage["color"] }> = {
  INITIAL_REVIEW: {
    label: "Initial Review",
    color: {
      bg: "bg-sky-500/10",
      text: "text-sky-600 dark:text-sky-400",
      border: "border-sky-500/30",
      bar: "bg-gradient-to-r from-sky-500 to-sky-400",
    },
  },
  FIRST_MEETING: {
    label: "First Meeting",
    color: {
      bg: "bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-500/30",
      bar: "bg-gradient-to-r from-blue-500 to-blue-400",
    },
  },
  DUE_DILIGENCE: {
    label: "Due Diligence",
    color: {
      bg: "bg-indigo-500/10",
      text: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-500/30",
      bar: "bg-gradient-to-r from-indigo-500 to-indigo-400",
    },
  },
  PARTNER_REVIEW: {
    label: "Partner Review",
    color: {
      bg: "bg-violet-500/10",
      text: "text-violet-600 dark:text-violet-400",
      border: "border-violet-500/30",
      bar: "bg-gradient-to-r from-violet-500 to-violet-400",
    },
  },
  INVESTMENT_COMMITTEE: {
    label: "Investment Committee",
    color: {
      bg: "bg-purple-500/10",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-500/30",
      bar: "bg-gradient-to-r from-purple-500 to-purple-400",
    },
  },
  TERM_SHEET: {
    label: "Term Sheet",
    color: {
      bg: "bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/30",
      bar: "bg-gradient-to-r from-amber-500 to-amber-400",
    },
  },
  LEGAL_DILIGENCE: {
    label: "Legal Diligence",
    color: {
      bg: "bg-orange-500/10",
      text: "text-orange-600 dark:text-orange-400",
      border: "border-orange-500/30",
      bar: "bg-gradient-to-r from-orange-500 to-orange-400",
    },
  },
  CLOSED_WON: {
    label: "Closed Won",
    color: {
      bg: "bg-tactical-500/10",
      text: "text-tactical-600 dark:text-tactical-400",
      border: "border-tactical-500/30",
      bar: "bg-gradient-to-r from-tactical-500 to-tactical-400",
    },
  },
};

// =============================================================================
// SAMPLE DATA
// =============================================================================

const defaultStagesData: PipelineStage[] = [
  { key: "INITIAL_REVIEW", count: 45, value: 112500000, ...stageConfig.INITIAL_REVIEW },
  { key: "FIRST_MEETING", count: 32, value: 80000000, ...stageConfig.FIRST_MEETING },
  { key: "DUE_DILIGENCE", count: 18, value: 45000000, ...stageConfig.DUE_DILIGENCE },
  { key: "PARTNER_REVIEW", count: 12, value: 30000000, ...stageConfig.PARTNER_REVIEW },
  { key: "INVESTMENT_COMMITTEE", count: 8, value: 20000000, ...stageConfig.INVESTMENT_COMMITTEE },
  { key: "TERM_SHEET", count: 5, value: 12500000, ...stageConfig.TERM_SHEET },
  { key: "LEGAL_DILIGENCE", count: 3, value: 7500000, ...stageConfig.LEGAL_DILIGENCE },
  { key: "CLOSED_WON", count: 2, value: 5000000, ...stageConfig.CLOSED_WON },
];

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const stageVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  },
};

const barVariants = {
  hidden: { scaleX: 0 },
  visible: (_width: number) => ({
    scaleX: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 20,
      delay: 0.2,
    },
  }),
};

const conversionVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.3,
    },
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function calculateConversionRate(from: number, to: number): number {
  if (from === 0) return 0;
  return Math.round((to / from) * 100);
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
}

// =============================================================================
// FUNNEL STAGE ROW COMPONENT
// =============================================================================

interface FunnelStageRowProps {
  stage: PipelineStage;
  maxCount: number;
  previousCount?: number;
  index: number;
  onStageClick?: (stage: PipelineStageKey) => void;
  showValue?: boolean;
}

function FunnelStageRow({
  stage,
  maxCount,
  previousCount,
  index: _index,
  onStageClick,
  showValue = true,
}: FunnelStageRowProps) {
  const widthPercent = Math.max((stage.count / maxCount) * 100, 8);
  const conversionRate = previousCount
    ? calculateConversionRate(previousCount, stage.count)
    : null;

  const href = `/deals?stage=${stage.key}`;

  return (
    <motion.div variants={stageVariants} className="relative">
      {/* Conversion rate indicator */}
      {conversionRate !== null && (
        <motion.div
          variants={conversionVariants}
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="flex items-center gap-1 px-2 py-0.5 bg-muted/80 backdrop-blur-sm rounded-full border border-border/50">
            <ChevronDownIcon className="size-3 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">
              {conversionRate}%
            </span>
          </div>
        </motion.div>
      )}

      {/* Stage row */}
      <Tooltip.Provider delayDuration={100}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Link
              href={href}
              onClick={(e) => {
                if (onStageClick) {
                  e.preventDefault();
                  onStageClick(stage.key);
                }
              }}
              className="block"
            >
              <motion.div
                className={cn(
                  "relative group",
                  "py-3 px-4",
                  "rounded-atlas-sm",
                  "border",
                  stage.color.border,
                  stage.color.bg,
                  "transition-all duration-fast",
                  "hover:shadow-md",
                  "cursor-pointer"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background bar */}
                <motion.div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-atlas-sm opacity-20",
                    stage.color.bar
                  )}
                  style={{ width: `${widthPercent}%` }}
                  variants={barVariants}
                  custom={widthPercent}
                  initial="hidden"
                  animate="visible"
                />

                {/* Content */}
                <div className="relative flex items-center justify-between">
                  {/* Left: Label + Count */}
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        stage.color.text
                      )}
                    >
                      {stage.label}
                    </span>
                  </div>

                  {/* Right: Count + Value */}
                  <div className="flex items-center gap-4">
                    {showValue && stage.value && (
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(stage.value)}
                      </span>
                    )}
                    <span
                      className={cn(
                        "font-mono text-lg font-semibold",
                        stage.color.text
                      )}
                    >
                      {stage.count}
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          </Tooltip.Trigger>

          {/* Tooltip */}
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              sideOffset={12}
              className={cn(
                "z-tooltip",
                "px-4 py-3",
                "rounded-atlas-sm",
                "bg-popover",
                "text-popover-foreground",
                "shadow-lg",
                "border border-border",
                "animate-in fade-in-0 zoom-in-95",
                "data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "size-3 rounded-full",
                      stage.color.bar.replace("bg-gradient-to-r", "bg").split(" ")[0]
                    )}
                  />
                  <span className="font-medium">{stage.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-muted-foreground">Companies:</span>
                  <span className="font-mono font-medium">{stage.count}</span>
                  {stage.value && (
                    <>
                      <span className="text-muted-foreground">Value:</span>
                      <span className="font-mono font-medium">
                        {formatCurrency(stage.value)}
                      </span>
                    </>
                  )}
                  {conversionRate !== null && (
                    <>
                      <span className="text-muted-foreground">Conversion:</span>
                      <span className="font-mono font-medium text-tactical-500">
                        {conversionRate}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Tooltip.Arrow className="fill-popover" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </motion.div>
  );
}

// =============================================================================
// FUNNEL SUMMARY COMPONENT
// =============================================================================

interface FunnelSummaryProps {
  stages: PipelineStage[];
}

function FunnelSummary({ stages }: FunnelSummaryProps) {
  const totalCompanies = stages[0]?.count || 0;
  const closedWon = stages.find((s) => s.key === "CLOSED_WON")?.count || 0;
  const totalValue = stages.reduce((acc, s) => acc + (s.value || 0), 0);
  const overallConversion = calculateConversionRate(totalCompanies, closedWon);

  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-atlas-sm border border-border/50">
      <div className="text-center">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          Total Deals
        </div>
        <div className="font-mono text-xl font-semibold text-foreground">
          {totalCompanies}
        </div>
      </div>
      <div className="text-center border-x border-border/50">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          Pipeline Value
        </div>
        <div className="font-mono text-xl font-semibold text-foreground">
          {formatCurrency(totalValue)}
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          Win Rate
        </div>
        <div className="font-mono text-xl font-semibold text-tactical-500">
          {overallConversion}%
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// PIPELINE FUNNEL COMPONENT
// =============================================================================

export interface PipelineFunnelProps {
  stages?: PipelineStage[];
  title?: string;
  description?: string;
  onStageClick?: (stage: PipelineStageKey) => void;
  showSummary?: boolean;
  showValue?: boolean;
  className?: string;
}

export function PipelineFunnel({
  stages = defaultStagesData,
  title = "Deal Pipeline",
  description,
  onStageClick,
  showSummary = true,
  showValue = true,
  className,
}: PipelineFunnelProps) {
  const maxCount = Math.max(...stages.map((s) => s.count));

  return (
    <Card
      variant="raised"
      className={cn("p-6", className)}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-display text-lg font-semibold text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {/* Funnel visualization */}
      <motion.div
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stages.map((stage, index) => (
          <FunnelStageRow
            key={stage.key}
            stage={stage}
            maxCount={maxCount}
            previousCount={index > 0 ? stages[index - 1].count : undefined}
            index={index}
            onStageClick={onStageClick}
            showValue={showValue}
          />
        ))}
      </motion.div>

      {/* Summary */}
      {showSummary && (
        <div className="mt-6">
          <FunnelSummary stages={stages} />
        </div>
      )}
    </Card>
  );
}

// =============================================================================
// PIPELINE FUNNEL SKELETON
// =============================================================================

export function PipelineFunnelSkeleton() {
  return (
    <Card variant="raised" className="p-6 animate-pulse">
      <div className="h-6 w-32 bg-muted rounded mb-6" />
      <div className="space-y-4">
        {[100, 85, 65, 50, 40, 30, 20, 15].map((width, i) => (
          <div
            key={i}
            className="h-12 bg-muted rounded-atlas-sm"
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
      <div className="mt-6 h-20 bg-muted rounded-atlas-sm" />
    </Card>
  );
}

// =============================================================================
// COMPACT FUNNEL (for sidebar/smaller areas)
// =============================================================================

export interface CompactFunnelProps {
  stages?: PipelineStage[];
  onStageClick?: (stage: PipelineStageKey) => void;
  className?: string;
}

export function CompactFunnel({
  stages = defaultStagesData,
  onStageClick,
  className,
}: CompactFunnelProps) {
  const maxCount = Math.max(...stages.map((s) => s.count));

  return (
    <div className={cn("space-y-1.5", className)}>
      {stages.map((stage, _index) => {
        const widthPercent = Math.max((stage.count / maxCount) * 100, 10);
        const href = `/deals?stage=${stage.key}`;

        return (
          <Link
            key={stage.key}
            href={href}
            onClick={(e) => {
              if (onStageClick) {
                e.preventDefault();
                onStageClick(stage.key);
              }
            }}
            className="block group"
          >
            <div className="flex items-center gap-2">
              {/* Bar */}
              <div
                className={cn(
                  "h-6 rounded-sm transition-all duration-fast",
                  "group-hover:brightness-110",
                  stage.color.bar
                )}
                style={{ width: `${widthPercent}%` }}
              />
              {/* Count */}
              <span className="text-xs font-mono font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {stage.count}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export { defaultStagesData, FunnelSummary };
export default PipelineFunnel;
