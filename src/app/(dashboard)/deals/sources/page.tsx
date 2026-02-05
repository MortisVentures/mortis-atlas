"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MixerHorizontalIcon,
  BarChartIcon,
  PersonIcon,
  RocketIcon,
  TargetIcon,
  MagnifyingGlassIcon,
  DownloadIcon,
} from "@radix-ui/react-icons";
import {
  SourceAnalyticsDashboard,
  SourceFunnelVisualization,
} from "@/components/deals/source-analytics";
import { ReferrerManagementDashboard } from "@/components/deals/referrer-management";
import {
  calculateSourceMetrics,
  SourceType,
  sourceTypeConfig,
  referrerTierConfig,
} from "@/lib/deals/source-tracking";
import { useSourceAttribution } from "@/hooks/use-source-attribution";

type TabType = "overview" | "analytics" | "funnel" | "referrers";

export default function SourceAttributionPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedSource, setSelectedSource] = useState<SourceType | null>(null);

  const { deals, referrers, isLoading, error } = useSourceAttribution();

  // Calculate metrics from real data
  const sourceMetrics = calculateSourceMetrics(deals);

  // Calculate top-level stats
  const totalDeals = deals.length;
  const totalInvested = deals
    .filter((d) => d.outcome === "WON")
    .reduce((sum, d) => sum + (d.amount || 0), 0);
  const avgConversionRate =
    sourceMetrics.length > 0
      ? sourceMetrics.reduce((sum, m) => sum + m.conversionRate, 0) /
        sourceMetrics.length
      : 0;
  const sortedMetrics = [...sourceMetrics].sort(
    (a, b) => b.conversionRate - a.conversionRate
  );
  const topSource = sortedMetrics[0];

  // Top referrers for overview (max 5)
  const topReferrers = [...referrers]
    .sort((a, b) => b.successfulReferrals - a.successfulReferrals)
    .slice(0, 5);

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChartIcon },
    { id: "analytics", label: "Source Analytics", icon: MixerHorizontalIcon },
    { id: "funnel", label: "Funnel Analysis", icon: TargetIcon },
    { id: "referrers", label: "Referrer Management", icon: PersonIcon },
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Deal Source Attribution</h1>
            <p className="text-zinc-400 mt-1">
              Track where your deals come from and optimize sourcing
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} variant="raised" className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-6 w-16 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse" />
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="flex gap-2 border-b border-zinc-800 pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 w-32 bg-zinc-800 rounded animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} variant="raised" className="p-4 h-32">
              <div className="space-y-2">
                <div className="h-5 w-20 bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-full bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-full bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-full bg-zinc-800 rounded animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Deal Source Attribution</h1>
          <p className="text-zinc-400 mt-1">
            Track where your deals come from and optimize sourcing
          </p>
        </div>
        <Card variant="raised" className="p-8 text-center">
          <p className="text-red-400 mb-2">Failed to load data</p>
          <p className="text-sm text-zinc-500">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deal Source Attribution</h1>
          <p className="text-zinc-400 mt-1">
            Track where your deals come from and optimize sourcing
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <DownloadIcon className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="raised" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <RocketIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalDeals}</p>
              <p className="text-xs text-zinc-500">Total Deals Tracked</p>
            </div>
          </div>
        </Card>

        <Card variant="raised" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <BarChartIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ${(totalInvested / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-zinc-500">Total Invested</p>
            </div>
          </div>
        </Card>

        <Card variant="raised" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TargetIcon className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {avgConversionRate.toFixed(1)}%
              </p>
              <p className="text-xs text-zinc-500">Avg Conversion Rate</p>
            </div>
          </div>
        </Card>

        <Card variant="raised" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <MagnifyingGlassIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {topSource
                  ? sourceTypeConfig[topSource.sourceType].label
                  : "N/A"}
              </p>
              <p className="text-xs text-zinc-500">Top Converting Source</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "primary" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className="relative"
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-[10px] left-0 right-0 h-0.5 bg-cyan-400"
                />
              )}
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Source Breakdown */}
            <Card variant="raised" className="p-6">
              <h3 className="font-semibold mb-4">Source Performance Overview</h3>
              {sourceMetrics.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sourceMetrics.slice(0, 8).map((metric) => {
                    const config = sourceTypeConfig[metric.sourceType];
                    return (
                      <motion.div
                        key={metric.sourceType}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors"
                        onClick={() => {
                          setSelectedSource(metric.sourceType);
                          setActiveTab("funnel");
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={`${config.color} text-xs`}
                          >
                            {config.label}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Deals</span>
                            <span className="font-medium">
                              {metric.totalDeals}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Conversion</span>
                            <span
                              className={`font-medium ${
                                metric.conversionRate > 10
                                  ? "text-emerald-400"
                                  : metric.conversionRate > 5
                                    ? "text-amber-400"
                                    : "text-zinc-400"
                              }`}
                            >
                              {metric.conversionRate.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Invested</span>
                            <span className="font-medium">
                              ${(metric.totalInvested / 1000000).toFixed(1)}M
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BarChartIcon className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No deal source data yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Source metrics will appear as deals are added with source
                    types
                  </p>
                </div>
              )}
            </Card>

            {/* Top Referrers Preview */}
            <Card variant="raised" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Top Referrers</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("referrers")}
                >
                  View All
                </Button>
              </div>
              {topReferrers.length > 0 ? (
                <div className="space-y-3">
                  {topReferrers.map((referrer) => (
                    <div
                      key={referrer.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-sm font-semibold">
                          {referrer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{referrer.name}</p>
                          <p className="text-xs text-zinc-500">
                            {referrer.company || referrer.organization || ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <Badge
                          variant="outline"
                          className={`${referrerTierConfig[referrer.tier].color} text-xs`}
                        >
                          {referrerTierConfig[referrer.tier].label}
                        </Badge>
                        <span className="text-zinc-400">
                          {referrer.successfulReferrals}/{referrer.totalReferrals}{" "}
                          won
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <PersonIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No referrer data yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Referrer metrics will appear as deals are sourced through
                    contacts
                  </p>
                </div>
              )}
            </Card>

            {/* Source Mix Chart Placeholder */}
            <Card variant="raised" className="p-6">
              <h3 className="font-semibold mb-4">Deal Flow by Source</h3>
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <BarChartIcon className="w-12 h-12 mx-auto text-zinc-600 mb-2" />
                  <p className="text-zinc-500">
                    Source analytics visualization
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab("analytics")}
                  >
                    View Full Analytics
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "analytics" && (
          <SourceAnalyticsDashboard deals={deals} />
        )}

        {activeTab === "funnel" && (
          <div className="space-y-6">
            {/* Source Selector */}
            <Card variant="raised" className="p-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedSource === null ? "primary" : "outline"}
                  onClick={() => setSelectedSource(null)}
                >
                  All Sources
                </Button>
                {(Object.keys(sourceTypeConfig) as SourceType[]).map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    variant={selectedSource === type ? "primary" : "outline"}
                    onClick={() => setSelectedSource(type)}
                    className={
                      selectedSource === type ? sourceTypeConfig[type].color : ""
                    }
                  >
                    {sourceTypeConfig[type].label}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Funnel Visualization */}
            {selectedSource ? (
              <SourceFunnelVisualization
                deals={deals}
                sourceType={selectedSource}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(Object.keys(sourceTypeConfig) as SourceType[])
                  .slice(0, 4)
                  .map((type) => (
                    <SourceFunnelVisualization
                      key={type}
                      deals={deals}
                      sourceType={type}
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "referrers" && (
          <ReferrerManagementDashboard referrers={referrers} />
        )}
      </motion.div>
    </div>
  );
}
