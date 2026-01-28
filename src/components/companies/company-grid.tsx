"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { AreaChart } from "@tremor/react";
import {
  GlobeIcon,
  PersonIcon,
  CalendarIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import { CompanyStage } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

// =============================================================================
// TYPES
// =============================================================================

export interface CompanyCardData {
  id: string;
  name: string;
  logoUrl?: string | null;
  website?: string | null;
  sector?: string | null;
  stage: CompanyStage;
  location?: string | null;
  foundedYear?: number | null;
  employeeCount?: string | null;
  fundingRound?: string | null;
  fundingAmount?: number | string | null;
  valuation?: number | string | null;
  // Activity data for sparkline
  activityData?: { date: string; activity: number }[];
  // Counts
  contactCount?: number;
  dealCount?: number;
  activityCount?: number;
}

export interface CompanyGridProps {
  companies: CompanyCardData[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  onCompanyClick?: (company: CompanyCardData) => void;
}

export interface CompanyCardProps {
  company: CompanyCardData;
  index?: number;
  onClick?: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const stageConfig: Record<CompanyStage, { label: string; color: string; variant: string }> = {
  PROSPECT: {
    label: "Prospect",
    color: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    variant: "secondary",
  },
  QUALIFIED: {
    label: "Qualified",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    variant: "default",
  },
  ENGAGED: {
    label: "Engaged",
    color: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    variant: "default",
  },
  DUE_DILIGENCE: {
    label: "Due Diligence",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    variant: "default",
  },
  PASSED: {
    label: "Passed",
    color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    variant: "destructive",
  },
  PORTFOLIO: {
    label: "Portfolio",
    color: "bg-tactical-500/10 text-tactical-500 border-tactical-500/20",
    variant: "default",
  },
  EXITED: {
    label: "Exited",
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    variant: "default",
  },
};

const sectorColors: Record<string, string> = {
  FinTech: "bg-blue-500/10 text-blue-500",
  HealthTech: "bg-rose-500/10 text-rose-500",
  SaaS: "bg-violet-500/10 text-violet-500",
  AI: "bg-amber-500/10 text-amber-500",
  "AI/ML": "bg-amber-500/10 text-amber-500",
  Biotech: "bg-emerald-500/10 text-emerald-500",
  CleanTech: "bg-green-500/10 text-green-500",
  EdTech: "bg-cyan-500/10 text-cyan-500",
  DeepTech: "bg-indigo-500/10 text-indigo-500",
  Crypto: "bg-orange-500/10 text-orange-500",
  Web3: "bg-purple-500/10 text-purple-500",
  default: "bg-muted text-muted-foreground",
};

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "—";

  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";

  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(0)}K`;
  }
  return `$${num.toFixed(0)}`;
}

function getSectorColor(sector: string | null | undefined): string {
  if (!sector) return sectorColors.default;
  return sectorColors[sector] || sectorColors.default;
}

function generatePlaceholderInitials(name: string): string {
  const words = name.split(" ").filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Generate sample activity data if not provided
function generateSampleActivityData(): { date: string; activity: number }[] {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split("T")[0],
      activity: Math.floor(Math.random() * 5) + 1,
    });
  }
  return data;
}

// =============================================================================
// COMPANY LOGO COMPONENT
// =============================================================================

interface CompanyLogoProps {
  logoUrl?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function CompanyLogo({ logoUrl, name, size = "md", className }: CompanyLogoProps) {
  const sizeClasses = {
    sm: "size-8 text-xs",
    md: "size-12 text-sm",
    lg: "size-16 text-base",
  };

  if (logoUrl) {
    return (
      <div
        className={cn(
          "relative rounded-atlas-sm overflow-hidden bg-muted",
          sizeClasses[size],
          className
        )}
      >
        <Image
          src={logoUrl}
          alt={`${name} logo`}
          fill
          className="object-cover"
          sizes={size === "lg" ? "64px" : size === "md" ? "48px" : "32px"}
        />
      </div>
    );
  }

  // Placeholder with initials
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-atlas-sm",
        "bg-gradient-to-br from-navy-600 to-navy-800",
        "text-white font-semibold",
        sizeClasses[size],
        className
      )}
    >
      {generatePlaceholderInitials(name)}
    </div>
  );
}

// =============================================================================
// MINI SPARKLINE COMPONENT
// =============================================================================

interface MiniSparklineProps {
  data: { date: string; activity: number }[];
  className?: string;
}

function MiniSparkline({ data, className }: MiniSparklineProps) {
  return (
    <div className={cn("h-8 w-20", className)}>
      <AreaChart
        data={data}
        index="date"
        categories={["activity"]}
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
  );
}

// =============================================================================
// COMPANY CARD COMPONENT
// =============================================================================

export function CompanyCard({ company, index = 0, onClick }: CompanyCardProps) {
  const stageInfo = stageConfig[company.stage];
  const activityData = company.activityData || generateSampleActivityData();

  const content = (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card
        variant="raised"
        className={cn(
          "group relative p-5 h-full",
          "transition-all duration-300",
          "hover:shadow-neu-dark-glow-navy",
          "cursor-pointer"
        )}
        onClick={onClick}
      >
        {/* Header: Logo + Name + Website */}
        <div className="flex items-start gap-4 mb-4">
          <CompanyLogo logoUrl={company.logoUrl} name={company.name} size="md" />
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-foreground truncate group-hover:text-tactical-500 transition-colors">
              {company.name}
            </h3>
            {company.website && (
              <div className="flex items-center gap-1 mt-0.5">
                <GlobeIcon className="size-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate">
                  {company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Badges: Sector + Stage */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {company.sector && (
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium border",
                getSectorColor(company.sector),
                "border-current/20"
              )}
            >
              {company.sector}
            </span>
          )}
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium border",
              stageInfo.color
            )}
          >
            {stageInfo.label}
          </span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Funding */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Funding</div>
            <div className="font-mono text-sm font-medium text-foreground">
              {company.fundingRound ? (
                <span className="flex items-center gap-1">
                  <RocketIcon className="size-3 text-tactical-500" />
                  {company.fundingRound}
                </span>
              ) : (
                formatCurrency(company.fundingAmount)
              )}
            </div>
          </div>

          {/* Valuation */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Valuation</div>
            <div className="font-mono text-sm font-medium text-foreground">
              {formatCurrency(company.valuation)}
            </div>
          </div>
        </div>

        {/* Footer: Activity Sparkline + Meta */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {company.location && (
              <span className="truncate max-w-[80px]">{company.location}</span>
            )}
            {company.foundedYear && (
              <span className="flex items-center gap-1">
                <CalendarIcon className="size-3" />
                {company.foundedYear}
              </span>
            )}
            {company.contactCount !== undefined && company.contactCount > 0 && (
              <span className="flex items-center gap-1">
                <PersonIcon className="size-3" />
                {company.contactCount}
              </span>
            )}
          </div>

          {/* Mini Sparkline */}
          <MiniSparkline data={activityData} />
        </div>

        {/* Hover glow overlay */}
        <div
          className={cn(
            "absolute inset-0 rounded-atlas-md opacity-0",
            "bg-gradient-to-t from-navy-500/5 to-transparent",
            "transition-opacity duration-300",
            "group-hover:opacity-100",
            "pointer-events-none"
          )}
        />
      </Card>
    </motion.div>
  );

  // Wrap in Link for navigation
  return (
    <Link href={`/companies/${company.id}`} className="block h-full">
      {content}
    </Link>
  );
}

// =============================================================================
// COMPANY GRID COMPONENT
// =============================================================================

export function CompanyGrid({
  companies,
  isLoading = false,
  emptyMessage = "No companies found",
  className,
  onCompanyClick,
}: CompanyGridProps) {
  if (isLoading) {
    return <CompanyGridSkeleton />;
  }

  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <RocketIcon className="size-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        "grid gap-4 md:gap-6",
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {companies.map((company, index) => (
        <CompanyCard
          key={company.id}
          company={company}
          index={index}
          onClick={onCompanyClick ? () => onCompanyClick(company) : undefined}
        />
      ))}
    </motion.div>
  );
}

// =============================================================================
// COMPANY GRID SKELETON
// =============================================================================

export function CompanyGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-pulse">
      {[...Array(count)].map((_, i) => (
        <Card key={i} variant="raised" className="p-5">
          {/* Header skeleton */}
          <div className="flex items-start gap-4 mb-4">
            <div className="size-12 bg-muted rounded-atlas-sm" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </div>
          </div>

          {/* Badges skeleton */}
          <div className="flex gap-2 mb-4">
            <div className="h-5 w-16 bg-muted rounded-full" />
            <div className="h-5 w-20 bg-muted rounded-full" />
          </div>

          {/* Metrics skeleton */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="space-y-1">
              <div className="h-3 w-12 bg-muted rounded" />
              <div className="h-5 w-16 bg-muted rounded" />
            </div>
            <div className="space-y-1">
              <div className="h-3 w-14 bg-muted rounded" />
              <div className="h-5 w-16 bg-muted rounded" />
            </div>
          </div>

          {/* Footer skeleton */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-8 w-20 bg-muted rounded" />
          </div>
        </Card>
      ))}
    </div>
  );
}

// =============================================================================
// COMPACT COMPANY CARD (for smaller spaces)
// =============================================================================

export interface CompactCompanyCardProps {
  company: CompanyCardData;
  onClick?: () => void;
  className?: string;
}

export function CompactCompanyCard({
  company,
  onClick,
  className,
}: CompactCompanyCardProps) {
  const stageInfo = stageConfig[company.stage];

  return (
    <Link
      href={`/companies/${company.id}`}
      className={cn("block", className)}
      onClick={onClick}
    >
      <Card
        variant="raised"
        className={cn(
          "group flex items-center gap-3 p-3",
          "transition-all duration-200",
          "hover:bg-muted/30 hover:scale-[1.01]",
          "cursor-pointer"
        )}
      >
        <CompanyLogo logoUrl={company.logoUrl} name={company.name} size="sm" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-foreground truncate group-hover:text-tactical-500 transition-colors">
            {company.name}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            {company.sector && (
              <span className="text-xs text-muted-foreground">{company.sector}</span>
            )}
          </div>
        </div>
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium border shrink-0",
            stageInfo.color
          )}
        >
          {stageInfo.label}
        </span>
      </Card>
    </Link>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  CompanyLogo,
  MiniSparkline,
  stageConfig,
  sectorColors,
  formatCurrency,
  getSectorColor,
  generatePlaceholderInitials,
  generateSampleActivityData,
};

export default CompanyGrid;
