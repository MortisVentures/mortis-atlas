"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  RocketIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";

import {
  DashboardLayout,
  DashboardContent,
  PageHeader,
  PageSection,
} from "@/components/layout";
import { PipelineFunnel } from "@/components/dashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// =============================================================================
// SAMPLE DEALS DATA
// =============================================================================

interface Deal {
  id: string;
  dealName: string;
  company: { id: string; name: string };
  stage: string;
  amount: number | null;
  valuation: number | null;
  probability: number | null;
  expectedClose: string | null;
}

const sampleDeals: Deal[] = [
  {
    id: "d1",
    dealName: "TechFlow AI Series A",
    company: { id: "c1", name: "TechFlow AI" },
    stage: "TERM_SHEET",
    amount: 5000000,
    valuation: 45000000,
    probability: 75,
    expectedClose: "2024-02-15",
  },
  {
    id: "d2",
    dealName: "Quantum Labs Series B",
    company: { id: "c2", name: "Quantum Labs" },
    stage: "DEEP_DIVE",
    amount: 15000000,
    valuation: 120000000,
    probability: 40,
    expectedClose: "2024-03-30",
  },
  {
    id: "d3",
    dealName: "FinanceOS Seed",
    company: { id: "c3", name: "FinanceOS" },
    stage: "PARTNER_REVIEW",
    amount: 2000000,
    valuation: 15000000,
    probability: 60,
    expectedClose: "2024-02-28",
  },
  {
    id: "d4",
    dealName: "DataSync Series A",
    company: { id: "c4", name: "DataSync Pro" },
    stage: "INITIAL_REVIEW",
    amount: 8000000,
    valuation: 55000000,
    probability: 20,
    expectedClose: null,
  },
];

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
  INITIAL_REVIEW: "bg-slate-500/10 text-slate-500",
  MEETING_SCHEDULED: "bg-blue-500/10 text-blue-500",
  DEEP_DIVE: "bg-indigo-500/10 text-indigo-500",
  PARTNER_REVIEW: "bg-violet-500/10 text-violet-500",
  TERM_SHEET: "bg-amber-500/10 text-amber-500",
  LEGAL_DILIGENCE: "bg-orange-500/10 text-orange-500",
  CLOSED_WON: "bg-tactical-500/10 text-tactical-500",
  CLOSED_LOST: "bg-rose-500/10 text-rose-500",
};

function formatCurrency(value: number | null): string {
  if (!value) return "—";
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

// =============================================================================
// DEALS PAGE
// =============================================================================

export default function DealsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredDeals = sampleDeals.filter((deal) =>
    deal.dealName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <DashboardContent>
        <PageHeader
          title="Deals"
          description="Manage your active deal pipeline"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Deals" },
          ]}
        />

        {/* Pipeline Overview */}
        <PageSection title="Pipeline Overview">
          <PipelineFunnel />
        </PageSection>

        {/* Deals List */}
        <PageSection
          title="Active Deals"
          actions={
            <div className="flex items-center gap-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search deals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button>
                <PlusIcon className="size-4 mr-2" />
                New Deal
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            {filteredDeals.map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/deals/${deal.id}`}>
                  <Card
                    variant="raised"
                    className={cn(
                      "p-4 cursor-pointer",
                      "transition-all duration-200",
                      "hover:scale-[1.01] hover:-translate-y-0.5",
                      "hover:shadow-neu-dark-glow-navy"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center size-10 rounded-full bg-navy-500/10">
                          <RocketIcon className="size-5 text-navy-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">
                            {deal.dealName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {deal.company.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Amount</div>
                          <div className="font-mono font-medium">
                            {formatCurrency(deal.amount)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Valuation</div>
                          <div className="font-mono font-medium">
                            {formatCurrency(deal.valuation)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Probability</div>
                          <div className="font-mono font-medium">
                            {deal.probability ? `${deal.probability}%` : "—"}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            stageColors[deal.stage] || "bg-muted text-muted-foreground"
                          )}
                        >
                          {stageLabels[deal.stage] || deal.stage}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}

            {filteredDeals.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No deals found matching your search.
              </div>
            )}
          </div>
        </PageSection>
      </DashboardContent>
    </DashboardLayout>
  );
}
