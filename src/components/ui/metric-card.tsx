"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Card, type CardProps } from "./card";

// =============================================================================
// SPARKLINE COMPONENT
// =============================================================================

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  className?: string;
}

const Sparkline = React.memo(function Sparkline({
  data,
  width = 100,
  height = 32,
  stroke = "currentColor",
  fill = "currentColor",
  className,
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Generate SVG path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  const linePath = `M${points.join(" L")}`;
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
      preserveAspectRatio="none"
    >
      {/* Area fill */}
      <motion.path
        d={areaPath}
        fill={fill}
        fillOpacity={0.1}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      {/* Line stroke */}
      <motion.path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </svg>
  );
});

// =============================================================================
// TREND INDICATOR COMPONENT
// =============================================================================

const trendVariants = cva(
  [
    "inline-flex",
    "items-center",
    "gap-0.5",
    "text-sm",
    "font-medium",
    "transition-colors",
  ],
  {
    variants: {
      trend: {
        up: "text-tactical-500 dark:text-tactical-400",
        down: "text-danger-base dark:text-red-400",
        neutral: "text-muted-foreground",
      },
    },
    defaultVariants: {
      trend: "neutral",
    },
  }
);

interface TrendIndicatorProps extends VariantProps<typeof trendVariants> {
  value: string | number;
  showIcon?: boolean;
  className?: string;
}

const TrendIndicator = React.memo(function TrendIndicator({
  trend,
  value,
  showIcon = true,
  className,
}: TrendIndicatorProps) {
  const Icon =
    trend === "up"
      ? ArrowUpIcon
      : trend === "down"
        ? ArrowDownIcon
        : MinusIcon;

  return (
    <span className={cn(trendVariants({ trend }), className)}>
      {showIcon && <Icon className="size-4" />}
      <span>{value}</span>
    </span>
  );
});

// =============================================================================
// METRIC VALUE COMPONENT
// =============================================================================

interface MetricValueProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
}

const metricSizeClasses = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
};

const MetricValue = React.forwardRef<HTMLDivElement, MetricValueProps>(
  ({ value, size = "lg", animated = true, className, ...props }, ref) => {
    const displayValue = typeof value === "number" ? value.toLocaleString() : value;

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={cn(
            "font-mono font-semibold tracking-tight text-foreground",
            metricSizeClasses[size],
            className
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {displayValue}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "font-mono font-semibold tracking-tight text-foreground",
          metricSizeClasses[size],
          className
        )}
        {...props}
      >
        {displayValue}
      </div>
    );
  }
);
MetricValue.displayName = "MetricValue";

// =============================================================================
// METRIC CARD COMPONENT
// =============================================================================

const metricCardVariants = cva([], {
  variants: {
    size: {
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    },
    layout: {
      vertical: "flex flex-col",
      horizontal: "flex flex-row items-center justify-between",
    },
  },
  defaultVariants: {
    size: "md",
    layout: "vertical",
  },
});

export interface MetricCardProps
  extends Omit<CardProps, "children">,
    VariantProps<typeof metricCardVariants> {
  /** Title/label for the metric */
  title: string;
  /** The metric value to display */
  value: string | number;
  /** Change value (e.g., "+12.5%") */
  change?: string | number;
  /** Trend direction */
  trend?: "up" | "down" | "neutral";
  /** Optional sparkline data points */
  sparklineData?: number[];
  /** Sparkline color (defaults to trend color) */
  sparklineColor?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Value size */
  valueSize?: "sm" | "md" | "lg" | "xl";
  /** Disable animations */
  disableAnimation?: boolean;
  /** Optional description text */
  description?: string;
  /** Optional comparison text (e.g., "vs last month") */
  comparison?: string;
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  (
    {
      title,
      value,
      change,
      trend = "neutral",
      sparklineData,
      sparklineColor,
      icon,
      valueSize = "lg",
      disableAnimation = false,
      description,
      comparison,
      size,
      layout,
      variant = "raised",
      className,
      ...props
    },
    ref
  ) => {
    // Determine sparkline color based on trend
    const resolvedSparklineColor =
      sparklineColor ||
      (trend === "up"
        ? "rgb(16, 185, 129)" // tactical-500
        : trend === "down"
          ? "rgb(220, 38, 38)" // danger-base
          : "rgb(148, 163, 184)"); // silver-400

    return (
      <Card
        ref={ref}
        variant={variant}
        className={cn(metricCardVariants({ size, layout }), className)}
        {...props}
      >
        {/* Header: Title + Icon */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          {icon && (
            <span className="text-muted-foreground">{icon}</span>
          )}
        </div>

        {/* Main content area */}
        <div className={cn(
          "flex items-end justify-between gap-4",
          layout === "vertical" && "flex-col items-start"
        )}>
          {/* Value + Trend */}
          <div className="space-y-1">
            <MetricValue
              value={value}
              size={valueSize}
              animated={!disableAnimation}
            />

            {/* Change indicator */}
            {change !== undefined && (
              <div className="flex items-center gap-2">
                <TrendIndicator trend={trend} value={change} />
                {comparison && (
                  <span className="text-xs text-muted-foreground">
                    {comparison}
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>

          {/* Sparkline */}
          {sparklineData && sparklineData.length > 1 && (
            <div className="flex-shrink-0">
              <Sparkline
                data={sparklineData}
                width={80}
                height={32}
                stroke={resolvedSparklineColor}
                fill={resolvedSparklineColor}
              />
            </div>
          )}
        </div>
      </Card>
    );
  }
);
MetricCard.displayName = "MetricCard";

// =============================================================================
// METRIC CARD GROUP
// =============================================================================

export interface MetricCardGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns */
  columns?: 2 | 3 | 4 | 5;
}

const MetricCardGroup = React.forwardRef<HTMLDivElement, MetricCardGroupProps>(
  ({ columns = 4, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "grid gap-4",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        columns === 5 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
MetricCardGroup.displayName = "MetricCardGroup";

// =============================================================================
// EXPORTS
// =============================================================================

export {
  MetricCard,
  MetricCardGroup,
  MetricValue,
  TrendIndicator,
  Sparkline,
  trendVariants,
  metricCardVariants,
};
