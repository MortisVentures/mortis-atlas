"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AreaChart,
  DonutChart,
  BarList,
  Color,
} from "@tremor/react";
import {
  RocketIcon,
  BackpackIcon,
  BarChartIcon,
  TargetIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

// =============================================================================
// TYPES
// =============================================================================

interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    trend: "up" | "down" | "neutral";
    label?: string;
  };
  icon?: React.ReactNode;
  href?: string;
  children?: React.ReactNode;
  className?: string;
  glowColor?: "tactical" | "navy" | "warning" | "danger";
}

interface AUMData {
  date: string;
  AUM: number;
}

interface StageDistribution {
  name: string;
  value: number;
  color: Color;
}

interface DealStage {
  name: string;
  value: number;
  color?: string;
}

// =============================================================================
// SAMPLE DATA
// =============================================================================

const aumHistoryData: AUMData[] = [
  { date: "Jan", AUM: 95 },
  { date: "Feb", AUM: 102 },
  { date: "Mar", AUM: 98 },
  { date: "Apr", AUM: 110 },
  { date: "May", AUM: 125 },
  { date: "Jun", AUM: 118 },
  { date: "Jul", AUM: 132 },
  { date: "Aug", AUM: 128 },
  { date: "Sep", AUM: 138 },
  { date: "Oct", AUM: 142 },
];

const stageDistributionData: StageDistribution[] = [
  { name: "Seed", value: 8, color: "cyan" },
  { name: "Series A", value: 12, color: "blue" },
  { name: "Series B", value: 6, color: "indigo" },
  { name: "Series C+", value: 4, color: "violet" },
];

const dealStagesData: DealStage[] = [
  { name: "Due Diligence", value: 8 },
  { name: "Term Sheet", value: 5 },
  { name: "Negotiation", value: 3 },
  { name: "Legal Review", value: 2 },
];

const pipelineHistoryData = [
  { date: "Jul", Pipeline: 18 },
  { date: "Aug", Pipeline: 22 },
  { date: "Sep", Pipeline: 19 },
  { date: "Oct", Pipeline: 25 },
];

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  }),
  hover: {
    y: -4,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  },
};

const valueVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.2,
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  },
};

// =============================================================================
// KPI CARD BASE COMPONENT
// =============================================================================

function KPICard({
  title,
  value,
  change,
  icon,
  href,
  children,
  className,
  glowColor = "navy",
}: KPICardProps) {
  const glowClasses = {
    tactical: "hover:shadow-neu-dark-glow-green",
    navy: "hover:shadow-neu-dark-glow-navy",
    warning: "hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]",
    danger: "hover:shadow-[0_0_25px_rgba(220,38,38,0.2)]",
  };

  const content = (
    <Card
      variant="raised"
      className={cn(
        "p-6 h-full",
        "transition-all duration-base",
        "hover:scale-[1.02]",
        glowClasses[glowColor],
        href && "cursor-pointer",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-muted-foreground">{icon}</span>
          )}
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
        </div>
      </div>

      {/* Value */}
      <motion.div
        className="mb-2"
        variants={valueVariants}
        initial="hidden"
        animate="visible"
      >
        <span className="font-mono text-3xl font-bold tracking-tight text-foreground">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
      </motion.div>

      {/* Change indicator */}
      {change && (
        <div className="flex items-center gap-2 mb-4">
          <span
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              change.trend === "up" && "text-tactical-500",
              change.trend === "down" && "text-danger-base",
              change.trend === "neutral" && "text-muted-foreground"
            )}
          >
            {change.trend === "up" && <ArrowUpIcon className="size-4" />}
            {change.trend === "down" && <ArrowDownIcon className="size-4" />}
            {change.value}
          </span>
          {change.label && (
            <span className="text-xs text-muted-foreground">{change.label}</span>
          )}
        </div>
      )}

      {/* Chart/Content area */}
      {children && <div className="mt-auto">{children}</div>}
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}

// =============================================================================
// TOTAL AUM CARD
// =============================================================================

interface TotalAUMCardProps {
  value: number;
  change: number;
  data: AUMData[];
  index?: number;
}

function TotalAUMCard({ value, change, data, index = 0 }: TotalAUMCardProps) {
  const formattedValue = `$${(value / 1000000).toFixed(1)}M`;
  const formattedChange = `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <KPICard
        title="Total AUM"
        value={formattedValue}
        change={{
          value: formattedChange,
          trend: change >= 0 ? "up" : "down",
          label: "vs last quarter",
        }}
        icon={<BarChartIcon className="size-5" />}
        glowColor="tactical"
      >
        <div className="h-16 -mx-2">
          <AreaChart
            data={data}
            index="date"
            categories={["AUM"]}
            colors={["emerald"]}
            showXAxis={false}
            showYAxis={false}
            showGridLines={false}
            showLegend={false}
            showTooltip={false}
            curveType="natural"
            className="h-full"
          />
        </div>
      </KPICard>
    </motion.div>
  );
}

// =============================================================================
// PORTFOLIO COMPANIES CARD
// =============================================================================

interface PortfolioCompaniesCardProps {
  total: number;
  newThisQuarter: number;
  distribution: StageDistribution[];
  index?: number;
}

function PortfolioCompaniesCard({
  total,
  newThisQuarter,
  distribution,
  index = 1,
}: PortfolioCompaniesCardProps) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <KPICard
        title="Portfolio Companies"
        value={total}
        change={{
          value: `+${newThisQuarter} new`,
          trend: "up",
          label: "this quarter",
        }}
        icon={<BackpackIcon className="size-5" />}
        href="/portfolio"
        glowColor="navy"
      >
        <div className="flex items-center gap-4">
          <div className="w-20 h-20">
            <DonutChart
              data={distribution}
              index="name"
              category="value"
              colors={["cyan", "blue", "indigo", "violet"]}
              showLabel={false}
              showTooltip={false}
              className="h-full"
            />
          </div>
          <div className="flex-1 space-y-1">
            {distribution.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-mono font-medium text-foreground">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </KPICard>
    </motion.div>
  );
}

// =============================================================================
// ACTIVE DEALS CARD
// =============================================================================

interface ActiveDealsCardProps {
  total: number;
  conversionRate: number;
  stages: DealStage[];
  index?: number;
}

function ActiveDealsCard({
  total,
  conversionRate,
  stages,
  index = 2,
}: ActiveDealsCardProps) {
  const barListData = stages.map((stage) => ({
    name: stage.name,
    value: stage.value,
  }));

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <KPICard
        title="Active Deals"
        value={total}
        change={{
          value: `${conversionRate}% conv.`,
          trend: conversionRate >= 25 ? "up" : "neutral",
          label: "rate",
        }}
        icon={<RocketIcon className="size-5" />}
        href="/deals"
        glowColor="navy"
      >
        <div className="space-y-2">
          <BarList
            data={barListData}
            color="blue"
            showAnimation
            className="[&_[data-tremor-id=bar]]:h-2"
          />
        </div>
      </KPICard>
    </motion.div>
  );
}

// =============================================================================
// PIPELINE VALUE CARD
// =============================================================================

interface PipelineValueCardProps {
  value: number;
  weightedValue: number;
  change: number;
  data: { date: string; Pipeline: number }[];
  index?: number;
}

function PipelineValueCard({
  value,
  weightedValue,
  change,
  data,
  index = 3,
}: PipelineValueCardProps) {
  const formattedValue = `$${(value / 1000000).toFixed(0)}M`;
  const formattedWeighted = `$${(weightedValue / 1000000).toFixed(1)}M`;
  const formattedChange = `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <KPICard
        title="Pipeline Value"
        value={formattedValue}
        change={{
          value: formattedChange,
          trend: change >= 0 ? "up" : "down",
          label: "MoM",
        }}
        icon={<TargetIcon className="size-5" />}
        glowColor="tactical"
      >
        <div className="space-y-3">
          {/* Weighted value */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Weighted</span>
            <span className="font-mono font-medium text-foreground">
              {formattedWeighted}
            </span>
          </div>

          {/* Mini chart */}
          <div className="h-12 -mx-2">
            <AreaChart
              data={data}
              index="date"
              categories={["Pipeline"]}
              colors={["emerald"]}
              showXAxis={false}
              showYAxis={false}
              showGridLines={false}
              showLegend={false}
              showTooltip={false}
              curveType="natural"
              className="h-full"
            />
          </div>
        </div>
      </KPICard>
    </motion.div>
  );
}

// =============================================================================
// KPI GRID COMPONENT
// =============================================================================

export interface KPIGridProps {
  className?: string;
  // Loading state
  isLoading?: boolean;
  // AUM data
  totalAUM?: number;
  aumChange?: number;
  aumHistory?: AUMData[];
  // Portfolio data
  portfolioCount?: number;
  newCompanies?: number;
  stageDistribution?: StageDistribution[];
  // Deals data
  activeDeals?: number;
  conversionRate?: number;
  dealStages?: DealStage[];
  // Pipeline data
  pipelineValue?: number;
  weightedPipeline?: number;
  pipelineChange?: number;
  pipelineHistory?: { date: string; Pipeline: number }[];
}

export function KPIGrid({
  className,
  // Loading state
  isLoading = false,
  // Default values for demo
  totalAUM = 142500000,
  aumChange = 12.4,
  aumHistory = aumHistoryData,
  portfolioCount = 30,
  newCompanies = 4,
  stageDistribution = stageDistributionData,
  activeDeals = 18,
  conversionRate = 28,
  dealStages = dealStagesData,
  pipelineValue = 25000000,
  weightedPipeline = 15800000,
  pipelineChange = 8.2,
  pipelineHistory = pipelineHistoryData,
}: KPIGridProps) {
  // Show skeleton when loading
  if (isLoading) {
    return <KPIGridSkeleton />;
  }

  return (
    <div
      className={cn(
        "grid gap-4 md:gap-6",
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {/* Total AUM */}
      <TotalAUMCard
        value={totalAUM}
        change={aumChange}
        data={aumHistory}
        index={0}
      />

      {/* Portfolio Companies */}
      <PortfolioCompaniesCard
        total={portfolioCount}
        newThisQuarter={newCompanies}
        distribution={stageDistribution}
        index={1}
      />

      {/* Active Deals */}
      <ActiveDealsCard
        total={activeDeals}
        conversionRate={conversionRate}
        stages={dealStages}
        index={2}
      />

      {/* Pipeline Value */}
      <PipelineValueCard
        value={pipelineValue}
        weightedValue={weightedPipeline}
        change={pipelineChange}
        data={pipelineHistory}
        index={3}
      />
    </div>
  );
}

// =============================================================================
// KPI GRID SKELETON
// =============================================================================

export function KPIGridSkeleton() {
  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} variant="raised" className="p-6 animate-pulse">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-5 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
          <div className="h-9 w-32 bg-muted rounded mb-2" />
          <div className="h-4 w-20 bg-muted rounded mb-4" />
          <div className="h-16 bg-muted rounded" />
        </Card>
      ))}
    </div>
  );
}

// =============================================================================
// INDIVIDUAL CARD EXPORTS
// =============================================================================

export {
  KPICard,
  TotalAUMCard,
  PortfolioCompaniesCard,
  ActiveDealsCard,
  PipelineValueCard,
};

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default KPIGrid;
