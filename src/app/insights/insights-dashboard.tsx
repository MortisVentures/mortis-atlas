"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChartIcon, LightningBoltIcon, MixerHorizontalIcon, ActivityLogIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

// Layout components
import {
  DashboardLayout,
  DashboardContent,
  PageHeader,
  PageSection,
} from "@/components/layout";

// Insight components
import {
  InsightKPIGrid,
  SourceEffectivenessChart,
  TimeInStageChart,
  DealVelocityChart,
  FounderRatingMatrix,
  ScoreCorrelationChart,
  PatternCard,
  DealVolumeTrend,
  SectorDistributionChart,
  SparseDataNotice,
} from "@/components/insights";

// Hooks
import { useInsights } from "@/hooks/use-insights";

// Thresholds
import { DATA_THRESHOLDS } from "@/lib/insights/thresholds";

// =============================================================================
// TYPES
// =============================================================================

type Tab = "overview" | "deal-flow" | "outcomes" | "trends";

interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  description: string;
}

// =============================================================================
// TAB CONFIGURATION
// =============================================================================

const tabs: TabConfig[] = [
  {
    id: "overview",
    label: "Overview",
    icon: <BarChartIcon className="size-4" />,
    description: "Key signals and recommendations",
  },
  {
    id: "deal-flow",
    label: "Deal Flow",
    icon: <ActivityLogIcon className="size-4" />,
    description: "Source effectiveness and pipeline velocity",
  },
  {
    id: "outcomes",
    label: "Outcome Learning",
    icon: <LightningBoltIcon className="size-4" />,
    description: "IC Memo correlations and decision patterns",
  },
  {
    id: "trends",
    label: "Trends",
    icon: <MixerHorizontalIcon className="size-4" />,
    description: "Deal volume, sector shifts, valuations",
  },
];

// =============================================================================
// TAB BUTTON COMPONENT
// =============================================================================

interface TabButtonProps {
  tab: TabConfig;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ tab, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
        "hover:bg-muted/50",
        isActive
          ? "text-foreground bg-muted"
          : "text-muted-foreground"
      )}
    >
      {tab.icon}
      <span className="hidden sm:inline">{tab.label}</span>
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-tactical-500/10 border border-tactical-500/20 rounded-lg -z-10"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </button>
  );
}

// =============================================================================
// TAB CONTENT COMPONENTS
// =============================================================================

interface OverviewTabProps {
  data: ReturnType<typeof useInsights>;
}

function OverviewTab({ data }: OverviewTabProps) {
  const { overview, isLoading } = data;

  if (isLoading) {
    return <TabSkeleton />;
  }

  if (!overview) {
    return <SparseDataNotice message="Unable to load overview data." />;
  }

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <InsightKPIGrid kpis={overview.kpis} />

      {/* Top Signals */}
      {overview.topSignals.length > 0 && (
        <PageSection title="Key Signals">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {overview.topSignals.map((signal) => (
              <PatternCard key={signal.id} insight={signal} />
            ))}
          </div>
        </PageSection>
      )}

      {/* All Insights */}
      {overview.insights.length > 0 && (
        <PageSection title="All Insights">
          <div className="grid gap-4 md:grid-cols-2">
            {overview.insights.map((insight) => (
              <PatternCard key={insight.id} insight={insight} />
            ))}
          </div>
        </PageSection>
      )}
    </div>
  );
}

interface DealFlowTabProps {
  data: ReturnType<typeof useInsights>;
}

function DealFlowTab({ data }: DealFlowTabProps) {
  const { dealFlow, isLoading } = data;

  if (isLoading) {
    return <TabSkeleton />;
  }

  if (!dealFlow) {
    return <SparseDataNotice message="Unable to load deal flow data." />;
  }

  const hasSourceData = dealFlow.sourceEffectiveness.length > 0;
  const hasStageData = dealFlow.timeInStage.some((t) => t.dealCount > 0);
  const hasVelocityData = dealFlow.velocity.some((v) => v.newDeals > 0 || v.closedWon > 0);

  return (
    <div className="space-y-6">
      {/* Source Effectiveness */}
      <PageSection title="Source Effectiveness">
        {hasSourceData ? (
          <SourceEffectivenessChart data={dealFlow.sourceEffectiveness} />
        ) : (
          <SparseDataNotice message="Add deals with source types to see effectiveness metrics." />
        )}
      </PageSection>

      {/* Time in Stage */}
      <PageSection title="Time in Stage">
        {hasStageData ? (
          <TimeInStageChart data={dealFlow.timeInStage} />
        ) : (
          <SparseDataNotice message="Track deal stage transitions to see time metrics." />
        )}
      </PageSection>

      {/* Deal Velocity */}
      <PageSection title="Deal Velocity (Last 6 Months)">
        {hasVelocityData ? (
          <DealVelocityChart data={dealFlow.velocity} />
        ) : (
          <SparseDataNotice message="Add more deals to see velocity trends." />
        )}
      </PageSection>

      {/* Funnel Conversion */}
      {dealFlow.funnelConversion.length > 0 && (
        <PageSection title="Funnel Conversion">
          <div className="grid gap-2">
            {dealFlow.funnelConversion.map((stage, i) => (
              <div
                key={stage.stage}
                className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
              >
                <span className="text-sm font-medium text-muted-foreground w-32">
                  {stage.stage}
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-tactical-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.percentage * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  />
                </div>
                <span className="text-sm font-mono font-medium w-16 text-right">
                  {stage.count} ({(stage.percentage * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </PageSection>
      )}
    </div>
  );
}

interface OutcomesTabProps {
  data: ReturnType<typeof useInsights>;
}

function OutcomesTab({ data }: OutcomesTabProps) {
  const { outcomes, isLoading } = data;

  if (isLoading) {
    return <TabSkeleton />;
  }

  if (!outcomes) {
    return <SparseDataNotice message="Unable to load outcome learning data." />;
  }

  const hasEnoughMemos = outcomes.summary.withDecisions >= DATA_THRESHOLDS.MIN_MEMOS_FOR_OUTCOMES;

  if (!hasEnoughMemos) {
    return (
      <SparseDataNotice
        message={`Need at least ${DATA_THRESHOLDS.MIN_MEMOS_FOR_OUTCOMES} IC memos with decisions for outcome learning. Currently have ${outcomes.summary.withDecisions}.`}
        actionLabel="Create IC Memo"
        actionHref="/ic-memos/new"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total IC Memos" value={outcomes.summary.totalMemos} />
        <StatCard label="With Decisions" value={outcomes.summary.withDecisions} />
        <StatCard
          label="Approval Rate"
          value={`${(outcomes.summary.avgApprovalRate * 100).toFixed(0)}%`}
          color={outcomes.summary.avgApprovalRate >= 0.3 ? "green" : "yellow"}
        />
        <StatCard
          label="Approved / Declined"
          value={`${outcomes.summary.approvedCount} / ${outcomes.summary.declinedCount}`}
        />
      </div>

      {/* Founder Rating Matrix */}
      <PageSection title="Founder Rating Correlations">
        <FounderRatingMatrix data={outcomes.founderMatrix} />
      </PageSection>

      {/* Score Effectiveness */}
      <PageSection title="Score Effectiveness">
        <ScoreCorrelationChart data={outcomes.scoreEffectiveness} />
      </PageSection>

      {/* Decision Patterns */}
      {outcomes.patterns.length > 0 && (
        <PageSection title="Decision Patterns">
          <div className="grid gap-4 md:grid-cols-2">
            {outcomes.patterns.map((pattern) => (
              <PatternCard
                key={pattern.id}
                insight={{
                  id: pattern.id,
                  type: "pattern",
                  title: pattern.pattern,
                  description: pattern.description,
                  severity: pattern.outcome === "positive" ? "success" : pattern.outcome === "negative" ? "alert" : "info",
                  confidence: pattern.confidence,
                }}
              />
            ))}
          </div>
        </PageSection>
      )}
    </div>
  );
}

interface TrendsTabProps {
  data: ReturnType<typeof useInsights>;
}

function TrendsTab({ data }: TrendsTabProps) {
  const { trends, isLoading } = data;

  if (isLoading) {
    return <TabSkeleton />;
  }

  if (!trends) {
    return <SparseDataNotice message="Unable to load trends data." />;
  }

  const hasVolumeData = trends.dealVolume.some((d) => d.value > 0);
  const hasSectorData = trends.sectorDistribution.length > 0;

  return (
    <div className="space-y-6">
      {/* Deal Volume Trend */}
      <PageSection title="Deal Volume Trend">
        {hasVolumeData ? (
          <DealVolumeTrend data={trends.dealVolume} />
        ) : (
          <SparseDataNotice message="Add deals to see volume trends over time." />
        )}
      </PageSection>

      {/* Sector Distribution */}
      <PageSection title="Sector Distribution">
        {hasSectorData ? (
          <SectorDistributionChart data={trends.sectorDistribution} />
        ) : (
          <SparseDataNotice message="No sector data available." />
        )}
      </PageSection>

      {/* Source Shifts */}
      {trends.sourceShifts.length > 0 && (
        <PageSection title="Source Shifts (Last 3 vs Previous 3 Months)">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {trends.sourceShifts.map((shift) => (
              <div
                key={shift.source}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <span className="text-sm font-medium">{shift.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {shift.previousPeriod} → {shift.currentPeriod}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-mono font-medium",
                      shift.change > 0 && "text-tactical-500",
                      shift.change < 0 && "text-danger-base",
                      shift.change === 0 && "text-muted-foreground"
                    )}
                  >
                    {shift.change > 0 ? "+" : ""}
                    {(shift.change * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </PageSection>
      )}
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function TabSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="h-64 bg-muted rounded-lg" />
      <div className="h-48 bg-muted rounded-lg" />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  color?: "default" | "green" | "yellow" | "red";
}

function StatCard({ label, value, color = "default" }: StatCardProps) {
  return (
    <div className="p-4 bg-muted/30 rounded-lg">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={cn(
          "text-2xl font-mono font-bold",
          color === "green" && "text-tactical-500",
          color === "yellow" && "text-warning-base",
          color === "red" && "text-danger-base"
        )}
      >
        {value}
      </p>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function InsightsDashboard() {
  const [activeTab, setActiveTab] = React.useState<Tab>("overview");
  const insightsData = useInsights({ section: "all" });

  return (
    <DashboardLayout>
      <DashboardContent>
        {/* Page Header */}
        <PageHeader
          title="Insights Engine"
          description="Decision intelligence powered by your deal data and IC memos"
        />

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1 bg-card/50 border border-border/50 rounded-xl mb-6">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        {/* Tab Description */}
        <p className="text-sm text-muted-foreground mb-6">
          {tabs.find((t) => t.id === activeTab)?.description}
        </p>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && <OverviewTab data={insightsData} />}
            {activeTab === "deal-flow" && <DealFlowTab data={insightsData} />}
            {activeTab === "outcomes" && <OutcomesTab data={insightsData} />}
            {activeTab === "trends" && <TrendsTab data={insightsData} />}
          </motion.div>
        </AnimatePresence>

        {/* Data freshness indicator */}
        {insightsData.data && (
          <p className="text-xs text-muted-foreground text-center mt-8">
            Data generated at {new Date(insightsData.data.generatedAt).toLocaleString()}
          </p>
        )}
      </DashboardContent>
    </DashboardLayout>
  );
}
