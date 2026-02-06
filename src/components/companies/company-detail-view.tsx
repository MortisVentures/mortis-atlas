"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLinkIcon,
  Pencil1Icon,
  TrashIcon,
  PlusIcon,
  FileIcon,
  CalendarIcon,
  ChatBubbleIcon,
  ClockIcon,
  CheckIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  EnvelopeClosedIcon,
  VideoIcon,
  StackIcon,
  LinkedInLogoIcon,
  TwitterLogoIcon,
  GlobeIcon,
  BookmarkIcon,
  Share2Icon,
  RocketIcon,
} from "@radix-ui/react-icons";

import {
  DashboardLayout,
  DashboardContent,
} from "@/components/layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge, StageBadge, BadgeGroup } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddContactDialog } from "./add-contact-dialog";
import { ActivityModal, type ActivityFormData } from "@/components/activities";

// =============================================================================
// TYPES
// =============================================================================

export interface CompanyDetailData {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  stage: string;
  sector: string | null;
  location: string | null;
  foundedYear: number | null;
  employeeCount: string | null;
  fundingRound: string | null;
  fundingAmount: number | null;
  valuation: number | null;
  linkedinUrl: string | null;
  twitterHandle: string | null;
  logoUrl: string | null;
  notes: string | null;
  updatedAt: string;
  tags: { tag: { id: string; name: string; color: string | null } }[];
  contacts: ContactData[];
  deals: DealData[];
  activities: ActivityData[];
  _count: {
    contacts: number;
    deals: number;
    activities: number;
  };
}

export interface ContactData {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  linkedinUrl: string | null;
  isPrimary: boolean;
}

export interface DealData {
  id: string;
  dealName: string;
  amount: number | null;
  valuation: number | null;
  stage: string;
  probability: number | null;
  expectedClose: string | null;
  notes: string | null;
  createdAt: string;
  contact: { id: string; firstName: string; lastName: string } | null;
}

export interface ActivityData {
  id: string;
  type: string;
  subject: string;
  description: string | null;
  activityDate: string;
  contact: { id: string; firstName: string; lastName: string } | null;
}

// =============================================================================
// STAGE & TYPE CONFIGS
// =============================================================================

const dealStageConfig: Record<string, { label: string; color: string; step: number }> = {
  INITIAL_REVIEW: { label: "Initial Review", color: "bg-slate-500", step: 1 },
  MEETING_SCHEDULED: { label: "Meeting Scheduled", color: "bg-blue-500", step: 2 },
  DEEP_DIVE: { label: "Deep Dive", color: "bg-cyan-500", step: 3 },
  PARTNER_REVIEW: { label: "Partner Review", color: "bg-violet-500", step: 4 },
  TERM_SHEET: { label: "Term Sheet", color: "bg-amber-500", step: 5 },
  LEGAL_DILIGENCE: { label: "Legal Diligence", color: "bg-orange-500", step: 6 },
  CLOSED_WON: { label: "Closed Won", color: "bg-green-500", step: 7 },
  CLOSED_LOST: { label: "Closed Lost", color: "bg-red-500", step: -1 },
};

const activityTypeConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  EMAIL: { icon: <EnvelopeClosedIcon className="size-4" />, color: "text-blue-400", label: "Email" },
  CALL: { icon: <VideoIcon className="size-4" />, color: "text-green-400", label: "Call" },
  MEETING: { icon: <CalendarIcon className="size-4" />, color: "text-violet-400", label: "Meeting" },
  NOTE: { icon: <FileIcon className="size-4" />, color: "text-amber-400", label: "Note" },
  DOCUMENT: { icon: <StackIcon className="size-4" />, color: "text-cyan-400", label: "Document" },
  DEAL_UPDATE: { icon: <RocketIcon className="size-4" />, color: "text-orange-400", label: "Deal Update" },
  INTRO: { icon: <ChevronRightIcon className="size-4" />, color: "text-tactical-400", label: "Intro" },
  TASK: { icon: <CheckIcon className="size-4" />, color: "text-pink-400", label: "Task" },
};

const companyStageMap: Record<string, string> = {
  PROSPECT: "IDENTIFIED",
  QUALIFIED: "RESEARCHING",
  ENGAGED: "OUTREACH_ACTIVE",
  DUE_DILIGENCE: "DUE_DILIGENCE",
  PASSED: "PASSED",
  PORTFOLIO: "PORTFOLIO",
  EXITED: "CLOSED",
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatCurrency(value: number | null | undefined, compact = false): string {
  if (value == null) return "—";
  if (compact) {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function MetricItem({
  label,
  value,
  subValue,
  trend,
  className,
}: {
  label: string;
  value: string | React.ReactNode;
  subValue?: string;
  trend?: { direction: "up" | "down" | "neutral"; value: string };
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-lg font-semibold font-mono">{value}</div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium",
              trend.direction === "up" && "text-tactical-500",
              trend.direction === "down" && "text-red-400",
              trend.direction === "neutral" && "text-muted-foreground"
            )}
          >
            {trend.direction === "up" && "↑"}
            {trend.direction === "down" && "↓"}
            {trend.value}
          </span>
        )}
      </div>
      {subValue && <div className="text-xs text-muted-foreground">{subValue}</div>}
    </div>
  );
}

function DealPipelineTimeline({ deal }: { deal: DealData }) {
  const currentStage = dealStageConfig[deal.stage] || { label: deal.stage, step: 0 };
  const stages = Object.entries(dealStageConfig)
    .filter(([, config]) => config.step > 0)
    .sort((a, b) => a[1].step - b[1].step);

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="flex justify-between mb-2">
          {stages.map(([key, config]) => (
            <div
              key={key}
              className={cn(
                "flex flex-col items-center",
                config.step <= currentStage.step ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all",
                  config.step < currentStage.step && "bg-tactical-500 border-tactical-500 text-white",
                  config.step === currentStage.step && "bg-background border-tactical-500 text-tactical-500",
                  config.step > currentStage.step && "bg-background border-border text-muted-foreground"
                )}
              >
                {config.step < currentStage.step ? <CheckIcon className="size-4" /> : config.step}
              </div>
              <span className="text-[10px] mt-1 text-center max-w-[60px] leading-tight">{config.label}</span>
            </div>
          ))}
        </div>
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-border -z-10">
          <div
            className="h-full bg-tactical-500 transition-all"
            style={{ width: `${Math.max(0, ((currentStage.step - 1) / (stages.length - 1)) * 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricItem label="Deal Size" value={formatCurrency(deal.amount, true)} />
        <MetricItem label="Pre-Money" value={formatCurrency(deal.valuation, true)} />
        <MetricItem label="Probability" value={deal.probability ? `${deal.probability}%` : "—"} />
        <MetricItem label="Expected Close" value={formatDate(deal.expectedClose)} />
      </div>
    </div>
  );
}

function ContactCard({ contact }: { contact: ContactData }) {
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`;

  return (
    <div className="flex items-start gap-3 p-3 rounded-atlas-sm bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-500 to-tactical-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">
            {contact.firstName} {contact.lastName}
          </span>
          {contact.isPrimary && <Badge variant="tactical" size="xs">Primary</Badge>}
        </div>
        <div className="text-xs text-muted-foreground truncate">{contact.role || "No role"}</div>
        <div className="flex items-center gap-3 mt-2">
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="text-muted-foreground hover:text-foreground transition-colors">
              <EnvelopeClosedIcon className="size-3.5" />
            </a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="text-muted-foreground hover:text-foreground transition-colors">
              <VideoIcon className="size-3.5" />
            </a>
          )}
          {contact.linkedinUrl && (
            <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <LinkedInLogoIcon className="size-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityTimelineItem({ activity }: { activity: ActivityData }) {
  const config = activityTypeConfig[activity.type] || { icon: <FileIcon className="size-4" />, color: "text-muted-foreground", label: activity.type };

  return (
    <div className="flex gap-4 pb-6 last:pb-0">
      <div className="relative">
        <div className={cn("w-8 h-8 rounded-full bg-muted flex items-center justify-center", config.color)}>
          {config.icon}
        </div>
        <div className="absolute top-8 bottom-0 left-1/2 w-px bg-border -translate-x-1/2" />
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-medium text-sm">{activity.subject}</div>
            {activity.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{activity.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
            <Badge variant="ghost" size="xs">{config.label}</Badge>
            <span>{formatRelativeDate(activity.activityDate)}</span>
          </div>
        </div>
        {activity.contact && (
          <Badge variant="outline" size="xs" className="mt-2">
            {activity.contact.firstName} {activity.contact.lastName}
          </Badge>
        )}
      </div>
    </div>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-atlas-sm transition-all",
        active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      {children}
    </button>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface CompanyDetailViewProps {
  company: CompanyDetailData;
}

export function CompanyDetailView({ company }: CompanyDetailViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"overview" | "team" | "activity" | "notes">("overview");
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    metrics: true,
    pipeline: true,
    financials: true,
  });
  const [showActivityModal, setShowActivityModal] = React.useState(false);

  const handleSaveActivity = async (data: ActivityFormData) => {
    const response = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: data.type,
        subject: data.subject,
        description: data.description || null,
        activityDate: data.activityDate ? new Date(data.activityDate).toISOString() : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        companyId: data.companyId || null,
        dealId: data.dealId || null,
        contactId: data.contactId || null,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save activity");
    }

    // Refresh the page to show updated activity count
    router.refresh();
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const tags = company.tags?.map((t) => t.tag.name) || [];
  const mappedStage = companyStageMap[company.stage] || company.stage;

  return (
    <DashboardLayout>
      <DashboardContent>
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/companies" className="hover:text-foreground transition-colors">Companies</Link>
            <ChevronRightIcon className="size-4" />
            <span className="text-foreground">{company.name}</span>
          </div>

          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-atlas-md bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                {company.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-display font-bold">{company.name}</h1>
                  <StageBadge stage={mappedStage} size="md" />
                  {company.sector && <Badge variant="navy" size="sm">{company.sector}</Badge>}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                      <GlobeIcon className="size-3.5" />
                      {company.website.replace(/^https?:\/\//, "")}
                      <ExternalLinkIcon className="size-3" />
                    </a>
                  )}
                  {company.linkedinUrl && (
                    <a href={company.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                      <LinkedInLogoIcon className="size-3.5" />
                      LinkedIn
                    </a>
                  )}
                  {company.twitterHandle && (
                    <a href={`https://twitter.com/${company.twitterHandle.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                      <TwitterLogoIcon className="size-3.5" />
                      {company.twitterHandle}
                    </a>
                  )}
                </div>
                {tags.length > 0 && (
                  <div className="mt-3">
                    <BadgeGroup max={5} size="xs">
                      {tags.map((tag) => <Badge key={tag} variant="ghost">{tag}</Badge>)}
                    </BadgeGroup>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm"><BookmarkIcon className="size-4 mr-2" />Save</Button>
              <Button variant="ghost" size="sm"><Share2Icon className="size-4 mr-2" />Share</Button>
              <Link href={`/companies/${company.id}/edit`}>
                <Button variant="outline" size="sm"><Pencil1Icon className="size-4 mr-2" />Edit</Button>
              </Link>
              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                <TrashIcon className="size-4" />
              </Button>
            </div>
          </div>

          {company.description && <p className="mt-4 text-muted-foreground max-w-3xl">{company.description}</p>}
          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
            <ClockIcon className="size-3" />
            Last updated {formatRelativeDate(company.updatedAt)}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-muted/30 rounded-atlas-md w-fit">
          <Tab active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Overview</Tab>
          <Tab active={activeTab === "team"} onClick={() => setActiveTab("team")}>Team & Contacts ({company._count.contacts})</Tab>
          <Tab active={activeTab === "activity"} onClick={() => setActiveTab("activity")}>Activity ({company._count.activities})</Tab>
          <Tab active={activeTab === "notes"} onClick={() => setActiveTab("notes")}>Notes</Tab>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
              {/* Key Metrics Card */}
              <Card variant="raised">
                <CardHeader layout="row" withBorder>
                  <CardTitle size="lg">Key Metrics</CardTitle>
                  <button onClick={() => toggleSection("metrics")} className="p-1 hover:bg-muted rounded transition-colors">
                    {expandedSections.metrics ? <ChevronDownIcon className="size-5" /> : <ChevronRightIcon className="size-5" />}
                  </button>
                </CardHeader>
                {expandedSections.metrics && (
                  <CardContent padding="lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      <MetricItem label="Funding Stage" value={company.fundingRound || "—"} />
                      <MetricItem label="Last Valuation" value={formatCurrency(company.valuation, true)} />
                      <MetricItem label="Funding Raised" value={formatCurrency(company.fundingAmount, true)} />
                      <MetricItem label="Location" value={company.location || "—"} />
                      <MetricItem label="Founded" value={company.foundedYear?.toString() || "—"} />
                      <MetricItem label="Team Size" value={company.employeeCount || "—"} />
                      <MetricItem label="Contacts" value={company._count.contacts.toString()} />
                      <MetricItem label="Active Deals" value={company._count.deals.toString()} />
                      <MetricItem label="Activities" value={company._count.activities.toString()} />
                      <MetricItem label="Pipeline Stage" value={company.stage.replace(/_/g, " ")} />
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Deal Pipeline Section */}
              {company.deals.length > 0 && (
                <Card variant="raised">
                  <CardHeader layout="row" withBorder>
                    <div className="flex items-center gap-2">
                      <CardTitle size="lg">Deal Pipeline</CardTitle>
                      <Badge variant="info" size="sm">{company.deals.length} Active</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline"><PlusIcon className="size-4 mr-2" />New Deal</Button>
                      <button onClick={() => toggleSection("pipeline")} className="p-1 hover:bg-muted rounded transition-colors">
                        {expandedSections.pipeline ? <ChevronDownIcon className="size-5" /> : <ChevronRightIcon className="size-5" />}
                      </button>
                    </div>
                  </CardHeader>
                  {expandedSections.pipeline && (
                    <CardContent padding="lg">
                      <div className="space-y-8">
                        {company.deals.map((deal) => (
                          <div key={deal.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                            <h4 className="font-medium mb-4">{deal.dealName}</h4>
                            <DealPipelineTimeline deal={deal} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Recent Activity Preview */}
              <Card variant="raised">
                <CardHeader layout="row" withBorder>
                  <div className="flex items-center gap-2">
                    <CardTitle size="lg">Recent Activity</CardTitle>
                    <Badge variant="ghost" size="sm">{company.activities.length}</Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("activity")}>
                    View All<ChevronRightIcon className="size-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent padding="lg">
                  {company.activities.length > 0 ? (
                    <div className="space-y-0">
                      {company.activities.slice(0, 5).map((activity) => (
                        <ActivityTimelineItem key={activity.id} activity={activity} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="size-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No activities logged yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes Preview */}
              {company.notes && (
                <Card variant="raised">
                  <CardHeader layout="row" withBorder>
                    <CardTitle size="lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent padding="lg">
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">{company.notes}</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {activeTab === "team" && (
            <motion.div key="team" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
              <Card variant="raised">
                <CardHeader layout="row" withBorder>
                  <CardTitle size="lg">Contacts</CardTitle>
                  <AddContactDialog companyId={company.id} companyName={company.name} />
                </CardHeader>
                <CardContent padding="lg">
                  {company.contacts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {company.contacts.map((contact) => (
                        <ContactCard key={contact.id} contact={contact} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <EnvelopeClosedIcon className="size-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No contacts added yet</p>
                      <div className="mt-4">
                        <AddContactDialog
                          companyId={company.id}
                          companyName={company.name}
                          trigger={
                            <Button variant="outline" size="sm">
                              <PlusIcon className="size-4 mr-2" />Add First Contact
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "activity" && (
            <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <Card variant="raised">
                <CardHeader layout="row" withBorder>
                  <CardTitle size="lg">Activity Timeline</CardTitle>
                  <Button size="sm" onClick={() => setShowActivityModal(true)}>
                    <PlusIcon className="size-4 mr-2" />Log Activity
                  </Button>
                </CardHeader>
                <CardContent padding="lg">
                  {company.activities.length > 0 ? (
                    <div className="space-y-0">
                      {company.activities.map((activity) => (
                        <ActivityTimelineItem key={activity.id} activity={activity} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="size-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No activities logged yet</p>
                      <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowActivityModal(true)}>
                        <PlusIcon className="size-4 mr-2" />Log First Activity
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "notes" && (
            <motion.div key="notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <Card variant="raised">
                <CardHeader layout="row" withBorder>
                  <CardTitle size="lg">Notes</CardTitle>
                  <Button size="sm"><PlusIcon className="size-4 mr-2" />Edit Notes</Button>
                </CardHeader>
                <CardContent padding="lg">
                  {company.notes ? (
                    <p className="whitespace-pre-wrap">{company.notes}</p>
                  ) : (
                    <div className="border border-dashed border-border rounded-atlas-md p-8 text-center">
                      <ChatBubbleIcon className="size-8 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground text-sm">No notes added yet.</p>
                      <Button variant="outline" size="sm" className="mt-4"><PlusIcon className="size-4 mr-2" />Add Notes</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activity Modal */}
        <ActivityModal
          isOpen={showActivityModal}
          onClose={() => setShowActivityModal(false)}
          onSave={handleSaveActivity}
          defaultCompanyId={company.id}
          defaultCompanyName={company.name}
        />
      </DashboardContent>
    </DashboardLayout>
  );
}
