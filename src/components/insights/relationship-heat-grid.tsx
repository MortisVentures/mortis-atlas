"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RelationshipHeat } from "@prisma/client";
import { HEAT_CONFIG } from "@/lib/integrations/calendar/types";
import { cn } from "@/lib/utils";

interface CompanyWithHeat {
  entityId: string;
  heat: RelationshipHeat;
  heatScore: number;
  meetingsLast30d: number;
  daysSinceLastMeeting: number | null;
  company: {
    id: string;
    name: string;
    stage: string;
  } | null;
}

interface RelationshipHeatGridProps {
  hotRelationships: CompanyWithHeat[];
  coolingRelationships: CompanyWithHeat[];
  className?: string;
}

export function RelationshipHeatGrid({
  hotRelationships,
  coolingRelationships,
  className,
}: RelationshipHeatGridProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      {/* Hot Relationships */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="size-3 rounded-full bg-red-500" />
            Hot Relationships
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hotRelationships.length === 0 ? (
            <p className="text-sm text-neutral-500">No hot relationships yet</p>
          ) : (
            <div className="space-y-3">
              {hotRelationships.map((rel) => (
                <RelationshipRow key={rel.entityId} relationship={rel} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cooling/Cold Relationships */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="size-3 rounded-full bg-blue-500" />
            Needs Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coolingRelationships.length === 0 ? (
            <p className="text-sm text-neutral-500">All relationships are healthy</p>
          ) : (
            <div className="space-y-3">
              {coolingRelationships.map((rel) => (
                <RelationshipRow key={rel.entityId} relationship={rel} showAlert />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RelationshipRow({
  relationship,
  showAlert = false,
}: {
  relationship: CompanyWithHeat;
  showAlert?: boolean;
}) {
  const config = HEAT_CONFIG[relationship.heat];

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800">
      <div className="flex-1 min-w-0">
        {relationship.company ? (
          <Link
            href={`/companies/${relationship.company.id}`}
            className="font-medium text-blue-600 hover:underline truncate block"
          >
            {relationship.company.name}
          </Link>
        ) : (
          <span className="font-medium text-neutral-500">Unknown Company</span>
        )}
        <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
          <span>{relationship.meetingsLast30d} meetings (30d)</span>
          {relationship.daysSinceLastMeeting !== null && (
            <>
              <span>•</span>
              <span>
                {relationship.daysSinceLastMeeting === 0
                  ? "Today"
                  : `${relationship.daysSinceLastMeeting}d ago`}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={cn(config.bgColor, config.color, "border-0")}>
          {config.label}
        </Badge>
        {showAlert && relationship.daysSinceLastMeeting && relationship.daysSinceLastMeeting > 30 && (
          <span className="text-orange-500 text-xs">Overdue</span>
        )}
      </div>
    </div>
  );
}

interface HeatDistributionChartProps {
  distribution: {
    HOT: number;
    WARM: number;
    COOLING: number;
    COLD: number;
  };
  className?: string;
}

export function HeatDistributionChart({ distribution, className }: HeatDistributionChartProps) {
  const total = distribution.HOT + distribution.WARM + distribution.COOLING + distribution.COLD;

  if (total === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Relationship Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500">No relationship data yet</p>
        </CardContent>
      </Card>
    );
  }

  const segments = [
    { key: "HOT", value: distribution.HOT, color: "bg-red-500" },
    { key: "WARM", value: distribution.WARM, color: "bg-orange-500" },
    { key: "COOLING", value: distribution.COOLING, color: "bg-yellow-500" },
    { key: "COLD", value: distribution.COLD, color: "bg-blue-500" },
  ].filter((s) => s.value > 0);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Relationship Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bar chart */}
        <div className="h-8 flex rounded-full overflow-hidden">
          {segments.map((segment) => (
            <div
              key={segment.key}
              className={cn(segment.color, "transition-all")}
              style={{ width: `${(segment.value / total) * 100}%` }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(HEAT_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2 text-sm">
              <span className={cn("size-3 rounded-full", config.bgColor.replace("100", "500"))} />
              <span className="text-neutral-600 dark:text-neutral-400">
                {config.label}
              </span>
              <span className="font-medium">
                {distribution[key as keyof typeof distribution]}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
