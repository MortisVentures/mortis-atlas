"use client";

import { useState } from "react";
import Link from "next/link";
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
  SAMPLE_DEALS_WITH_SOURCE,
  SAMPLE_REFERRERS,
  calculateSourceMetrics,
  SourceType,
  sourceTypeConfig,
} from "@/lib/deals/source-tracking";

type TabType = "overview" | "analytics" | "funnel" | "referrers";

export default function SourceAttributionPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedSource, setSelectedSource] = useState<SourceType | null>(null);

  // Calculate metrics
  const sourceMetrics = calculateSourceMetrics(SAMPLE_DEALS_WITH_SOURCE);

  // Calculate top-level stats
  const totalDeals = SAMPLE_DEALS_WITH_SOURCE.length;
  const totalInvested = SAMPLE_DEALS_WITH_SOURCE
    .filter((d) => d.stage === "CLOSED" && d.outcome === "WON")
    .reduce((sum, d) => sum + (d.amount || 0), 0);
  const avgConversionRate =
    sourceMetrics.reduce((sum, m) => sum + m.conversionRate, 0) /
    sourceMetrics.length;
  const topSource = sourceMetrics.sort(
    (a, b) => b.conversionRate - a.conversionRate
  )[0];

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChartIcon },
    { id: "analytics", label: "Source Analytics", icon: MixerHorizontalIcon },
    { id: "funnel", label: "Funnel Analysis", icon: TargetIcon },
    { id: "referrers", label: "Referrer Management", icon: PersonIcon },
  ];

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
        <Card variant="neumorphic" className="p-4">
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

        <Card variant="neumorphic" className="p-4">
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

        <Card variant="neumorphic" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TargetIcon className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgConversionRate.toFixed(1)}%</p>
              <p className="text-xs text-zinc-500">Avg Conversion Rate</p>
            </div>
          </div>
        </Card>

        <Card variant="neumorphic" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <MagnifyingGlassIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {sourceTypeConfig[topSource?.sourceType || "INBOUND"].label}
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
              variant={activeTab === tab.id ? "default" : "ghost"}
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
            <Card variant="neumorphic" className="p-6">
              <h3 className="font-semibold mb-4">Source Performance Overview</h3>
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
                          <span className="font-medium">{metric.totalDeals}</span>
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
            </Card>

            {/* Top Referrers Preview */}
            <Card variant="neumorphic" className="p-6">
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
              <div className="space-y-3">
                {SAMPLE_REFERRERS.slice(0, 5).map((referrer, index) => (
                  <div
                    key={referrer.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        {referrer.contactId ? (
                          <Link
                            href={`/contacts/${referrer.contactId}?highlight=referrals`}
                            className="font-medium text-foreground hover:text-tactical-400 transition-colors"
                          >
                            {referrer.name}
                          </Link>
                        ) : (
                          <p className="font-medium">{referrer.name}</p>
                        )}
                        <p className="text-xs text-zinc-500">
                          {referrer.organization}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{referrer.totalReferrals}</p>
                      <p className="text-xs text-zinc-500">referrals</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Source Mix Chart Placeholder */}
            <Card variant="neumorphic" className="p-6">
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
          <SourceAnalyticsDashboard deals={SAMPLE_DEALS_WITH_SOURCE} />
        )}

        {activeTab === "funnel" && (
          <div className="space-y-6">
            {/* Source Selector */}
            <Card variant="neumorphic" className="p-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedSource === null ? "default" : "outline"}
                  onClick={() => setSelectedSource(null)}
                >
                  All Sources
                </Button>
                {(Object.keys(sourceTypeConfig) as SourceType[]).map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    variant={selectedSource === type ? "default" : "outline"}
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
                deals={SAMPLE_DEALS_WITH_SOURCE}
                sourceType={selectedSource}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(Object.keys(sourceTypeConfig) as SourceType[])
                  .slice(0, 4)
                  .map((type) => (
                    <SourceFunnelVisualization
                      key={type}
                      deals={SAMPLE_DEALS_WITH_SOURCE}
                      sourceType={type}
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "referrers" && (
          <ReferrerManagementDashboard referrers={SAMPLE_REFERRERS} />
        )}
      </motion.div>
    </div>
  );
}
