"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  DonutChart,
} from "@tremor/react";
import {
  BarChartIcon,
  ArrowRightIcon,
  ClockIcon,
  TargetIcon,
  CheckCircledIcon,
  Cross2Icon,
  PersonIcon,
  CalendarIcon,
} from "@radix-ui/react-icons";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  SourceType,
  DealWithSource,
  sourceTypeConfig,
  calculateSourceMetrics,
  calculateFunnelBySource,
  calculateEventEffectiveness,
  calculateQualityScoreBySource,
  formatDaysToClose,
} from "@/lib/deals/source-tracking";

// =============================================================================
// SOURCE ANALYTICS DASHBOARD
// =============================================================================

interface SourceAnalyticsDashboardProps {
  deals: DealWithSource[];
}

export function SourceAnalyticsDashboard({ deals }: SourceAnalyticsDashboardProps) {
  const [selectedSource, setSelectedSource] = React.useState<SourceType | null>(null);

  // Calculate metrics
  const sourceMetrics = React.useMemo(() => calculateSourceMetrics(deals), [deals]);
  const eventEffectiveness = React.useMemo(() => calculateEventEffectiveness(deals), [deals]);
  const qualityScores = React.useMemo(() => calculateQualityScoreBySource(deals), [deals]);

  // Aggregate stats
  const totalDeals = deals.length;
  const wonDeals = deals.filter(d => d.outcome === "WON").length;
  const overallConversion = totalDeals > 0 ? wonDeals / totalDeals : 0;

  // Chart data
  const conversionBySourceData = sourceMetrics.map(m => ({
    name: sourceTypeConfig[m.sourceType].label,
    "Conversion Rate": m.conversionRate * 100,
    "Deals Won": m.wonDeals,
  }));

  const dealsBySourceData = sourceMetrics.map(m => ({
    name: sourceTypeConfig[m.sourceType].label,
    value: m.totalDeals,
    color: sourceTypeConfig[m.sourceType].color.includes("emerald") ? "emerald" :
           sourceTypeConfig[m.sourceType].color.includes("blue") ? "blue" :
           sourceTypeConfig[m.sourceType].color.includes("purple") ? "violet" :
           sourceTypeConfig[m.sourceType].color.includes("amber") ? "amber" :
           sourceTypeConfig[m.sourceType].color.includes("cyan") ? "cyan" :
           sourceTypeConfig[m.sourceType].color.includes("red") ? "rose" :
           sourceTypeConfig[m.sourceType].color.includes("indigo") ? "indigo" : "slate",
  }));

  const timeToCloseData = sourceMetrics
    .filter(m => m.avgTimeToClose > 0)
    .map(m => ({
      name: sourceTypeConfig[m.sourceType].label,
      "Avg Days to Close": Math.round(m.avgTimeToClose),
    }));

  const qualityData = Array.from(qualityScores.entries()).map(([type, score]) => ({
    name: sourceTypeConfig[type].label,
    "Quality Score": score,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Total Deals Sourced"
          value={totalDeals.toString()}
          icon={<BarChartIcon className="size-5" />}
          color="blue"
        />
        <MetricCard
          title="Deals Won"
          value={wonDeals.toString()}
          subtitle={`${(overallConversion * 100).toFixed(1)}% conversion`}
          icon={<CheckCircledIcon className="size-5" />}
          color="emerald"
        />
        <MetricCard
          title="Active Sources"
          value={sourceMetrics.length.toString()}
          subtitle="channels tracked"
          icon={<TargetIcon className="size-5" />}
          color="violet"
        />
        <MetricCard
          title="Top Source"
          value={sourceMetrics[0] ? sourceTypeConfig[sourceMetrics[0].sourceType].label : "N/A"}
          subtitle={sourceMetrics[0] ? `${(sourceMetrics[0].conversionRate * 100).toFixed(0)}% conversion` : ""}
          icon={<PersonIcon className="size-5" />}
          color="amber"
        />
      </div>

      {/* Conversion by Source */}
      <div className="grid grid-cols-2 gap-6">
        <Card variant="raised">
          <CardHeader>
            <CardTitle>Conversion Rate by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={conversionBySourceData}
              index="name"
              categories={["Conversion Rate"]}
              colors={["emerald"]}
              valueFormatter={(v) => `${v.toFixed(1)}%`}
              yAxisWidth={50}
              className="h-64"
            />
          </CardContent>
        </Card>

        <Card variant="raised">
          <CardHeader>
            <CardTitle>Deal Distribution by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={dealsBySourceData}
              category="value"
              index="name"
              colors={["emerald", "blue", "violet", "amber", "cyan", "rose", "indigo", "slate"]}
              valueFormatter={(v) => `${v} deals`}
              className="h-64"
            />
          </CardContent>
        </Card>
      </div>

      {/* Source Performance Table */}
      <Card variant="raised">
        <CardHeader>
          <CardTitle>Source Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Source</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Won</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Lost</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Pending</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Conversion</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Avg Time</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Quality</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Invested</th>
                </tr>
              </thead>
              <tbody>
                {sourceMetrics.map((metric) => {
                  const config = sourceTypeConfig[metric.sourceType];
                  return (
                    <tr
                      key={metric.sourceType}
                      className="border-b border-border/50 hover:bg-muted/20 cursor-pointer"
                      onClick={() => setSelectedSource(metric.sourceType === selectedSource ? null : metric.sourceType)}
                    >
                      <td className="py-3 px-4">
                        <Badge className={config.color} size="sm">
                          {config.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">{metric.totalDeals}</td>
                      <td className="py-3 px-4 text-right text-emerald-400">{metric.wonDeals}</td>
                      <td className="py-3 px-4 text-right text-red-400">{metric.lostDeals}</td>
                      <td className="py-3 px-4 text-right text-amber-400">{metric.pendingDeals}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={cn(
                          metric.conversionRate >= 0.3 ? "text-emerald-400" :
                          metric.conversionRate >= 0.15 ? "text-amber-400" : "text-muted-foreground"
                        )}>
                          {(metric.conversionRate * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        {metric.avgTimeToClose > 0 ? formatDaysToClose(metric.avgTimeToClose) : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <QualityIndicator score={metric.avgQualityScore} />
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        ${(metric.totalInvested / 1000000).toFixed(1)}M
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Time to Close & Quality */}
      <div className="grid grid-cols-2 gap-6">
        <Card variant="raised">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="size-5 text-amber-400" />
              Average Time to Close
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={timeToCloseData}
              index="name"
              categories={["Avg Days to Close"]}
              colors={["amber"]}
              valueFormatter={(v) => `${v} days`}
              layout="vertical"
              className="h-64"
            />
          </CardContent>
        </Card>

        <Card variant="raised">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TargetIcon className="size-5 text-cyan-400" />
              Deal Quality by Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={qualityData}
              index="name"
              categories={["Quality Score"]}
              colors={["cyan"]}
              valueFormatter={(v) => `${v.toFixed(1)}/10`}
              layout="vertical"
              className="h-64"
            />
          </CardContent>
        </Card>
      </div>

      {/* Event Effectiveness */}
      {eventEffectiveness.length > 0 && (
        <Card variant="raised">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="size-5 text-purple-400" />
              Event Effectiveness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Event</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Deals Sourced</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Deals Won</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Conversion</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Invested</th>
                  </tr>
                </thead>
                <tbody>
                  {eventEffectiveness.map((event) => (
                    <tr key={event.eventName} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="py-3 px-4 font-medium">{event.eventName}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">{event.dealsSourced}</td>
                      <td className="py-3 px-4 text-right text-emerald-400">{event.dealsWon}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={cn(
                          event.conversionRate >= 0.3 ? "text-emerald-400" : "text-muted-foreground"
                        )}>
                          {(event.conversionRate * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        ${(event.totalInvested / 1000000).toFixed(1)}M
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Source Funnel */}
      {selectedSource && (
        <SourceFunnelVisualization
          deals={deals}
          sourceType={selectedSource}
          onClose={() => setSelectedSource(null)}
        />
      )}
    </div>
  );
}

// =============================================================================
// SOURCE FUNNEL VISUALIZATION
// =============================================================================

interface SourceFunnelVisualizationProps {
  deals: DealWithSource[];
  sourceType: SourceType;
  onClose?: () => void;
}

export function SourceFunnelVisualization({ deals, sourceType, onClose }: SourceFunnelVisualizationProps) {
  const funnel = calculateFunnelBySource(deals, sourceType);
  const config = sourceTypeConfig[sourceType];

  const maxCount = Math.max(...funnel.stages.map(s => s.count));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card variant="raised">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ArrowRightIcon className="size-5 text-indigo-400" />
              Funnel: {config.label}
            </CardTitle>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-atlas-sm transition-colors"
              >
                <Cross2Icon className="size-4" />
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {funnel.stages.map((stage, index) => (
              <div key={stage.stage} className="flex items-center gap-4">
                <div className="w-32 text-sm text-muted-foreground">
                  {stage.stage.replace("_", " ")}
                </div>
                <div className="flex-1 h-8 bg-muted/30 rounded-atlas-sm overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${maxCount > 0 ? (stage.count / maxCount) * 100 : 0}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="h-full bg-indigo-500/50 rounded-atlas-sm"
                  />
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-sm font-medium">{stage.count}</span>
                  </div>
                </div>
                <div className="w-20 text-right text-sm">
                  <span className={cn(
                    stage.conversionFromPrevious >= 50 ? "text-emerald-400" :
                    stage.conversionFromPrevious >= 25 ? "text-amber-400" : "text-red-400"
                  )}>
                    {stage.conversionFromPrevious.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: "emerald" | "blue" | "violet" | "amber";
}

function MetricCard({ title, value, subtitle, icon, color }: MetricCardProps) {
  const colorClasses = {
    emerald: "bg-emerald-500/20 text-emerald-400",
    blue: "bg-blue-500/20 text-blue-400",
    violet: "bg-violet-500/20 text-violet-400",
    amber: "bg-amber-500/20 text-amber-400",
  };

  return (
    <Card variant="raised" className="p-4">
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-atlas-sm flex items-center justify-center", colorClasses[color])}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{title}</div>
          {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
        </div>
      </div>
    </Card>
  );
}

interface QualityIndicatorProps {
  score: number;
}

function QualityIndicator({ score }: QualityIndicatorProps) {
  if (score === 0) return <span className="text-muted-foreground">—</span>;

  const color = score >= 8 ? "text-emerald-400" : score >= 6 ? "text-amber-400" : "text-red-400";

  return (
    <span className={cn("font-medium", color)}>
      {score.toFixed(1)}
    </span>
  );
}
