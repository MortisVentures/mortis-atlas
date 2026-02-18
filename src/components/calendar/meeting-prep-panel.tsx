"use client";

import { ReloadIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMeetingPrep } from "@/hooks/use-meeting-prep";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MeetingPrepPanelProps {
  eventId: string;
  className?: string;
}

export function MeetingPrepPanel({ eventId, className }: MeetingPrepPanelProps) {
  const { brief, isLoading, error, regenerate } = useMeetingPrep(eventId);

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-center p-8">
          <ReloadIcon className="size-6 animate-spin text-neutral-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button variant="outline" size="sm" onClick={() => regenerate()} className="mt-2">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!brief) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Meeting Prep</h3>
        <Button variant="ghost" size="sm" onClick={() => regenerate()}>
          <ReloadIcon className="size-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Deal Context */}
      {brief.dealContext && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Deal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <Link
                href={`/deals/${brief.dealContext.id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {brief.dealContext.name}
              </Link>
              <Badge variant="outline">{brief.dealContext.stage}</Badge>
            </div>
            {brief.dealContext.amount && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Amount: ${brief.dealContext.amount.toLocaleString()}
              </p>
            )}
            {brief.dealContext.nextMilestone && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Next: {brief.dealContext.nextMilestone}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Company Context */}
      {brief.companyContext && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Company</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <Link
                href={`/companies/${brief.companyContext.id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {brief.companyContext.name}
              </Link>
              {brief.companyContext.sector && (
                <Badge variant="outline">{brief.companyContext.sector}</Badge>
              )}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
              {brief.companyContext.valuation && (
                <p>Valuation: ${brief.companyContext.valuation.toLocaleString()}</p>
              )}
              <p>Previous meetings: {brief.companyContext.previousMeetingsCount}</p>
              {brief.companyContext.lastMeetingDate && (
                <p>
                  Last meeting: {new Date(brief.companyContext.lastMeetingDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendees */}
      {brief.attendeeProfiles.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Attendees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {brief.attendeeProfiles.map((attendee) => (
                <div key={attendee.email} className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      {attendee.contactId ? (
                        <Link
                          href={`/contacts/${attendee.contactId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {attendee.name || attendee.email}
                        </Link>
                      ) : (
                        attendee.name || attendee.email
                      )}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {[attendee.role, attendee.company].filter(Boolean).join(" at ")}
                    </p>
                  </div>
                  {attendee.interactionCount > 0 && (
                    <span className="text-xs text-neutral-500">
                      {attendee.interactionCount} interactions
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relationship Signals */}
      {brief.relationshipSignals.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {brief.relationshipSignals.map((signal, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg",
                    signal.sentiment === "positive" && "bg-green-50 dark:bg-green-900/20",
                    signal.sentiment === "negative" && "bg-red-50 dark:bg-red-900/20",
                    signal.sentiment === "neutral" && "bg-neutral-50 dark:bg-neutral-800"
                  )}
                >
                  <span className="text-sm font-medium">{signal.label}</span>
                  <span className="text-sm text-neutral-600">{signal.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Talking Points */}
      {brief.suggestedTalkingPoints.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Suggested Talking Points</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {brief.suggestedTalkingPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Open Questions */}
      {brief.openQuestions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Open Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {brief.openQuestions.map((question, i) => (
                <li key={i} className="text-sm text-neutral-600 dark:text-neutral-400">
                  {question}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recent Interactions */}
      {brief.recentInteractions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {brief.recentInteractions.map((interaction, i) => (
                <div key={i} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{interaction.subject}</span>
                    <span className="text-xs text-neutral-500">
                      {new Date(interaction.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-neutral-500">{interaction.type}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
