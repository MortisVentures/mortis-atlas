"use client";

import * as React from "react";
import { BarChart } from "@tremor/react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TimeInStageData } from "@/lib/insights/types";
import { BOTTLENECK_THRESHOLDS } from "@/lib/insights/thresholds";

// =============================================================================
// TYPES
// =============================================================================

interface TimeInStageChartProps {
  data: TimeInStageData[];
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TimeInStageChart({ data }: TimeInStageChartProps) {
  // Filter out stages with no data
  const filteredData = data.filter((d) => d.dealCount > 0);

  // Prepare chart data
  const chartData = filteredData.map((stage) => ({
    stage: stage.label,
    "Avg Days": Math.round(stage.avgDays),
    "Median Days": Math.round(stage.medianDays),
  }));

  // Check for bottlenecks
  const bottlenecks = filteredData.filter((stage) => {
    const threshold = BOTTLENECK_THRESHOLDS[stage.stage as keyof typeof BOTTLENECK_THRESHOLDS];
    return threshold && stage.avgDays > threshold;
  });

  return (
    <div className="space-y-4">
      {/* Bottleneck Alerts */}
      {bottlenecks.length > 0 && (
        <div className="p-3 bg-warning-base/10 border border-warning-base/20 rounded-lg">
          <h4 className="text-sm font-medium text-warning-base mb-2">
            Potential Bottlenecks Detected
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {bottlenecks.map((stage) => (
              <li key={stage.stage}>
                <span className="font-medium">{stage.label}</span>: Avg{" "}
                {Math.round(stage.avgDays)} days (expected &lt;{" "}
                {BOTTLENECK_THRESHOLDS[stage.stage as keyof typeof BOTTLENECK_THRESHOLDS]} days)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bar Chart */}
      <Card variant="raised" className="p-4">
        <h4 className="text-sm font-medium text-foreground mb-4">
          Average Time in Each Stage
        </h4>
        {chartData.length > 0 ? (
          <BarChart
            data={chartData}
            index="stage"
            categories={["Avg Days", "Median Days"]}
            colors={["blue", "cyan"]}
            yAxisWidth={48}
            className="h-64"
          />
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No stage timing data available yet.
          </p>
        )}
      </Card>

      {/* Detailed Stats */}
      {filteredData.length > 0 && (
        <Card variant="raised" className="p-4 overflow-x-auto">
          <h4 className="text-sm font-medium text-foreground mb-4">
            Stage Timing Details
          </h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="pb-2 font-medium">Stage</th>
                <th className="pb-2 font-medium text-right">Avg Days</th>
                <th className="pb-2 font-medium text-right">Median</th>
                <th className="pb-2 font-medium text-right">Min</th>
                <th className="pb-2 font-medium text-right">Max</th>
                <th className="pb-2 font-medium text-right">Deals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredData.map((stage) => {
                const threshold =
                  BOTTLENECK_THRESHOLDS[stage.stage as keyof typeof BOTTLENECK_THRESHOLDS];
                const isBottleneck = threshold && stage.avgDays > threshold;

                return (
                  <tr key={stage.stage} className="hover:bg-muted/30">
                    <td className="py-2 font-medium">{stage.label}</td>
                    <td
                      className={cn(
                        "py-2 text-right font-mono",
                        isBottleneck && "text-warning-base font-semibold"
                      )}
                    >
                      {Math.round(stage.avgDays)}
                    </td>
                    <td className="py-2 text-right font-mono text-muted-foreground">
                      {Math.round(stage.medianDays)}
                    </td>
                    <td className="py-2 text-right font-mono text-muted-foreground">
                      {Math.round(stage.minDays)}
                    </td>
                    <td className="py-2 text-right font-mono text-muted-foreground">
                      {Math.round(stage.maxDays)}
                    </td>
                    <td className="py-2 text-right font-mono">{stage.dealCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

export default TimeInStageChart;
