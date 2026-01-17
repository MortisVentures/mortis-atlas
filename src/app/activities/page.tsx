"use client";

import * as React from "react";
import {
  DashboardLayout,
  DashboardContent,
  PageHeader,
  PageSection,
} from "@/components/layout";
import { ActivityFeed } from "@/components/dashboard";

// =============================================================================
// ACTIVITIES PAGE
// =============================================================================

export default function ActivitiesPage() {
  return (
    <DashboardLayout>
      <DashboardContent>
        <PageHeader
          title="Activities"
          description="View all recent activities across your portfolio"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Activities" },
          ]}
        />

        <PageSection title="All Activities">
          <ActivityFeed maxItems={50} maxHeight="max-h-[800px]" />
        </PageSection>
      </DashboardContent>
    </DashboardLayout>
  );
}
