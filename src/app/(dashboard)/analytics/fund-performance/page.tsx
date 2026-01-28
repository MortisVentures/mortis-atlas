"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  BarChart,
  DonutChart,
  Color,
} from "@tremor/react";
import {
  BarChartIcon,
  DownloadIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  RocketIcon,
  TargetIcon,
  LayersIcon,
  GlobeIcon,
  PieChartIcon,
  ClockIcon,
  CheckCircledIcon,
  TriangleUpIcon,
} from "@radix-ui/react-icons";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  SAMPLE_INVESTMENTS,
  SAMPLE_FUND_INFO,
  calculateFundMetrics,
  analyzePortfolioConstruction,
  generateQuarterlyData,
  getAllCashFlows,
  formatCurrency,
  formatPercentage,
  formatMultiple,
} from "@/lib/analytics/fund-metrics";

// =============================================================================
// CHART COLORS
// =============================================================================

const chartColors: Color[] = ["emerald", "cyan", "indigo", "amber", "rose", "violet", "blue", "fuchsia"];

// =============================================================================
// FUND PERFORMANCE PAGE
// =============================================================================

export default function FundPerformancePage() {
  const [selectedPeriod, setSelectedPeriod] = React.useState<"all" | "ytd" | "1y" | "3y">("all");

  // Calculate metrics
  const metrics = React.useMemo(() => {
    return calculateFundMetrics(SAMPLE_INVESTMENTS, SAMPLE_FUND_INFO);
  }, []);

  // Portfolio construction analysis
  const portfolioConstruction = React.useMemo(() => {
    return analyzePortfolioConstruction(SAMPLE_INVESTMENTS);
  }, []);

  // Quarterly data
  const quarterlyData = React.useMemo(() => {
    return generateQuarterlyData(SAMPLE_INVESTMENTS, getAllCashFlows(SAMPLE_INVESTMENTS), "2021-01-01", 16);
  }, []);

  // Capital deployment timeline data
  const deploymentData = React.useMemo(() => {
    let cumulative = 0;
    return SAMPLE_INVESTMENTS
      .sort((a, b) => new Date(a.investmentDate).getTime() - new Date(b.investmentDate).getTime())
      .map((inv) => {
        cumulative += inv.initialAmount;
        return {
          date: inv.investmentDate,
          company: inv.companyName,
          amount: inv.initialAmount,
          cumulative,
          cumulativeFormatted: formatCurrency(cumulative, 1),
        };
      });
  }, []);

  // Investment performance data for bar chart
  const investmentPerformance = React.useMemo(() => {
    return SAMPLE_INVESTMENTS.map((inv) => ({
      name: inv.companyName,
      "Initial Investment": inv.initialAmount / 1000000,
      "Current Value": (inv.currentValue + inv.realizedValue) / 1000000,
      moic: inv.isExited
        ? inv.realizedValue / inv.initialAmount
        : inv.currentValue / inv.initialAmount,
    })).sort((a, b) => b.moic - a.moic);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-atlas-md bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <BarChartIcon className="size-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{SAMPLE_FUND_INFO.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Fund Performance Analytics • Vintage {SAMPLE_FUND_INFO.vintageYear}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Period Selector */}
              <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-atlas-sm">
                {(["all", "ytd", "1y", "3y"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-atlas-sm transition-all",
                      selectedPeriod === period
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {period === "all" ? "All Time" : period.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Export Button */}
              <Button variant="outline" className="gap-2">
                <DownloadIcon className="size-4" />
                Export
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Key Metrics Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-6 gap-4">
            <MetricCard
              title="Net IRR"
              value={formatPercentage(metrics.netIRR)}
              subtitle="Since Inception"
              trend={metrics.netIRR > 0.15 ? "up" : metrics.netIRR > 0 ? "neutral" : "down"}
              benchmark="Top Quartile: 25%+"
              icon={<TriangleUpIcon className="size-5" />}
              color="emerald"
            />
            <MetricCard
              title="Total MOIC"
              value={formatMultiple(metrics.totalMOIC)}
              subtitle="Gross Multiple"
              trend={metrics.totalMOIC > 2 ? "up" : metrics.totalMOIC > 1 ? "neutral" : "down"}
              benchmark="Target: 3.0x"
              icon={<LayersIcon className="size-5" />}
              color="cyan"
            />
            <MetricCard
              title="TVPI"
              value={formatMultiple(metrics.tvpi)}
              subtitle="Total Value / Paid-In"
              trend={metrics.tvpi > 1.5 ? "up" : "neutral"}
              icon={<TargetIcon className="size-5" />}
              color="indigo"
            />
            <MetricCard
              title="DPI"
              value={formatMultiple(metrics.dpi)}
              subtitle="Distributions / Paid-In"
              trend={metrics.dpi > 0.5 ? "up" : "neutral"}
              icon={<CheckCircledIcon className="size-5" />}
              color="violet"
            />
            <MetricCard
              title="Deployed"
              value={formatCurrency(metrics.deployedCapital, 1)}
              subtitle={`of ${formatCurrency(metrics.committedCapital, 0)}`}
              progress={(metrics.deployedCapital / metrics.committedCapital) * 100}
              icon={<RocketIcon className="size-5" />}
              color="amber"
            />
            <MetricCard
              title="Dry Powder"
              value={formatCurrency(metrics.dryPowder, 1)}
              subtitle="Remaining Capital"
              icon={<ClockIcon className="size-5" />}
              color="blue"
            />
          </div>
        </motion.div>

        {/* IRR & MOIC Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-6"
        >
          {/* IRR Breakdown */}
          <Card variant="raised">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TriangleUpIcon className="size-5 text-emerald-400" />
                IRR Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted/30 rounded-atlas-md p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {formatPercentage(metrics.grossIRR)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Gross IRR</div>
                  </div>
                  <div className="bg-muted/30 rounded-atlas-md p-4 text-center">
                    <div className="text-2xl font-bold text-cyan-400">
                      {formatPercentage(metrics.netIRR)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Net IRR</div>
                  </div>
                  <div className="bg-muted/30 rounded-atlas-md p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-400">
                      {formatMultiple(metrics.pmeRatio)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">PME vs S&P</div>
                  </div>
                </div>

                {/* IRR Waterfall */}
                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-3">IRR Waterfall</h4>
                  <div className="space-y-2">
                    <WaterfallItem
                      label="Gross IRR"
                      value={metrics.grossIRR * 100}
                      total={metrics.grossIRR * 100}
                      color="emerald"
                    />
                    <WaterfallItem
                      label="Management Fees"
                      value={-2}
                      total={metrics.grossIRR * 100}
                      color="amber"
                      isNegative
                    />
                    <WaterfallItem
                      label="Carried Interest"
                      value={-3.5}
                      total={metrics.grossIRR * 100}
                      color="violet"
                      isNegative
                    />
                    <WaterfallItem
                      label="Net IRR"
                      value={metrics.netIRR * 100}
                      total={metrics.grossIRR * 100}
                      color="cyan"
                      isFinal
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MOIC Breakdown */}
          <Card variant="raised">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayersIcon className="size-5 text-cyan-400" />
                MOIC Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted/30 rounded-atlas-md p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {formatMultiple(metrics.realizedMOIC)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Realized</div>
                  </div>
                  <div className="bg-muted/30 rounded-atlas-md p-4 text-center">
                    <div className="text-2xl font-bold text-amber-400">
                      {formatMultiple(metrics.unrealizedMOIC)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Unrealized</div>
                  </div>
                  <div className="bg-muted/30 rounded-atlas-md p-4 text-center">
                    <div className="text-2xl font-bold text-cyan-400">
                      {formatMultiple(metrics.totalMOIC)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Total MOIC</div>
                  </div>
                </div>

                {/* MOIC Distribution */}
                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-3">Portfolio MOIC Distribution</h4>
                  <BarChart
                    data={investmentPerformance.slice(0, 8)}
                    index="name"
                    categories={["Initial Investment", "Current Value"]}
                    colors={["slate", "emerald"]}
                    valueFormatter={(v) => `$${v.toFixed(1)}M`}
                    yAxisWidth={50}
                    className="h-48"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* LP Metrics & Performance Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-6"
        >
          {/* TVPI/DPI/RVPI Chart */}
          <Card variant="raised" className="col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TargetIcon className="size-5 text-indigo-400" />
                LP Metrics Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AreaChart
                data={quarterlyData}
                index="quarter"
                categories={["tvpi", "dpi", "rvpi"]}
                colors={["indigo", "emerald", "amber"]}
                valueFormatter={(v) => `${v.toFixed(2)}x`}
                yAxisWidth={50}
                className="h-72"
                showLegend
                curveType="monotone"
              />
            </CardContent>
          </Card>

          {/* LP Metrics Summary */}
          <Card variant="raised">
            <CardHeader>
              <CardTitle>LP Returns Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <MetricBar label="TVPI" value={metrics.tvpi} max={3} color="indigo" />
                <MetricBar label="DPI" value={metrics.dpi} max={3} color="emerald" />
                <MetricBar label="RVPI" value={metrics.rvpi} max={3} color="amber" />
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid-In Capital</span>
                  <span className="font-medium">{formatCurrency(metrics.calledCapital, 1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Distributions</span>
                  <span className="font-medium text-emerald-400">
                    {formatCurrency(metrics.dpi * metrics.calledCapital, 1)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Residual Value</span>
                  <span className="font-medium text-amber-400">
                    {formatCurrency(metrics.rvpi * metrics.calledCapital, 1)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-border">
                  <span className="font-medium">Total Value</span>
                  <span className="font-bold text-indigo-400">
                    {formatCurrency(metrics.tvpi * metrics.calledCapital, 1)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Capital Deployment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card variant="raised">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <RocketIcon className="size-5 text-amber-400" />
                  Capital Deployment
                </CardTitle>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Deployed: {formatCurrency(metrics.deployedCapital, 1)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>Reserve: {formatCurrency(metrics.reserveAllocation, 1)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-500" />
                    <span>Dry Powder: {formatCurrency(metrics.dryPowder, 1)}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-6">
                {/* Deployment Progress */}
                <div className="col-span-1">
                  <DonutChart
                    data={[
                      { name: "Deployed", value: metrics.deployedCapital },
                      { name: "Reserve", value: metrics.reserveAllocation },
                      { name: "Dry Powder", value: metrics.dryPowder },
                    ]}
                    category="value"
                    index="name"
                    colors={["emerald", "amber", "slate"]}
                    valueFormatter={(v) => formatCurrency(v, 1)}
                    className="h-48"
                  />
                  <div className="text-center mt-2">
                    <div className="text-2xl font-bold">
                      {((metrics.deployedCapital / metrics.committedCapital) * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Capital Deployed</div>
                  </div>
                </div>

                {/* Deployment Timeline */}
                <div className="col-span-3">
                  <AreaChart
                    data={deploymentData}
                    index="date"
                    categories={["cumulative"]}
                    colors={["emerald"]}
                    valueFormatter={(v) => formatCurrency(v, 1)}
                    yAxisWidth={60}
                    className="h-64"
                    showLegend={false}
                    curveType="monotone"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Portfolio Construction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-6"
        >
          {/* By Sector */}
          <Card variant="raised">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="size-5 text-violet-400" />
                Sector Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart
                data={portfolioConstruction.bySector}
                category="value"
                index="sector"
                colors={chartColors}
                valueFormatter={(v) => formatCurrency(v, 1)}
                className="h-48"
              />
              <div className="mt-4 space-y-2">
                {portfolioConstruction.bySector.slice(0, 5).map((item, idx) => (
                  <div key={item.sector} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: `var(--tremor-${chartColors[idx]}-500)` }}
                      />
                      <span className="truncate">{item.sector}</span>
                    </div>
                    <span className="text-muted-foreground">{item.percentage.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* By Stage */}
          <Card variant="raised">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayersIcon className="size-5 text-cyan-400" />
                Stage Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={portfolioConstruction.byStage}
                index="stage"
                categories={["value"]}
                colors={["cyan"]}
                valueFormatter={(v) => formatCurrency(v, 1)}
                layout="vertical"
                className="h-48"
                showLegend={false}
              />
              <div className="mt-4 grid grid-cols-2 gap-2">
                {portfolioConstruction.byStage.map((item) => (
                  <div key={item.stage} className="bg-muted/30 rounded-atlas-sm p-2 text-center">
                    <div className="text-lg font-bold">{item.count}</div>
                    <div className="text-xs text-muted-foreground">{item.stage}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* By Geography */}
          <Card variant="raised">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GlobeIcon className="size-5 text-blue-400" />
                Geographic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart
                data={portfolioConstruction.byGeography}
                category="value"
                index="geography"
                colors={["blue", "emerald", "amber"]}
                valueFormatter={(v) => formatCurrency(v, 1)}
                className="h-48"
              />
              <div className="mt-4 space-y-2">
                {portfolioConstruction.byGeography.map((item, idx) => (
                  <div key={item.geography} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: `var(--tremor-${["blue", "emerald", "amber"][idx]}-500)` }}
                      />
                      <span>{item.geography}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{item.count} cos</span>
                      <span>{item.percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vintage Year Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card variant="raised">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="size-5 text-amber-400" />
                Vintage Year Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Vintage</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Invested</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Current Value</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">MOIC</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">IRR</th>
                      <th className="py-3 px-4 text-sm font-medium text-muted-foreground w-48">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioConstruction.byVintage.map((vintage) => (
                      <tr key={vintage.year} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="py-3 px-4 font-medium">{vintage.year}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(vintage.invested, 1)}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(vintage.currentValue, 1)}</td>
                        <td className="py-3 px-4 text-right">
                          <Badge
                            className={cn(
                              vintage.moic >= 2
                                ? "bg-emerald-500/20 text-emerald-400"
                                : vintage.moic >= 1
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-red-500/20 text-red-400"
                            )}
                          >
                            {formatMultiple(vintage.moic)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={cn(
                              vintage.irr >= 25 ? "text-emerald-400" : vintage.irr >= 0 ? "text-foreground" : "text-red-400"
                            )}
                          >
                            {vintage.irr.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                vintage.moic >= 2 ? "bg-emerald-500" : vintage.moic >= 1 ? "bg-amber-500" : "bg-red-500"
                              )}
                              style={{ width: `${Math.min((vintage.moic / 3) * 100, 100)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Portfolio Companies Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="raised">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Portfolio Companies ({metrics.totalInvestments})</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge className="bg-emerald-500/20 text-emerald-400">
                    {metrics.activeInvestments} Active
                  </Badge>
                  <Badge className="bg-violet-500/20 text-violet-400">
                    {metrics.exitedInvestments} Exited
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Company</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Stage</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sector</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Invested</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Current Value</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">MOIC</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_INVESTMENTS.sort(
                      (a, b) =>
                        (b.currentValue + b.realizedValue) / b.initialAmount -
                        (a.currentValue + a.realizedValue) / a.initialAmount
                    ).map((inv) => {
                      const moic = (inv.currentValue + inv.realizedValue) / inv.initialAmount;
                      return (
                        <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-atlas-sm bg-gradient-to-br from-navy-500 to-tactical-500 flex items-center justify-center text-white text-xs font-bold">
                                {inv.companyName[0]}
                              </div>
                              <span className="font-medium">{inv.companyName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary" size="sm">
                              {inv.stage.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{inv.sector}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(inv.initialAmount, 1)}</td>
                          <td className="py-3 px-4 text-right">
                            {formatCurrency(inv.currentValue + inv.realizedValue, 1)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={cn(
                                "font-medium",
                                moic >= 2 ? "text-emerald-400" : moic >= 1 ? "text-foreground" : "text-red-400"
                              )}
                            >
                              {formatMultiple(moic)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {inv.isExited ? (
                              <Badge className="bg-violet-500/20 text-violet-400">Exited</Badge>
                            ) : (
                              <Badge className="bg-emerald-500/20 text-emerald-400">Active</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  benchmark?: string;
  progress?: number;
  icon: React.ReactNode;
  color: "emerald" | "cyan" | "indigo" | "violet" | "amber" | "blue";
}

function MetricCard({ value, subtitle, trend, benchmark, progress, icon, color }: MetricCardProps) {
  const colorClasses = {
    emerald: "bg-emerald-500/20 text-emerald-400",
    cyan: "bg-cyan-500/20 text-cyan-400",
    indigo: "bg-indigo-500/20 text-indigo-400",
    violet: "bg-violet-500/20 text-violet-400",
    amber: "bg-amber-500/20 text-amber-400",
    blue: "bg-blue-500/20 text-blue-400",
  };

  return (
    <Card variant="raised" className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-atlas-sm flex items-center justify-center", colorClasses[color])}>
          {icon}
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs",
              trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-muted-foreground"
            )}
          >
            {trend === "up" ? <ArrowUpIcon className="size-3" /> : trend === "down" ? <ArrowDownIcon className="size-3" /> : null}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
      {progress !== undefined && (
        <div className="mt-3">
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full", `bg-${color}-500`)}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
      {benchmark && <div className="text-[10px] text-muted-foreground mt-2">{benchmark}</div>}
    </Card>
  );
}

interface WaterfallItemProps {
  label: string;
  value: number;
  total: number;
  color: string;
  isNegative?: boolean;
  isFinal?: boolean;
}

function WaterfallItem({ label, value, total, color, isNegative, isFinal }: WaterfallItemProps) {
  const width = Math.abs(value / total) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="w-28 text-sm text-muted-foreground">{label}</div>
      <div className="flex-1 h-6 bg-muted/30 rounded-atlas-sm overflow-hidden relative">
        <div
          className={cn(
            "absolute top-0 h-full rounded-atlas-sm",
            isFinal ? `bg-${color}-500` : isNegative ? `bg-${color}-500/50` : `bg-${color}-500`
          )}
          style={{ width: `${width}%`, left: isNegative ? `${100 - width}%` : 0 }}
        />
      </div>
      <div
        className={cn(
          "w-16 text-right text-sm font-medium",
          isNegative ? "text-red-400" : isFinal ? `text-${color}-400` : ""
        )}
      >
        {isNegative ? "-" : ""}
        {Math.abs(value).toFixed(1)}%
      </div>
    </div>
  );
}

interface MetricBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

function MetricBar({ label, value, max, color }: MetricBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{formatMultiple(value)}</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-${color}-500`}
          style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
