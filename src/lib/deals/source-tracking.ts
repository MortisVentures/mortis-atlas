// =============================================================================
// DEAL SOURCE ATTRIBUTION - TYPES AND UTILITIES
// =============================================================================

import { DealSource } from "@prisma/client";

// =============================================================================
// TYPES
// =============================================================================

export type SourceType = DealSource;

export interface DealSourceInfo {
  id: string;
  type: SourceType;

  // Type-specific details
  referrerContactId?: string;
  referrerName?: string;
  coInvestorFund?: string;
  portfolioCompanyId?: string;
  portfolioCompanyName?: string;
  eventName?: string;
  eventDate?: string;
  acceleratorName?: string;
  acceleratorBatch?: string;
  universityName?: string;
  channel?: string; // For inbound: website, email, linkedin, etc.

  notes?: string;
  createdAt: string;
}


export interface DealWithSource {
  id: string;
  companyId: string;
  companyName: string;
  dealName: string;
  stage: string;
  amount?: number;
  investedAmount?: number;
  source: DealSourceInfo;
  createdAt: string;
  closedAt?: string;
  outcome: "PENDING" | "WON" | "LOST" | "PASSED";
  timeToClose?: number; // Days
  qualityScore?: number; // 1-10
}

export interface Referrer {
  id: string;
  contactId?: string; // Links to Contact record for navigation
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  organization?: string;
  role?: string;
  type: "INDIVIDUAL" | "FUND" | "ACCELERATOR" | "UNIVERSITY" | "PORTFOLIO_COMPANY";
  tier: ReferrerTier;
  relationship: "INVESTOR" | "FOUNDER" | "OPERATOR" | "ADVISOR" | "ACADEMIC" | "OTHER";
  isStarred?: boolean;

  // Stats
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  conversionRate: number;
  totalDealsValue: number;
  lastReferralDate?: string;
  firstReferralDate: string;
  lastContactDate?: string;

  // Rewards & Thank You
  rewardsEarned?: number;
  thankYouSent?: boolean;
  lastThankYouSent?: string;
  lastThankYouDate?: string;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SourceMetrics {
  sourceType: SourceType;
  totalDeals: number;
  wonDeals: number;
  lostDeals: number;
  pendingDeals: number;
  conversionRate: number;
  avgTimeToClose: number;
  avgQualityScore: number;
  totalInvested: number;
  avgDealSize: number;
  roi?: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  conversionFromPrevious: number;
}

export interface SourceFunnel {
  sourceType: SourceType;
  stages: FunnelStage[];
}

export interface EventEffectiveness {
  eventName: string;
  eventDate: string;
  dealsSourced: number;
  dealsWon: number;
  conversionRate: number;
  totalInvested: number;
  estimatedCost?: number;
  roi?: number;
}

// =============================================================================
// REFERRER TIERS
// =============================================================================

export type ReferrerTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export const referrerTierConfig: Record<ReferrerTier, {
  label: string;
  color: string;
  minReferrals: number;
}> = {
  BRONZE: {
    label: "Bronze",
    color: "bg-amber-700/20 text-amber-600 border-amber-700/30",
    minReferrals: 0,
  },
  SILVER: {
    label: "Silver",
    color: "bg-zinc-400/20 text-zinc-300 border-zinc-400/30",
    minReferrals: 3,
  },
  GOLD: {
    label: "Gold",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    minReferrals: 5,
  },
  PLATINUM: {
    label: "Platinum",
    color: "bg-cyan-400/20 text-cyan-300 border-cyan-400/30",
    minReferrals: 10,
  },
};

// =============================================================================
// SOURCE TYPE CONFIG
// =============================================================================

export const sourceTypeConfig: Record<SourceType, {
  label: string;
  icon: string;
  color: string;
  description: string;
}> = {
  REFERRAL: {
    label: "Referral",
    icon: "person",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    description: "Personal or professional referrals",
  },
  DIRECT_OUTREACH: {
    label: "Direct Outreach",
    icon: "mail",
    color: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    description: "Proactive deal sourcing",
  },
  INBOUND: {
    label: "Inbound",
    icon: "inbox",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    description: "Website, email, or direct inquiries",
  },
  CONFERENCE: {
    label: "Conference",
    icon: "calendar",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    description: "Industry conferences and events",
  },
  ACCELERATOR: {
    label: "Accelerator",
    icon: "lightning",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    description: "YC, Techstars, etc.",
  },
  NETWORK: {
    label: "Network",
    icon: "school",
    color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    description: "General network connection",
  },
  PORTFOLIO: {
    label: "Portfolio",
    icon: "rocket",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    description: "Referrals from portfolio companies",
  },
  INVESTOR_NETWORK: {
    label: "Investor Network",
    icon: "briefcase",
    color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    description: "Co-investor or LP referrals",
  },
  OTHER: {
    label: "Other",
    icon: "circle",
    color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    description: "Other sources",
  },
};

export const ACCELERATORS = [
  "Y Combinator",
  "Techstars",
  "500 Startups",
  "Plug and Play",
  "AngelPad",
  "Alchemist",
  "MassChallenge",
  "Dreamit",
  "Seedcamp",
  "Antler",
];

export const UNIVERSITIES = [
  "Stanford University",
  "MIT",
  "Harvard University",
  "UC Berkeley",
  "Carnegie Mellon",
  "Georgia Tech",
  "Princeton University",
  "Cornell University",
  "Yale University",
  "Columbia University",
];

export const DEAL_STAGES = [
  "INITIAL_REVIEW",
  "MEETING_SCHEDULED",
  "DEEP_DIVE",
  "PARTNER_REVIEW",
  "TERM_SHEET",
  "LEGAL_DILIGENCE",
  "CLOSED_WON",
  "CLOSED_LOST",
];

// =============================================================================
// CALCULATION UTILITIES
// =============================================================================

export function calculateSourceMetrics(deals: DealWithSource[]): SourceMetrics[] {
  const sourceGroups = new Map<SourceType, DealWithSource[]>();

  deals.forEach(deal => {
    const type = deal.source.type;
    if (!sourceGroups.has(type)) {
      sourceGroups.set(type, []);
    }
    sourceGroups.get(type)!.push(deal);
  });

  const metrics: SourceMetrics[] = [];

  sourceGroups.forEach((groupDeals, sourceType) => {
    const wonDeals = groupDeals.filter(d => d.outcome === "WON");
    const lostDeals = groupDeals.filter(d => d.outcome === "LOST" || d.outcome === "PASSED");
    const pendingDeals = groupDeals.filter(d => d.outcome === "PENDING");

    const closedDeals = groupDeals.filter(d => d.timeToClose !== undefined);
    const avgTimeToClose = closedDeals.length > 0
      ? closedDeals.reduce((sum, d) => sum + (d.timeToClose || 0), 0) / closedDeals.length
      : 0;

    const scoredDeals = groupDeals.filter(d => d.qualityScore !== undefined);
    const avgQualityScore = scoredDeals.length > 0
      ? scoredDeals.reduce((sum, d) => sum + (d.qualityScore || 0), 0) / scoredDeals.length
      : 0;

    const totalInvested = wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
    const avgDealSize = wonDeals.length > 0 ? totalInvested / wonDeals.length : 0;

    metrics.push({
      sourceType,
      totalDeals: groupDeals.length,
      wonDeals: wonDeals.length,
      lostDeals: lostDeals.length,
      pendingDeals: pendingDeals.length,
      conversionRate: groupDeals.length > 0 ? wonDeals.length / groupDeals.length : 0,
      avgTimeToClose,
      avgQualityScore,
      totalInvested,
      avgDealSize,
    });
  });

  return metrics.sort((a, b) => b.conversionRate - a.conversionRate);
}

export function calculateFunnelBySource(deals: DealWithSource[], sourceType: SourceType): SourceFunnel {
  const sourceDeals = deals.filter(d => d.source.type === sourceType);

  const stageCounts: Record<string, number> = {};
  DEAL_STAGES.forEach(stage => { stageCounts[stage] = 0; });

  sourceDeals.forEach(deal => {
    const stageIndex = DEAL_STAGES.indexOf(deal.stage);
    for (let i = 0; i <= stageIndex; i++) {
      stageCounts[DEAL_STAGES[i]]++;
    }
  });

  const stages: FunnelStage[] = DEAL_STAGES.map((stage, index) => {
    const count = stageCounts[stage];
    const totalForSource = sourceDeals.length;
    const previousCount = index > 0 ? stageCounts[DEAL_STAGES[index - 1]] : totalForSource;

    return {
      stage,
      count,
      percentage: totalForSource > 0 ? (count / totalForSource) * 100 : 0,
      conversionFromPrevious: previousCount > 0 ? (count / previousCount) * 100 : 0,
    };
  });

  return { sourceType, stages };
}

export function calculateEventEffectiveness(deals: DealWithSource[]): EventEffectiveness[] {
  const eventDeals = deals.filter(d => d.source.type === "CONFERENCE" && d.source.eventName);

  const eventGroups = new Map<string, DealWithSource[]>();
  eventDeals.forEach(deal => {
    const eventName = deal.source.eventName!;
    if (!eventGroups.has(eventName)) {
      eventGroups.set(eventName, []);
    }
    eventGroups.get(eventName)!.push(deal);
  });

  const effectiveness: EventEffectiveness[] = [];

  eventGroups.forEach((groupDeals, eventName) => {
    const firstDeal = groupDeals[0];
    const wonDeals = groupDeals.filter(d => d.outcome === "WON");
    const totalInvested = wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

    effectiveness.push({
      eventName,
      eventDate: firstDeal.source.eventDate || "",
      dealsSourced: groupDeals.length,
      dealsWon: wonDeals.length,
      conversionRate: groupDeals.length > 0 ? wonDeals.length / groupDeals.length : 0,
      totalInvested,
    });
  });

  return effectiveness.sort((a, b) => b.conversionRate - a.conversionRate);
}

export function calculateReferrerLeaderboard(
  referrers: Referrer[],
  sortBy: "totalReferrals" | "successfulReferrals" | "conversionRate" = "successfulReferrals"
): Referrer[] {
  return [...referrers].sort((a, b) => {
    if (sortBy === "conversionRate") {
      return b.conversionRate - a.conversionRate;
    }
    return b[sortBy] - a[sortBy];
  });
}

export function calculateQualityScoreBySource(deals: DealWithSource[]): Map<SourceType, number> {
  const scores = new Map<SourceType, { total: number; count: number }>();

  deals.forEach(deal => {
    if (deal.qualityScore !== undefined) {
      const current = scores.get(deal.source.type) || { total: 0, count: 0 };
      current.total += deal.qualityScore;
      current.count += 1;
      scores.set(deal.source.type, current);
    }
  });

  const avgScores = new Map<SourceType, number>();
  scores.forEach((value, key) => {
    avgScores.set(key, value.count > 0 ? value.total / value.count : 0);
  });

  return avgScores;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function formatDaysToClose(days: number): string {
  if (days < 30) return `${Math.round(days)} days`;
  if (days < 365) return `${Math.round(days / 30)} months`;
  return `${(days / 365).toFixed(1)} years`;
}

export function getSourceColor(sourceType: SourceType): string {
  return sourceTypeConfig[sourceType].color;
}

export function getSourceLabel(sourceType: SourceType): string {
  return sourceTypeConfig[sourceType].label;
}

// =============================================================================
// SAMPLE DATA
// =============================================================================

export const SAMPLE_REFERRERS: Referrer[] = [
  {
    id: "ref-1",
    contactId: "ct-alex-thompson",
    name: "Alex Thompson",
    email: "alex@venturefund.com",
    company: "Venture Capital Partners",
    organization: "Venture Capital Partners",
    role: "Partner",
    type: "FUND",
    tier: "GOLD",
    relationship: "INVESTOR",
    isStarred: true,
    totalReferrals: 8,
    successfulReferrals: 3,
    pendingReferrals: 2,
    conversionRate: 0.375,
    totalDealsValue: 6500000,
    lastReferralDate: "2024-08-15",
    firstReferralDate: "2022-01-15",
    lastContactDate: "2024-10-01",
    thankYouSent: true,
    lastThankYouSent: "2024-06-20",
    lastThankYouDate: "2024-06-20",
    notes: "Great source for enterprise SaaS deals",
    createdAt: "2022-01-15",
    updatedAt: "2024-08-15",
  },
  {
    id: "ref-2",
    contactId: "ct-sarah-chen",
    name: "Sarah Chen",
    email: "sarah@techcorp.com",
    company: "TechCorp (Portfolio Co)",
    organization: "TechCorp",
    role: "CEO",
    type: "PORTFOLIO_COMPANY",
    tier: "SILVER",
    relationship: "FOUNDER",
    isStarred: false,
    totalReferrals: 5,
    successfulReferrals: 2,
    pendingReferrals: 1,
    conversionRate: 0.4,
    totalDealsValue: 4000000,
    lastReferralDate: "2024-09-01",
    firstReferralDate: "2022-06-20",
    lastContactDate: "2024-09-15",
    thankYouSent: true,
    lastThankYouSent: "2024-07-10",
    lastThankYouDate: "2024-07-10",
    createdAt: "2022-06-20",
    updatedAt: "2024-09-01",
  },
  {
    id: "ref-3",
    contactId: "ct-michael-lee",
    name: "Dr. Michael Lee",
    email: "mlee@stanford.edu",
    company: "Stanford University",
    organization: "Stanford University",
    role: "Professor",
    type: "UNIVERSITY",
    tier: "PLATINUM",
    relationship: "ACADEMIC",
    isStarred: true,
    totalReferrals: 12,
    successfulReferrals: 4,
    pendingReferrals: 3,
    conversionRate: 0.333,
    totalDealsValue: 8500000,
    lastReferralDate: "2024-10-05",
    firstReferralDate: "2021-09-01",
    lastContactDate: "2024-10-05",
    thankYouSent: false,
    notes: "Key connection for deeptech and AI startups from Stanford",
    createdAt: "2021-09-01",
    updatedAt: "2024-10-05",
  },
  {
    id: "ref-4",
    // No contactId - this is a program, not an individual contact
    name: "YC Demo Day",
    email: "contact@ycombinator.com",
    company: "Y Combinator",
    organization: "Y Combinator",
    role: "Program",
    type: "ACCELERATOR",
    tier: "PLATINUM",
    relationship: "OTHER",
    isStarred: true,
    totalReferrals: 25,
    successfulReferrals: 5,
    pendingReferrals: 8,
    conversionRate: 0.2,
    totalDealsValue: 12500000,
    lastReferralDate: "2024-09-15",
    firstReferralDate: "2020-01-01",
    lastContactDate: "2024-09-15",
    lastThankYouSent: "2024-03-15",
    createdAt: "2020-01-01",
    updatedAt: "2024-09-15",
  },
  {
    id: "ref-5",
    name: "Jennifer Wu",
    email: "jwu@founders.com",
    company: "Founders Network",
    organization: "Founders Network",
    role: "Director",
    type: "INDIVIDUAL",
    tier: "GOLD",
    relationship: "OPERATOR",
    isStarred: false,
    totalReferrals: 6,
    successfulReferrals: 3,
    pendingReferrals: 0,
    conversionRate: 0.5,
    totalDealsValue: 5500000,
    lastReferralDate: "2024-07-20",
    firstReferralDate: "2023-02-15",
    lastContactDate: "2024-08-05",
    thankYouSent: true,
    lastThankYouSent: "2024-08-01",
    lastThankYouDate: "2024-08-01",
    rewardsEarned: 5000,
    createdAt: "2023-02-15",
    updatedAt: "2024-07-20",
  },
  {
    id: "ref-6",
    name: "Techstars Boulder",
    email: "boulder@techstars.com",
    company: "Techstars",
    organization: "Techstars",
    role: "Program",
    type: "ACCELERATOR",
    tier: "PLATINUM",
    relationship: "OTHER",
    isStarred: false,
    totalReferrals: 15,
    successfulReferrals: 3,
    pendingReferrals: 4,
    conversionRate: 0.2,
    totalDealsValue: 6000000,
    lastReferralDate: "2024-08-30",
    firstReferralDate: "2021-03-01",
    lastContactDate: "2024-09-01",
    createdAt: "2021-03-01",
    updatedAt: "2024-08-30",
  },
];

export const SAMPLE_DEALS_WITH_SOURCE: DealWithSource[] = [
  {
    id: "deal-1",
    companyId: "c1",
    companyName: "Acme Corp",
    dealName: "Series A",
    stage: "CLOSED_WON",
    amount: 2500000,
    source: {
      id: "src-1",
      type: "REFERRAL",
      referrerContactId: "ref-1",
      referrerName: "Alex Thompson",
      createdAt: "2021-01-15",
    },
    createdAt: "2021-01-15",
    closedAt: "2021-03-15",
    outcome: "WON",
    timeToClose: 59,
    qualityScore: 9,
  },
  {
    id: "deal-2",
    companyId: "c2",
    companyName: "TechFlow",
    dealName: "Seed",
    stage: "CLOSED_WON",
    amount: 1500000,
    source: {
      id: "src-2",
      type: "ACCELERATOR",
      acceleratorName: "Y Combinator",
      acceleratorBatch: "W21",
      createdAt: "2021-04-01",
    },
    createdAt: "2021-04-01",
    closedAt: "2021-06-20",
    outcome: "WON",
    timeToClose: 80,
    qualityScore: 8,
  },
  {
    id: "deal-3",
    companyId: "c3",
    companyName: "DataVault",
    dealName: "Series A",
    stage: "CLOSED_WON",
    amount: 3000000,
    source: {
      id: "src-3",
      type: "CONFERENCE",
      eventName: "TechCrunch Disrupt 2021",
      eventDate: "2021-09-21",
      createdAt: "2021-09-25",
    },
    createdAt: "2021-09-25",
    closedAt: "2022-01-10",
    outcome: "WON",
    timeToClose: 107,
    qualityScore: 9,
  },
  {
    id: "deal-4",
    companyId: "c4",
    companyName: "CloudSync",
    dealName: "Seed",
    stage: "CLOSED_WON",
    amount: 2000000,
    source: {
      id: "src-4",
      type: "PORTFOLIO",
      portfolioCompanyId: "c1",
      portfolioCompanyName: "Acme Corp",
      referrerName: "Sarah Chen",
      createdAt: "2022-02-01",
    },
    createdAt: "2022-02-01",
    closedAt: "2022-04-05",
    outcome: "WON",
    timeToClose: 63,
    qualityScore: 8,
  },
  {
    id: "deal-5",
    companyId: "c5",
    companyName: "QuantumAI",
    dealName: "Series A",
    stage: "CLOSED_WON",
    amount: 4000000,
    source: {
      id: "src-5",
      type: "INVESTOR_NETWORK",
      coInvestorFund: "Sequoia Capital",
      referrerName: "Partner at Sequoia",
      createdAt: "2022-06-15",
    },
    createdAt: "2022-06-15",
    closedAt: "2022-09-12",
    outcome: "WON",
    timeToClose: 89,
    qualityScore: 10,
  },
  {
    id: "deal-6",
    companyId: "c6",
    companyName: "BioTech Labs",
    dealName: "Series B",
    stage: "CLOSED_WON",
    amount: 3500000,
    source: {
      id: "src-6",
      type: "NETWORK",
      universityName: "Stanford University",
      referrerContactId: "ref-3",
      referrerName: "Dr. Michael Lee",
      createdAt: "2022-11-01",
    },
    createdAt: "2022-11-01",
    closedAt: "2023-02-28",
    outcome: "WON",
    timeToClose: 119,
    qualityScore: 8,
  },
  {
    id: "deal-7",
    companyId: "c7",
    companyName: "SecureNet",
    dealName: "Series A",
    stage: "CLOSED_WON",
    amount: 2500000,
    source: {
      id: "src-7",
      type: "INBOUND",
      channel: "Website",
      createdAt: "2023-02-15",
    },
    createdAt: "2023-02-15",
    closedAt: "2023-05-18",
    outcome: "WON",
    timeToClose: 92,
    qualityScore: 7,
  },
  {
    id: "deal-8",
    companyId: "c8",
    companyName: "GreenEnergy",
    dealName: "Seed",
    stage: "CLOSED_WON",
    amount: 1800000,
    source: {
      id: "src-8",
      type: "CONFERENCE",
      eventName: "Climate Tech Summit 2023",
      eventDate: "2023-05-15",
      createdAt: "2023-05-20",
    },
    createdAt: "2023-05-20",
    closedAt: "2023-08-10",
    outcome: "WON",
    timeToClose: 82,
    qualityScore: 8,
  },
  {
    id: "deal-9",
    companyId: "c9",
    companyName: "LogiChain",
    dealName: "Seed",
    stage: "DEEP_DIVE",
    source: {
      id: "src-9",
      type: "DIRECT_OUTREACH",
      notes: "Found via LinkedIn research",
      createdAt: "2023-09-01",
    },
    createdAt: "2023-09-01",
    outcome: "PENDING",
    qualityScore: 6,
  },
  {
    id: "deal-10",
    companyId: "c10",
    companyName: "EduPlatform",
    dealName: "Seed",
    stage: "PARTNER_REVIEW",
    source: {
      id: "src-10",
      type: "ACCELERATOR",
      acceleratorName: "Techstars",
      acceleratorBatch: "Boulder 2023",
      createdAt: "2023-10-15",
    },
    createdAt: "2023-10-15",
    outcome: "PENDING",
    qualityScore: 7,
  },
  {
    id: "deal-11",
    companyId: "c11",
    companyName: "RetailOS",
    dealName: "Series A",
    stage: "MEETING_SCHEDULED",
    source: {
      id: "src-11",
      type: "REFERRAL",
      referrerContactId: "ref-5",
      referrerName: "Jennifer Wu",
      createdAt: "2024-01-10",
    },
    createdAt: "2024-01-10",
    outcome: "PENDING",
    qualityScore: 7,
  },
  {
    id: "deal-12",
    companyId: "c12",
    companyName: "PropTech Solutions",
    dealName: "Series A",
    stage: "TERM_SHEET",
    source: {
      id: "src-12",
      type: "INVESTOR_NETWORK",
      coInvestorFund: "Andreessen Horowitz",
      createdAt: "2024-03-01",
    },
    createdAt: "2024-03-01",
    outcome: "PENDING",
    qualityScore: 9,
  },
  {
    id: "deal-13",
    companyId: "c13",
    companyName: "FailedStartup",
    dealName: "Seed",
    stage: "CLOSED_LOST",
    source: {
      id: "src-13",
      type: "INBOUND",
      channel: "Email",
      createdAt: "2023-06-01",
    },
    createdAt: "2023-06-01",
    outcome: "PASSED",
    timeToClose: 14,
    qualityScore: 4,
  },
  {
    id: "deal-14",
    companyId: "c14",
    companyName: "AnotherOne",
    dealName: "Series A",
    stage: "CLOSED_LOST",
    source: {
      id: "src-14",
      type: "CONFERENCE",
      eventName: "TechCrunch Disrupt 2023",
      eventDate: "2023-09-19",
      createdAt: "2023-09-22",
    },
    createdAt: "2023-09-22",
    outcome: "LOST",
    timeToClose: 45,
    qualityScore: 5,
  },
  {
    id: "deal-15",
    companyId: "c15",
    companyName: "MissedDeal",
    dealName: "Seed",
    stage: "CLOSED_LOST",
    source: {
      id: "src-15",
      type: "DIRECT_OUTREACH",
      createdAt: "2023-07-15",
    },
    createdAt: "2023-07-15",
    outcome: "LOST",
    timeToClose: 30,
    qualityScore: 5,
  },
];
