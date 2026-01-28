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
  ChevronRightIcon,
  ChevronDownIcon,
  EnvelopeClosedIcon,
  VideoIcon,
  LinkedInLogoIcon,
  ClockIcon,
  CheckIcon,
  RocketIcon,
  StackIcon,
  PersonIcon,
  HomeIcon,
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
import { Badge, StageBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReferralActivity } from "./referral-activity";

// =============================================================================
// TYPES
// =============================================================================

export interface ContactDetailData {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  linkedinUrl: string | null;
  notes: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
    stage: string;
    sector: string | null;
    website: string | null;
    location: string | null;
  } | null;
  deals: DealData[];
  activities: ActivityData[];
  _count: {
    deals: number;
    activities: number;
  };
}

interface DealData {
  id: string;
  dealName: string;
  stage: string;
  amount: number | null;
  valuation: number | null;
  probability: number | null;
  expectedClose: string | null;
  createdAt: string;
  company: { id: string; name: string } | null;
}

interface ActivityData {
  id: string;
  type: string;
  subject: string;
  description: string | null;
  activityDate: string;
  company: { id: string; name: string } | null;
  deal: { id: string; dealName: string } | null;
}

// =============================================================================
// CONFIGS
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

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function MetricItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string | React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-lg font-semibold font-mono">{value}</div>
    </div>
  );
}

function DealCard({ deal }: { deal: DealData }) {
  const stageConfig = dealStageConfig[deal.stage] || { label: deal.stage, color: "bg-slate-500" };

  return (
    <Link href={`/deals/${deal.id}`}>
      <div className="p-4 rounded-atlas-sm bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{deal.dealName}</div>
            {deal.company && (
              <div className="text-xs text-muted-foreground mt-0.5">{deal.company.name}</div>
            )}
          </div>
          <Badge variant="outline" size="xs" className={cn("flex-shrink-0", stageConfig.color.replace("bg-", "border-"))}>
            {stageConfig.label}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          {deal.amount && <span>{formatCurrency(deal.amount, true)}</span>}
          {deal.probability && <span>{deal.probability}% prob</span>}
          {deal.expectedClose && <span>Close: {formatDate(deal.expectedClose)}</span>}
        </div>
      </div>
    </Link>
  );
}

function ActivityTimelineItem({ activity }: { activity: ActivityData }) {
  const config = activityTypeConfig[activity.type] || {
    icon: <FileIcon className="size-4" />,
    color: "text-muted-foreground",
    label: activity.type
  };

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
        {(activity.company || activity.deal) && (
          <div className="flex items-center gap-2 mt-2">
            {activity.company && (
              <Link href={`/companies/${activity.company.id}`}>
                <Badge variant="outline" size="xs" className="hover:bg-muted/50">
                  {activity.company.name}
                </Badge>
              </Link>
            )}
            {activity.deal && (
              <Link href={`/deals/${activity.deal.id}`}>
                <Badge variant="navy" size="xs" className="hover:bg-navy-600/50">
                  {activity.deal.dealName}
                </Badge>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Tab({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-atlas-sm transition-all",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      {children}
    </button>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface ContactDetailViewProps {
  contact: ContactDetailData;
  highlightSection?: string;
}

export function ContactDetailView({ contact, highlightSection }: ContactDetailViewProps) {
  const _router = useRouter();
  const referralSectionRef = React.useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = React.useState<"overview" | "deals" | "activity" | "notes">("overview");
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    info: true,
    company: true,
    deals: true,
  });

  // Scroll to referral section if highlighted
  React.useEffect(() => {
    if (highlightSection === "referrals" && referralSectionRef.current) {
      // Small delay to ensure the component is fully rendered
      const timer = setTimeout(() => {
        referralSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [highlightSection]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const fullName = `${contact.firstName} ${contact.lastName}`;
  const initials = getInitials(contact.firstName, contact.lastName);
  const mappedCompanyStage = contact.company ? companyStageMap[contact.company.stage] || contact.company.stage : null;

  return (
    <DashboardLayout>
      <DashboardContent>
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/contacts" className="hover:text-foreground transition-colors">Contacts</Link>
            <ChevronRightIcon className="size-4" />
            <span className="text-foreground">{fullName}</span>
          </div>

          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-navy-600 to-tactical-500 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-display font-bold">{fullName}</h1>
                  {contact.isPrimary && (
                    <Badge variant="tactical" size="md">Primary Contact</Badge>
                  )}
                </div>
                {contact.role && (
                  <div className="text-lg text-muted-foreground mb-2">{contact.role}</div>
                )}
                <div className="flex items-center gap-4 text-sm">
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <EnvelopeClosedIcon className="size-3.5" />
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <VideoIcon className="size-3.5" />
                      {contact.phone}
                    </a>
                  )}
                  {contact.linkedinUrl && (
                    <a
                      href={contact.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <LinkedInLogoIcon className="size-3.5" />
                      LinkedIn
                      <ExternalLinkIcon className="size-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <EnvelopeClosedIcon className="size-4 mr-2" />
                Email
              </Button>
              <Link href={`/contacts/${contact.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Pencil1Icon className="size-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                <TrashIcon className="size-4" />
              </Button>
            </div>
          </div>

          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
            <ClockIcon className="size-3" />
            Last updated {formatRelativeDate(contact.updatedAt)}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-muted/30 rounded-atlas-md w-fit">
          <Tab active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Overview</Tab>
          <Tab active={activeTab === "deals"} onClick={() => setActiveTab("deals")}>Deals ({contact._count.deals})</Tab>
          <Tab active={activeTab === "activity"} onClick={() => setActiveTab("activity")}>Activity ({contact._count.activities})</Tab>
          <Tab active={activeTab === "notes"} onClick={() => setActiveTab("notes")}>Notes</Tab>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Company Association Card */}
              {contact.company && (
                <Card variant="raised">
                  <CardHeader layout="row" withBorder>
                    <div className="flex items-center gap-2">
                      <HomeIcon className="size-5 text-muted-foreground" />
                      <CardTitle size="lg">Company</CardTitle>
                    </div>
                    <button onClick={() => toggleSection("company")} className="p-1 hover:bg-muted rounded transition-colors">
                      {expandedSections.company ? <ChevronDownIcon className="size-5" /> : <ChevronRightIcon className="size-5" />}
                    </button>
                  </CardHeader>
                  {expandedSections.company && (
                    <CardContent padding="lg">
                      <Link href={`/companies/${contact.company.id}`}>
                        <div className="flex items-start gap-4 p-4 rounded-atlas-sm bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="w-12 h-12 rounded-atlas-sm bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                            {contact.company.name[0]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-semibold text-lg">{contact.company.name}</span>
                              {mappedCompanyStage && <StageBadge stage={mappedCompanyStage} size="sm" />}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {contact.company.sector && <span>{contact.company.sector}</span>}
                              {contact.company.location && <span>{contact.company.location}</span>}
                            </div>
                            {contact.company.website && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                <ExternalLinkIcon className="size-3" />
                                {contact.company.website.replace(/^https?:\/\//, "")}
                              </div>
                            )}
                          </div>
                          <ChevronRightIcon className="size-5 text-muted-foreground" />
                        </div>
                      </Link>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Contact Info Card */}
              <Card variant="raised">
                <CardHeader layout="row" withBorder>
                  <div className="flex items-center gap-2">
                    <PersonIcon className="size-5 text-muted-foreground" />
                    <CardTitle size="lg">Contact Information</CardTitle>
                  </div>
                  <button onClick={() => toggleSection("info")} className="p-1 hover:bg-muted rounded transition-colors">
                    {expandedSections.info ? <ChevronDownIcon className="size-5" /> : <ChevronRightIcon className="size-5" />}
                  </button>
                </CardHeader>
                {expandedSections.info && (
                  <CardContent padding="lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <MetricItem label="Email" value={contact.email || "—"} />
                      <MetricItem label="Phone" value={contact.phone || "—"} />
                      <MetricItem label="Role" value={contact.role || "—"} />
                      <MetricItem label="Primary Contact" value={contact.isPrimary ? "Yes" : "No"} />
                      <MetricItem label="Total Deals" value={contact._count.deals.toString()} />
                      <MetricItem label="Activities" value={contact._count.activities.toString()} />
                      <MetricItem label="Added" value={formatDate(contact.createdAt)} />
                      <MetricItem
                        label="LinkedIn"
                        value={
                          contact.linkedinUrl ? (
                            <a
                              href={contact.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-tactical-500 hover:text-tactical-400 flex items-center gap-1"
                            >
                              View <ExternalLinkIcon className="size-3" />
                            </a>
                          ) : "—"
                        }
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Recent Deals Card */}
              {contact.deals.length > 0 && (
                <Card variant="raised">
                  <CardHeader layout="row" withBorder>
                    <div className="flex items-center gap-2">
                      <RocketIcon className="size-5 text-muted-foreground" />
                      <CardTitle size="lg">Associated Deals</CardTitle>
                    </div>
                    <Link href={`?tab=deals`}>
                      <Button variant="ghost" size="sm">View All ({contact._count.deals})</Button>
                    </Link>
                  </CardHeader>
                  <CardContent padding="lg">
                    <div className="space-y-3">
                      {contact.deals.slice(0, 3).map((deal) => (
                        <DealCard key={deal.id} deal={deal} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Referral Activity */}
              <div
                ref={referralSectionRef}
                id="referral-activity"
                className={cn(
                  "scroll-mt-6 transition-all duration-500",
                  highlightSection === "referrals" && "ring-2 ring-tactical-500/50 rounded-lg"
                )}
              >
                <ReferralActivity
                  contactId={contact.id}
                  contactEmail={contact.email}
                  contactName={fullName}
                />
              </div>
            </motion.div>
          )}

          {activeTab === "deals" && (
            <motion.div
              key="deals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card variant="raised">
                <CardHeader layout="row" withBorder>
                  <CardTitle size="lg">All Deals ({contact._count.deals})</CardTitle>
                  <Button size="sm">
                    <PlusIcon className="size-4 mr-2" />
                    Link Deal
                  </Button>
                </CardHeader>
                <CardContent padding="lg">
                  {contact.deals.length > 0 ? (
                    <div className="space-y-3">
                      {contact.deals.map((deal) => (
                        <DealCard key={deal.id} deal={deal} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <RocketIcon className="size-8 mx-auto mb-3 opacity-50" />
                      <p>No deals associated with this contact yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "activity" && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card variant="raised">
                <CardHeader layout="row" withBorder>
                  <CardTitle size="lg">Activity Timeline</CardTitle>
                  <Button size="sm">
                    <PlusIcon className="size-4 mr-2" />
                    Log Activity
                  </Button>
                </CardHeader>
                <CardContent padding="lg">
                  {contact.activities.length > 0 ? (
                    <div>
                      {contact.activities.map((activity) => (
                        <ActivityTimelineItem key={activity.id} activity={activity} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <CalendarIcon className="size-8 mx-auto mb-3 opacity-50" />
                      <p>No activities recorded for this contact yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "notes" && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card variant="raised">
                <CardHeader layout="row" withBorder>
                  <CardTitle size="lg">Notes</CardTitle>
                  <Button variant="outline" size="sm">
                    <Pencil1Icon className="size-4 mr-2" />
                    Edit Notes
                  </Button>
                </CardHeader>
                <CardContent padding="lg">
                  {contact.notes ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{contact.notes}</p>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileIcon className="size-8 mx-auto mb-3 opacity-50" />
                      <p>No notes added for this contact yet.</p>
                      <Button variant="outline" size="sm" className="mt-4">
                        <PlusIcon className="size-4 mr-2" />
                        Add Notes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </DashboardContent>
    </DashboardLayout>
  );
}
