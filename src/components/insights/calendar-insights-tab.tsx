"use client";

import { useState, useEffect } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RelationshipHeatGrid, HeatDistributionChart } from "./relationship-heat-grid";
import {
  MeetingVelocityByStageChart,
  MeetingTrendChart,
  MeetingPatternsCard,
} from "./meeting-velocity-chart";
import { SparseDataNotice } from "./sparse-data-notice";
import { cn } from "@/lib/utils";

interface CalendarInsightsData {
  kpis: {
    totalMeetings30d: number;
    totalMeetings90d: number;
    meetingsPerWeek: number;
    upcomingMeetings: number;
  };
  heat: {
    distribution: {
      HOT: number;
      WARM: number;
      COOLING: number;
      COLD: number;
    };
    hotRelationships: Array<{
      entityId: string;
      heat: "HOT" | "WARM" | "COOLING" | "COLD";
      heatScore: number;
      meetingsLast30d: number;
      daysSinceLastMeeting: number | null;
      company: { id: string; name: string; stage: string } | null;
    }>;
    coolingRelationships: Array<{
      entityId: string;
      heat: "HOT" | "WARM" | "COOLING" | "COLD";
      heatScore: number;
      meetingsLast30d: number;
      daysSinceLastMeeting: number | null;
      company: { id: string; name: string; stage: string } | null;
    }>;
  };
  velocity: {
    byStage: Array<{ stage: string; count: number; avgPerMonth: number }>;
  };
  types: Array<{ type: string; count: number }>;
  trends: {
    monthly: Array<{ month: string; count: number }>;
  };
  patterns: {
    avgMeetingsForWonDeals: number;
    avgMeetingsForLostDeals: number;
    closedWonCount: number;
    closedLostCount: number;
    insight: string | null;
  };
}

interface CalendarInsightsTabProps {
  className?: string;
}

export function CalendarInsightsTab({ className }: CalendarInsightsTabProps) {
  const [data, setData] = useState<CalendarInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/calendar/insights?section=all");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch calendar insights");
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch insights");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-12", className)}>
        <ReloadIcon className="size-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("p-4", className)}>
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchData} className="mt-2">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <SparseDataNotice
        title="No Calendar Data"
        description="Connect your calendar to see meeting insights"
        actionLabel="Connect Calendar"
        actionHref="/settings/integrations"
        className={className}
      />
    );
  }

  const hasEnoughData = data.kpis.totalMeetings90d >= 5;

  return (
    <div className={cn("space-y-6", className)}>
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Meetings (30d)"
          value={data.kpis.totalMeetings30d.toString()}
        />
        <KPICard
          title="Meetings (90d)"
          value={data.kpis.totalMeetings90d.toString()}
        />
        <KPICard
          title="Avg per Week"
          value={data.kpis.meetingsPerWeek.toFixed(1)}
        />
        <KPICard
          title="Upcoming"
          value={data.kpis.upcomingMeetings.toString()}
        />
      </div>

      {!hasEnoughData && (
        <SparseDataNotice
          title="Limited Data"
          description="More meetings will improve pattern detection accuracy"
        />
      )}

      {/* Relationship Heat */}
      <div className="grid gap-4 md:grid-cols-3">
        <HeatDistributionChart distribution={data.heat.distribution} />
        <div className="md:col-span-2">
          <RelationshipHeatGrid
            hotRelationships={data.heat.hotRelationships}
            coolingRelationships={data.heat.coolingRelationships}
          />
        </div>
      </div>

      {/* Meeting Trends */}
      <div className="grid gap-4 md:grid-cols-2">
        <MeetingTrendChart data={data.trends.monthly} />
        <MeetingVelocityByStageChart data={data.velocity.byStage} />
      </div>

      {/* Meeting Types */}
      {data.types.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Meeting Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.types.map((type) => (
                <Badge key={type.type} variant="outline" className="text-sm">
                  {type.type}: {type.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meeting Patterns */}
      <MeetingPatternsCard
        avgMeetingsWon={data.patterns.avgMeetingsForWonDeals}
        avgMeetingsLost={data.patterns.avgMeetingsForLostDeals}
        closedWonCount={data.patterns.closedWonCount}
        closedLostCount={data.patterns.closedLostCount}
        insight={data.patterns.insight}
      />
    </div>
  );
}

function KPICard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}
