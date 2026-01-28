"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  Pencil1Icon,
  DownloadIcon,
  Share2Icon,
  ClockIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ExternalLinkIcon,
  FileTextIcon,
  CheckIcon,
  Cross2Icon,
  MinusIcon,
  RocketIcon,
  TargetIcon,
  GlobeIcon,
  BarChartIcon,
} from "@radix-ui/react-icons";
import { toast } from "sonner";

import { DashboardLayout, DashboardContent } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

type MemoStatus = "DRAFT" | "PENDING_VOTE" | "APPROVED" | "REJECTED" | "ARCHIVED";
type VoteType = "YES" | "NO" | "ABSTAIN" | null;

interface Partner {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  vote: VoteType;
  votedAt: string | null;
  comment: string | null;
}

interface ICMemoFull {
  id: string;
  title: string;
  status: MemoStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  votingDeadline: string | null;
  author: { id: string; name: string; avatar?: string };

  // Company Info
  company: {
    id: string;
    name: string;
    website: string;
    sector: string;
    location: string;
    foundedYear: number;
    employeeCount: string;
    description: string;
    logoUrl?: string;
  };

  // Founders
  founders: {
    name: string;
    role: string;
    bio: string;
    linkedinUrl?: string;
  }[];

  // Investment Thesis
  thesis: {
    problemStatement: string;
    solutionOverview: string;
    whyNow: string;
    whyThisTeam: string;
    whyUs: string;
  };

  // Traction
  traction: {
    arr: number;
    arrGrowth: number;
    customers: number;
    retention: number;
    highlights: string[];
  };

  // Market
  market: {
    tam: number;
    sam: number;
    som: number;
    competitors: { name: string; description: string; threat: "low" | "medium" | "high" }[];
    trends: string[];
  };

  // Financials
  financials: {
    currentValuation: number;
    proposedInvestment: number;
    preMoneyValuation: number;
    postMoneyValuation: number;
    ownershipTarget: number;
    proRataRights: boolean;
    boardSeat: boolean;
    dilutionScenarios: { scenario: string; ownership: number }[];
    exitScenarios: { scenario: string; exitValue: number; moic: number; irr: number }[];
  };

  // Due Diligence
  dueDiligence: {
    technical: { status: "complete" | "in_progress" | "pending"; summary: string; findings: string[] };
    legal: { status: "complete" | "in_progress" | "pending"; summary: string; findings: string[] };
    references: { status: "complete" | "in_progress" | "pending"; summary: string; findings: string[] };
    risks: { category: string; description: string; severity: "low" | "medium" | "high"; mitigation: string }[];
  };

  // Recommendation
  recommendation: {
    investmentAmount: number;
    valuationCap: number;
    boardSeatRequest: boolean;
    followOnStrategy: string;
    keyTerms: string[];
  };

  // Voting
  partners: Partner[];
  quorum: number;
  votingComments: { partnerId: string; partnerName: string; comment: string; createdAt: string }[];
}

// =============================================================================
// SAMPLE DATA
// =============================================================================

const sampleMemo: ICMemoFull = {
  id: "memo-1",
  title: "TechFlow AI - Series A Investment",
  status: "PENDING_VOTE",
  version: 2,
  createdAt: "2024-01-10T09:00:00Z",
  updatedAt: "2024-01-12T14:30:00Z",
  votingDeadline: "2024-01-20T17:00:00Z",
  author: { id: "u1", name: "John Smith" },

  company: {
    id: "c1",
    name: "TechFlow AI",
    website: "https://techflow.ai",
    sector: "AI/ML",
    location: "San Francisco, CA",
    foundedYear: 2021,
    employeeCount: "51-100",
    description: "AI-powered workflow automation platform for enterprise teams. Combines NLP with no-code automation.",
  },

  founders: [
    { name: "Sarah Chen", role: "CEO & Co-Founder", bio: "Former Google PM, Stanford MBA. Led product at Scale AI.", linkedinUrl: "https://linkedin.com" },
    { name: "Michael Park", role: "CTO & Co-Founder", bio: "Former Staff Engineer at Stripe. PhD in ML from MIT.", linkedinUrl: "https://linkedin.com" },
  ],

  thesis: {
    problemStatement: "Enterprise teams spend 40%+ of their time on repetitive workflows that could be automated. Current RPA solutions require technical expertise and fail to handle unstructured data.",
    solutionOverview: "TechFlow AI combines large language models with visual workflow builders, enabling non-technical users to automate complex processes involving documents, emails, and databases.",
    whyNow: "GPT-4 and similar models have unlocked the ability to understand and process unstructured data reliably. Enterprise AI budgets are at all-time highs, with 78% of Fortune 500 companies increasing AI spend.",
    whyThisTeam: "Sarah's enterprise product experience at Google and Scale AI gives deep understanding of enterprise sales. Michael's ML expertise from MIT and Stripe provides technical moat.",
    whyUs: "Our enterprise network can accelerate GTM. We have relationships at 3 of their target F500 accounts. Our AI expertise from prior investments (AICompany1, AICompany2) provides strategic value.",
  },

  traction: {
    arr: 2400000,
    arrGrowth: 185,
    customers: 45,
    retention: 94,
    highlights: [
      "Landed 3 Fortune 500 logos in Q4",
      "Average contract size increased 40% YoY",
      "NPS of 72 (industry avg: 45)",
      "Zero churn in enterprise segment",
    ],
  },

  market: {
    tam: 50000000000,
    sam: 8000000000,
    som: 800000000,
    competitors: [
      { name: "UIPath", description: "Legacy RPA, struggles with unstructured data", threat: "medium" },
      { name: "Zapier", description: "SMB focus, limited AI capabilities", threat: "low" },
      { name: "Microsoft Power Automate", description: "Enterprise reach but clunky UX", threat: "high" },
    ],
    trends: [
      "AI automation market growing 35% CAGR",
      "Shift from RPA to intelligent automation",
      "Enterprise AI adoption accelerating post-GPT",
      "Labor costs driving automation urgency",
    ],
  },

  financials: {
    currentValuation: 45000000,
    proposedInvestment: 5000000,
    preMoneyValuation: 45000000,
    postMoneyValuation: 50000000,
    ownershipTarget: 10,
    proRataRights: true,
    boardSeat: true,
    dilutionScenarios: [
      { scenario: "Base Case (Series B at 3x)", ownership: 7.5 },
      { scenario: "Bull Case (Series B at 5x)", ownership: 8.2 },
      { scenario: "Bear Case (Down Round)", ownership: 5.0 },
    ],
    exitScenarios: [
      { scenario: "Strategic Acquisition ($500M)", exitValue: 50000000, moic: 10, irr: 65 },
      { scenario: "IPO ($2B)", exitValue: 200000000, moic: 40, irr: 85 },
      { scenario: "Base Case Exit ($250M)", exitValue: 25000000, moic: 5, irr: 45 },
    ],
  },

  dueDiligence: {
    technical: {
      status: "complete",
      summary: "Strong technical architecture with defensible ML models. Code quality is excellent.",
      findings: [
        "Proprietary fine-tuned models outperform GPT-4 on workflow tasks",
        "SOC 2 Type II certified",
        "99.9% uptime in production",
        "Scalable infrastructure on AWS",
      ],
    },
    legal: {
      status: "complete",
      summary: "Clean cap table, standard corporate structure. No material litigation.",
      findings: [
        "Delaware C-Corp, clean cap table",
        "All IP properly assigned",
        "Standard employee agreements",
        "No pending litigation",
      ],
    },
    references: {
      status: "complete",
      summary: "Universally positive references from customers and former colleagues.",
      findings: [
        "Fortune 500 CTO: 'Best automation tool we've used'",
        "Former Google colleague: 'Sarah is exceptional PM'",
        "Early customer: 'ROI achieved in 3 months'",
        "Board member: 'Highly coachable founders'",
      ],
    },
    risks: [
      { category: "Competition", description: "Microsoft could bundle similar features", severity: "high", mitigation: "Focus on specialized workflows, build switching costs" },
      { category: "Technology", description: "LLM costs could compress margins", severity: "medium", mitigation: "Building proprietary models, negotiating enterprise agreements" },
      { category: "Execution", description: "Scaling enterprise sales team", severity: "medium", mitigation: "Hiring VP Sales from Salesforce, our network can help" },
      { category: "Market", description: "Economic slowdown could slow enterprise deals", severity: "low", mitigation: "ROI-focused positioning, cost-saving narrative" },
    ],
  },

  recommendation: {
    investmentAmount: 5000000,
    valuationCap: 45000000,
    boardSeatRequest: true,
    followOnStrategy: "Plan to invest pro-rata in Series B. Reserve $7.5M for follow-on.",
    keyTerms: [
      "$5M investment at $45M pre-money",
      "Board seat",
      "Pro-rata rights",
      "Standard protective provisions",
      "1x non-participating liquidation preference",
    ],
  },

  partners: [
    { id: "p1", name: "John Smith", role: "General Partner", vote: "YES", votedAt: "2024-01-15T10:00:00Z", comment: "Strong thesis, great team" },
    { id: "p2", name: "Sarah Johnson", role: "General Partner", vote: "YES", votedAt: "2024-01-15T11:30:00Z", comment: "Excited about the market opportunity" },
    { id: "p3", name: "Michael Chen", role: "Partner", vote: "YES", votedAt: "2024-01-16T09:00:00Z", comment: null },
    { id: "p4", name: "Emily Rogers", role: "Partner", vote: "ABSTAIN", votedAt: "2024-01-16T14:00:00Z", comment: "Need more clarity on competitive moat" },
    { id: "p5", name: "David Kim", role: "General Partner", vote: null, votedAt: null, comment: null },
    { id: "p6", name: "Amanda Liu", role: "Partner", vote: null, votedAt: null, comment: null },
  ],

  quorum: 5,

  votingComments: [
    { partnerId: "p1", partnerName: "John Smith", comment: "Strong thesis, the team has proven they can execute. Technical DD is solid.", createdAt: "2024-01-15T10:00:00Z" },
    { partnerId: "p2", partnerName: "Sarah Johnson", comment: "Market timing is perfect. I've spoken with 2 of their customers - glowing reviews.", createdAt: "2024-01-15T11:30:00Z" },
    { partnerId: "p4", partnerName: "Emily Rogers", comment: "What's our view on Microsoft's potential entry? Would like to discuss more.", createdAt: "2024-01-16T14:00:00Z" },
  ],
};

// =============================================================================
// STATUS CONFIG
// =============================================================================

const statusConfig: Record<MemoStatus, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT: { label: "Draft", color: "bg-slate-500/20 text-slate-300", icon: <Pencil1Icon className="size-4" /> },
  PENDING_VOTE: { label: "Pending Vote", color: "bg-amber-500/20 text-amber-300", icon: <ClockIcon className="size-4" /> },
  APPROVED: { label: "Approved", color: "bg-tactical-500/20 text-tactical-300", icon: <CheckCircledIcon className="size-4" /> },
  REJECTED: { label: "Rejected", color: "bg-red-500/20 text-red-300", icon: <CrossCircledIcon className="size-4" /> },
  ARCHIVED: { label: "Archived", color: "bg-neutral-500/20 text-neutral-400", icon: <FileTextIcon className="size-4" /> },
};

const ddStatusConfig = {
  complete: { label: "Complete", color: "text-tactical-400", icon: <CheckCircledIcon className="size-4" /> },
  in_progress: { label: "In Progress", color: "text-amber-400", icon: <ClockIcon className="size-4" /> },
  pending: { label: "Pending", color: "text-muted-foreground", icon: <MinusIcon className="size-4" /> },
};

const severityConfig = {
  low: { label: "Low", color: "bg-tactical-500/20 text-tactical-400" },
  medium: { label: "Medium", color: "bg-amber-500/20 text-amber-400" },
  high: { label: "High", color: "bg-red-500/20 text-red-400" },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatCurrency(value: number, compact = true): string {
  if (compact) {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return formatDate(dateString);
}

// =============================================================================
// COMPONENTS
// =============================================================================

function Section({
  title,
  icon,
  children,
  defaultExpanded = true,
  actions,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  actions?: React.ReactNode;
}) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  return (
    <Card variant="raised" className="overflow-hidden">
      <CardHeader
        layout="row"
        withBorder
        className="cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <CardTitle size="lg">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {actions && <div onClick={(e) => e.stopPropagation()}>{actions}</div>}
          <button className="p-1 hover:bg-muted rounded transition-colors">
            {expanded ? <ChevronDownIcon className="size-5" /> : <ChevronRightIcon className="size-5" />}
          </button>
        </div>
      </CardHeader>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent padding="lg">{children}</CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function ThesisItem({ label, content }: { label: string; content: string }) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm text-tactical-400">{label}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
    </div>
  );
}

function MetricCard({ label, value, subValue }: { label: string; value: string; subValue?: string }) {
  return (
    <div className="p-4 bg-muted/30 rounded-atlas-sm">
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
      <div className="text-xl font-semibold font-mono">{value}</div>
      {subValue && <div className="text-xs text-muted-foreground mt-1">{subValue}</div>}
    </div>
  );
}

function VoteButton({
  type,
  active,
  onClick,
  disabled,
}: {
  type: "YES" | "NO" | "ABSTAIN";
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const config = {
    YES: { icon: <CheckIcon className="size-5" />, color: "bg-tactical-500 text-white", label: "Yes" },
    NO: { icon: <Cross2Icon className="size-5" />, color: "bg-red-500 text-white", label: "No" },
    ABSTAIN: { icon: <MinusIcon className="size-5" />, color: "bg-slate-500 text-white", label: "Abstain" },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 rounded-atlas-md transition-all border-2",
        active
          ? cn(config[type].color, "border-transparent")
          : "bg-muted/30 border-border hover:border-muted-foreground/30"
      )}
    >
      {config[type].icon}
      <span className="text-sm font-medium">{config[type].label}</span>
    </button>
  );
}

function PartnerVoteRow({ partner }: { partner: Partner }) {
  const voteConfig = {
    YES: { color: "text-tactical-400", icon: <CheckCircledIcon className="size-4" /> },
    NO: { color: "text-red-400", icon: <CrossCircledIcon className="size-4" /> },
    ABSTAIN: { color: "text-slate-400", icon: <MinusIcon className="size-4" /> },
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-500 to-tactical-500 flex items-center justify-center text-white text-xs font-medium">
          {partner.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <div className="font-medium text-sm">{partner.name}</div>
          <div className="text-xs text-muted-foreground">{partner.role}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {partner.vote ? (
          <>
            <span className={cn("flex items-center gap-1 text-sm", voteConfig[partner.vote].color)}>
              {voteConfig[partner.vote].icon}
              {partner.vote}
            </span>
            <span className="text-xs text-muted-foreground">{formatRelativeDate(partner.votedAt!)}</span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Pending</span>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function ICMemoDetailPage() {
  const _params = useParams();
  const _router = useRouter();
  const [userVote, setUserVote] = React.useState<VoteType>(null);
  const [voteComment, setVoteComment] = React.useState("");

  const memo = sampleMemo;
  const status = statusConfig[memo.status];

  const voteCounts = React.useMemo(() => {
    return {
      yes: memo.partners.filter((p) => p.vote === "YES").length,
      no: memo.partners.filter((p) => p.vote === "NO").length,
      abstain: memo.partners.filter((p) => p.vote === "ABSTAIN").length,
      total: memo.partners.filter((p) => p.vote !== null).length,
    };
  }, [memo.partners]);

  const handleVoteSubmit = () => {
    if (!userVote) return;
    toast.success(`Vote submitted: ${userVote}`);
  };

  const handleExportPDF = () => {
    toast.success("PDF export started");
  };

  return (
    <DashboardLayout>
      <DashboardContent>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/ic-memos" className="hover:text-foreground transition-colors">IC Memos</Link>
            <ChevronRightIcon className="size-4" />
            <span className="text-foreground">{memo.title}</span>
          </div>

          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-display font-bold">{memo.title}</h1>
                <Badge className={cn("gap-1.5", status.color)}>{status.icon}{status.label}</Badge>
                <Badge variant="ghost" size="sm">v{memo.version}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>By {memo.author.name}</span>
                <span>•</span>
                <span>Updated {formatRelativeDate(memo.updatedAt)}</span>
                {memo.votingDeadline && (
                  <>
                    <span>•</span>
                    <span className="text-amber-400">Voting ends {formatDate(memo.votingDeadline)}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <DownloadIcon className="size-4 mr-2" />PDF
              </Button>
              <Button variant="outline" size="sm"><Share2Icon className="size-4 mr-2" />Share</Button>
              <Button variant="outline" size="sm"><Pencil1Icon className="size-4 mr-2" />Edit</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Investment Thesis */}
            <Section title="Investment Thesis" icon={<RocketIcon className="size-5" />}>
              <div className="space-y-6">
                <ThesisItem label="Problem Statement" content={memo.thesis.problemStatement} />
                <ThesisItem label="Solution Overview" content={memo.thesis.solutionOverview} />
                <ThesisItem label="Why Now?" content={memo.thesis.whyNow} />
                <ThesisItem label="Why This Team?" content={memo.thesis.whyThisTeam} />
                <ThesisItem label="Why Us?" content={memo.thesis.whyUs} />
              </div>
            </Section>

            {/* Company Overview */}
            <Section title="Company Overview" icon={<GlobeIcon className="size-5" />}>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-atlas-md bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-2xl font-bold text-white">
                    {memo.company.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{memo.company.name}</h3>
                      <a href={memo.company.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                        <ExternalLinkIcon className="size-4" />
                      </a>
                    </div>
                    <p className="text-sm text-muted-foreground">{memo.company.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard label="Sector" value={memo.company.sector} />
                  <MetricCard label="Location" value={memo.company.location} />
                  <MetricCard label="Founded" value={memo.company.foundedYear.toString()} />
                  <MetricCard label="Team Size" value={memo.company.employeeCount} />
                </div>

                {/* Founders */}
                <div>
                  <h4 className="font-semibold mb-3">Founders</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {memo.founders.map((founder) => (
                      <div key={founder.name} className="p-4 bg-muted/30 rounded-atlas-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{founder.name}</span>
                          {founder.linkedinUrl && (
                            <a href={founder.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                              <ExternalLinkIcon className="size-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-xs text-tactical-400 mb-2">{founder.role}</div>
                        <p className="text-sm text-muted-foreground">{founder.bio}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Traction */}
                <div>
                  <h4 className="font-semibold mb-3">Traction</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <MetricCard label="ARR" value={formatCurrency(memo.traction.arr)} subValue={`${memo.traction.arrGrowth}% YoY`} />
                    <MetricCard label="Customers" value={memo.traction.customers.toString()} />
                    <MetricCard label="Net Retention" value={`${memo.traction.retention}%`} />
                    <MetricCard label="Growth" value={`${memo.traction.arrGrowth}%`} />
                  </div>
                  <ul className="space-y-2">
                    {memo.traction.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircledIcon className="size-4 text-tactical-400 mt-0.5 flex-shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>

            {/* Market Analysis */}
            <Section title="Market Analysis" icon={<BarChartIcon className="size-5" />}>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <MetricCard label="TAM" value={formatCurrency(memo.market.tam)} subValue="Total Addressable" />
                  <MetricCard label="SAM" value={formatCurrency(memo.market.sam)} subValue="Serviceable Addressable" />
                  <MetricCard label="SOM" value={formatCurrency(memo.market.som)} subValue="Serviceable Obtainable" />
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Competitive Landscape</h4>
                  <div className="space-y-3">
                    {memo.market.competitors.map((comp) => (
                      <div key={comp.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-atlas-sm">
                        <div>
                          <div className="font-medium text-sm">{comp.name}</div>
                          <div className="text-xs text-muted-foreground">{comp.description}</div>
                        </div>
                        <Badge className={severityConfig[comp.threat].color} size="sm">
                          {comp.threat} threat
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Market Trends</h4>
                  <ul className="space-y-2">
                    {memo.market.trends.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <RocketIcon className="size-4 text-tactical-400 mt-0.5 flex-shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>

            {/* Financial Analysis */}
            <Section title="Financial Analysis" icon={<TargetIcon className="size-5" />}>
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard label="Investment" value={formatCurrency(memo.financials.proposedInvestment)} />
                  <MetricCard label="Pre-Money" value={formatCurrency(memo.financials.preMoneyValuation)} />
                  <MetricCard label="Post-Money" value={formatCurrency(memo.financials.postMoneyValuation)} />
                  <MetricCard label="Ownership" value={`${memo.financials.ownershipTarget}%`} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Dilution Scenarios</h4>
                    <div className="space-y-2">
                      {memo.financials.dilutionScenarios.map((s) => (
                        <div key={s.scenario} className="flex justify-between p-3 bg-muted/30 rounded-atlas-sm">
                          <span className="text-sm">{s.scenario}</span>
                          <span className="font-mono font-semibold">{s.ownership}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Exit Scenarios</h4>
                    <div className="space-y-2">
                      {memo.financials.exitScenarios.map((s) => (
                        <div key={s.scenario} className="p-3 bg-muted/30 rounded-atlas-sm">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">{s.scenario}</span>
                            <span className="font-mono font-semibold text-tactical-400">{s.moic}x</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Return: {formatCurrency(s.exitValue)}</span>
                            <span>IRR: {s.irr}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Due Diligence */}
            <Section title="Due Diligence Summary" icon={<FileTextIcon className="size-5" />}>
              <div className="space-y-6">
                {(["technical", "legal", "references"] as const).map((type) => {
                  const dd = memo.dueDiligence[type];
                  const config = ddStatusConfig[dd.status];
                  return (
                    <div key={type} className="p-4 bg-muted/30 rounded-atlas-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold capitalize">{type} DD</h4>
                        <span className={cn("flex items-center gap-1 text-sm", config.color)}>
                          {config.icon}{config.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{dd.summary}</p>
                      <ul className="space-y-1">
                        {dd.findings.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckIcon className="size-3 text-tactical-400 mt-0.5" />{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}

                <div>
                  <h4 className="font-semibold mb-3">Risk Assessment</h4>
                  <div className="space-y-3">
                    {memo.dueDiligence.risks.map((risk, i) => (
                      <div key={i} className="p-4 border border-border rounded-atlas-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{risk.category}</span>
                          <Badge className={severityConfig[risk.severity].color} size="xs">{risk.severity}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{risk.description}</p>
                        <div className="text-xs">
                          <span className="text-muted-foreground">Mitigation: </span>
                          <span className="text-tactical-400">{risk.mitigation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* Recommendation */}
            <Section title="Recommendation" icon={<CheckCircledIcon className="size-5" />}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard label="Investment" value={formatCurrency(memo.recommendation.investmentAmount)} />
                  <MetricCard label="Valuation Cap" value={formatCurrency(memo.recommendation.valuationCap)} />
                  <MetricCard label="Board Seat" value={memo.recommendation.boardSeatRequest ? "Yes" : "No"} />
                  <MetricCard label="Pro-Rata" value={memo.financials.proRataRights ? "Yes" : "No"} />
                </div>

                <div className="p-4 bg-muted/30 rounded-atlas-sm">
                  <h4 className="font-semibold mb-2">Follow-on Strategy</h4>
                  <p className="text-sm text-muted-foreground">{memo.recommendation.followOnStrategy}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Key Terms</h4>
                  <ul className="space-y-2">
                    {memo.recommendation.keyTerms.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckIcon className="size-4 text-tactical-400 mt-0.5" />{t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>
          </div>

          {/* Sidebar - Voting */}
          <div className="space-y-6">
            {/* Voting Card */}
            <Card variant="raised" className="sticky top-4">
              <CardHeader withBorder>
                <CardTitle size="lg">Voting</CardTitle>
              </CardHeader>
              <CardContent padding="lg">
                <div className="space-y-6">
                  {/* Vote Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">{voteCounts.total} of {memo.quorum} votes</span>
                      <span className={voteCounts.total >= memo.quorum ? "text-tactical-400" : "text-muted-foreground"}>
                        {voteCounts.total >= memo.quorum ? "Quorum reached" : `${memo.quorum - voteCounts.total} needed`}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-navy-500 to-tactical-500"
                        style={{ width: `${Math.min(100, (voteCounts.total / memo.quorum) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Vote Summary */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 bg-tactical-500/10 rounded-atlas-sm">
                      <div className="text-2xl font-bold text-tactical-400">{voteCounts.yes}</div>
                      <div className="text-xs text-muted-foreground">Yes</div>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-atlas-sm">
                      <div className="text-2xl font-bold text-red-400">{voteCounts.no}</div>
                      <div className="text-xs text-muted-foreground">No</div>
                    </div>
                    <div className="p-3 bg-slate-500/10 rounded-atlas-sm">
                      <div className="text-2xl font-bold text-slate-400">{voteCounts.abstain}</div>
                      <div className="text-xs text-muted-foreground">Abstain</div>
                    </div>
                  </div>

                  {/* Cast Vote */}
                  {memo.status === "PENDING_VOTE" && (
                    <div className="border-t border-border pt-4">
                      <h4 className="font-semibold mb-3">Cast Your Vote</h4>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <VoteButton type="YES" active={userVote === "YES"} onClick={() => setUserVote("YES")} />
                        <VoteButton type="NO" active={userVote === "NO"} onClick={() => setUserVote("NO")} />
                        <VoteButton type="ABSTAIN" active={userVote === "ABSTAIN"} onClick={() => setUserVote("ABSTAIN")} />
                      </div>
                      <textarea
                        placeholder="Add a comment (optional)..."
                        value={voteComment}
                        onChange={(e) => setVoteComment(e.target.value)}
                        className="w-full p-3 bg-muted/30 border border-border rounded-atlas-sm text-sm resize-none h-20 mb-3"
                      />
                      <Button className="w-full" disabled={!userVote} onClick={handleVoteSubmit}>
                        Submit Vote
                      </Button>
                    </div>
                  )}

                  {/* Partner Votes */}
                  <div className="border-t border-border pt-4">
                    <h4 className="font-semibold mb-3">Partner Votes</h4>
                    <div className="space-y-0">
                      {memo.partners.map((p) => (
                        <PartnerVoteRow key={p.id} partner={p} />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card variant="raised">
              <CardHeader withBorder>
                <CardTitle size="md">Discussion</CardTitle>
              </CardHeader>
              <CardContent padding="lg">
                {memo.votingComments.length > 0 ? (
                  <div className="space-y-4">
                    {memo.votingComments.map((c, i) => (
                      <div key={i} className="pb-4 border-b border-border last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-navy-500 to-tactical-500 flex items-center justify-center text-white text-[10px]">
                            {c.partnerName.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <span className="font-medium text-sm">{c.partnerName}</span>
                          <span className="text-xs text-muted-foreground">{formatRelativeDate(c.createdAt)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{c.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardContent>
    </DashboardLayout>
  );
}
