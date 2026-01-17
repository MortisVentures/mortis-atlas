"use client";

import * as React from "react";
import { CompanyStage } from "@prisma/client";
import { toast } from "sonner";

// Layout components
import {
  DashboardLayout,
  DashboardContent,
  PageHeader,
  PageSection,
} from "@/components/layout";

// Dashboard components
import {
  KPIGrid,
  PipelineFunnel,
  DealFlowChart,
  ActivityFeed,
  QuickActions,
  type QuickAction,
} from "@/components/dashboard";

// Company components
import {
  ViewToggle,
  CompanyGrid,
  AddCompanyModal,
  useAddCompanyShortcut,
  type ViewMode,
  type CompanyCardData,
} from "@/components/companies";

// =============================================================================
// SAMPLE DATA
// =============================================================================

const sampleCompanies: CompanyCardData[] = [
  {
    id: "1",
    name: "TechFlow AI",
    logoUrl: null,
    website: "https://techflow.ai",
    sector: "AI/ML",
    stage: "DUE_DILIGENCE" as CompanyStage,
    location: "San Francisco, CA",
    foundedYear: 2021,
    employeeCount: "11-50",
    fundingRound: "Series A",
    fundingAmount: 12000000,
    valuation: 45000000,
    contactCount: 3,
    dealCount: 1,
  },
  {
    id: "2",
    name: "Quantum Labs",
    logoUrl: null,
    website: "https://quantumlabs.io",
    sector: "DeepTech",
    stage: "ENGAGED" as CompanyStage,
    location: "Boston, MA",
    foundedYear: 2020,
    employeeCount: "51-200",
    fundingRound: "Series B",
    fundingAmount: 35000000,
    valuation: 120000000,
    contactCount: 5,
    dealCount: 2,
  },
  {
    id: "3",
    name: "HealthBridge",
    logoUrl: null,
    website: "https://healthbridge.com",
    sector: "HealthTech",
    stage: "PORTFOLIO" as CompanyStage,
    location: "New York, NY",
    foundedYear: 2019,
    employeeCount: "51-200",
    fundingRound: "Series C",
    fundingAmount: 80000000,
    valuation: 350000000,
    contactCount: 8,
    dealCount: 1,
  },
  {
    id: "4",
    name: "FinanceOS",
    logoUrl: null,
    website: "https://financeos.io",
    sector: "FinTech",
    stage: "QUALIFIED" as CompanyStage,
    location: "Austin, TX",
    foundedYear: 2022,
    employeeCount: "1-10",
    fundingRound: "Seed",
    fundingAmount: 3500000,
    valuation: 15000000,
    contactCount: 2,
    dealCount: 1,
  },
  {
    id: "5",
    name: "EduLearn Pro",
    logoUrl: null,
    website: "https://edulearnpro.com",
    sector: "EdTech",
    stage: "PROSPECT" as CompanyStage,
    location: "Seattle, WA",
    foundedYear: 2023,
    employeeCount: "1-10",
    fundingRound: null,
    fundingAmount: 500000,
    valuation: 5000000,
    contactCount: 1,
    dealCount: 0,
  },
  {
    id: "6",
    name: "GreenEnergy Co",
    logoUrl: null,
    website: "https://greenenergy.co",
    sector: "CleanTech",
    stage: "PASSED" as CompanyStage,
    location: "Denver, CO",
    foundedYear: 2020,
    employeeCount: "11-50",
    fundingRound: "Series A",
    fundingAmount: 8000000,
    valuation: 30000000,
    contactCount: 2,
    dealCount: 1,
  },
  {
    id: "7",
    name: "CryptoVault",
    logoUrl: null,
    website: "https://cryptovault.xyz",
    sector: "Crypto",
    stage: "EXITED" as CompanyStage,
    location: "Miami, FL",
    foundedYear: 2018,
    employeeCount: "51-200",
    fundingRound: "Series B",
    fundingAmount: 50000000,
    valuation: 500000000,
    contactCount: 4,
    dealCount: 1,
  },
  {
    id: "8",
    name: "DataSync Pro",
    logoUrl: null,
    website: "https://datasync.pro",
    sector: "SaaS",
    stage: "DUE_DILIGENCE" as CompanyStage,
    location: "Chicago, IL",
    foundedYear: 2021,
    employeeCount: "11-50",
    fundingRound: "Series A",
    fundingAmount: 15000000,
    valuation: 55000000,
    contactCount: 3,
    dealCount: 1,
  },
];

// =============================================================================
// DEMO PAGE
// =============================================================================

export default function DemoPage() {
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [isAddCompanyOpen, setIsAddCompanyOpen] = React.useState(false);

  // Register keyboard shortcut for Add Company (Cmd+N / Ctrl+N)
  useAddCompanyShortcut(() => setIsAddCompanyOpen(true));

  // Handle quick action clicks
  const handleQuickAction = (action: QuickAction) => {
    switch (action.id) {
      case "add-company":
        setIsAddCompanyOpen(true);
        break;
      case "add-contact":
        toast.info("Add Contact modal coming soon!");
        break;
      case "schedule-meeting":
        toast.info("Schedule Meeting modal coming soon!");
        break;
      case "generate-report":
        toast.info("Report generation coming soon!");
        break;
      case "review-memos":
        toast.info("IC Memos page coming soon!");
        break;
      default:
        break;
    }
  };

  return (
    <DashboardLayout>
      <DashboardContent>
        {/* Add Company Modal */}
        <AddCompanyModal
          open={isAddCompanyOpen}
          onOpenChange={setIsAddCompanyOpen}
          onSuccess={(company) => {
            toast.success(`${company.name} added to pipeline!`);
          }}
        />

        {/* Page Header */}
        <PageHeader
          title="Design System Demo"
          description="Preview all Mortis Atlas components"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Demo" },
          ]}
        />

        {/* Quick Actions */}
        <PageSection title="Quick Actions" description="Common actions with keyboard shortcuts (try ⌘N)">
          <QuickActions onActionClick={handleQuickAction} />
        </PageSection>

        {/* KPI Grid */}
        <PageSection title="KPI Dashboard" description="Key performance indicators">
          <KPIGrid />
        </PageSection>

        {/* Deal Flow Chart */}
        <PageSection title="Deal Flow Over Time" description="Track deal velocity and trends">
          <DealFlowChart />
        </PageSection>

        {/* Pipeline + Activity Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pipeline Funnel */}
          <PageSection title="Pipeline Funnel" description="Deal stages overview">
            <PipelineFunnel />
          </PageSection>

          {/* Activity Feed */}
          <PageSection title="Recent Activity" description="Latest updates">
            <ActivityFeed maxItems={10} />
          </PageSection>
        </div>

        {/* Company Grid */}
        <PageSection
          title="Companies"
          description="Portfolio and pipeline companies"
          actions={
            <ViewToggle
              value={viewMode}
              onChange={setViewMode}
            />
          }
        >
          {viewMode === "grid" && (
            <CompanyGrid companies={sampleCompanies} />
          )}
          {viewMode === "table" && (
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-atlas-md">
              Table view coming soon...
            </div>
          )}
          {viewMode === "kanban" && (
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-atlas-md">
              Kanban view coming soon...
            </div>
          )}
        </PageSection>
      </DashboardContent>
    </DashboardLayout>
  );
}
