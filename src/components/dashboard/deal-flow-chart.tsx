"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  LineChart,
  Color,
} from "@tremor/react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button, ButtonGroup } from "@/components/ui/button";

// =============================================================================
// TYPES
// =============================================================================

export type TimeRange = "3M" | "6M" | "1Y" | "ALL";

export type DealOutcome = "won" | "lost" | "active";

export interface DealFlowDataPoint {
  month: string;
  date: Date;
  // By outcome
  won: number;
  lost: number;
  active: number;
  // Total
  total: number;
  // Optional: by stage
  sourced?: number;
  inDiligence?: number;
  termSheet?: number;
}

export interface TrendDataPoint {
  month: string;
  velocity: number;
  trend: number;
}

// =============================================================================
// SAMPLE DATA - Last 12 months
// =============================================================================

function generateSampleData(): DealFlowDataPoint[] {
  const months = [
    "Nov '23", "Dec '23", "Jan '24", "Feb '24", "Mar '24", "Apr '24",
    "May '24", "Jun '24", "Jul '24", "Aug '24", "Sep '24", "Oct '24"
  ];

  const data: DealFlowDataPoint[] = [
    { month: "Nov '23", date: new Date(2023, 10), won: 1, lost: 3, active: 8, total: 12, sourced: 8, inDiligence: 3, termSheet: 1 },
    { month: "Dec '23", date: new Date(2023, 11), won: 0, lost: 2, active: 6, total: 8, sourced: 5, inDiligence: 2, termSheet: 1 },
    { month: "Jan '24", date: new Date(2024, 0), won: 2, lost: 4, active: 12, total: 18, sourced: 10, inDiligence: 5, termSheet: 3 },
    { month: "Feb '24", date: new Date(2024, 1), won: 1, lost: 3, active: 10, total: 14, sourced: 8, inDiligence: 4, termSheet: 2 },
    { month: "Mar '24", date: new Date(2024, 2), won: 3, lost: 5, active: 14, total: 22, sourced: 12, inDiligence: 6, termSheet: 4 },
    { month: "Apr '24", date: new Date(2024, 3), won: 2, lost: 4, active: 11, total: 17, sourced: 9, inDiligence: 5, termSheet: 3 },
    { month: "May '24", date: new Date(2024, 4), won: 1, lost: 3, active: 15, total: 19, sourced: 11, inDiligence: 5, termSheet: 3 },
    { month: "Jun '24", date: new Date(2024, 5), won: 2, lost: 2, active: 12, total: 16, sourced: 9, inDiligence: 4, termSheet: 3 },
    { month: "Jul '24", date: new Date(2024, 6), won: 3, lost: 4, active: 18, total: 25, sourced: 14, inDiligence: 7, termSheet: 4 },
    { month: "Aug '24", date: new Date(2024, 7), won: 2, lost: 3, active: 16, total: 21, sourced: 12, inDiligence: 6, termSheet: 3 },
    { month: "Sep '24", date: new Date(2024, 8), won: 4, lost: 5, active: 20, total: 29, sourced: 16, inDiligence: 8, termSheet: 5 },
    { month: "Oct '24", date: new Date(2024, 9), won: 2, lost: 2, active: 22, total: 26, sourced: 15, inDiligence: 7, termSheet: 4 },
  ];

  return data;
}

const defaultData = generateSampleData();

// Calculate trend/velocity data
function calculateTrendData(data: DealFlowDataPoint[]): TrendDataPoint[] {
  const trendData: TrendDataPoint[] = [];
  let runningAvg = 0;

  data.forEach((point, index) => {
    // Calculate 3-month moving average for trend
    const windowStart = Math.max(0, index - 2);
    const window = data.slice(windowStart, index + 1);
    const avg = window.reduce((sum, p) => sum + p.total, 0) / window.length;

    runningAvg = avg;

    trendData.push({
      month: point.month,
      velocity: point.total,
      trend: Math.round(avg * 10) / 10,
    });
  });

  return trendData;
}

// =============================================================================
// TIME RANGE FILTER
// =============================================================================

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  const ranges: { key: TimeRange; label: string }[] = [
    { key: "3M", label: "3M" },
    { key: "6M", label: "6M" },
    { key: "1Y", label: "1Y" },
    { key: "ALL", label: "All" },
  ];

  return (
    <ButtonGroup attached>
      {ranges.map((range) => (
        <Button
          key={range.key}
          variant={value === range.key ? "primary" : "outline"}
          size="sm"
          onClick={() => onChange(range.key)}
          disableAnimation
        >
          {range.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}

// =============================================================================
// CHART LEGEND
// =============================================================================

interface LegendItem {
  label: string;
  color: string;
  value?: number;
}

interface ChartLegendProps {
  items: LegendItem[];
  className?: string;
}

function ChartLegend({ items, className }: ChartLegendProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className={cn("size-3 rounded-full", item.color)}
          />
          <span className="text-sm text-muted-foreground">{item.label}</span>
          {item.value !== undefined && (
            <span className="text-sm font-mono font-medium text-foreground">
              {item.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// SUMMARY STATS
// =============================================================================

interface SummaryStatsProps {
  data: DealFlowDataPoint[];
  timeRange: TimeRange;
}

function SummaryStats({ data, timeRange }: SummaryStatsProps) {
  const totalDeals = data.reduce((sum, p) => sum + p.total, 0);
  const totalWon = data.reduce((sum, p) => sum + p.won, 0);
  const totalLost = data.reduce((sum, p) => sum + p.lost, 0);
  const avgPerMonth = Math.round(totalDeals / data.length);
  const winRate = totalDeals > 0 ? Math.round((totalWon / (totalWon + totalLost)) * 100) : 0;

  const stats = [
    { label: "Total Deals", value: totalDeals },
    { label: "Avg/Month", value: avgPerMonth },
    { label: "Won", value: totalWon, color: "text-tactical-500" },
    { label: "Win Rate", value: `${winRate}%`, color: "text-tactical-500" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-atlas-sm border border-border/50">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {stat.label}
          </div>
          <div className={cn(
            "font-mono text-xl font-semibold",
            stat.color || "text-foreground"
          )}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// VIEW MODE TYPES
// =============================================================================

export type ChartViewMode = "outcome" | "stage" | "trend";

// =============================================================================
// DEAL FLOW CHART COMPONENT
// =============================================================================

export interface DealFlowChartProps {
  data?: DealFlowDataPoint[];
  title?: string;
  description?: string;
  defaultTimeRange?: TimeRange;
  defaultViewMode?: ChartViewMode;
  showSummary?: boolean;
  showLegend?: boolean;
  showTrendLine?: boolean;
  height?: string;
  className?: string;
}

export function DealFlowChart({
  data = defaultData,
  title = "Deal Flow Over Time",
  description,
  defaultTimeRange = "1Y",
  defaultViewMode = "outcome",
  showSummary = true,
  showLegend = true,
  showTrendLine = true,
  height = "h-72",
  className,
}: DealFlowChartProps) {
  const [timeRange, setTimeRange] = React.useState<TimeRange>(defaultTimeRange);
  const [viewMode, setViewMode] = React.useState<ChartViewMode>(defaultViewMode);

  // Filter data by time range
  const filteredData = React.useMemo(() => {
    const now = new Date();
    let monthsToShow = data.length;

    switch (timeRange) {
      case "3M":
        monthsToShow = 3;
        break;
      case "6M":
        monthsToShow = 6;
        break;
      case "1Y":
        monthsToShow = 12;
        break;
      case "ALL":
      default:
        monthsToShow = data.length;
    }

    return data.slice(-monthsToShow);
  }, [data, timeRange]);

  // Calculate trend data
  const trendData = React.useMemo(
    () => calculateTrendData(filteredData),
    [filteredData]
  );

  // Chart categories based on view mode
  const chartConfig = React.useMemo(() => {
    switch (viewMode) {
      case "outcome":
        return {
          categories: ["won", "lost", "active"] as const,
          colors: ["emerald", "rose", "blue"] as Color[],
          legendItems: [
            { label: "Won", color: "bg-emerald-500" },
            { label: "Lost", color: "bg-rose-500" },
            { label: "Active", color: "bg-blue-500" },
          ],
        };
      case "stage":
        return {
          categories: ["sourced", "inDiligence", "termSheet"] as const,
          colors: ["cyan", "indigo", "amber"] as Color[],
          legendItems: [
            { label: "Sourced", color: "bg-cyan-500" },
            { label: "In Diligence", color: "bg-indigo-500" },
            { label: "Term Sheet", color: "bg-amber-500" },
          ],
        };
      case "trend":
        return {
          categories: ["velocity", "trend"] as const,
          colors: ["blue", "emerald"] as Color[],
          legendItems: [
            { label: "Monthly Deals", color: "bg-blue-500" },
            { label: "3M Avg Trend", color: "bg-emerald-500" },
          ],
        };
    }
  }, [viewMode]);

  // Custom tooltip formatter
  const valueFormatter = (value: number) => `${value} deals`;

  return (
    <Card variant="raised" className={cn("p-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Selector */}
          <ButtonGroup attached>
            <Button
              variant={viewMode === "outcome" ? "primary" : "outline"}
              size="sm"
              onClick={() => setViewMode("outcome")}
              disableAnimation
            >
              Outcome
            </Button>
            <Button
              variant={viewMode === "stage" ? "primary" : "outline"}
              size="sm"
              onClick={() => setViewMode("stage")}
              disableAnimation
            >
              Stage
            </Button>
            <Button
              variant={viewMode === "trend" ? "primary" : "outline"}
              size="sm"
              onClick={() => setViewMode("trend")}
              disableAnimation
            >
              Trend
            </Button>
          </ButtonGroup>

          {/* Time Range Selector */}
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <ChartLegend items={chartConfig.legendItems} className="mb-4" />
      )}

      {/* Chart */}
      <motion.div
        className={height}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        key={`${viewMode}-${timeRange}`}
      >
        {viewMode === "trend" ? (
          <LineChart
            data={trendData}
            index="month"
            categories={["velocity", "trend"]}
            colors={chartConfig.colors}
            valueFormatter={valueFormatter}
            showLegend={false}
            showGridLines={true}
            curveType="natural"
            connectNulls
            className="h-full"
            yAxisWidth={40}
          />
        ) : (
          <AreaChart
            data={filteredData}
            index="month"
            categories={chartConfig.categories as unknown as string[]}
            colors={chartConfig.colors}
            valueFormatter={valueFormatter}
            showLegend={false}
            showGridLines={true}
            stack
            curveType="natural"
            className="h-full"
            yAxisWidth={40}
          />
        )}
      </motion.div>

      {/* Trend Line Overlay (when not in trend mode) */}
      {showTrendLine && viewMode !== "trend" && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <div className="size-2 rounded-full bg-tactical-500" />
          <span className="text-muted-foreground">
            Deal Velocity Trend:
          </span>
          <span className="font-mono font-medium text-tactical-500">
            {trendData[trendData.length - 1]?.trend || 0} deals/month avg
          </span>
          {trendData.length >= 2 && (
            <span className={cn(
              "text-xs",
              trendData[trendData.length - 1].trend > trendData[trendData.length - 2].trend
                ? "text-tactical-500"
                : "text-danger-base"
            )}>
              ({trendData[trendData.length - 1].trend > trendData[trendData.length - 2].trend ? "↑" : "↓"} vs prev month)
            </span>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {showSummary && (
        <div className="mt-6">
          <SummaryStats data={filteredData} timeRange={timeRange} />
        </div>
      )}
    </Card>
  );
}

// =============================================================================
// DEAL FLOW CHART SKELETON
// =============================================================================

export function DealFlowChartSkeleton() {
  return (
    <Card variant="raised" className="p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-40 bg-muted rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-muted rounded" />
          <div className="h-8 w-32 bg-muted rounded" />
        </div>
      </div>

      {/* Legend skeleton */}
      <div className="flex gap-4 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="size-3 bg-muted rounded-full" />
            <div className="h-4 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="h-72 bg-muted rounded-atlas-sm" />

      {/* Summary skeleton */}
      <div className="mt-6 h-20 bg-muted rounded-atlas-sm" />
    </Card>
  );
}

// =============================================================================
// MINI DEAL FLOW SPARKLINE
// =============================================================================

export interface MiniDealFlowProps {
  data?: DealFlowDataPoint[];
  className?: string;
}

export function MiniDealFlow({ data = defaultData, className }: MiniDealFlowProps) {
  const last6Months = data.slice(-6);

  return (
    <div className={cn("h-16", className)}>
      <AreaChart
        data={last6Months}
        index="month"
        categories={["total"]}
        colors={["blue"]}
        showXAxis={false}
        showYAxis={false}
        showGridLines={false}
        showLegend={false}
        showTooltip={false}
        curveType="natural"
        className="h-full"
      />
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  TimeRangeSelector,
  ChartLegend,
  SummaryStats,
  generateSampleData,
  calculateTrendData,
};

export default DealFlowChart;
