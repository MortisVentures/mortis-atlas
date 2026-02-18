"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MeetingsByStageData {
  stage: string;
  count: number;
  avgPerMonth: number;
}

interface MeetingVelocityChartProps {
  data: MeetingsByStageData[];
  className?: string;
}

export function MeetingVelocityByStageChart({ data, className }: MeetingVelocityChartProps) {
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Meetings by Deal Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500">No meeting data yet</p>
        </CardContent>
      </Card>
    );
  }

  // Format stage names
  const formattedData = data.map((d) => ({
    ...d,
    stage: formatStageName(d.stage),
  }));

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Meetings by Deal Stage (90d)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" />
              <YAxis type="category" dataKey="stage" width={120} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [value, "Meetings"]}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function formatStageName(stage: string): string {
  return stage
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

interface MonthlyMeetingData {
  month: string;
  count: number;
}

interface MeetingTrendChartProps {
  data: MonthlyMeetingData[];
  className?: string;
}

export function MeetingTrendChart({ data, className }: MeetingTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Meeting Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500">No meeting data yet</p>
        </CardContent>
      </Card>
    );
  }

  // Format month labels
  const formattedData = data.map((d) => ({
    ...d,
    monthLabel: formatMonth(d.month),
  }));

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Meeting Trend (6 months)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [value, "Meetings"]}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[parseInt(m, 10) - 1] || month;
}

interface MeetingPatternsCardProps {
  avgMeetingsWon: number;
  avgMeetingsLost: number;
  closedWonCount: number;
  closedLostCount: number;
  insight: string | null;
  className?: string;
}

export function MeetingPatternsCard({
  avgMeetingsWon,
  avgMeetingsLost,
  closedWonCount,
  closedLostCount,
  insight,
  className,
}: MeetingPatternsCardProps) {
  const hasData = closedWonCount > 0 || closedLostCount > 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Meeting Patterns & Outcomes</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="text-sm text-neutral-500">Need more closed deals for pattern analysis</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-sm text-green-600 dark:text-green-400">Won Deals</p>
                <p className="text-2xl font-semibold text-green-700 dark:text-green-300">
                  {avgMeetingsWon.toFixed(1)}
                </p>
                <p className="text-xs text-green-600/80 dark:text-green-400/80">
                  avg meetings ({closedWonCount} deals)
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                <p className="text-sm text-red-600 dark:text-red-400">Lost Deals</p>
                <p className="text-2xl font-semibold text-red-700 dark:text-red-300">
                  {avgMeetingsLost.toFixed(1)}
                </p>
                <p className="text-xs text-red-600/80 dark:text-red-400/80">
                  avg meetings ({closedLostCount} deals)
                </p>
              </div>
            </div>

            {insight && (
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {insight}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
