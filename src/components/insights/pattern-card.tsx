"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LightningBoltIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { OverviewInsight } from "@/lib/insights/types";

// =============================================================================
// TYPES
// =============================================================================

interface PatternCardProps {
  insight: OverviewInsight;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PatternCard({ insight }: PatternCardProps) {
  const severityConfig = {
    info: {
      icon: <InfoCircledIcon className="size-5" />,
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-400",
    },
    warning: {
      icon: <ExclamationTriangleIcon className="size-5" />,
      bg: "bg-warning-base/10",
      border: "border-warning-base/20",
      text: "text-warning-base",
    },
    success: {
      icon: <CheckCircledIcon className="size-5" />,
      bg: "bg-tactical-500/10",
      border: "border-tactical-500/20",
      text: "text-tactical-500",
    },
    alert: {
      icon: <LightningBoltIcon className="size-5" />,
      bg: "bg-danger-base/10",
      border: "border-danger-base/20",
      text: "text-danger-base",
    },
  };

  const config = severityConfig[insight.severity];

  const typeLabels = {
    signal: "Signal",
    pattern: "Pattern",
    recommendation: "Recommendation",
  };

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card
        variant="raised"
        className={cn(
          "p-4 h-full transition-all",
          config.bg,
          `border ${config.border}`,
          insight.actionUrl && "hover:scale-[1.02] cursor-pointer"
        )}
      >
        <div className="flex items-start gap-3">
          <span className={config.text}>{config.icon}</span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  "text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full",
                  config.bg,
                  config.text
                )}
              >
                {typeLabels[insight.type]}
              </span>
              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full",
                  insight.confidence.level === "high" && "bg-tactical-500/20 text-tactical-500",
                  insight.confidence.level === "medium" && "bg-blue-500/20 text-blue-400",
                  insight.confidence.level === "low" && "bg-muted text-muted-foreground"
                )}
              >
                {insight.confidence.level}
              </span>
            </div>

            <h4 className="text-sm font-medium text-foreground mb-1">
              {insight.title}
            </h4>

            <p className="text-xs text-muted-foreground line-clamp-2">
              {insight.description}
            </p>

            {insight.relatedDeals && insight.relatedDeals.length > 0 && (
              <p className="text-[10px] text-muted-foreground mt-2">
                Related: {insight.relatedDeals.slice(0, 3).join(", ")}
                {insight.relatedDeals.length > 3 && ` +${insight.relatedDeals.length - 3} more`}
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  if (insight.actionUrl) {
    return <Link href={insight.actionUrl}>{content}</Link>;
  }

  return content;
}

export default PatternCard;
