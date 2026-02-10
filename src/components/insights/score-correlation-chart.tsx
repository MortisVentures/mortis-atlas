"use client";

import * as React from "react";
import { BarChart } from "@tremor/react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { ScoreEffectiveness, ScoreCorrelation } from "@/lib/insights/types";

// =============================================================================
// TYPES
// =============================================================================

interface ScoreCorrelationChartProps {
  data: ScoreEffectiveness;
}

// =============================================================================
// SCORE TABLE
// =============================================================================

interface ScoreTableProps {
  title: string;
  correlations: ScoreCorrelation[];
}

function ScoreTable({ title, correlations }: ScoreTableProps) {
  return (
    <div>
      <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
        {title}
      </h5>
      <div className="space-y-1">
        {correlations.map((c) => (
          <div
            key={c.score}
            className="flex items-center justify-between p-2 rounded bg-muted/30"
          >
            <span className="text-sm font-medium">{c.label}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {c.approved}/{c.total}
              </span>
              <span
                className={cn(
                  "text-sm font-mono font-medium w-12 text-right",
                  c.approvalRate >= 0.5 && "text-tactical-500",
                  c.approvalRate < 0.2 && "text-danger-base"
                )}
              >
                {c.total > 0 ? `${(c.approvalRate * 100).toFixed(0)}%` : "-"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ScoreCorrelationChart({ data }: ScoreCorrelationChartProps) {
  // Prepare chart data - comparing Strong vs Weak approval rates
  const chartData = [
    {
      score: "Triple-Use",
      Strong: Math.round(
        (data.tripleUse.find((c) => c.score === "STRONG")?.approvalRate || 0) * 100
      ),
      Weak: Math.round(
        (data.tripleUse.find((c) => c.score === "WEAK")?.approvalRate || 0) * 100
      ),
    },
    {
      score: "WLCDIA",
      Strong: Math.round(
        (data.wlcdia.find((c) => c.score === "STRONG")?.approvalRate || 0) * 100
      ),
      Weak: Math.round(
        (data.wlcdia.find((c) => c.score === "WEAK")?.approvalRate || 0) * 100
      ),
    },
    {
      score: "Team",
      Strong: Math.round(
        (data.team.find((c) => c.score === "STRONG")?.approvalRate || 0) * 100
      ),
      Weak: Math.round(
        (data.team.find((c) => c.score === "WEAK")?.approvalRate || 0) * 100
      ),
    },
    {
      score: "Market",
      Strong: Math.round(
        (data.market.find((c) => c.score === "STRONG")?.approvalRate || 0) * 100
      ),
      Weak: Math.round(
        (data.market.find((c) => c.score === "WEAK")?.approvalRate || 0) * 100
      ),
    },
    {
      score: "Capital Eff.",
      Strong: Math.round(
        (data.capitalEfficiency.find((c) => c.score === "STRONG")?.approvalRate || 0) *
          100
      ),
      Weak: Math.round(
        (data.capitalEfficiency.find((c) => c.score === "WEAK")?.approvalRate || 0) *
          100
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Best Predictor Insight */}
      {data.bestPredictor && (
        <Card variant="raised" className="p-4 bg-tactical-500/10 border-tactical-500/20">
          <p className="text-sm text-foreground font-medium">{data.bestPredictor}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Based on {data.confidence.sampleSize} IC memos with decisions
          </p>
        </Card>
      )}

      {/* Comparison Chart */}
      <Card variant="raised" className="p-4">
        <h4 className="text-sm font-medium text-foreground mb-4">
          Strong vs Weak Score Approval Rates
        </h4>
        <BarChart
          data={chartData}
          index="score"
          categories={["Strong", "Weak"]}
          colors={["emerald", "rose"]}
          valueFormatter={(v) => `${v}%`}
          yAxisWidth={48}
          className="h-64"
        />
      </Card>

      {/* Detailed Tables Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card variant="raised" className="p-4">
          <ScoreTable title="Triple-Use" correlations={data.tripleUse} />
        </Card>
        <Card variant="raised" className="p-4">
          <ScoreTable title="WLCDIA" correlations={data.wlcdia} />
        </Card>
        <Card variant="raised" className="p-4">
          <ScoreTable title="Team" correlations={data.team} />
        </Card>
        <Card variant="raised" className="p-4">
          <ScoreTable title="Market" correlations={data.market} />
        </Card>
        <Card variant="raised" className="p-4">
          <ScoreTable title="Capital Efficiency" correlations={data.capitalEfficiency} />
        </Card>
      </div>
    </div>
  );
}

export default ScoreCorrelationChart;
