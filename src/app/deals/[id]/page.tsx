import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  RocketIcon,
  CalendarIcon,
  PersonIcon,
  ArrowLeftIcon,
  Pencil1Icon,
  ExternalLinkIcon,
  ClockIcon,
  CheckCircledIcon,
  CrossCircledIcon,
} from "@radix-ui/react-icons";

import { auth } from "@/lib/auth";
import { getDealById } from "@/lib/db/deals";
import { PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DealActions } from "./deal-actions";
import { DealActivityTimeline } from "./deal-activity-timeline";
import { DealDocumentList } from "./deal-document-list";
import {
  STAGE_CONFIG,
  PRIORITY_CONFIG,
  SOURCE_CONFIG,
  formatCurrency,
  getDaysInStage,
  formatDaysInStage,
  getUrgencyLevel,
} from "@/lib/deals/pipeline-utils";

// =============================================================================
// TYPES
// =============================================================================

interface PageProps {
  params: Promise<{ id: string }>;
}

interface StageHistoryEntry {
  stage: string;
  timestamp: string;
  previousStage?: string;
  notes?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatDate(date: Date | string | null): string {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(date: Date | string | null): string {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// =============================================================================
// DEAL DETAIL PAGE (SERVER COMPONENT)
// =============================================================================

export default async function DealDetailPage({ params }: PageProps) {
  // Get authenticated user
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { id } = await params;

  // Fetch deal data from database
  const deal = await getDealById(id, session.user.id);

  if (!deal) {
    notFound();
  }

  // Get stage config
  const stageConfig = STAGE_CONFIG[deal.stage];
  const priorityConfig = PRIORITY_CONFIG[deal.priority];
  const sourceConfig = deal.sourceType ? SOURCE_CONFIG[deal.sourceType] : null;

  // Calculate days in stage
  const daysInStage = getDaysInStage(deal.lastStageChange);
  const urgencyLevel = getUrgencyLevel(daysInStage, deal.stage);

  // Parse stage history
  const stageHistory = (deal.stageHistory as StageHistoryEntry[] | null) || [];

  // Convert Prisma Decimal to number for display
  const amount = deal.amount ? Number(deal.amount) : null;
  const valuation = deal.valuation ? Number(deal.valuation) : null;
  const roundSize = deal.roundSize ? Number(deal.roundSize) : null;
  const postMoneyVal = deal.postMoneyVal ? Number(deal.postMoneyVal) : null;
  const ownershipTarget = deal.ownershipTarget ? Number(deal.ownershipTarget) : null;

  return (
    <>
      <PageHeader
          title={deal.dealName}
          description={`Deal with ${deal.company.name}`}
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Deals", href: "/deals" },
            { label: deal.dealName },
          ]}
        />

        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/deals">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="size-4 mr-2" />
              Back to Deals
            </Button>
          </Link>
          <Link href={`/deals/${deal.id}/edit`}>
            <Button size="sm">
              <Pencil1Icon className="size-4 mr-2" />
              Edit Deal
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deal Overview */}
            <Card variant="raised" className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center size-14 rounded-full bg-navy-500/10">
                    <RocketIcon className="size-7 text-navy-400" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold">
                      {deal.dealName}
                    </h2>
                    <Link
                      href={`/companies/${deal.company.id}`}
                      className="text-muted-foreground hover:text-tactical-500 transition-colors flex items-center gap-1"
                    >
                      {deal.company.name}
                      <ExternalLinkIcon className="size-3" />
                    </Link>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    className={cn(
                      "border",
                      stageConfig.bgColor,
                      stageConfig.borderColor,
                      stageConfig.textColor
                    )}
                  >
                    {stageConfig.label}
                  </Badge>
                  <Badge
                    className={cn(
                      "border",
                      priorityConfig.bgColor,
                      priorityConfig.borderColor,
                      priorityConfig.textColor
                    )}
                  >
                    {priorityConfig.label} Priority
                  </Badge>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-atlas-sm bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Investment</div>
                  <div className="font-mono text-lg font-semibold">
                    {formatCurrency(amount)}
                  </div>
                </div>
                <div className="p-4 rounded-atlas-sm bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Valuation</div>
                  <div className="font-mono text-lg font-semibold">
                    {formatCurrency(valuation)}
                  </div>
                </div>
                <div className="p-4 rounded-atlas-sm bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Probability</div>
                  <div className="font-mono text-lg font-semibold text-tactical-500">
                    {deal.probability ?? stageConfig.probability}%
                  </div>
                </div>
                <div className="p-4 rounded-atlas-sm bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Expected Close</div>
                  <div className="font-mono text-lg font-semibold">
                    {formatDate(deal.expectedClose)}
                  </div>
                </div>
              </div>

              {/* Additional Financial Details */}
              {(roundSize || postMoneyVal || ownershipTarget !== null) && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Financial Details
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {roundSize && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Round Size</div>
                        <div className="font-mono font-medium">{formatCurrency(roundSize)}</div>
                      </div>
                    )}
                    {postMoneyVal && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Post-Money</div>
                        <div className="font-mono font-medium">{formatCurrency(postMoneyVal)}</div>
                      </div>
                    )}
                    {ownershipTarget !== null && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Target Ownership</div>
                        <div className="font-mono font-medium">{ownershipTarget}%</div>
                      </div>
                    )}
                    {deal.proRataRights && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Pro-Rata Rights</div>
                        <div className="font-medium text-tactical-500">Yes</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Source Attribution */}
            {(sourceConfig || deal.referrerContact) && (
              <Card variant="raised" className="p-6">
                <h3 className="font-display font-semibold mb-4">Source Attribution</h3>
                <div className="space-y-4">
                  {sourceConfig && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Source Type:</span>
                      <Badge
                        className={cn(
                          "border",
                          sourceConfig.bgColor,
                          sourceConfig.borderColor,
                          sourceConfig.textColor
                        )}
                      >
                        {sourceConfig.label}
                      </Badge>
                    </div>
                  )}

                  {deal.sourceChannel && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Channel:</span>
                      <span className="text-sm">{deal.sourceChannel}</span>
                    </div>
                  )}

                  {deal.sourceDetail && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Details:</span>
                      <span className="text-sm">{deal.sourceDetail}</span>
                    </div>
                  )}

                  {deal.referrerContact && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Referred By:</span>
                      <Link
                        href={`/contacts/${deal.referrerContact.id}?highlight=referrals`}
                        className="flex items-center gap-2 text-tactical-500 hover:text-tactical-400 transition-colors"
                      >
                        <PersonIcon className="size-4" />
                        {deal.referrerContact.firstName} {deal.referrerContact.lastName}
                        {deal.referrerContact.company && (
                          <span className="text-muted-foreground">
                            ({deal.referrerContact.company.name})
                          </span>
                        )}
                      </Link>
                    </div>
                  )}

                  {deal.referralDate && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Referral Date:</span>
                      <span className="text-sm">{formatDate(deal.referralDate)}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Notes */}
            <Card variant="raised" className="p-6">
              <h3 className="font-display font-semibold mb-4">Notes</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {deal.notes || "No notes yet."}
              </p>
            </Card>

            {/* Activity Timeline */}
            <DealActivityTimeline
              dealId={deal.id}
              initialCount={deal._count?.activities ?? 0}
            />

            {/* Documents */}
            <DealDocumentList
              dealId={deal.id}
              initialCount={deal._count?.documents ?? 0}
            />

            {/* Stage History Timeline */}
            {stageHistory.length > 0 && (
              <Card variant="raised" className="p-6">
                <h3 className="font-display font-semibold mb-4">Stage History</h3>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />

                  <div className="space-y-4">
                    {stageHistory.slice().reverse().map((entry, index) => {
                      const entryStageConfig = STAGE_CONFIG[entry.stage as keyof typeof STAGE_CONFIG];
                      const isLatest = index === 0;

                      return (
                        <div key={index} className="relative pl-8">
                          {/* Timeline dot */}
                          <div
                            className={cn(
                              "absolute left-0 top-1 size-6 rounded-full flex items-center justify-center",
                              isLatest ? "bg-tactical-500" : "bg-muted"
                            )}
                          >
                            {entry.stage === "CLOSED_WON" ? (
                              <CheckCircledIcon className="size-4 text-white" />
                            ) : entry.stage === "CLOSED_LOST" ? (
                              <CrossCircledIcon className="size-4 text-white" />
                            ) : (
                              <div
                                className={cn(
                                  "size-2 rounded-full",
                                  isLatest ? "bg-white" : "bg-muted-foreground"
                                )}
                              />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <Badge
                                size="sm"
                                className={cn(
                                  "border",
                                  entryStageConfig?.bgColor || "bg-muted",
                                  entryStageConfig?.borderColor || "border-border",
                                  entryStageConfig?.textColor || "text-foreground"
                                )}
                              >
                                {entryStageConfig?.label || entry.stage}
                              </Badge>
                              {entry.previousStage && (
                                <span className="text-xs text-muted-foreground">
                                  from {STAGE_CONFIG[entry.previousStage as keyof typeof STAGE_CONFIG]?.label || entry.previousStage}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatDateTime(entry.timestamp)}
                            </div>
                            {entry.notes && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {entry.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Days in Stage */}
            <Card variant="raised" className="p-6">
              <h3 className="font-display font-semibold mb-4">Time in Stage</h3>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex items-center justify-center size-12 rounded-full",
                    urgencyLevel === "critical"
                      ? "bg-red-500/10"
                      : urgencyLevel === "warning"
                        ? "bg-amber-500/10"
                        : "bg-tactical-500/10"
                  )}
                >
                  <ClockIcon
                    className={cn(
                      "size-6",
                      urgencyLevel === "critical"
                        ? "text-red-400"
                        : urgencyLevel === "warning"
                          ? "text-amber-400"
                          : "text-tactical-400"
                    )}
                  />
                </div>
                <div>
                  <div
                    className={cn(
                      "text-2xl font-bold",
                      urgencyLevel === "critical"
                        ? "text-red-400"
                        : urgencyLevel === "warning"
                          ? "text-amber-400"
                          : "text-foreground"
                    )}
                  >
                    {formatDaysInStage(daysInStage)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    in {stageConfig.shortLabel}
                  </div>
                </div>
              </div>
            </Card>

            {/* Primary Contact */}
            {deal.contact && (
              <Card variant="raised" className="p-6">
                <h3 className="font-display font-semibold mb-4">Primary Contact</h3>
                <Link
                  href={`/contacts/${deal.contact.id}`}
                  className="flex items-center gap-3 p-3 rounded-atlas-sm hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-center size-10 rounded-full bg-tactical-500/10">
                    <PersonIcon className="size-5 text-tactical-500" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {deal.contact.firstName} {deal.contact.lastName}
                    </div>
                    {deal.contact.role && (
                      <div className="text-sm text-muted-foreground">{deal.contact.role}</div>
                    )}
                  </div>
                </Link>
              </Card>
            )}

            {/* Deal Team */}
            {deal.teamMembers && deal.teamMembers.length > 0 && (
              <Card variant="raised" className="p-6">
                <h3 className="font-display font-semibold mb-4">Deal Team</h3>
                <div className="space-y-3">
                  {deal.teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-atlas-sm"
                    >
                      <div className="flex items-center justify-center size-8 rounded-full bg-navy-500/10">
                        <PersonIcon className="size-4 text-navy-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {member.user.name || member.user.email}
                        </div>
                        <div className="text-xs text-muted-foreground">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Timeline */}
            <Card variant="raised" className="p-6">
              <h3 className="font-display font-semibold mb-4">Timeline</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="size-4" />
                  <span>Created: {formatDate(deal.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="size-4" />
                  <span>Updated: {formatDate(deal.updatedAt)}</span>
                </div>
                {deal.actualClose && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircledIcon className="size-4" />
                    <span>Closed: {formatDate(deal.actualClose)}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <DealActions
              dealId={deal.id}
              dealName={deal.dealName}
              companyId={deal.company.id}
              companyName={deal.company.name}
            />

            {/* Related Counts */}
            {deal._count && (
              <Card variant="raised" className="p-6">
                <h3 className="font-display font-semibold mb-4">Related</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-atlas-sm bg-muted/30">
                    <div className="text-2xl font-bold">{deal._count.activities}</div>
                    <div className="text-xs text-muted-foreground">Activities</div>
                  </div>
                  <div className="text-center p-3 rounded-atlas-sm bg-muted/30">
                    <div className="text-2xl font-bold">{deal._count.documents}</div>
                    <div className="text-xs text-muted-foreground">Documents</div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
    </>
  );
}

// =============================================================================
// METADATA
// =============================================================================

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return { title: "Deal | Mortis Atlas" };
  }

  const deal = await getDealById(id, session.user.id);

  if (!deal) {
    return { title: "Deal Not Found | Mortis Atlas" };
  }

  return {
    title: `${deal.dealName} | Mortis Atlas`,
    description: `${deal.dealName} deal with ${deal.company.name}`,
  };
}
