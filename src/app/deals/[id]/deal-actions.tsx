"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ActivityType } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ActivityModal, type ActivityFormData } from "@/components/activities";

// =============================================================================
// TYPES
// =============================================================================

interface DealActionsProps {
  dealId: string;
  dealName: string;
  companyId: string;
  companyName: string;
}

// =============================================================================
// DEAL ACTIONS CLIENT COMPONENT
// =============================================================================

export function DealActions({
  dealId,
  dealName,
  companyId,
  companyName,
}: DealActionsProps) {
  const router = useRouter();
  const [showActivityModal, setShowActivityModal] = React.useState(false);
  const [defaultActivityType, setDefaultActivityType] = React.useState<ActivityType>("NOTE");

  const handleOpenActivityModal = (type: ActivityType) => {
    setDefaultActivityType(type);
    setShowActivityModal(true);
  };

  const handleSaveActivity = async (data: ActivityFormData) => {
    const response = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: data.type,
        subject: data.subject,
        description: data.description || null,
        activityDate: data.activityDate ? new Date(data.activityDate).toISOString() : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        companyId: data.companyId || null,
        dealId: data.dealId || null,
        contactId: data.contactId || null,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save activity");
    }

    // Refresh the page to show updated activity count
    router.refresh();
  };

  return (
    <>
      <Card variant="raised" className="p-6">
        <h3 className="font-display font-semibold mb-4">Actions</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleOpenActivityModal("NOTE")}
          >
            Log Activity
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleOpenActivityModal("MEETING")}
          >
            Schedule Meeting
          </Button>
          <Link href="/documents/upload" className="block">
            <Button variant="outline" className="w-full justify-start">
              Add Document
            </Button>
          </Link>
        </div>
      </Card>

      <ActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        onSave={handleSaveActivity}
        defaultType={defaultActivityType}
        defaultDealId={dealId}
        defaultDealName={dealName}
        defaultCompanyId={companyId}
        defaultCompanyName={companyName}
      />
    </>
  );
}
