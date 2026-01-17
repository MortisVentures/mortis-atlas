// =============================================================================
// LP QUARTERLY REPORT - TYPES AND UTILITIES
// =============================================================================

// =============================================================================
// TYPES
// =============================================================================

export interface FundOverview {
  fundName: string;
  fundSize: number;
  vintage: number;
  closeDate: string;
  capitalCalled: number;
  capitalCommitted: number;
  distributionsToDate: number;
  nav: number;
  managementFee: number;
  carriedInterest: number;
  investmentPeriodEnd?: string;
  fundTermEnd?: string;
}

export interface PerformanceMetrics {
  grossIRR: number;
  netIRR: number;
  grossMOIC: number;
  netMOIC: number;
  tvpi: number;
  dpi: number;
  rvpi: number;
  paidInCapital: number;
  realizedValue: number;
  unrealizedValue: number;
}

export interface BenchmarkComparison {
  benchmark: string;
  benchmarkIRR: number;
  benchmarkTVPI: number;
  fundOutperformanceIRR: number;
  fundOutperformanceTVPI: number;
  quartile: 1 | 2 | 3 | 4;
}

export interface PortfolioCompany {
  id: string;
  name: string;
  sector: string;
  stage: string;
  initialInvestmentDate: string;
  totalInvested: number;
  currentValue: number;
  moic: number;
  irr: number;
  ownership: number;
  status: "ACTIVE" | "REALIZED" | "WRITTEN_OFF" | "PARTIAL_EXIT";
  lastRoundDate?: string;
  lastRoundValuation?: number;
  valuationChange: number; // percentage change from last quarter
  notes?: string;
}

export interface QuarterlyActivity {
  newInvestments: {
    companyName: string;
    amount: number;
    round: string;
    sector: string;
    date: string;
    ownership: number;
    leadInvestor: boolean;
  }[];
  followOnInvestments: {
    companyName: string;
    amount: number;
    round: string;
    date: string;
    previousOwnership: number;
    newOwnership: number;
  }[];
  exits: {
    companyName: string;
    exitType: "IPO" | "M&A" | "SECONDARY" | "BUYBACK";
    proceeds: number;
    moic: number;
    irr: number;
    holdingPeriod: number; // in months
    date: string;
  }[];
  markups: {
    companyName: string;
    previousValue: number;
    newValue: number;
    percentageChange: number;
    reason: string;
  }[];
  markdowns: {
    companyName: string;
    previousValue: number;
    newValue: number;
    percentageChange: number;
    reason: string;
  }[];
}

export interface DealActivity {
  companiesReviewed: number;
  icPresentations: number;
  termSheetsIssued: number;
  dealsClosed: number;
  passRate: number;
  avgCheckSize: number;
  topSectors: { sector: string; count: number }[];
  pipeline: {
    stage: string;
    count: number;
    totalValue: number;
  }[];
}

export interface UpcomingEvent {
  id: string;
  type: "EXIT" | "REFINANCING" | "BOARD_MEETING" | "FUNDRAISE" | "MILESTONE";
  companyName: string;
  description: string;
  expectedDate: string;
  probability?: number;
  potentialValue?: number;
  notes?: string;
}

export interface MarketCommentary {
  period: string;
  summary: string;
  sectorTrends: {
    sector: string;
    trend: "BULLISH" | "NEUTRAL" | "BEARISH";
    commentary: string;
  }[];
  competitiveLandscape: string;
  regulatoryUpdates: string[];
  outlook: string;
}

export interface LPReport {
  id: string;
  quarter: string; // e.g., "Q4 2024"
  year: number;
  generatedAt: string;
  status: "DRAFT" | "REVIEW" | "APPROVED" | "DISTRIBUTED";

  fundOverview: FundOverview;
  performance: PerformanceMetrics;
  benchmarks: BenchmarkComparison[];
  portfolio: PortfolioCompany[];
  quarterlyActivity: QuarterlyActivity;
  dealActivity: DealActivity;
  upcomingEvents: UpcomingEvent[];
  marketCommentary: MarketCommentary;

  // Distribution tracking
  distributedTo?: {
    lpName: string;
    email: string;
    sentAt: string;
    opened: boolean;
    downloaded: boolean;
  }[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  sections: {
    id: string;
    title: string;
    enabled: boolean;
    order: number;
  }[];
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logoUrl?: string;
  customFooter?: string;
}

// =============================================================================
// SAMPLE DATA
// =============================================================================

export const SAMPLE_FUND_OVERVIEW: FundOverview = {
  fundName: "Mortis Ventures Fund I",
  fundSize: 150000000,
  vintage: 2022,
  closeDate: "2022-06-15",
  capitalCalled: 95000000,
  capitalCommitted: 150000000,
  distributionsToDate: 18500000,
  nav: 142000000,
  managementFee: 0.02,
  carriedInterest: 0.20,
  investmentPeriodEnd: "2027-06-15",
  fundTermEnd: "2032-06-15",
};

export const SAMPLE_PERFORMANCE: PerformanceMetrics = {
  grossIRR: 0.285,
  netIRR: 0.225,
  grossMOIC: 1.68,
  netMOIC: 1.52,
  tvpi: 1.69,
  dpi: 0.19,
  rvpi: 1.50,
  paidInCapital: 95000000,
  realizedValue: 18500000,
  unrealizedValue: 142000000,
};

export const SAMPLE_BENCHMARKS: BenchmarkComparison[] = [
  {
    benchmark: "Cambridge Associates US VC",
    benchmarkIRR: 0.165,
    benchmarkTVPI: 1.42,
    fundOutperformanceIRR: 0.06,
    fundOutperformanceTVPI: 0.27,
    quartile: 1,
  },
  {
    benchmark: "Preqin Venture Capital Index",
    benchmarkIRR: 0.148,
    benchmarkTVPI: 1.35,
    fundOutperformanceIRR: 0.077,
    fundOutperformanceTVPI: 0.34,
    quartile: 1,
  },
  {
    benchmark: "S&P 500 (Public Market Equivalent)",
    benchmarkIRR: 0.112,
    benchmarkTVPI: 1.28,
    fundOutperformanceIRR: 0.113,
    fundOutperformanceTVPI: 0.41,
    quartile: 1,
  },
];

export const SAMPLE_PORTFOLIO: PortfolioCompany[] = [
  {
    id: "p1",
    name: "QuantumAI",
    sector: "AI/ML",
    stage: "Series B",
    initialInvestmentDate: "2022-08-15",
    totalInvested: 4000000,
    currentValue: 12800000,
    moic: 3.2,
    irr: 0.65,
    ownership: 8.5,
    status: "ACTIVE",
    lastRoundDate: "2024-03-15",
    lastRoundValuation: 180000000,
    valuationChange: 0.35,
    notes: "Strong revenue growth, preparing for Series C",
  },
  {
    id: "p2",
    name: "DataVault",
    sector: "Enterprise Software",
    stage: "Series A",
    initialInvestmentDate: "2022-11-20",
    totalInvested: 3000000,
    currentValue: 7500000,
    moic: 2.5,
    irr: 0.52,
    ownership: 12.0,
    status: "ACTIVE",
    lastRoundDate: "2024-06-10",
    lastRoundValuation: 75000000,
    valuationChange: 0.25,
  },
  {
    id: "p3",
    name: "CloudSync",
    sector: "Cloud Infrastructure",
    stage: "Series B",
    initialInvestmentDate: "2022-09-01",
    totalInvested: 5000000,
    currentValue: 11000000,
    moic: 2.2,
    irr: 0.42,
    ownership: 7.5,
    status: "ACTIVE",
    valuationChange: 0.15,
  },
  {
    id: "p4",
    name: "SecureNet",
    sector: "Cybersecurity",
    stage: "Series A",
    initialInvestmentDate: "2023-02-15",
    totalInvested: 2500000,
    currentValue: 4500000,
    moic: 1.8,
    irr: 0.38,
    ownership: 10.0,
    status: "ACTIVE",
    valuationChange: 0.20,
  },
  {
    id: "p5",
    name: "GreenEnergy",
    sector: "CleanTech",
    stage: "Series A",
    initialInvestmentDate: "2023-05-20",
    totalInvested: 1800000,
    currentValue: 2700000,
    moic: 1.5,
    irr: 0.28,
    ownership: 9.0,
    status: "ACTIVE",
    valuationChange: 0.10,
  },
  {
    id: "p6",
    name: "BioTech Labs",
    sector: "Healthcare",
    stage: "Series B",
    initialInvestmentDate: "2022-10-01",
    totalInvested: 3500000,
    currentValue: 5250000,
    moic: 1.5,
    irr: 0.22,
    ownership: 6.5,
    status: "ACTIVE",
    valuationChange: -0.08,
    notes: "Slower than expected clinical trials",
  },
  {
    id: "p7",
    name: "Acme Corp",
    sector: "SaaS",
    stage: "Realized",
    initialInvestmentDate: "2022-07-01",
    totalInvested: 2500000,
    currentValue: 8750000,
    moic: 3.5,
    irr: 0.75,
    ownership: 0,
    status: "REALIZED",
    valuationChange: 0,
    notes: "Acquired by TechGiant in Q3 2024",
  },
  {
    id: "p8",
    name: "FailedStartup",
    sector: "Consumer",
    stage: "Written Off",
    initialInvestmentDate: "2023-01-15",
    totalInvested: 1500000,
    currentValue: 0,
    moic: 0,
    irr: -1.0,
    ownership: 0,
    status: "WRITTEN_OFF",
    valuationChange: -1.0,
    notes: "Company shut down due to market conditions",
  },
];

export const SAMPLE_QUARTERLY_ACTIVITY: QuarterlyActivity = {
  newInvestments: [
    {
      companyName: "NeuralPath",
      amount: 3000000,
      round: "Series A",
      sector: "AI/ML",
      date: "2024-10-15",
      ownership: 12.0,
      leadInvestor: true,
    },
    {
      companyName: "FinFlow",
      amount: 2000000,
      round: "Seed",
      sector: "FinTech",
      date: "2024-11-20",
      ownership: 15.0,
      leadInvestor: false,
    },
  ],
  followOnInvestments: [
    {
      companyName: "QuantumAI",
      amount: 1500000,
      round: "Series B",
      date: "2024-10-05",
      previousOwnership: 10.0,
      newOwnership: 8.5,
    },
  ],
  exits: [
    {
      companyName: "Acme Corp",
      exitType: "M&A",
      proceeds: 8750000,
      moic: 3.5,
      irr: 0.75,
      holdingPeriod: 27,
      date: "2024-09-15",
    },
  ],
  markups: [
    {
      companyName: "QuantumAI",
      previousValue: 9500000,
      newValue: 12800000,
      percentageChange: 0.35,
      reason: "Series B pricing at $180M post-money",
    },
    {
      companyName: "DataVault",
      previousValue: 6000000,
      newValue: 7500000,
      percentageChange: 0.25,
      reason: "Strong ARR growth (200% YoY)",
    },
  ],
  markdowns: [
    {
      companyName: "BioTech Labs",
      previousValue: 5700000,
      newValue: 5250000,
      percentageChange: -0.08,
      reason: "Clinical trial delays impacting timeline",
    },
  ],
};

export const SAMPLE_DEAL_ACTIVITY: DealActivity = {
  companiesReviewed: 245,
  icPresentations: 18,
  termSheetsIssued: 6,
  dealsClosed: 2,
  passRate: 0.992,
  avgCheckSize: 2500000,
  topSectors: [
    { sector: "AI/ML", count: 68 },
    { sector: "Enterprise Software", count: 52 },
    { sector: "FinTech", count: 41 },
    { sector: "Healthcare", count: 35 },
    { sector: "CleanTech", count: 28 },
  ],
  pipeline: [
    { stage: "Sourced", count: 245, totalValue: 0 },
    { stage: "First Meeting", count: 85, totalValue: 0 },
    { stage: "Deep Dive", count: 32, totalValue: 96000000 },
    { stage: "IC Review", count: 18, totalValue: 54000000 },
    { stage: "Term Sheet", count: 6, totalValue: 18000000 },
    { stage: "Closed", count: 2, totalValue: 5000000 },
  ],
};

export const SAMPLE_UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    id: "e1",
    type: "EXIT",
    companyName: "CloudSync",
    description: "Strategic acquisition discussions with major cloud provider",
    expectedDate: "2025-Q2",
    probability: 0.65,
    potentialValue: 22000000,
    notes: "NDA signed, due diligence in progress",
  },
  {
    id: "e2",
    type: "FUNDRAISE",
    companyName: "QuantumAI",
    description: "Series C fundraise planned",
    expectedDate: "2025-Q1",
    probability: 0.80,
    potentialValue: 50000000,
    notes: "Multiple term sheets expected",
  },
  {
    id: "e3",
    type: "BOARD_MEETING",
    companyName: "DataVault",
    description: "Q4 Board Meeting",
    expectedDate: "2025-01-15",
    notes: "2025 planning and budget approval",
  },
  {
    id: "e4",
    type: "MILESTONE",
    companyName: "SecureNet",
    description: "SOC 2 Type II certification expected",
    expectedDate: "2025-02-01",
    notes: "Critical for enterprise sales",
  },
  {
    id: "e5",
    type: "REFINANCING",
    companyName: "GreenEnergy",
    description: "Project financing for new solar installations",
    expectedDate: "2025-Q1",
    potentialValue: 15000000,
  },
];

export const SAMPLE_MARKET_COMMENTARY: MarketCommentary = {
  period: "Q4 2024",
  summary: "The venture capital market showed signs of stabilization in Q4 2024, with deal activity increasing modestly compared to the prior quarter. While valuations remain below 2021 peaks, we're seeing healthy price discovery and improving fundamentals across our portfolio. AI/ML continues to dominate deal flow, representing over 25% of opportunities reviewed.",
  sectorTrends: [
    {
      sector: "AI/ML",
      trend: "BULLISH",
      commentary: "Enterprise AI adoption accelerating. Strong demand for vertical AI solutions and infrastructure.",
    },
    {
      sector: "Enterprise Software",
      trend: "NEUTRAL",
      commentary: "Steady growth but increased competition. Focus on profitability over growth at all costs.",
    },
    {
      sector: "FinTech",
      trend: "NEUTRAL",
      commentary: "Regulatory clarity improving. Infrastructure and B2B payments showing strength.",
    },
    {
      sector: "Healthcare",
      trend: "BULLISH",
      commentary: "AI-enabled diagnostics and drug discovery attracting significant capital.",
    },
    {
      sector: "CleanTech",
      trend: "BULLISH",
      commentary: "IRA benefits driving investment. Battery storage and grid infrastructure in demand.",
    },
  ],
  competitiveLandscape: "We continue to see strong competition for high-quality deals, particularly in AI/ML. However, our deep sector expertise and founder network provide differentiated deal flow. We've maintained our discipline on valuation while securing allocations in competitive rounds.",
  regulatoryUpdates: [
    "SEC private fund rules implementation in 2024 - increased reporting requirements",
    "AI regulation developments in EU (AI Act) and US (Executive Order)",
    "Continued FTC scrutiny of tech M&A may impact exit timelines",
  ],
  outlook: "We remain cautiously optimistic for 2025. Our portfolio companies are well-capitalized and focused on sustainable growth. We expect 2-3 meaningful liquidity events in the coming year and continue to see attractive investment opportunities, particularly in AI infrastructure and enterprise applications.",
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function formatCurrency(value: number): string {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatMultiple(value: number): string {
  return `${value.toFixed(2)}x`;
}

export function getQuartile(quartile: 1 | 2 | 3 | 4): string {
  const labels = {
    1: "Top Quartile",
    2: "Second Quartile",
    3: "Third Quartile",
    4: "Bottom Quartile",
  };
  return labels[quartile];
}

export function getQuartileColor(quartile: 1 | 2 | 3 | 4): string {
  const colors = {
    1: "text-emerald-400",
    2: "text-cyan-400",
    3: "text-amber-400",
    4: "text-red-400",
  };
  return colors[quartile];
}

export function getStatusColor(status: PortfolioCompany["status"]): string {
  const colors = {
    ACTIVE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    REALIZED: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    WRITTEN_OFF: "bg-red-500/20 text-red-400 border-red-500/30",
    PARTIAL_EXIT: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };
  return colors[status];
}

export function getTrendIcon(change: number): "up" | "down" | "flat" {
  if (change > 0.01) return "up";
  if (change < -0.01) return "down";
  return "flat";
}

export function getEventTypeConfig(type: UpcomingEvent["type"]): {
  label: string;
  color: string;
} {
  const config = {
    EXIT: { label: "Potential Exit", color: "bg-emerald-500/20 text-emerald-400" },
    REFINANCING: { label: "Refinancing", color: "bg-blue-500/20 text-blue-400" },
    BOARD_MEETING: { label: "Board Meeting", color: "bg-purple-500/20 text-purple-400" },
    FUNDRAISE: { label: "Fundraise", color: "bg-cyan-500/20 text-cyan-400" },
    MILESTONE: { label: "Milestone", color: "bg-amber-500/20 text-amber-400" },
  };
  return config[type];
}

export function getSectorTrendConfig(trend: "BULLISH" | "NEUTRAL" | "BEARISH"): {
  label: string;
  color: string;
  icon: string;
} {
  const config = {
    BULLISH: { label: "Bullish", color: "text-emerald-400", icon: "up" },
    NEUTRAL: { label: "Neutral", color: "text-amber-400", icon: "flat" },
    BEARISH: { label: "Bearish", color: "text-red-400", icon: "down" },
  };
  return config[trend];
}

export function calculatePortfolioStats(portfolio: PortfolioCompany[]): {
  totalInvested: number;
  totalValue: number;
  activeCompanies: number;
  realizedCompanies: number;
  writtenOff: number;
  avgMOIC: number;
} {
  const activePortfolio = portfolio.filter(p => p.status === "ACTIVE");
  const realizedPortfolio = portfolio.filter(p => p.status === "REALIZED");
  const writtenOffPortfolio = portfolio.filter(p => p.status === "WRITTEN_OFF");

  const totalInvested = portfolio.reduce((sum, p) => sum + p.totalInvested, 0);
  const totalValue = portfolio.reduce((sum, p) => sum + p.currentValue, 0);
  const avgMOIC = portfolio
    .filter(p => p.status !== "WRITTEN_OFF")
    .reduce((sum, p) => sum + p.moic, 0) / (portfolio.length - writtenOffPortfolio.length);

  return {
    totalInvested,
    totalValue,
    activeCompanies: activePortfolio.length,
    realizedCompanies: realizedPortfolio.length,
    writtenOff: writtenOffPortfolio.length,
    avgMOIC,
  };
}

export function generateReportPeriod(): string {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  const year = now.getFullYear();
  return `Q${quarter} ${year}`;
}

// Default report template
export const DEFAULT_TEMPLATE: ReportTemplate = {
  id: "default",
  name: "Standard LP Report",
  sections: [
    { id: "overview", title: "Fund Overview", enabled: true, order: 1 },
    { id: "performance", title: "Performance Summary", enabled: true, order: 2 },
    { id: "portfolio", title: "Portfolio Update", enabled: true, order: 3 },
    { id: "activity", title: "Deal Activity", enabled: true, order: 4 },
    { id: "events", title: "Upcoming Events", enabled: true, order: 5 },
    { id: "market", title: "Market Commentary", enabled: true, order: 6 },
  ],
  brandColors: {
    primary: "#06b6d4", // cyan-500
    secondary: "#0f172a", // slate-900
    accent: "#8b5cf6", // violet-500
  },
};
