"use client";

import {
  DashboardLayout,
  DashboardContent,
  PageHeader,
} from "@/components/layout";
import { DealForm } from "@/components/deals";

export default function NewDealPage() {
  return (
    <DashboardLayout>
      <DashboardContent>
        <PageHeader
          title="New Deal"
          description="Create a new investment opportunity"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Deals", href: "/deals" },
            { label: "New Deal" },
          ]}
        />

        <div className="max-w-3xl">
          <DealForm mode="create" />
        </div>
      </DashboardContent>
    </DashboardLayout>
  );
}
