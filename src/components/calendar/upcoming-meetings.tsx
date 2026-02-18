"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarIcon, VideoIcon, ClockIcon, PersonIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUpcomingMeetings } from "@/hooks/use-calendar";
import { MeetingTypeBadge } from "./meeting-type-badge";
import { MeetingPrepPanel } from "./meeting-prep-panel";
import { cn } from "@/lib/utils";

interface UpcomingMeetingsProps {
  limit?: number;
  showPrep?: boolean;
  className?: string;
}

export function UpcomingMeetings({
  limit = 5,
  showPrep = false,
  className,
}: UpcomingMeetingsProps) {
  const { events, isLoading, error } = useUpcomingMeetings(limit);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarIcon className="size-4" />
            Upcoming Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarIcon className="size-4" />
            Upcoming Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarIcon className="size-4" />
            Upcoming Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500">No upcoming meetings</p>
          <Link href="/settings/integrations" className="text-sm text-blue-600 hover:underline">
            Connect your calendar
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("flex gap-4", showPrep && "flex-col lg:flex-row", className)}>
      <Card className={cn(showPrep ? "lg:w-1/2" : "w-full")}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarIcon className="size-4" />
            Upcoming Meetings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {events.map((event) => (
            <MeetingCard
              key={event.id}
              event={event}
              isSelected={selectedEventId === event.id}
              onSelect={() => setSelectedEventId(selectedEventId === event.id ? null : event.id)}
              showPrepButton={showPrep}
            />
          ))}
        </CardContent>
      </Card>

      {showPrep && selectedEventId && (
        <Card className="lg:w-1/2">
          <CardContent className="p-4">
            <MeetingPrepPanel eventId={selectedEventId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface MeetingCardProps {
  event: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    location: string | null;
    meetingLink: string | null;
    detectedType: string | null;
    typeConfidence: number | null;
    company: { id: string; name: string } | null;
    deal: { id: string; dealName: string; stage: string } | null;
    attendees: {
      email: string;
      name: string | null;
      contact: { id: string; firstName: string; lastName: string } | null;
    }[];
  };
  isSelected?: boolean;
  onSelect?: () => void;
  showPrepButton?: boolean;
}

function MeetingCard({ event, isSelected, onSelect, showPrepButton }: MeetingCardProps) {
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  const isToday = startTime.toDateString() === new Date().toDateString();
  const isTomorrow = startTime.toDateString() ===
    new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const getDayLabel = () => {
    if (isToday) return "Today";
    if (isTomorrow) return "Tomorrow";
    return startTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-colors",
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium truncate">{event.title}</h4>
            {event.detectedType && (
              <MeetingTypeBadge
                type={event.detectedType as import("@prisma/client").MeetingType}
                size="sm"
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
            <span className="flex items-center gap-1">
              <ClockIcon className="size-3" />
              {getDayLabel()}, {formatTime(startTime)} - {formatTime(endTime)}
            </span>

            {event.attendees.length > 0 && (
              <span className="flex items-center gap-1">
                <PersonIcon className="size-3" />
                {event.attendees.length} attendee{event.attendees.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {event.company && (
            <Link
              href={`/companies/${event.company.id}`}
              className="text-sm text-blue-600 hover:underline mt-1 inline-block"
            >
              {event.company.name}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {event.meetingLink && (
            <a
              href={event.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            >
              <VideoIcon className="size-4" />
            </a>
          )}

          {showPrepButton && (
            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={onSelect}
            >
              {isSelected ? "Hide Prep" : "View Prep"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export { MeetingCard };
