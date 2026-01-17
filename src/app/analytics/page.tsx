"use client";

import * as React from "react";
import { AreaChart, BarChart, DonutChart } from "@tremor/react";

import {
  DashboardLayout,
  DashboardContent,
  PageHeader,
  PageSection,
} from "@/components/layout";
import { KPIGrid, DealFlowChart } from "@/components/dashboard";
import { Card } from "@/components/ui/card";

// =============================================================================
// SAMPLE ANALYTICS DATA
// =============================================================================

const dealVelocityData = [
  { month: "Jan", sourced: 12, closed: 2 },
  { month: "Feb", sourced: 15, closed: 1 },
  { month: "Mar", sourced: 18, closed: 3 },
  { month: "Apr", sourced: 14, closed: 2 },
  { month: "May", sourced: 22, closed: 4 },
  { month: "Jun", sourced: 19, closed: 2 },
];

const conversionData = [
  { stage: "Sourced", count: 100 },
  { stage: "First Meeting", count: 45 },
  { stage: "Deep Dive", count: 20 },
  { stage: "Term Sheet", count: 8 },
  { stage: "Closed", count: 3 },
];

const sectorPerformance = [
  { name: "FinTech", value: 35 },
  { name: "HealthTech", value: 25 },
  { name: "SaaS", value: 20 },
  { name: "AI/ML", value: 15 },
  { name: "Other", value: 5 },
];

// =============================================================================
// ANALYTICS PAGE
// =============================================================================

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <DashboardContent>
        <PageHeader
          title="Analytics"
          description="Portfolio and pipeline performance insights"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Analytics" },
          ]}
        />

        {/* KPIs */}
        <PageSection title="Key Performance Indicators">
          <KPIGrid />
        </PageSection>

        {/* Deal Flow */}
        <PageSection title="Deal Flow Analysis">
          <DealFlowChart />
        </PageSection>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Deal Velocity */}
          <Card variant="raised" className="p-6">
            <h3 className="font-display font-semibold mb-4">Deal Velocity</h3>
            <div className="h-64">
              <BarChart
                data={dealVelocityData}
                index="month"
                categories={["sourced", "closed"]}
                colors={["blue", "emerald"]}
                valueFormatter={(v) => `${v} deals`}
                showLegend={true}
                className="h-full"
              />
            </div>
          </Card>

          {/* Sector Distribution */}
          <Card variant="raised" className="p-6">
            <h3 className="font-display font-semibold mb-4">Pipeline by Sector</h3>
            <div className="flex items-center gap-8">
              <div className="w-48 h-48">
                <DonutChart
                  data={sectorPerformance}
                  index="name"
                  category="value"
                  colors={["blue", "rose", "violet", "amber", "slate"]}
                  showLabel={false}
                  className="h-full"
                />
              </div>
              <div className="flex-1 space-y-2">
                {sectorPerformance.map((sector, i) => (
                  <div key={sector.name} className="flex items-center justify-between text-sm">
                    <span>{sector.name}</span>
                    <span className="font-mono">{sector.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Conversion Funnel */}
        <PageSection title="Conversion Funnel">
          <Card variant="raised" className="p-6">
            <div className="h-64">
              <BarChart
                data={conversionData}
                index="stage"
                categories={["count"]}
                colors={["indigo"]}
                valueFormatter={(v) => `${v} deals`}
                showLegend={false}
                layout="vertical"
                className="h-full"
              />
            </div>
          </Card>
        </PageSection>
      </DashboardContent>
    </DashboardLayout>
  );
}
