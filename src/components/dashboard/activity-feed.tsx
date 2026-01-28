"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { List, type RowComponentProps } from "react-window";
import {
  EnvelopeClosedIcon,
  ChatBubbleIcon,
  CalendarIcon,
  FileTextIcon,
  RocketIcon,
  PersonIcon,
  HomeIcon,
  ChevronRightIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

// =============================================================================
// TYPES
// =============================================================================

export type ActivityType = "EMAIL" | "CALL" | "MEETING" | "NOTE" | "DEAL_UPDATE";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: Date;
  // Related entities
  company?: {
    id: string;
    name: string;
  };
  contact?: {
    id: string;
    name: string;
  };
  deal?: {
    id: string;
    name: string;
  };
  // Additional metadata
  metadata?: {
    duration?: string; // For calls/meetings
    attendees?: string[];
    outcome?: string;
    dealStage?: string;
    previousStage?: string;
  };
  // For new activity animation
  isNew?: boolean;
}

export type DateGroup = "Today" | "Yesterday" | "This Week" | "Earlier";

export interface GroupedActivities {
  group: DateGroup;
  activities: Activity[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  EMAIL: <EnvelopeClosedIcon className="size-4" />,
  CALL: <ChatBubbleIcon className="size-4" />,
  MEETING: <CalendarIcon className="size-4" />,
  NOTE: <FileTextIcon className="size-4" />,
  DEAL_UPDATE: <RocketIcon className="size-4" />,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  EMAIL: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  CALL: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  MEETING: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  NOTE: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  DEAL_UPDATE: "bg-tactical-500/10 text-tactical-500 border-tactical-500/20",
};

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  EMAIL: "Email",
  CALL: "Call",
  MEETING: "Meeting",
  NOTE: "Note",
  DEAL_UPDATE: "Deal Update",
};

const ITEM_HEIGHT = 80;
const _EXPANDED_ITEM_HEIGHT = 140;

// =============================================================================
// SAMPLE DATA
// =============================================================================

function generateSampleActivities(): Activity[] {
  const now = new Date();

  return [
    {
      id: "1",
      type: "DEAL_UPDATE",
      title: "TechFlow AI moved to Term Sheet",
      description: "Deal progressed from Due Diligence to Term Sheet stage. Valuation confirmed at $45M.",
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
      company: { id: "c1", name: "TechFlow AI" },
      deal: { id: "d1", name: "Series A" },
      metadata: { dealStage: "Term Sheet", previousStage: "Due Diligence" },
      isNew: true,
    },
    {
      id: "2",
      type: "MEETING",
      title: "Partner meeting with Quantum Labs",
      description: "Initial pitch meeting. Discussed product roadmap and market opportunity.",
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
      company: { id: "c2", name: "Quantum Labs" },
      contact: { id: "ct1", name: "Sarah Chen" },
      metadata: { duration: "45 min", attendees: ["John Smith", "Sarah Chen"] },
    },
    {
      id: "3",
      type: "EMAIL",
      title: "Follow-up sent to DataSync",
      description: "Sent term sheet draft and investment memo for review.",
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
      company: { id: "c3", name: "DataSync" },
      contact: { id: "ct2", name: "Mike Johnson" },
    },
    {
      id: "4",
      type: "CALL",
      title: "Reference call - CloudScale",
      description: "Spoke with former CTO about technical capabilities and team dynamics.",
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
      company: { id: "c4", name: "CloudScale" },
      metadata: { duration: "30 min", outcome: "Positive" },
    },
    {
      id: "5",
      type: "NOTE",
      title: "Investment thesis updated",
      description: "Added notes on competitive landscape analysis and market sizing for AI infrastructure sector.",
      timestamp: new Date(now.getTime() - 26 * 60 * 60 * 1000), // Yesterday
      company: { id: "c5", name: "NeuralNet Inc" },
    },
    {
      id: "6",
      type: "DEAL_UPDATE",
      title: "Blockchain Labs deal closed",
      description: "Successfully closed Series B investment. $15M at $120M post-money.",
      timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000), // 2 days ago
      company: { id: "c6", name: "Blockchain Labs" },
      deal: { id: "d2", name: "Series B" },
      metadata: { dealStage: "Closed Won" },
    },
    {
      id: "7",
      type: "MEETING",
      title: "IC presentation - FinanceAI",
      description: "Presented investment opportunity to Investment Committee. Approved for term sheet.",
      timestamp: new Date(now.getTime() - 72 * 60 * 60 * 1000), // 3 days ago
      company: { id: "c7", name: "FinanceAI" },
      metadata: { duration: "1 hr", outcome: "Approved" },
    },
    {
      id: "8",
      type: "EMAIL",
      title: "Due diligence request sent",
      description: "Requested financial statements, cap table, and customer references.",
      timestamp: new Date(now.getTime() - 96 * 60 * 60 * 1000), // 4 days ago
      company: { id: "c8", name: "RoboTech" },
      contact: { id: "ct3", name: "Alex Wong" },
    },
    {
      id: "9",
      type: "CALL",
      title: "Intro call with founder",
      description: "Initial conversation about vision, team, and funding needs.",
      timestamp: new Date(now.getTime() - 120 * 60 * 60 * 1000), // 5 days ago
      company: { id: "c9", name: "SpaceData" },
      contact: { id: "ct4", name: "Emily Davis" },
      metadata: { duration: "25 min" },
    },
    {
      id: "10",
      type: "NOTE",
      title: "Market research notes",
      description: "Compiled research on autonomous vehicle market trends and key players.",
      timestamp: new Date(now.getTime() - 168 * 60 * 60 * 1000), // 7 days ago
    },
    {
      id: "11",
      type: "DEAL_UPDATE",
      title: "GreenEnergy passed",
      description: "Decision to pass on opportunity. Concerns about unit economics and competition.",
      timestamp: new Date(now.getTime() - 200 * 60 * 60 * 1000), // 8+ days ago
      company: { id: "c10", name: "GreenEnergy" },
      deal: { id: "d3", name: "Series A" },
      metadata: { dealStage: "Passed" },
    },
    {
      id: "12",
      type: "MEETING",
      title: "Board meeting - Portfolio Co",
      description: "Quarterly board meeting. Reviewed financials and growth metrics.",
      timestamp: new Date(now.getTime() - 240 * 60 * 60 * 1000), // 10 days ago
      company: { id: "c11", name: "Portfolio Co" },
      metadata: { duration: "2 hrs" },
    },
  ];
}

const defaultActivities = generateSampleActivities();

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDateGroup(date: Date): DateGroup {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  if (date >= today) return "Today";
  if (date >= yesterday) return "Yesterday";
  if (date >= weekAgo) return "This Week";
  return "Earlier";
}

function groupActivitiesByDate(activities: Activity[]): GroupedActivities[] {
  const groups: Record<DateGroup, Activity[]> = {
    "Today": [],
    "Yesterday": [],
    "This Week": [],
    "Earlier": [],
  };

  activities.forEach((activity) => {
    const group = getDateGroup(activity.timestamp);
    groups[group].push(activity);
  });

  const result: GroupedActivities[] = [];
  const order: DateGroup[] = ["Today", "Yesterday", "This Week", "Earlier"];

  order.forEach((group) => {
    if (groups[group].length > 0) {
      result.push({ group, activities: groups[group] });
    }
  });

  return result;
}

// =============================================================================
// ACTIVITY ITEM COMPONENT
// =============================================================================

interface ActivityItemProps {
  activity: Activity;
  isExpanded: boolean;
  onToggleExpand: () => void;
  style?: React.CSSProperties;
}

function ActivityItem({
  activity,
  isExpanded,
  onToggleExpand,
  style,
}: ActivityItemProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  // Determine link href
  const linkHref = activity.company
    ? `/companies/${activity.company.id}`
    : activity.deal
    ? `/deals/${activity.deal.id}`
    : activity.contact
    ? `/contacts/${activity.contact.id}`
    : null;

  const content = (
    <motion.div
      className={cn(
        "relative flex gap-4 p-4 mx-2 rounded-atlas-sm",
        "transition-all duration-200",
        "hover:bg-muted/50",
        isExpanded && "bg-muted/30"
      )}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onToggleExpand}
      initial={activity.isNew ? { opacity: 0, x: -20 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
    >
      {/* Timeline connector */}
      <div className="absolute left-8 top-14 bottom-0 w-px bg-border/50" />

      {/* Icon */}
      <div
        className={cn(
          "relative z-10 flex items-center justify-center",
          "size-8 rounded-full border",
          "transition-all duration-200",
          ACTIVITY_COLORS[activity.type],
          isHovered && "scale-110"
        )}
      >
        {ACTIVITY_ICONS[activity.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4 className="text-sm font-medium text-foreground truncate">
              {activity.title}
            </h4>

            {/* Related entity */}
            {(activity.company || activity.contact) && (
              <div className="flex items-center gap-2 mt-1">
                {activity.company && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <HomeIcon className="size-3" />
                    {activity.company.name}
                  </span>
                )}
                {activity.contact && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <PersonIcon className="size-3" />
                    {activity.contact.name}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Timestamp & Arrow */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(activity.timestamp)}
            </span>
            {linkHref && (
              <ChevronRightIcon
                className={cn(
                  "size-4 text-muted-foreground transition-transform duration-200",
                  isHovered && "translate-x-0.5"
                )}
              />
            )}
          </div>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {isExpanded && activity.description && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 space-y-2"
            >
              <p className="text-sm text-muted-foreground">
                {activity.description}
              </p>

              {/* Metadata */}
              {activity.metadata && (
                <div className="flex flex-wrap gap-2">
                  {activity.metadata.duration && (
                    <span className="px-2 py-0.5 text-xs bg-muted rounded-full">
                      {activity.metadata.duration}
                    </span>
                  )}
                  {activity.metadata.outcome && (
                    <span className={cn(
                      "px-2 py-0.5 text-xs rounded-full",
                      activity.metadata.outcome === "Positive" || activity.metadata.outcome === "Approved"
                        ? "bg-tactical-500/10 text-tactical-500"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {activity.metadata.outcome}
                    </span>
                  )}
                  {activity.metadata.dealStage && (
                    <span className="px-2 py-0.5 text-xs bg-blue-500/10 text-blue-500 rounded-full">
                      {activity.metadata.dealStage}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  if (linkHref && !isExpanded) {
    return (
      <Link href={linkHref} className="block">
        {content}
      </Link>
    );
  }

  return <div className="cursor-pointer">{content}</div>;
}

// =============================================================================
// DATE GROUP HEADER
// =============================================================================

interface DateGroupHeaderProps {
  group: DateGroup;
  count: number;
}

function DateGroupHeader({ group, count }: DateGroupHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm border-b border-border/50">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {group}
      </span>
      <span className="flex items-center justify-center size-5 text-xs font-mono bg-muted rounded-full">
        {count}
      </span>
    </div>
  );
}

// =============================================================================
// VIRTUALIZED ACTIVITY LIST
// =============================================================================

interface VirtualizedActivityListProps {
  activities: Activity[];
  height: number;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
}

interface ActivityRowProps {
  activities: Activity[];
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
}

function ActivityRow({
  index,
  style,
  activities,
  expandedId,
  onToggleExpand,
}: RowComponentProps<ActivityRowProps>) {
  const activity = activities[index];
  return (
    <ActivityItem
      key={activity.id}
      activity={activity}
      isExpanded={expandedId === activity.id}
      onToggleExpand={() => onToggleExpand(activity.id)}
      style={style}
    />
  );
}

function VirtualizedActivityList({
  activities,
  height,
  expandedId,
  onToggleExpand,
}: VirtualizedActivityListProps) {
  return (
    <List
      rowComponent={ActivityRow}
      rowCount={activities.length}
      rowHeight={ITEM_HEIGHT}
      rowProps={{ activities, expandedId, onToggleExpand }}
      className="scrollbar-thin"
      style={{ height, width: "100%" }}
    />
  );
}

// =============================================================================
// NON-VIRTUALIZED ACTIVITY LIST (for smaller lists)
// =============================================================================

interface ActivityListProps {
  groupedActivities: GroupedActivities[];
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  maxHeight?: string;
}

function ActivityList({
  groupedActivities,
  expandedId,
  onToggleExpand,
  maxHeight = "max-h-[600px]",
}: ActivityListProps) {
  return (
    <div className={cn("overflow-y-auto scrollbar-thin", maxHeight)}>
      {groupedActivities.map((group) => (
        <div key={group.group}>
          <DateGroupHeader group={group.group} count={group.activities.length} />
          <div className="py-2">
            {group.activities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                isExpanded={expandedId === activity.id}
                onToggleExpand={() => onToggleExpand(activity.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// ACTIVITY FEED COMPONENT
// =============================================================================

export interface ActivityFeedProps {
  activities?: Activity[];
  title?: string;
  showHeader?: boolean;
  maxItems?: number;
  useVirtualization?: boolean;
  virtualizedHeight?: number;
  maxHeight?: string;
  className?: string;
  onActivityClick?: (activity: Activity) => void;
}

export function ActivityFeed({
  activities = defaultActivities,
  title = "Recent Activity",
  showHeader = true,
  maxItems = 20,
  useVirtualization = false,
  virtualizedHeight = 500,
  maxHeight = "max-h-[600px]",
  className,
  onActivityClick: _onActivityClick,
}: ActivityFeedProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  // Limit activities and group by date
  const limitedActivities = activities.slice(0, maxItems);
  const groupedActivities = React.useMemo(
    () => groupActivitiesByDate(limitedActivities),
    [limitedActivities]
  );

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Card variant="raised" className={cn("overflow-hidden", className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {title}
          </h3>
          <button
            className={cn(
              "p-2 rounded-atlas-sm",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-muted/50 transition-colors"
            )}
            aria-label="More options"
          >
            <DotsHorizontalIcon className="size-4" />
          </button>
        </div>
      )}

      {/* Activity List */}
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <CalendarIcon className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No recent activity</p>
        </div>
      ) : useVirtualization ? (
        <VirtualizedActivityList
          activities={limitedActivities}
          height={virtualizedHeight}
          expandedId={expandedId}
          onToggleExpand={handleToggleExpand}
        />
      ) : (
        <ActivityList
          groupedActivities={groupedActivities}
          expandedId={expandedId}
          onToggleExpand={handleToggleExpand}
          maxHeight={maxHeight}
        />
      )}
    </Card>
  );
}

// =============================================================================
// ACTIVITY FEED SKELETON
// =============================================================================

export function ActivityFeedSkeleton() {
  return (
    <Card variant="raised" className="overflow-hidden animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="h-6 w-32 bg-muted rounded" />
        <div className="size-8 bg-muted rounded" />
      </div>

      {/* Group header skeleton */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50">
        <div className="h-4 w-16 bg-muted rounded" />
        <div className="size-5 bg-muted rounded-full" />
      </div>

      {/* Activity items skeleton */}
      <div className="p-2 space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4">
            <div className="size-8 bg-muted rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </div>
            <div className="h-3 w-12 bg-muted rounded shrink-0" />
          </div>
        ))}
      </div>
    </Card>
  );
}

// =============================================================================
// COMPACT ACTIVITY FEED (for sidebar or small spaces)
// =============================================================================

export interface CompactActivityFeedProps {
  activities?: Activity[];
  maxItems?: number;
  className?: string;
}

export function CompactActivityFeed({
  activities = defaultActivities,
  maxItems = 5,
  className,
}: CompactActivityFeedProps) {
  const limitedActivities = activities.slice(0, maxItems);

  return (
    <div className={cn("space-y-1", className)}>
      {limitedActivities.map((activity) => (
        <Link
          key={activity.id}
          href={activity.company ? `/companies/${activity.company.id}` : "#"}
          className={cn(
            "flex items-center gap-3 p-2 rounded-atlas-sm",
            "hover:bg-muted/50 transition-colors"
          )}
        >
          <div
            className={cn(
              "flex items-center justify-center",
              "size-6 rounded-full border",
              ACTIVITY_COLORS[activity.type]
            )}
          >
            {ACTIVITY_ICONS[activity.type]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground truncate">{activity.title}</p>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatRelativeTime(activity.timestamp)}
          </span>
        </Link>
      ))}
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  generateSampleActivities,
  formatRelativeTime,
  getDateGroup,
  groupActivitiesByDate,
  ActivityItem,
  DateGroupHeader,
  ActivityList,
  ACTIVITY_ICONS,
  ACTIVITY_COLORS,
  ACTIVITY_LABELS,
};

export default ActivityFeed;
