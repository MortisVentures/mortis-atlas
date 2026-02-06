"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  ClockIcon,
  VideoIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

export interface Meeting {
  id: string;
  subject: string;
  description: string | null;
  activityDate: string;
  completed: boolean;
  company: {
    id: string;
    name: string;
  } | null;
  deal: {
    id: string;
    dealName: string;
  } | null;
  contact: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface MeetingListProps {
  meetings: Meeting[];
  isLoading?: boolean;
  onMarkComplete?: (id: string, completed: boolean) => void;
  showCompanyLinks?: boolean;
  emptyMessage?: string;
  className?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatMeetingDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === new Date(now.getTime() + 86400000).toDateString();

  if (isToday) {
    return `Today at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  }
  if (isTomorrow) {
    return `Tomorrow at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getMeetingStatus(dateString: string, completed: boolean): "upcoming" | "past" | "completed" {
  if (completed) return "completed";
  const date = new Date(dateString);
  const now = new Date();
  return date > now ? "upcoming" : "past";
}

function getTimeUntilMeeting(dateString: string): string | null {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();

  if (diffMs < 0) return null;

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `in ${diffMins}m`;
  if (diffHours < 24) return `in ${diffHours}h`;
  if (diffDays < 7) return `in ${diffDays}d`;
  return null;
}

// =============================================================================
// MEETING ITEM COMPONENT
// =============================================================================

function MeetingItem({
  meeting,
  onMarkComplete,
  showCompanyLinks,
}: {
  meeting: Meeting;
  onMarkComplete?: (id: string, completed: boolean) => void;
  showCompanyLinks?: boolean;
}) {
  const status = getMeetingStatus(meeting.activityDate, meeting.completed);
  const timeUntil = getTimeUntilMeeting(meeting.activityDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-lg border transition-all hover:bg-muted/30",
        status === "upcoming" && "border-purple-500/30 bg-purple-500/5",
        status === "past" && "border-amber-500/30 bg-amber-500/5",
        status === "completed" && "border-emerald-500/30 bg-emerald-500/5"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Status icon */}
          <div
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
              status === "upcoming" && "bg-purple-500/20",
              status === "past" && "bg-amber-500/20",
              status === "completed" && "bg-emerald-500/20"
            )}
          >
            {status === "completed" ? (
              <CheckCircledIcon className="size-4 text-emerald-400" />
            ) : status === "past" ? (
              <CrossCircledIcon className="size-4 text-amber-400" />
            ) : (
              <VideoIcon className="size-4 text-purple-400" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-sm truncate">{meeting.subject}</h4>
              {timeUntil && (
                <Badge variant="outline" size="xs" className="text-purple-400 border-purple-500/30">
                  {timeUntil}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarIcon className="size-3" />
                {formatMeetingDate(meeting.activityDate)}
              </span>
            </div>

            {/* Associated entities */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {meeting.company && (
                showCompanyLinks ? (
                  <Link
                    href={`/companies/${meeting.company.id}`}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {meeting.company.name}
                  </Link>
                ) : (
                  <span className="text-xs text-muted-foreground">{meeting.company.name}</span>
                )
              )}
              {meeting.deal && (
                <Link
                  href={`/deals/${meeting.deal.id}`}
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  {meeting.deal.dealName}
                </Link>
              )}
              {meeting.contact && (
                <span className="text-xs text-muted-foreground">
                  with {meeting.contact.firstName} {meeting.contact.lastName}
                </span>
              )}
            </div>

            {meeting.description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {meeting.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {onMarkComplete && !meeting.completed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkComplete(meeting.id, true)}
            className="flex-shrink-0"
          >
            <CheckCircledIcon className="size-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================================
// MEETING LIST COMPONENT
// =============================================================================

export function MeetingList({
  meetings,
  isLoading,
  onMarkComplete,
  showCompanyLinks = true,
  emptyMessage = "No meetings scheduled",
  className,
}: MeetingListProps) {
  // Separate meetings into upcoming and past
  const now = new Date();
  const upcomingMeetings = meetings
    .filter((m) => new Date(m.activityDate) > now && !m.completed)
    .sort((a, b) => new Date(a.activityDate).getTime() - new Date(b.activityDate).getTime());

  const pastMeetings = meetings
    .filter((m) => new Date(m.activityDate) <= now || m.completed)
    .sort((a, b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime());

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-lg border border-border animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-muted rounded" />
                <div className="h-3 w-32 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <CalendarIcon className="size-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upcoming meetings */}
      {upcomingMeetings.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <ClockIcon className="size-3" />
            Upcoming ({upcomingMeetings.length})
          </h4>
          <div className="space-y-2">
            {upcomingMeetings.map((meeting) => (
              <MeetingItem
                key={meeting.id}
                meeting={meeting}
                onMarkComplete={onMarkComplete}
                showCompanyLinks={showCompanyLinks}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past meetings */}
      {pastMeetings.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <CheckCircledIcon className="size-3" />
            Past ({pastMeetings.length})
          </h4>
          <div className="space-y-2">
            {pastMeetings.slice(0, 5).map((meeting) => (
              <MeetingItem
                key={meeting.id}
                meeting={meeting}
                onMarkComplete={onMarkComplete}
                showCompanyLinks={showCompanyLinks}
              />
            ))}
            {pastMeetings.length > 5 && (
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                View {pastMeetings.length - 5} more
                <ChevronRightIcon className="size-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MEETING CARD COMPONENT (for dashboard widgets)
// =============================================================================

interface MeetingCardProps {
  title?: string;
  meetings: Meeting[];
  isLoading?: boolean;
  onMarkComplete?: (id: string, completed: boolean) => void;
  showViewAll?: boolean;
  viewAllHref?: string;
  className?: string;
}

export function MeetingCard({
  title = "Upcoming Meetings",
  meetings,
  isLoading,
  onMarkComplete,
  showViewAll = false,
  viewAllHref = "/tasks",
  className,
}: MeetingCardProps) {
  const upcomingMeetings = meetings
    .filter((m) => new Date(m.activityDate) > new Date() && !m.completed)
    .sort((a, b) => new Date(a.activityDate).getTime() - new Date(b.activityDate).getTime())
    .slice(0, 3);

  return (
    <Card variant="raised" className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold">{title}</h3>
        {showViewAll && (
          <Link href={viewAllHref}>
            <Button variant="ghost" size="sm">
              View All
              <ChevronRightIcon className="size-4 ml-1" />
            </Button>
          </Link>
        )}
      </div>

      <MeetingList
        meetings={upcomingMeetings}
        isLoading={isLoading}
        onMarkComplete={onMarkComplete}
        showCompanyLinks={true}
        emptyMessage="No upcoming meetings"
      />
    </Card>
  );
}
