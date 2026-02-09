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

// Activity components
import { ActivityModal, MeetingCard, type ActivityFormData } from "@/components/activities";

// Hooks
import { useMeetings } from "@/hooks/use-meetings";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";

import { toast } from "sonner";

// =============================================================================
// TEAM DASHBOARD COMPONENT
// =============================================================================

export default function TeamDashboard() {
  const router = useRouter();
  const [isAddCompanyOpen, setIsAddCompanyOpen] = React.useState(false);
  const [isScheduleMeetingOpen, setIsScheduleMeetingOpen] = React.useState(false);

  // Fetch meetings
  const { meetings, isLoading: meetingsLoading, markComplete, refetch: refetchMeetings } = useMeetings({
    limit: 10,
  });

  // Fetch dashboard stats
  const { stats, isLoading: statsLoading } = useDashboardStats();

  // Register keyboard shortcut for Add Company
  useAddCompanyShortcut(() => setIsAddCompanyOpen(true));

  // Handle saving a new meeting
  const handleSaveMeeting = async (data: ActivityFormData) => {
    const response = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: data.type,
        subject: data.subject,
        description: data.description,
        activityDate: data.activityDate ? new Date(data.activityDate).toISOString() : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        companyId: data.companyId || undefined,
        dealId: data.dealId || undefined,
        contactId: data.contactId || undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save meeting");
    }

    toast.success("Meeting scheduled successfully!");
    refetchMeetings();
  };

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
        setIsScheduleMeetingOpen(true);
        break;
      case "generate-report":
        toast.info("Report generation coming soon!");
        break;
      case "review-memos":
        router.push("/ic-memos");
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

        {/* Schedule Meeting Modal */}
        <ActivityModal
          isOpen={isScheduleMeetingOpen}
          onClose={() => setIsScheduleMeetingOpen(false)}
          onSave={handleSaveMeeting}
          defaultType="MEETING"
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
          <KPIGrid
            isLoading={statsLoading}
            totalAUM={stats?.totalInvested || 0}
            aumChange={0}
            portfolioCount={stats?.portfolioCount || 0}
            newCompanies={0}
            stageDistribution={
              stats?.sectorDistribution?.slice(0, 4).map((s, i) => ({
                name: s.name,
                value: s.value,
                color: (["cyan", "blue", "indigo", "violet"] as const)[i % 4],
              })) || []
            }
            activeDeals={stats?.activeDeals || 0}
            conversionRate={stats?.conversionRate || 0}
            dealStages={stats?.dealStages || []}
            pipelineValue={stats?.pipelineValue || 0}
            weightedPipeline={Math.round((stats?.pipelineValue || 0) * 0.6)}
            pipelineChange={0}
          />
        </PageSection>

        {/* Deal Flow Chart */}
        <PageSection title="Deal Flow">
          <DealFlowChart />
        </PageSection>

        {/* Upcoming Meetings */}
        <PageSection>
          <MeetingCard
            meetings={meetings}
            isLoading={meetingsLoading}
            onMarkComplete={markComplete}
            showViewAll
            viewAllHref="/tasks"
          />
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
