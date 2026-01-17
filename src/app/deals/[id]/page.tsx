"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  RocketIcon,
  CalendarIcon,
  PersonIcon,
  ArrowLeftIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";

import {
  DashboardLayout,
  DashboardContent,
  PageHeader,
  PageSection,
} from "@/components/layout";
import { ActivityFeed } from "@/components/dashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// =============================================================================
// SAMPLE DATA
// =============================================================================

const sampleDeal = {
  id: "d1",
  dealName: "TechFlow AI Series A",
  company: { id: "c1", name: "TechFlow AI" },
  contact: { id: "ct1", name: "Sarah Chen", role: "CEO" },
  stage: "TERM_SHEET",
  amount: 5000000,
  valuation: 45000000,
  probability: 75,
  expectedClose: "2024-02-15",
  notes: "Strong team with prior exits. Product-market fit demonstrated with $2M ARR.",
  createdAt: "2024-01-10",
  updatedAt: "2024-01-20",
};

const stageLabels: Record<string, string> = {
  INITIAL_REVIEW: "Initial Review",
  MEETING_SCHEDULED: "Meeting Scheduled",
  DEEP_DIVE: "Deep Dive",
  PARTNER_REVIEW: "Partner Review",
  TERM_SHEET: "Term Sheet",
  LEGAL_DILIGENCE: "Legal Diligence",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
};

const stageColors: Record<string, string> = {
  INITIAL_REVIEW: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  MEETING_SCHEDULED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  DEEP_DIVE: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  PARTNER_REVIEW: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  TERM_SHEET: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  LEGAL_DILIGENCE: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  CLOSED_WON: "bg-tactical-500/10 text-tactical-500 border-tactical-500/20",
  CLOSED_LOST: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

function formatCurrency(value: number | null): string {
  if (!value) return "—";
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// =============================================================================
// DEAL DETAIL PAGE
// =============================================================================

export default function DealDetailPage() {
  const params = useParams();
  const dealId = params.id as string;

  // In a real app, fetch deal data based on dealId
  const deal = sampleDeal;

  return (
    <DashboardLayout>
      <DashboardContent>
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
          <Button size="sm">
            <Pencil1Icon className="size-4 mr-2" />
            Edit Deal
          </Button>
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
                      className="text-muted-foreground hover:text-tactical-500 transition-colors"
                    >
                      {deal.company.name}
                    </Link>
                  </div>
                </div>
                <span
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium border",
                    stageColors[deal.stage] || "bg-muted"
                  )}
                >
                  {stageLabels[deal.stage] || deal.stage}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-atlas-sm bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Investment</div>
                  <div className="font-mono text-lg font-semibold">
                    {formatCurrency(deal.amount)}
                  </div>
                </div>
                <div className="p-4 rounded-atlas-sm bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Valuation</div>
                  <div className="font-mono text-lg font-semibold">
                    {formatCurrency(deal.valuation)}
                  </div>
                </div>
                <div className="p-4 rounded-atlas-sm bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Probability</div>
                  <div className="font-mono text-lg font-semibold text-tactical-500">
                    {deal.probability}%
                  </div>
                </div>
                <div className="p-4 rounded-atlas-sm bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Expected Close</div>
                  <div className="font-mono text-lg font-semibold">
                    {formatDate(deal.expectedClose)}
                  </div>
                </div>
              </div>
            </Card>

            {/* Notes */}
            <Card variant="raised" className="p-6">
              <h3 className="font-display font-semibold mb-4">Notes</h3>
              <p className="text-muted-foreground">{deal.notes || "No notes yet."}</p>
            </Card>

            {/* Activity */}
            <PageSection title="Activity">
              <ActivityFeed maxItems={5} />
            </PageSection>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Primary Contact */}
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
                  <div className="font-medium">{deal.contact.name}</div>
                  <div className="text-sm text-muted-foreground">{deal.contact.role}</div>
                </div>
              </Link>
            </Card>

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
              </div>
            </Card>

            {/* Quick Actions */}
            <Card variant="raised" className="p-6">
              <h3 className="font-display font-semibold mb-4">Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Log Activity
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Schedule Meeting
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Add Document
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </DashboardContent>
    </DashboardLayout>
  );
}
