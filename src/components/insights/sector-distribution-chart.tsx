"use client";

import * as React from "react";
import { DonutChart, BarList } from "@tremor/react";
import { Card } from "@/components/ui/card";
import type { SectorTrend } from "@/lib/insights/types";

// =============================================================================
// TYPES
// =============================================================================

interface SectorDistributionChartProps {
  data: SectorTrend[];
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SectorDistributionChart({ data }: SectorDistributionChartProps) {
  // Prepare donut chart data
  const donutData = data.map((s) => ({
    name: s.sector,
    value: s.dealCount,
  }));

  // Prepare bar list data
  const barListData = data.map((s) => ({
    name: s.sector,
    value: s.dealCount,
  }));

  // Calculate totals
  const totalDeals = data.reduce((sum, s) => sum + s.dealCount, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Donut Chart */}
        <Card variant="raised" className="p-4">
          <h4 className="text-sm font-medium text-foreground mb-4">
            Distribution by Sector
          </h4>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32">
              <DonutChart
                data={donutData}
                index="name"
                category="value"
                colors={["cyan", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"]}
                showLabel
                valueFormatter={(v) => `${v}`}
                className="h-full"
              />
            </div>
            <div className="flex-1 space-y-2">
              {data.slice(0, 5).map((s, i) => (
                <div key={s.sector} className="flex items-center gap-2 text-sm">
                  <div
                    className="size-3 rounded-full"
                    style={{
                      backgroundColor: [
                        "#22d3ee",
                        "#3b82f6",
                        "#6366f1",
                        "#8b5cf6",
                        "#a855f7",
                      ][i],
                    }}
                  />
                  <span className="text-muted-foreground truncate flex-1">
                    {s.sector}
                  </span>
                  <span className="font-mono text-foreground">
                    {s.dealCount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Bar List */}
        <Card variant="raised" className="p-4">
          <h4 className="text-sm font-medium text-foreground mb-4">
            Deal Count by Sector
          </h4>
          <BarList data={barListData} color="cyan" showAnimation />
        </Card>
      </div>

      {/* Detailed Table */}
      <Card variant="raised" className="p-4 overflow-x-auto">
        <h4 className="text-sm font-medium text-foreground mb-4">
          Sector Details
        </h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="pb-2 font-medium">Sector</th>
              <th className="pb-2 font-medium text-right">Deals</th>
              <th className="pb-2 font-medium text-right">% of Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.map((s) => (
              <tr key={s.sector} className="hover:bg-muted/30">
                <td className="py-2 font-medium">{s.sector}</td>
                <td className="py-2 text-right font-mono">{s.dealCount}</td>
                <td className="py-2 text-right font-mono text-muted-foreground">
                  {((s.dealCount / totalDeals) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default SectorDistributionChart;
