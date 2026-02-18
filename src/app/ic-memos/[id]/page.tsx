"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Pencil1Icon,
  DownloadIcon,
  Share2Icon,
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
  LightningBoltIcon,
  PersonIcon,
  CubeIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useICMemoDetail } from "@/hooks/use-ic-memos";
import { VoteType } from "@prisma/client";
import {
  STATUS_CONFIG,
  RECOMMENDATION_CONFIG,
  SCORE_RATING_CONFIG,
} from "@/lib/validations/ic-memo";

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatCurrency(value: number | string | null | undefined, compact = true): string {
  if (value === null || value === undefined) return "-";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "-";

  if (compact) {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(num);
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

function ReturnToTop() {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "flex items-center gap-2 px-4 py-3",
        "bg-navy-600 text-white rounded-atlas-md",
        "shadow-lg shadow-navy-500/30",
        "transition-all duration-300",
        "hover:bg-navy-500 hover:shadow-xl hover:shadow-navy-500/40",
        "hover:-translate-y-1",
        "focus:outline-none focus:ring-2 focus:ring-navy-400 focus:ring-offset-2"
      )}
      aria-label="Return to top"
    >
      <ChevronUpIcon className="size-5" />
      <span className="text-sm font-medium">Back to Top</span>
    </button>
  );
}

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

function ContentItem({ label, content }: { label: string; content: string | undefined | null }) {
  if (!content) return null;
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm text-tactical-400">{label}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
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

function ScoreBadge({ score, label }: { score: string | null | undefined; label: string }) {
  if (!score) return null;
  const config = SCORE_RATING_CONFIG[score as keyof typeof SCORE_RATING_CONFIG];
  if (!config) return null;

  return (
    <div className="p-3 bg-muted/30 rounded-atlas-sm">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <Badge className={config.color} size="sm">{config.label}</Badge>
    </div>
  );
}

function RatingDisplay({ value, label, max = 5 }: { value: number | null | undefined; label: string; max?: number }) {
  if (value === null || value === undefined) return null;

  return (
    <div className="p-3 bg-muted/30 rounded-atlas-sm">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-4 h-4 rounded-sm",
              i < value ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
        <span className="ml-2 text-sm font-mono">{value}/{max}</span>
      </div>
    </div>
  );
}

function VoteButton({
  type,
  active,
  onClick,
  disabled,
}: {
  type: VoteType;
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
          : "bg-muted/30 border-border hover:border-muted-foreground/30",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {config[type].icon}
      <span className="text-sm font-medium">{config[type].label}</span>
    </button>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-muted rounded" />
      <div className="h-4 w-48 bg-muted rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} variant="raised">
              <CardContent padding="lg">
                <div className="h-32 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div>
          <Card variant="raised">
            <CardContent padding="lg">
              <div className="h-64 bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function ICMemoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { memo, isLoading, error, votes, voteSummary, userVote, castVote, refetch } = useICMemoDetail(id);

  const [selectedVote, setSelectedVote] = React.useState<VoteType | null>(null);
  const [voteComment, setVoteComment] = React.useState("");
  const [isVoting, setIsVoting] = React.useState(false);

  React.useEffect(() => {
    if (userVote) {
      setSelectedVote(userVote.vote);
      setVoteComment(userVote.comment || "");
    }
  }, [userVote]);

  const handleVoteSubmit = async () => {
    if (!selectedVote) return;
    setIsVoting(true);

    const success = await castVote(selectedVote, voteComment || undefined);

    if (success) {
      toast.success(`Vote submitted: ${selectedVote}`);
    } else {
      toast.error("Failed to submit vote");
    }

    setIsVoting(false);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !memo) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileTextIcon className="size-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">IC Memo Not Found</h2>
        <p className="text-muted-foreground mb-4">{error || "The requested memo could not be found."}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <ReloadIcon className="size-4 mr-2" />
            Retry
          </Button>
          <Link href="/ic-memos">
            <Button>Back to IC Memos</Button>
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[memo.status];
  const content = memo.content || {};
  const authorName = memo.author.name || memo.author.email || "Unknown";
  const quorum = 3;

  const canVote = ["SUBMITTED", "UNDER_REVIEW", "PENDING_VOTE"].includes(memo.status);

  return (
    <>
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
                <Badge className={cn("gap-1.5", status.color)}>{status.label}</Badge>
                {memo.memoRecommendation && (
                  <Badge className={RECOMMENDATION_CONFIG[memo.memoRecommendation].color}>
                    {RECOMMENDATION_CONFIG[memo.memoRecommendation].label}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>By {authorName}</span>
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
              <Button variant="outline" size="sm">
                <DownloadIcon className="size-4 mr-2" />PDF
              </Button>
              <Button variant="outline" size="sm"><Share2Icon className="size-4 mr-2" />Share</Button>
              {memo.status === "DRAFT" && (
                <Button variant="outline" size="sm" onClick={() => router.push(`/ic-memos/${id}/edit`)}>
                  <Pencil1Icon className="size-4 mr-2" />Edit
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Overview */}
            <Section title="Company Overview" icon={<GlobeIcon className="size-5" />}>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-atlas-md bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-2xl font-bold text-white">
                    {memo.company.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{memo.company.name}</h3>
                      <Link href={`/companies/${memo.company.id}`} className="text-muted-foreground hover:text-foreground">
                        <ExternalLinkIcon className="size-4" />
                      </Link>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {memo.company.sector && <span>{memo.company.sector}</span>}
                      {memo.stage && <span>• {memo.stage}</span>}
                      {memo.focusArea && <span>• {memo.focusArea}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Decision Rationale */}
            {memo.decisionRationale && (
              <Section title="Decision Rationale" icon={<CheckCircledIcon className="size-5" />}>
                <p className="text-sm text-muted-foreground leading-relaxed">{memo.decisionRationale}</p>
              </Section>
            )}

            {/* Triple-Use Analysis */}
            <Section title="Triple-Use Analysis" icon={<RocketIcon className="size-5" />}>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <ScoreBadge score={memo.tripleUseScore} label="Triple-Use Score" />
                </div>
                <div className="space-y-4">
                  <ContentItem label="Defense Application" content={content.defenseApplication} />
                  <ContentItem label="Commercial Application" content={content.commercialApplication} />
                  <ContentItem label="Space Application" content={content.spaceApplication} />
                  <ContentItem label="Justification" content={content.tripleUseJustification} />
                </div>
              </div>
            </Section>

            {/* WLCDIA */}
            <Section title="WLCDIA (Wright's Law Cost Decline)" icon={<LightningBoltIcon className="size-5" />}>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <ScoreBadge score={memo.wlcdiaScore} label="WLCDIA Score" />
                  {memo.expectedCostDecline && (
                    <MetricCard
                      label="Expected Cost Decline"
                      value={`${parseFloat(memo.expectedCostDecline)}%`}
                      subValue="per doubling"
                    />
                  )}
                </div>
                <div className="space-y-4">
                  <ContentItem label="Scale Analysis" content={content.scaleAnalysis} />
                  <ContentItem label="Demand Analysis" content={content.demandAnalysis} />
                  <ContentItem label="Supply Chain Analysis" content={content.supplyChainAnalysis} />
                </div>
              </div>
            </Section>

            {/* Team Assessment */}
            <Section title="Team Assessment (GWC)" icon={<PersonIcon className="size-5" />}>
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ScoreBadge score={memo.teamScore} label="Team Score" />
                  <RatingDisplay value={memo.founderTechRating} label="Technical" />
                  <RatingDisplay value={memo.founderBusinessRating} label="Business" />
                  <RatingDisplay value={memo.founderDesignRating} label="Design/Product" />
                </div>
                <div className="space-y-4">
                  <ContentItem label="Founder" content={content.founderName} />
                  <ContentItem label="Background" content={content.founderBackground} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ContentItem label="Get It" content={content.gwcGetIt} />
                    <ContentItem label="Want It" content={content.gwcWantIt} />
                    <ContentItem label="Capacity" content={content.gwcCapacity} />
                  </div>
                  <ContentItem label="Key Hires Assessment" content={content.keyHiresAssessment} />
                </div>
              </div>
            </Section>

            {/* Market Analysis */}
            <Section title="Market Analysis" icon={<BarChartIcon className="size-5" />}>
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ScoreBadge score={memo.marketScore} label="Market Score" />
                  <MetricCard label="TAM" value={formatCurrency(memo.tam)} />
                  <MetricCard label="SAM" value={formatCurrency(memo.sam)} />
                  <MetricCard label="SOM" value={formatCurrency(memo.som)} />
                </div>
                <div className="space-y-4">
                  <ContentItem label="Market Understanding" content={content.marketUnderstanding} />
                  <ContentItem label="Direct Competitors" content={content.directCompetitors} />
                  <ContentItem label="Adjacent Players" content={content.adjacentPlayers} />
                  <ContentItem label="Unfair Advantage" content={content.unfairAdvantage} />
                </div>
              </div>
            </Section>

            {/* Capital Efficiency */}
            <Section title="Capital Efficiency" icon={<CubeIcon className="size-5" />}>
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ScoreBadge score={memo.capitalEfficiencyScore} label="Capital Efficiency Score" />
                  {memo.trlStage && <MetricCard label="TRL Stage" value={`${memo.trlStage}`} />}
                  <MetricCard label="Monthly Burn" value={formatCurrency(memo.monthlyBurn)} />
                  {memo.runwayMonths && <MetricCard label="Runway" value={`${memo.runwayMonths} months`} />}
                </div>
                {content.milestones && content.milestones.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Key Milestones</h4>
                    <ul className="space-y-2">
                      {content.milestones.map((m: { description: string }, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircledIcon className="size-4 text-tactical-400 mt-0.5" />
                          {m.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <ContentItem label="Contingency Planning" content={content.contingencyPlanning} />
              </div>
            </Section>

            {/* Financial Terms */}
            <Section title="Financial Terms" icon={<TargetIcon className="size-5" />}>
              <div className="space-y-6">
                <div className="p-4 bg-muted/30 rounded-atlas-sm">
                  <h4 className="text-sm font-medium mb-4">Company Ask</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <MetricCard label="Ask Amount" value={formatCurrency(memo.askAmount)} />
                    <MetricCard label="Ask Valuation" value={formatCurrency(memo.askValuation)} />
                  </div>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-atlas-sm">
                  <h4 className="text-sm font-medium mb-4">Mortis Proposed Terms</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <MetricCard label="Pre-Money" value={formatCurrency(memo.preMoneyValuation)} />
                    <MetricCard label="Round Size" value={formatCurrency(memo.roundSize)} />
                    <MetricCard label="Post-Money" value={formatCurrency(memo.postMoneyValuation)} />
                    <MetricCard label="Mortis Investment" value={formatCurrency(memo.mortisInvestment)} />
                    <MetricCard
                      label="Ownership"
                      value={memo.mortisOwnership ? `${(parseFloat(memo.mortisOwnership) * 100).toFixed(1)}%` : "-"}
                    />
                    <MetricCard label="Follow-on Reserve" value={formatCurrency(memo.followOnReserve)} />
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-atlas-sm">
                  <h4 className="text-sm font-medium mb-4">Exit Projections</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {memo.projectedExitYears && <MetricCard label="Timeline" value={`${memo.projectedExitYears} years`} />}
                    <MetricCard label="Exit (Low)" value={formatCurrency(memo.targetExitLow)} />
                    <MetricCard label="Exit (High)" value={formatCurrency(memo.targetExitHigh)} />
                    {memo.projectedMoicLow && <MetricCard label="MOIC (Low)" value={`${parseFloat(memo.projectedMoicLow)}x`} />}
                    {memo.projectedMoicHigh && <MetricCard label="MOIC (High)" value={`${parseFloat(memo.projectedMoicHigh)}x`} />}
                  </div>
                </div>
              </div>
            </Section>

            {/* Key Risks */}
            {content.keyRisks && content.keyRisks.length > 0 && (
              <Section title="Key Risks" icon={<FileTextIcon className="size-5" />}>
                <div className="space-y-3">
                  {content.keyRisks.map((risk: { category: string; description: string; mitigation: string }, i: number) => (
                    <div key={i} className="p-4 border border-border rounded-atlas-sm">
                      <div className="font-medium text-sm mb-2">{risk.category}</div>
                      <p className="text-sm text-muted-foreground mb-2">{risk.description}</p>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Mitigation: </span>
                        <span className="text-tactical-400">{risk.mitigation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Thesis Alignment */}
            <Section title="Thesis Alignment" icon={<CheckCircledIcon className="size-5" />}>
              <div className="space-y-4">
                <ContentItem label="Strategic Value" content={content.strategicValue} />
                <ContentItem label="Portfolio Synergies" content={content.portfolioSynergies} />
                <ContentItem label="Next Steps" content={content.nextSteps} />
              </div>
            </Section>
          </div>

          {/* Sidebar - Voting */}
          <div className="space-y-6">
            <Card variant="raised" className="sticky top-4">
              <CardHeader withBorder>
                <CardTitle size="lg">Voting</CardTitle>
              </CardHeader>
              <CardContent padding="lg">
                <div className="space-y-6">
                  {/* Vote Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">{voteSummary.total} of {quorum} votes</span>
                      <span className={voteSummary.total >= quorum ? "text-tactical-400" : "text-muted-foreground"}>
                        {voteSummary.total >= quorum ? "Quorum reached" : `${quorum - voteSummary.total} needed`}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-navy-500 to-tactical-500"
                        style={{ width: `${Math.min(100, (voteSummary.total / quorum) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Vote Summary */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 bg-tactical-500/10 rounded-atlas-sm">
                      <div className="text-2xl font-bold text-tactical-400">{voteSummary.yes}</div>
                      <div className="text-xs text-muted-foreground">Yes</div>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-atlas-sm">
                      <div className="text-2xl font-bold text-red-400">{voteSummary.no}</div>
                      <div className="text-xs text-muted-foreground">No</div>
                    </div>
                    <div className="p-3 bg-slate-500/10 rounded-atlas-sm">
                      <div className="text-2xl font-bold text-slate-400">{voteSummary.abstain}</div>
                      <div className="text-xs text-muted-foreground">Abstain</div>
                    </div>
                  </div>

                  {/* Cast Vote */}
                  {canVote && (
                    <div className="border-t border-border pt-4">
                      <h4 className="font-semibold mb-3">
                        {userVote ? "Update Your Vote" : "Cast Your Vote"}
                      </h4>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <VoteButton
                          type="YES"
                          active={selectedVote === "YES"}
                          onClick={() => setSelectedVote("YES")}
                          disabled={isVoting}
                        />
                        <VoteButton
                          type="NO"
                          active={selectedVote === "NO"}
                          onClick={() => setSelectedVote("NO")}
                          disabled={isVoting}
                        />
                        <VoteButton
                          type="ABSTAIN"
                          active={selectedVote === "ABSTAIN"}
                          onClick={() => setSelectedVote("ABSTAIN")}
                          disabled={isVoting}
                        />
                      </div>
                      <textarea
                        placeholder="Add a comment (optional)..."
                        value={voteComment}
                        onChange={(e) => setVoteComment(e.target.value)}
                        className="w-full p-3 bg-muted/30 border border-border rounded-atlas-sm text-sm resize-none h-20 mb-3"
                        disabled={isVoting}
                      />
                      <Button
                        className="w-full"
                        disabled={!selectedVote || isVoting}
                        onClick={handleVoteSubmit}
                      >
                        {isVoting ? "Submitting..." : "Submit Vote"}
                      </Button>
                    </div>
                  )}

                  {/* Partner Votes */}
                  {votes.length > 0 && (
                    <div className="border-t border-border pt-4">
                      <h4 className="font-semibold mb-3">Partner Votes</h4>
                      <div className="space-y-3">
                        {votes.map((vote) => {
                          const voterName = vote.user.name || vote.user.email || "Unknown";
                          const voteColor = {
                            YES: "text-tactical-400",
                            NO: "text-red-400",
                            ABSTAIN: "text-slate-400",
                          };
                          const voteIcon = {
                            YES: <CheckCircledIcon className="size-4" />,
                            NO: <CrossCircledIcon className="size-4" />,
                            ABSTAIN: <MinusIcon className="size-4" />,
                          };

                          return (
                            <div key={vote.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-navy-500 to-tactical-500 flex items-center justify-center text-white text-[10px]">
                                  {voterName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                </div>
                                <span className="text-sm">{voterName}</span>
                              </div>
                              <span className={cn("flex items-center gap-1 text-sm", voteColor[vote.vote])}>
                                {voteIcon[vote.vote]}
                                {vote.vote}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Discussion */}
            {votes.some((v) => v.comment) && (
              <Card variant="raised">
                <CardHeader withBorder>
                  <CardTitle size="md">Discussion</CardTitle>
                </CardHeader>
                <CardContent padding="lg">
                  <div className="space-y-4">
                    {votes.filter((v) => v.comment).map((vote) => {
                      const voterName = vote.user.name || vote.user.email || "Unknown";
                      return (
                        <div key={vote.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-navy-500 to-tactical-500 flex items-center justify-center text-white text-[10px]">
                              {voterName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <span className="font-medium text-sm">{voterName}</span>
                            <span className="text-xs text-muted-foreground">{formatRelativeDate(vote.createdAt)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{vote.comment}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Return to Top Button */}
        <ReturnToTop />
    </>
  );
}
