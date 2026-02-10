"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  BarChartIcon,
  ClockIcon,
  RocketIcon,
  TargetIcon,
  CheckCircledIcon,
  CrossCircledIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { OverviewData, OverviewKPI, ConfidenceLevel } from "@/lib/insights/types";

// =============================================================================
// TYPES
// =============================================================================

interface InsightKPIGridProps {
  kpis: OverviewData["kpis"];
}

interface KPICardProps {
  kpi: OverviewKPI;
  icon: React.ReactNode;
  index: number;
}

// =============================================================================
// CONFIDENCE BADGE
// =============================================================================

function ConfidenceBadge({ level, sampleSize }: { level: ConfidenceLevel; sampleSize: number }) {
  const colors = {
    low: "bg-warning-base/20 text-warning-base border-warning-base/30",
    medium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    high: "bg-tactical-500/20 text-tactical-500 border-tactical-500/30",
  };

  const labels = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full border",
        colors[level]
      )}
      title={`Based on ${sampleSize} data points`}
    >
      {labels[level]}
    </span>
  );
}

// =============================================================================
// KPI CARD
// =============================================================================

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  }),
};

function KPICard({ kpi, icon, index }: KPICardProps) {
  const trendIcon = kpi.trend === "up" ? (
    <CheckCircledIcon className="size-4 text-tactical-500" />
  ) : kpi.trend === "down" ? (
    <CrossCircledIcon className="size-4 text-danger-base" />
  ) : null;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <Card variant="raised" className="p-4 h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{icon}</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {kpi.label}
            </span>
          </div>
          <ConfidenceBadge
            level={kpi.confidence.level}
            sampleSize={kpi.confidence.sampleSize}
          />
        </div>

        <div className="flex items-end justify-between">
          <div>
            <span className="font-mono text-2xl font-bold text-foreground">
              {kpi.value}
            </span>
            {kpi.changeLabel && (
              <p className="text-xs text-muted-foreground mt-1">
                {kpi.changeLabel}
              </p>
            )}
          </div>
          {trendIcon}
        </div>
      </Card>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function InsightKPIGrid({ kpis }: InsightKPIGridProps) {
  const kpiConfig = [
    { key: "totalDeals" as const, icon: <BarChartIcon className="size-4" /> },
    { key: "conversionRate" as const, icon: <TargetIcon className="size-4" /> },
    { key: "avgTimeToClose" as const, icon: <ClockIcon className="size-4" /> },
    { key: "pipelineValue" as const, icon: <RocketIcon className="size-4" /> },
    { key: "portfolioValue" as const, icon: <CheckCircledIcon className="size-4" /> },
    { key: "activeDeals" as const, icon: <RocketIcon className="size-4" /> },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {kpiConfig.map((config, index) => (
        <KPICard
          key={config.key}
          kpi={kpis[config.key]}
          icon={config.icon}
          index={index}
        />
      ))}
    </div>
  );
}

export default InsightKPIGrid;
