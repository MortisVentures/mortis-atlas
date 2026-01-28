"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AreaChart, DonutChart } from "@tremor/react";
import {
  ArrowUpIcon,
} from "@radix-ui/react-icons";

import {
  DashboardLayout,
  DashboardContent,
  PageHeader,
  PageSection,
} from "@/components/layout";
import { Card } from "@/components/ui/card";
import { CompanyLogo } from "@/components/companies";
import { cn } from "@/lib/utils";

// =============================================================================
// SAMPLE PORTFOLIO DATA
// =============================================================================

interface PortfolioCompany {
  id: string;
  name: string;
  sector: string;
  stage: string;
  investmentDate: string;
  investmentAmount: number;
  currentValuation: number;
  ownership: number;
  moic: number;
  irr: number;
}

const portfolioCompanies: PortfolioCompany[] = [
  {
    id: "p1",
    name: "HealthBridge",
    sector: "HealthTech",
    stage: "Series C",
    investmentDate: "2021-03-15",
    investmentAmount: 5000000,
    currentValuation: 350000000,
    ownership: 8.5,
    moic: 4.2,
    irr: 85,
  },
  {
    id: "p2",
    name: "CryptoVault",
    sector: "Crypto",
    stage: "Series B",
    investmentDate: "2020-06-01",
    investmentAmount: 3000000,
    currentValuation: 500000000,
    ownership: 5.2,
    moic: 8.7,
    irr: 142,
  },
  {
    id: "p3",
    name: "CloudScale",
    sector: "SaaS",
    stage: "Series A",
    investmentDate: "2022-01-20",
    investmentAmount: 2000000,
    currentValuation: 80000000,
    ownership: 12.0,
    moic: 2.4,
    irr: 65,
  },
  {
    id: "p4",
    name: "AI Dynamics",
    sector: "AI/ML",
    stage: "Series B",
    investmentDate: "2021-09-10",
    investmentAmount: 4000000,
    currentValuation: 200000000,
    ownership: 6.8,
    moic: 3.4,
    irr: 78,
  },
];

const sectorDistribution = [
  { name: "HealthTech", value: 30 },
  { name: "Crypto", value: 25 },
  { name: "SaaS", value: 20 },
  { name: "AI/ML", value: 15 },
  { name: "Other", value: 10 },
];

const portfolioGrowth = [
  { date: "Jan '23", value: 80 },
  { date: "Apr '23", value: 95 },
  { date: "Jul '23", value: 110 },
  { date: "Oct '23", value: 125 },
  { date: "Jan '24", value: 142 },
];

function formatCurrency(value: number): string {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

// =============================================================================
// PORTFOLIO PAGE
// =============================================================================

export default function PortfolioPage() {
  // Calculate totals
  const totalInvested = portfolioCompanies.reduce((sum, c) => sum + c.investmentAmount, 0);
  const totalValue = portfolioCompanies.reduce(
    (sum, c) => sum + (c.currentValuation * c.ownership) / 100,
    0
  );
  const averageMoic = portfolioCompanies.reduce((sum, c) => sum + c.moic, 0) / portfolioCompanies.length;

  return (
    <DashboardLayout>
      <DashboardContent>
        <PageHeader
          title="Portfolio"
          description="Track your portfolio company performance"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Portfolio" },
          ]}
        />

        {/* Portfolio Summary */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card variant="raised" className="p-5">
            <div className="text-sm text-muted-foreground mb-1">Total Invested</div>
            <div className="font-mono text-2xl font-bold">{formatCurrency(totalInvested)}</div>
          </Card>
          <Card variant="raised" className="p-5">
            <div className="text-sm text-muted-foreground mb-1">Current Value</div>
            <div className="font-mono text-2xl font-bold text-tactical-500">
              {formatCurrency(totalValue)}
            </div>
          </Card>
          <Card variant="raised" className="p-5">
            <div className="text-sm text-muted-foreground mb-1">Avg MOIC</div>
            <div className="font-mono text-2xl font-bold">{averageMoic.toFixed(1)}x</div>
          </Card>
          <Card variant="raised" className="p-5">
            <div className="text-sm text-muted-foreground mb-1">Companies</div>
            <div className="font-mono text-2xl font-bold">{portfolioCompanies.length}</div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          {/* Portfolio Growth */}
          <Card variant="raised" className="p-6">
            <h3 className="font-display font-semibold mb-4">Portfolio Value Growth</h3>
            <div className="h-64">
              <AreaChart
                data={portfolioGrowth}
                index="date"
                categories={["value"]}
                colors={["emerald"]}
                valueFormatter={(v) => `$${v}M`}
                showLegend={false}
                showGridLines={true}
                curveType="natural"
                className="h-full"
              />
            </div>
          </Card>

          {/* Sector Distribution */}
          <Card variant="raised" className="p-6">
            <h3 className="font-display font-semibold mb-4">Sector Distribution</h3>
            <div className="flex items-center gap-8">
              <div className="w-48 h-48">
                <DonutChart
                  data={sectorDistribution}
                  index="name"
                  category="value"
                  colors={["cyan", "violet", "blue", "amber", "slate"]}
                  showLabel={false}
                  className="h-full"
                />
              </div>
              <div className="flex-1 space-y-2">
                {sectorDistribution.map((sector, i) => (
                  <div key={sector.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "size-3 rounded-full",
                          i === 0 && "bg-cyan-500",
                          i === 1 && "bg-violet-500",
                          i === 2 && "bg-blue-500",
                          i === 3 && "bg-amber-500",
                          i === 4 && "bg-slate-500"
                        )}
                      />
                      <span className="text-sm">{sector.name}</span>
                    </div>
                    <span className="font-mono text-sm">{sector.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Portfolio Companies */}
        <PageSection title="Portfolio Companies">
          <div className="space-y-3">
            {portfolioCompanies.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/companies/${company.id}`}>
                  <Card
                    variant="raised"
                    className={cn(
                      "p-4 cursor-pointer",
                      "transition-all duration-200",
                      "hover:scale-[1.01] hover:-translate-y-0.5",
                      "hover:shadow-neu-dark-glow-navy"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <CompanyLogo name={company.name} size="md" />
                        <div>
                          <h3 className="font-medium text-foreground">
                            {company.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {company.sector} • {company.stage}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Invested</div>
                          <div className="font-mono font-medium">
                            {formatCurrency(company.investmentAmount)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Ownership</div>
                          <div className="font-mono font-medium">
                            {company.ownership}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">MOIC</div>
                          <div className={cn(
                            "font-mono font-medium flex items-center gap-1",
                            company.moic >= 2 ? "text-tactical-500" : "text-foreground"
                          )}>
                            {company.moic >= 2 && <ArrowUpIcon className="size-3" />}
                            {company.moic.toFixed(1)}x
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">IRR</div>
                          <div className={cn(
                            "font-mono font-medium",
                            company.irr >= 50 ? "text-tactical-500" : "text-foreground"
                          )}>
                            {company.irr}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </PageSection>
      </DashboardContent>
    </DashboardLayout>
  );
}
