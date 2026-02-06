"use client";

import * as React from "react";
import {
  ActivityFeed,
  ActivityFeedSkeleton,
  type Activity,
} from "@/components/dashboard/activity-feed";

// =============================================================================
// TYPES
// =============================================================================

interface DealActivityTimelineProps {
  dealId: string;
  initialCount?: number;
}

interface ApiActivity {
  id: string;
  type: "EMAIL" | "CALL" | "MEETING" | "NOTE" | "TASK" | "DEAL_UPDATE" | "INTRO" | "DOCUMENT";
  subject: string;
  description: string | null;
  activityDate: string;
  company: {
    id: string;
    name: string;
  } | null;
  contact: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  deal: {
    id: string;
    dealName: string;
  } | null;
}

// =============================================================================
// DEAL ACTIVITY TIMELINE
// =============================================================================

export function DealActivityTimeline({
  dealId,
  initialCount = 0,
}: DealActivityTimelineProps) {
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchActivities() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/activities?dealId=${dealId}&limit=50`);

        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }

        const data = await response.json();

        // Transform API activities to ActivityFeed format
        const transformedActivities: Activity[] = (data.data || []).map(
          (activity: ApiActivity) => ({
            id: activity.id,
            type: mapActivityType(activity.type),
            title: activity.subject,
            description: activity.description || undefined,
            timestamp: new Date(activity.activityDate),
            company: activity.company
              ? {
                  id: activity.company.id,
                  name: activity.company.name,
                }
              : undefined,
            contact: activity.contact
              ? {
                  id: activity.contact.id,
                  name: `${activity.contact.firstName} ${activity.contact.lastName}`,
                }
              : undefined,
            deal: activity.deal
              ? {
                  id: activity.deal.id,
                  name: activity.deal.dealName,
                }
              : undefined,
          })
        );

        setActivities(transformedActivities);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching activities:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchActivities();
  }, [dealId]);

  // Map extended activity types to the feed's type subset
  function mapActivityType(type: string): Activity["type"] {
    const validTypes = ["EMAIL", "CALL", "MEETING", "NOTE", "DEAL_UPDATE"];
    if (validTypes.includes(type)) {
      return type as Activity["type"];
    }
    // Map other types to NOTE for display
    if (type === "TASK" || type === "INTRO" || type === "DOCUMENT") {
      return "NOTE";
    }
    return "NOTE";
  }

  if (isLoading) {
    return <ActivityFeedSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>Failed to load activities</p>
      </div>
    );
  }

  // Don't render if no activities and initialCount is 0
  if (activities.length === 0 && initialCount === 0) {
    return null;
  }

  return (
    <ActivityFeed
      activities={activities}
      title="Activity Timeline"
      showHeader={true}
      maxItems={20}
      maxHeight="max-h-[400px]"
    />
  );
}
