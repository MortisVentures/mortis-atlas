"use client";

import * as React from "react";
import {
  EnvelopeClosedIcon,
  PersonIcon,
  ClockIcon,
  ChatBubbleIcon,
  StarFilledIcon,
  Cross2Icon,
  CheckIcon,
  Link2Icon,
} from "@radix-ui/react-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Proposal } from "@/hooks/use-proposals";
import { getScoreColor, getScoreTier } from "@/lib/integrations/detection/scoring";

// =============================================================================
// TYPES
// =============================================================================

interface ProposalsListProps {
  proposals: Proposal[];
  isLoading: boolean;
  onSelect: (proposal: Proposal) => void;
  onDismiss: (proposalId: string) => void;
  onQuickCreate: (proposal: Proposal) => void;
}

// =============================================================================
// PROPOSAL CARD
// =============================================================================

interface ProposalCardProps {
  proposal: Proposal;
  onSelect: () => void;
  onDismiss: () => void;
  onQuickCreate: () => void;
}

function ProposalCard({
  proposal,
  onSelect,
  onDismiss,
  onQuickCreate,
}: ProposalCardProps) {
  const tier = getScoreTier(proposal.score);
  const scoreColorClass = getScoreColor(proposal.score);

  const displayName =
    proposal.name ||
    (proposal.parsedName.firstName && proposal.parsedName.lastName
      ? `${proposal.parsedName.firstName} ${proposal.parsedName.lastName}`
      : null) ||
    proposal.email.split("@")[0];

  const hasCompanyMatch = proposal.companyMatches.length > 0;
  const bestMatch = proposal.companyMatches[0];

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all hover:shadow-md",
        "border-neutral-200 dark:border-neutral-700",
        tier === "high" && "border-l-4 border-l-green-500"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Contact Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {displayName}
              </span>
              {tier === "high" && (
                <StarFilledIcon className="size-4 text-yellow-500 flex-shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-2">
              <EnvelopeClosedIcon className="size-3.5 flex-shrink-0" />
              <span className="truncate">{proposal.email}</span>
            </div>

            {/* Domain / Company Match */}
            {proposal.domainInfo.companyName && (
              <div className="flex items-center gap-2 text-sm mb-2">
                {hasCompanyMatch ? (
                  <>
                    <Link2Icon className="size-3.5 text-green-500 flex-shrink-0" />
                    <span className="text-green-600 dark:text-green-400">
                      Matches: {bestMatch.name}
                      <span className="text-neutral-400 ml-1">
                        ({bestMatch.confidence}%)
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    <PersonIcon className="size-3.5 flex-shrink-0" />
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {proposal.domainInfo.companyName}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Recent Subject */}
            {proposal.recentSubjects[0] && (
              <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                <ChatBubbleIcon className="size-3.5 flex-shrink-0" />
                <span className="truncate">{proposal.recentSubjects[0]}</span>
              </div>
            )}
          </div>

          {/* Right: Stats & Actions */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {/* Score Badge */}
            <Badge
              variant="outline"
              className={cn("text-xs font-medium", scoreColorClass)}
            >
              Score: {proposal.score}
            </Badge>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-neutral-400">
              <span className="flex items-center gap-1">
                <EnvelopeClosedIcon className="size-3" />
                {proposal.messageCount}
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="size-3" />
                {formatRelativeTime(new Date(proposal.lastSeenAt))}
              </span>
            </div>

            {/* Quick Actions */}
            <div
              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onQuickCreate}
                title="Quick create contact"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <CheckIcon className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onDismiss}
                title="Dismiss"
                className="text-neutral-400 hover:text-red-600 hover:bg-red-50"
              >
                <Cross2Icon className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// PROPOSALS LIST
// =============================================================================

export function ProposalsList({
  proposals,
  isLoading,
  onSelect,
  onDismiss,
  onQuickCreate,
}: ProposalsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3" />
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <EnvelopeClosedIcon className="size-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            No new contact suggestions
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            When you receive emails from people not in your contacts, they&apos;ll
            appear here for review.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {proposals.map((proposal) => (
        <ProposalCard
          key={proposal.id}
          proposal={proposal}
          onSelect={() => onSelect(proposal)}
          onDismiss={() => onDismiss(proposal.id)}
          onQuickCreate={() => onQuickCreate(proposal)}
        />
      ))}
    </div>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString();
}

export default ProposalsList;
