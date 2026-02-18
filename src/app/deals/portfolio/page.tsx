"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AreaChart,
  DonutChart,
} from "@tremor/react";
import {
  StarFilledIcon,
  CalendarIcon,
  ExternalLinkIcon,
  MagnifyingGlassIcon,
  Cross2Icon,
  ReloadIcon,
} from "@radix-ui/react-icons";

import { PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  SOURCE_CONFIG,
} from "@/lib/deals/pipeline-utils";

// =============================================================================
// TYPES
// =============================================================================

interface PortfolioDeal {
  id: string;
  dealName: string;
  amount: number | null;
  valuation: number | null;
  actualClose: string | null;
  notes: string | null;
  sourceType: string | null;
  company: {
    id: string;
    name: string;
    sector: string | null;
  };
  contact: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

// =============================================================================
// PORTFOLIO PAGE COMPONENT
// =============================================================================

export default function PortfolioPage() {
  const [deals, setDeals] = React.useState<PortfolioDeal[]>([]);
  const [filteredDeals, setFilteredDeals] = React.useState<PortfolioDeal[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");

  // Fetch portfolio deals (CLOSED_WON only)
  const fetchDeals = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/deals?stage=CLOSED_WON");
      if (!response.ok) {
        throw new Error("Failed to fetch portfolio deals");
      }

      const result = await response.json();
      const portfolioDeals = (result.data || []).map((deal: PortfolioDeal & { amount?: string | number; valuation?: string | number }) => ({
        ...deal,
        amount: deal.amount ? Number(deal.amount) : null,
        valuation: deal.valuation ? Number(deal.valuation) : null,
      }));
      setDeals(portfolioDeals);
      setFilteredDeals(portfolioDeals);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching portfolio deals:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  React.useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  // Filter deals based on search
  React.useEffect(() => {
    if (!search) {
      setFilteredDeals(deals);
      return;
    }

    const searchLower = search.toLowerCase();
    setFilteredDeals(
      deals.filter(
        (deal) =>
          deal.dealName.toLowerCase().includes(searchLower) ||
          deal.company.name.toLowerCase().includes(searchLower)
      )
    );
  }, [search, deals]);

  // Calculate portfolio metrics
  const metrics = React.useMemo(() => {
    const totalInvested = filteredDeals.reduce(
      (sum, deal) => sum + (deal.amount || 0),
      0
    );
    const totalValuation = filteredDeals.reduce(
      (sum, deal) => sum + (deal.valuation || 0),
      0
    );
    const avgInvestment =
      filteredDeals.length > 0 ? totalInvested / filteredDeals.length : 0;

    return {
      totalCompanies: filteredDeals.length,
      totalInvested,
      totalValuation,
      avgInvestment,
    };
  }, [filteredDeals]);

  // Calculate portfolio growth data (cumulative investment over time)
  const growthData = React.useMemo(() => {
    // Filter deals with valid close dates and sort by date
    const dealsWithDates = deals
      .filter((deal) => deal.actualClose)
      .sort((a, b) => new Date(a.actualClose!).getTime() - new Date(b.actualClose!).getTime());

    if (dealsWithDates.length === 0) return [];

    // Group by month and calculate cumulative
    const byMonth: Record<string, number> = {};
    let cumulative = 0;

    dealsWithDates.forEach((deal) => {
      const date = new Date(deal.actualClose!);
      const month = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      cumulative += deal.amount || 0;
      byMonth[month] = cumulative;
    });

    return Object.entries(byMonth).map(([month, value]) => ({
      month,
      "Portfolio Value": value,
    }));
  }, [deals]);

  // Calculate sector distribution data
  const sectorData = React.useMemo(() => {
    const bySector: Record<string, number> = {};

    deals.forEach((deal) => {
      const sector = deal.company.sector || "Other";
      bySector[sector] = (bySector[sector] || 0) + 1;
    });

    return Object.entries(bySector)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [deals]);

  return (
    <>
      {/* Page Header */}
        <PageHeader
          title="Portfolio"
          description="Your invested companies"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Deal Flow", href: "/deals" },
            { label: "Portfolio" },
          ]}
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchDeals()}
              disabled={isLoading}
            >
              <ReloadIcon
                className={cn("size-4", isLoading && "animate-spin")}
              />
            </Button>
          }
        />

        {/* Main Content */}
        <div className="space-y-6">
          {/* Portfolio Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {/* Total Companies */}
            <Card variant="raised" className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-tactical-500/10 flex items-center justify-center">
                  <StarFilledIcon className="size-6 text-tactical-400" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{metrics.totalCompanies}</div>
                  <div className="text-sm text-muted-foreground">
                    Portfolio Companies
                  </div>
                </div>
              </div>
            </Card>

            {/* Total Invested */}
            <Card variant="raised" className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <svg
                    className="size-6 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {formatCurrency(metrics.totalInvested)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Invested
                  </div>
                </div>
              </div>
            </Card>

            {/* Total Valuation */}
            <Card variant="raised" className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <svg
                    className="size-6 text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {formatCurrency(metrics.totalValuation)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Portfolio Valuation
                  </div>
                </div>
              </div>
            </Card>

            {/* Average Investment */}
            <Card variant="raised" className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <svg
                    className="size-6 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {formatCurrency(metrics.avgInvestment)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg Investment
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Charts Section */}
          {!isLoading && !error && deals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Portfolio Growth Chart */}
              <Card variant="raised" className="p-6">
                <h3 className="text-lg font-semibold mb-4">Portfolio Growth</h3>
                {growthData.length > 0 ? (
                  <AreaChart
                    data={growthData}
                    index="month"
                    categories={["Portfolio Value"]}
                    colors={["emerald"]}
                    valueFormatter={(value) => formatCurrency(value)}
                    showLegend={false}
                    showGridLines={false}
                    className="h-48"
                  />
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground">
                    No investment timeline data
                  </div>
                )}
              </Card>

              {/* Sector Distribution Chart */}
              <Card variant="raised" className="p-6">
                <h3 className="text-lg font-semibold mb-4">Sector Distribution</h3>
                {sectorData.length > 0 ? (
                  <div className="flex items-center gap-6">
                    <div className="w-40 h-40">
                      <DonutChart
                        data={sectorData}
                        index="name"
                        category="value"
                        colors={["emerald", "cyan", "blue", "indigo", "violet", "purple", "fuchsia", "rose"]}
                        showLabel={false}
                        className="h-full"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      {sectorData.slice(0, 6).map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted-foreground truncate">
                            {item.name}
                          </span>
                          <span className="font-mono font-medium">
                            {item.value} {item.value === 1 ? "company" : "companies"}
                          </span>
                        </div>
                      ))}
                      {sectorData.length > 6 && (
                        <div className="text-xs text-muted-foreground">
                          +{sectorData.length - 6} more sectors
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-muted-foreground">
                    No sector data
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search portfolio companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Cross2Icon className="size-4" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400"
            >
              <p className="text-sm font-medium">Error loading portfolio</p>
              <p className="text-xs mt-1">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchDeals()}
                className="mt-2"
              >
                Try Again
              </Button>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} variant="raised" className="p-6 animate-pulse">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </Card>
              ))}
            </div>
          )}

          {/* Portfolio Grid */}
          {!isLoading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredDeals.map((deal, index) => {
                const sourceConfig = deal.sourceType
                  ? SOURCE_CONFIG[deal.sourceType as keyof typeof SOURCE_CONFIG]
                  : null;

                return (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Link href={`/deals/${deal.id}`}>
                      <Card
                        variant="raised"
                        className="p-6 hover:shadow-lg transition-all cursor-pointer group"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate group-hover:text-tactical-500 transition-colors">
                              {deal.company.name}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {deal.dealName}
                            </p>
                          </div>
                          <ExternalLinkIcon className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">
                              Invested
                            </div>
                            <div className="font-mono font-semibold text-tactical-500">
                              {formatCurrency(deal.amount)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">
                              Valuation
                            </div>
                            <div className="font-mono font-semibold">
                              {formatCurrency(deal.valuation)}
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex items-center gap-2">
                            {deal.company.sector && (
                              <Badge variant="outline" size="sm">
                                {deal.company.sector}
                              </Badge>
                            )}
                            {sourceConfig && (
                              <Badge
                                size="sm"
                                className={cn(
                                  "border",
                                  sourceConfig.bgColor,
                                  sourceConfig.borderColor,
                                  sourceConfig.textColor
                                )}
                              >
                                {sourceConfig.label}
                              </Badge>
                            )}
                          </div>
                          {deal.actualClose && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CalendarIcon className="size-3" />
                              {new Date(deal.actualClose).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredDeals.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <StarFilledIcon className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No portfolio companies</h3>
              <p className="text-muted-foreground mb-4">
                {search
                  ? "No companies match your search"
                  : "Closed deals will appear here as portfolio companies"}
              </p>
              {search && (
                <Button variant="outline" onClick={() => setSearch("")}>
                  Clear Search
                </Button>
              )}
            </motion.div>
          )}
        </div>
    </>
  );
}
