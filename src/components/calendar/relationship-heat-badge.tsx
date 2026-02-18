"use client";

import { RelationshipHeat } from "@prisma/client";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { HEAT_CONFIG } from "@/lib/integrations/calendar/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RelationshipHeatBadgeProps {
  heat: RelationshipHeat | null;
  heatScore?: number;
  trendDirection?: number;
  showTrend?: boolean;
  showScore?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function RelationshipHeatBadge({
  heat,
  heatScore,
  trendDirection,
  showTrend = true,
  showScore = false,
  size = "md",
  className,
}: RelationshipHeatBadgeProps) {
  if (!heat) return null;

  const config = HEAT_CONFIG[heat];

  const TrendIcon = getTrendIcon(trendDirection);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full font-medium",
              size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
              config.bgColor,
              config.color,
              className
            )}
          >
            {config.label}
            {showScore && heatScore !== undefined && (
              <span className="opacity-60">({heatScore})</span>
            )}
            {showTrend && trendDirection !== undefined && TrendIcon && (
              <TrendIcon className="size-3" />
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">{config.label} Relationship</p>
            {heatScore !== undefined && (
              <p className="text-neutral-400">Score: {heatScore}/100</p>
            )}
            {trendDirection !== undefined && (
              <p className="text-neutral-400">
                Trend: {getTrendLabel(trendDirection)}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function getTrendIcon(trendDirection?: number) {
  if (trendDirection === undefined) return null;
  if (trendDirection > 0.1) return ArrowUpIcon;
  if (trendDirection < -0.1) return ArrowDownIcon;
  return MinusIcon;
}

function getTrendLabel(trendDirection: number): string {
  if (trendDirection > 0.3) return "Rising significantly";
  if (trendDirection > 0.1) return "Rising";
  if (trendDirection > -0.1) return "Stable";
  if (trendDirection > -0.3) return "Declining";
  return "Declining significantly";
}

interface RelationshipHeatIndicatorProps {
  heat: RelationshipHeat | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RelationshipHeatIndicator({
  heat,
  size = "md",
  className,
}: RelationshipHeatIndicatorProps) {
  if (!heat) return null;

  const sizeClasses = {
    sm: "size-2",
    md: "size-3",
    lg: "size-4",
  };

  const colorClasses: Record<RelationshipHeat, string> = {
    HOT: "bg-red-500",
    WARM: "bg-orange-500",
    COOLING: "bg-yellow-500",
    COLD: "bg-blue-500",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-block rounded-full",
              sizeClasses[size],
              colorClasses[heat],
              className
            )}
          />
        </TooltipTrigger>
        <TooltipContent>
          <span>{HEAT_CONFIG[heat].label} relationship</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
