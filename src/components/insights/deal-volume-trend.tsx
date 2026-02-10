"use client";

import * as React from "react";
import { AreaChart } from "@tremor/react";
import { Card } from "@/components/ui/card";
import type { TrendDataPoint } from "@/lib/insights/types";

// =============================================================================
// TYPES
// =============================================================================

interface DealVolumeTrendProps {
  data: TrendDataPoint[];
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function DealVolumeTrend({ data }: DealVolumeTrendProps) {
  // Prepare chart data
  const chartData = data.map((d) => ({
    period: d.label || d.period,
    "Deal Count": d.value,
  }));

  // Calculate summary stats
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const avg = total / data.length;
  const max = Math.max(...data.map((d) => d.value));

  // Calculate trend
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  const firstHalfAvg =
    firstHalf.length > 0
      ? firstHalf.reduce((sum, d) => sum + d.value, 0) / firstHalf.length
      : 0;
  const secondHalfAvg =
    secondHalf.length > 0
      ? secondHalf.reduce((sum, d) => sum + d.value, 0) / secondHalf.length
      : 0;
  const trendDirection = secondHalfAvg > firstHalfAvg ? "up" : secondHalfAvg < firstHalfAvg ? "down" : "flat";

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card variant="raised" className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Total Deals
          </p>
          <p className="text-2xl font-mono font-bold">{total}</p>
        </Card>
        <Card variant="raised" className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Monthly Avg
          </p>
          <p className="text-2xl font-mono font-bold">{avg.toFixed(1)}</p>
        </Card>
        <Card variant="raised" className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Peak Month
          </p>
          <p className="text-2xl font-mono font-bold">{max}</p>
        </Card>
        <Card variant="raised" className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Trend
          </p>
          <p className="text-2xl font-mono font-bold capitalize">
            {trendDirection === "up" && "↑ Rising"}
            {trendDirection === "down" && "↓ Falling"}
            {trendDirection === "flat" && "→ Stable"}
          </p>
        </Card>
      </div>

      {/* Area Chart */}
      <Card variant="raised" className="p-4">
        <h4 className="text-sm font-medium text-foreground mb-4">
          Deal Volume Over Time
        </h4>
        <AreaChart
          data={chartData}
          index="period"
          categories={["Deal Count"]}
          colors={["cyan"]}
          yAxisWidth={48}
          className="h-64"
          curveType="natural"
          showAnimation
        />
      </Card>
    </div>
  );
}

export default DealVolumeTrend;
