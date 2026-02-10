"use client";

import * as React from "react";
import { AreaChart, BarChart } from "@tremor/react";
import { Card } from "@/components/ui/card";
import type { DealVelocity } from "@/lib/insights/types";

// =============================================================================
// TYPES
// =============================================================================

interface DealVelocityChartProps {
  data: DealVelocity[];
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function DealVelocityChart({ data }: DealVelocityChartProps) {
  // Prepare chart data
  const chartData = data.map((v) => ({
    period: v.period,
    "New Deals": v.newDeals,
    "Closed Won": v.closedWon,
    "Closed Lost": v.closedLost,
  }));

  // Calculate totals
  const totals = data.reduce(
    (acc, v) => ({
      newDeals: acc.newDeals + v.newDeals,
      closedWon: acc.closedWon + v.closedWon,
      closedLost: acc.closedLost + v.closedLost,
    }),
    { newDeals: 0, closedWon: 0, closedLost: 0 }
  );

  // Calculate net flow
  const netChartData = data.map((v) => ({
    period: v.period,
    "Net Change": v.netChange,
  }));

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card variant="raised" className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            New Deals
          </p>
          <p className="text-2xl font-mono font-bold">{totals.newDeals}</p>
        </Card>
        <Card variant="raised" className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Closed Won
          </p>
          <p className="text-2xl font-mono font-bold text-tactical-500">
            {totals.closedWon}
          </p>
        </Card>
        <Card variant="raised" className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Closed Lost
          </p>
          <p className="text-2xl font-mono font-bold text-danger-base">
            {totals.closedLost}
          </p>
        </Card>
        <Card variant="raised" className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Net Pipeline
          </p>
          <p className="text-2xl font-mono font-bold">
            {totals.newDeals - totals.closedWon - totals.closedLost}
          </p>
        </Card>
      </div>

      {/* Velocity Chart */}
      <Card variant="raised" className="p-4">
        <h4 className="text-sm font-medium text-foreground mb-4">
          Deal Flow Over Time
        </h4>
        <BarChart
          data={chartData}
          index="period"
          categories={["New Deals", "Closed Won", "Closed Lost"]}
          colors={["blue", "emerald", "rose"]}
          yAxisWidth={48}
          className="h-64"
          stack
        />
      </Card>

      {/* Net Flow Chart */}
      <Card variant="raised" className="p-4">
        <h4 className="text-sm font-medium text-foreground mb-4">
          Net Pipeline Change
        </h4>
        <AreaChart
          data={netChartData}
          index="period"
          categories={["Net Change"]}
          colors={["cyan"]}
          yAxisWidth={48}
          className="h-48"
          curveType="natural"
        />
      </Card>
    </div>
  );
}

export default DealVelocityChart;
