"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

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
import { AddCompanyModal, useAddCompanyShortcut } from "@/components/companies";

import { toast } from "sonner";

// =============================================================================
// DASHBOARD PAGE
// =============================================================================

export default function DashboardPage() {
  const router = useRouter();
  const [isAddCompanyOpen, setIsAddCompanyOpen] = React.useState(false);

  // Register keyboard shortcut for Add Company
  useAddCompanyShortcut(() => setIsAddCompanyOpen(true));

  // Handle quick action clicks
  const handleQuickAction = (action: QuickAction) => {
    switch (action.id) {
      case "add-company":
        setIsAddCompanyOpen(true);
        break;
      case "add-contact":
        router.push("/contacts/new");
        break;
      case "schedule-meeting":
        toast.info("Schedule Meeting coming soon!");
        break;
      case "generate-report":
        toast.info("Report generation coming soon!");
        break;
      case "review-memos":
        router.push("/memos");
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
            router.push(`/companies/${company.id}`);
          }}
        />

        {/* Page Header */}
        <PageHeader
          title="Dashboard"
          description="Overview of your portfolio and deal pipeline"
        />

        {/* Quick Actions */}
        <PageSection>
          <QuickActions onActionClick={handleQuickAction} />
        </PageSection>

        {/* KPI Grid */}
        <PageSection title="Key Metrics">
          <KPIGrid />
        </PageSection>

        {/* Deal Flow Chart */}
        <PageSection title="Deal Flow">
          <DealFlowChart />
        </PageSection>

        {/* Pipeline + Activity Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PageSection title="Pipeline">
            <PipelineFunnel />
          </PageSection>

          <PageSection title="Recent Activity">
            <ActivityFeed maxItems={10} />
          </PageSection>
        </div>
      </DashboardContent>
    </DashboardLayout>
  );
}
