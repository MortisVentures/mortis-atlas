"use client";

import * as React from "react";
import { BarChart, BarList } from "@tremor/react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { SourceEffectiveness } from "@/lib/insights/types";
import { formatCurrency, formatDays } from "@/lib/insights/thresholds";

// =============================================================================
// TYPES
// =============================================================================

interface SourceEffectivenessChartProps {
  data: SourceEffectiveness[];
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SourceEffectivenessChart({ data }: SourceEffectivenessChartProps) {
  // Prepare data for bar chart
  const chartData = data.map((source) => ({
    source: source.label,
    "Conversion Rate": Math.round(source.conversionRate * 100),
    "Total Deals": source.totalDeals,
  }));

  // Prepare data for bar list (rankings)
  const barListData = data.slice(0, 5).map((source) => ({
    name: source.label,
    value: Math.round(source.conversionRate * 100),
    href: undefined,
  }));

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <Card variant="raised" className="p-4">
        <h4 className="text-sm font-medium text-foreground mb-4">
          Conversion Rate by Source
        </h4>
        <BarChart
          data={chartData}
          index="source"
          categories={["Conversion Rate"]}
          colors={["emerald"]}
          valueFormatter={(v) => `${v}%`}
          yAxisWidth={48}
          className="h-64"
        />
      </Card>

      {/* Detailed Table */}
      <Card variant="raised" className="p-4 overflow-x-auto">
        <h4 className="text-sm font-medium text-foreground mb-4">
          Source Effectiveness Details
        </h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="pb-2 font-medium">Source</th>
              <th className="pb-2 font-medium text-right">Deals</th>
              <th className="pb-2 font-medium text-right">Won</th>
              <th className="pb-2 font-medium text-right">Lost</th>
              <th className="pb-2 font-medium text-right">Conv. Rate</th>
              <th className="pb-2 font-medium text-right">Avg Time</th>
              <th className="pb-2 font-medium text-right">Total Invested</th>
              <th className="pb-2 font-medium text-right">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.map((source) => (
              <tr key={source.source} className="hover:bg-muted/30">
                <td className="py-2 font-medium">{source.label}</td>
                <td className="py-2 text-right font-mono">{source.totalDeals}</td>
                <td className="py-2 text-right font-mono text-tactical-500">
                  {source.wonDeals}
                </td>
                <td className="py-2 text-right font-mono text-danger-base">
                  {source.lostDeals}
                </td>
                <td className="py-2 text-right font-mono">
                  <span
                    className={cn(
                      source.conversionRate >= 0.3 && "text-tactical-500",
                      source.conversionRate < 0.15 && "text-danger-base"
                    )}
                  >
                    {(source.conversionRate * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="py-2 text-right font-mono text-muted-foreground">
                  {source.avgTimeToClose > 0 ? formatDays(source.avgTimeToClose) : "-"}
                </td>
                <td className="py-2 text-right font-mono">
                  {source.totalInvested > 0 ? formatCurrency(source.totalInvested) : "-"}
                </td>
                <td className="py-2 text-right">
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      source.confidence.level === "high" && "bg-tactical-500/20 text-tactical-500",
                      source.confidence.level === "medium" && "bg-blue-500/20 text-blue-400",
                      source.confidence.level === "low" && "bg-warning-base/20 text-warning-base"
                    )}
                  >
                    {source.confidence.level}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Top Sources Ranking */}
      <Card variant="raised" className="p-4">
        <h4 className="text-sm font-medium text-foreground mb-4">
          Top Sources by Conversion
        </h4>
        <BarList
          data={barListData}
          color="emerald"
          valueFormatter={(v: number) => `${v}%`}
          showAnimation
        />
      </Card>
    </div>
  );
}

export default SourceEffectivenessChart;
