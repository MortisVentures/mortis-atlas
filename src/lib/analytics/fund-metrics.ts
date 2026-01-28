// =============================================================================
// FUND ANALYTICS - TYPES AND CALCULATION UTILITIES
// =============================================================================

// =============================================================================
// TYPES
// =============================================================================

export interface CashFlow {
  date: string; // ISO date string
  amount: number; // Positive = inflow (distribution), Negative = outflow (investment)
  type: "INVESTMENT" | "DISTRIBUTION" | "FEE" | "CARRY" | "VALUATION";
  description?: string;
  companyId?: string;
  companyName?: string;
}

export interface Investment {
  id: string;
  companyId: string;
  companyName: string;
  investmentDate: string;
  initialAmount: number;
  currentValue: number;
  realizedValue: number;
  isExited: boolean;
  exitDate?: string;
  exitMultiple?: number;
  stage: "SEED" | "SERIES_A" | "SERIES_B" | "SERIES_C" | "GROWTH";
  sector: string;
  geography: string;
  vintageYear: number;
  ownershipPercentage: number;
  cashFlows: CashFlow[];
}

export interface FundMetrics {
  // IRR Metrics
  grossIRR: number;
  netIRR: number;
  sinceInceptionIRR: number;

  // MOIC Metrics
  realizedMOIC: number;
  unrealizedMOIC: number;
  totalMOIC: number;

  // LP Metrics
  tvpi: number; // Total Value to Paid-In
  dpi: number; // Distributions to Paid-In
  rvpi: number; // Residual Value to Paid-In

  // Capital Metrics
  committedCapital: number;
  calledCapital: number;
  deployedCapital: number;
  dryPowder: number;
  reserveAllocation: number;
  managementFees: number;
  carriedInterest: number;

  // Portfolio Metrics
  totalInvestments: number;
  activeInvestments: number;
  exitedInvestments: number;
  averageCheckSize: number;
  medianCheckSize: number;

  // Performance
  topQuartileThreshold: number;
  medianBenchmark: number;
  pmeRatio: number; // Public Market Equivalent
}

export interface PortfolioConstruction {
  byStage: { stage: string; count: number; value: number; percentage: number }[];
  bySector: { sector: string; count: number; value: number; percentage: number }[];
  byGeography: { geography: string; count: number; value: number; percentage: number }[];
  byCheckSize: { range: string; count: number; percentage: number }[];
  byVintage: { year: number; invested: number; currentValue: number; moic: number; irr: number }[];
}

export interface QuarterlyData {
  quarter: string;
  date: string;
  nav: number;
  distributions: number;
  contributions: number;
  tvpi: number;
  dpi: number;
  rvpi: number;
  irr: number;
}

// =============================================================================
// IRR CALCULATION (Newton-Raphson Method)
// =============================================================================

/**
 * Calculate Internal Rate of Return using Newton-Raphson method
 * Cash flows: negative = outflow (investment), positive = inflow (distribution/value)
 */
export function calculateIRR(cashFlows: CashFlow[], terminalValue: number = 0): number {
  if (cashFlows.length === 0) return 0;

  // Sort cash flows by date
  const sorted = [...cashFlows].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Convert to years from first cash flow
  const firstDate = new Date(sorted[0].date);
  const flows: { years: number; amount: number }[] = sorted.map(cf => ({
    years: (new Date(cf.date).getTime() - firstDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    amount: cf.type === "INVESTMENT" ? -Math.abs(cf.amount) : cf.amount
  }));

  // Add terminal value as final cash flow
  if (terminalValue > 0) {
    const lastDate = new Date(sorted[sorted.length - 1].date);
    const terminalYears = (lastDate.getTime() - firstDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    flows.push({ years: terminalYears, amount: terminalValue });
  }

  // Newton-Raphson iteration
  let irr = 0.1; // Initial guess
  const maxIterations = 100;
  const tolerance = 0.0001;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let derivative = 0;

    for (const flow of flows) {
      const discountFactor = Math.pow(1 + irr, flow.years);
      npv += flow.amount / discountFactor;
      derivative -= flow.years * flow.amount / Math.pow(1 + irr, flow.years + 1);
    }

    if (Math.abs(npv) < tolerance) break;
    if (derivative === 0) break;

    irr = irr - npv / derivative;

    // Bound the IRR to reasonable range
    if (irr < -0.99) irr = -0.99;
    if (irr > 10) irr = 10;
  }

  return isNaN(irr) || !isFinite(irr) ? 0 : irr;
}

/**
 * Calculate Net IRR (after management fees and carry)
 */
export function calculateNetIRR(
  cashFlows: CashFlow[],
  terminalValue: number,
  _managementFeeRate: number = 0.02,
  carryRate: number = 0.20,
  _hurdleRate: number = 0.08
): number {
  // Adjust cash flows for fees
  const adjustedFlows = cashFlows.map(cf => {
    if (cf.type === "DISTRIBUTION") {
      // Calculate carry on profits above hurdle
      const profit = cf.amount;
      const carry = Math.max(0, profit * carryRate);
      return { ...cf, amount: cf.amount - carry };
    }
    return cf;
  });

  // Adjust terminal value for potential carry
  const adjustedTerminalValue = terminalValue * (1 - carryRate * 0.5); // Simplified

  return calculateIRR(adjustedFlows, adjustedTerminalValue);
}

// =============================================================================
// MOIC CALCULATIONS
// =============================================================================

export function calculateMOIC(investments: Investment[]): {
  realized: number;
  unrealized: number;
  total: number;
} {
  const totalInvested = investments.reduce((sum, inv) => sum + inv.initialAmount, 0);
  const realizedValue = investments
    .filter(inv => inv.isExited)
    .reduce((sum, inv) => sum + inv.realizedValue, 0);
  const unrealizedValue = investments
    .filter(inv => !inv.isExited)
    .reduce((sum, inv) => sum + inv.currentValue, 0);

  return {
    realized: totalInvested > 0 ? realizedValue / investments.filter(i => i.isExited).reduce((s, i) => s + i.initialAmount, 0) || 0 : 0,
    unrealized: totalInvested > 0 ? unrealizedValue / investments.filter(i => !i.isExited).reduce((s, i) => s + i.initialAmount, 0) || 0 : 0,
    total: totalInvested > 0 ? (realizedValue + unrealizedValue) / totalInvested : 0,
  };
}

// =============================================================================
// LP METRICS (TVPI, DPI, RVPI)
// =============================================================================

export function calculateLPMetrics(
  paidInCapital: number,
  distributions: number,
  currentNAV: number
): { tvpi: number; dpi: number; rvpi: number } {
  if (paidInCapital <= 0) {
    return { tvpi: 0, dpi: 0, rvpi: 0 };
  }

  return {
    tvpi: (distributions + currentNAV) / paidInCapital,
    dpi: distributions / paidInCapital,
    rvpi: currentNAV / paidInCapital,
  };
}

// =============================================================================
// PORTFOLIO CONSTRUCTION ANALYSIS
// =============================================================================

export function analyzePortfolioConstruction(investments: Investment[]): PortfolioConstruction {
  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const _totalInvested = investments.reduce((sum, inv) => sum + inv.initialAmount, 0);

  // By Stage
  const stageGroups = groupBy(investments, 'stage');
  const byStage = Object.entries(stageGroups).map(([stage, invs]) => ({
    stage: formatStage(stage),
    count: invs.length,
    value: invs.reduce((sum, inv) => sum + inv.currentValue, 0),
    percentage: totalValue > 0 ? (invs.reduce((sum, inv) => sum + inv.currentValue, 0) / totalValue) * 100 : 0,
  }));

  // By Sector
  const sectorGroups = groupBy(investments, 'sector');
  const bySector = Object.entries(sectorGroups).map(([sector, invs]) => ({
    sector,
    count: invs.length,
    value: invs.reduce((sum, inv) => sum + inv.currentValue, 0),
    percentage: totalValue > 0 ? (invs.reduce((sum, inv) => sum + inv.currentValue, 0) / totalValue) * 100 : 0,
  }));

  // By Geography
  const geoGroups = groupBy(investments, 'geography');
  const byGeography = Object.entries(geoGroups).map(([geography, invs]) => ({
    geography,
    count: invs.length,
    value: invs.reduce((sum, inv) => sum + inv.currentValue, 0),
    percentage: totalValue > 0 ? (invs.reduce((sum, inv) => sum + inv.currentValue, 0) / totalValue) * 100 : 0,
  }));

  // By Check Size
  const checkSizeRanges = [
    { range: "$0-500K", min: 0, max: 500000 },
    { range: "$500K-1M", min: 500000, max: 1000000 },
    { range: "$1M-2M", min: 1000000, max: 2000000 },
    { range: "$2M-5M", min: 2000000, max: 5000000 },
    { range: "$5M+", min: 5000000, max: Infinity },
  ];

  const byCheckSize = checkSizeRanges.map(({ range, min, max }) => {
    const count = investments.filter(inv => inv.initialAmount >= min && inv.initialAmount < max).length;
    return {
      range,
      count,
      percentage: investments.length > 0 ? (count / investments.length) * 100 : 0,
    };
  });

  // By Vintage Year
  const vintageGroups = groupBy(investments, 'vintageYear');
  const byVintage = Object.entries(vintageGroups)
    .map(([year, invs]) => {
      const invested = invs.reduce((sum, inv) => sum + inv.initialAmount, 0);
      const currentValue = invs.reduce((sum, inv) => sum + inv.currentValue, 0);
      const cashFlows = invs.flatMap(inv => inv.cashFlows);

      return {
        year: parseInt(year),
        invested,
        currentValue,
        moic: invested > 0 ? currentValue / invested : 0,
        irr: calculateIRR(cashFlows, currentValue) * 100,
      };
    })
    .sort((a, b) => a.year - b.year);

  return { byStage, bySector, byGeography, byCheckSize, byVintage };
}

// =============================================================================
// QUARTERLY TRACKING
// =============================================================================

export function generateQuarterlyData(
  investments: Investment[],
  cashFlows: CashFlow[],
  startDate: string,
  quarters: number = 12
): QuarterlyData[] {
  const result: QuarterlyData[] = [];
  const start = new Date(startDate);

  for (let q = 0; q < quarters; q++) {
    const quarterDate = new Date(start);
    quarterDate.setMonth(start.getMonth() + q * 3);

    const quarterEnd = new Date(quarterDate);
    quarterEnd.setMonth(quarterEnd.getMonth() + 3);

    // Filter cash flows for this quarter
    const quarterFlows = cashFlows.filter(cf => {
      const cfDate = new Date(cf.date);
      return cfDate >= quarterDate && cfDate < quarterEnd;
    });

    const contributions = quarterFlows
      .filter(cf => cf.type === "INVESTMENT")
      .reduce((sum, cf) => sum + Math.abs(cf.amount), 0);

    const distributions = quarterFlows
      .filter(cf => cf.type === "DISTRIBUTION")
      .reduce((sum, cf) => sum + cf.amount, 0);

    // Calculate NAV at quarter end
    const nav = investments
      .filter(inv => new Date(inv.investmentDate) <= quarterEnd)
      .reduce((sum, inv) => {
        if (inv.isExited && inv.exitDate && new Date(inv.exitDate) <= quarterEnd) {
          return sum; // Already exited
        }
        return sum + inv.currentValue * (1 - 0.02 * q); // Simplified mark adjustment
      }, 0);

    // Calculate cumulative metrics
    const allFlowsToDate = cashFlows.filter(cf => new Date(cf.date) <= quarterEnd);
    const totalContributions = allFlowsToDate
      .filter(cf => cf.type === "INVESTMENT")
      .reduce((sum, cf) => sum + Math.abs(cf.amount), 0);
    const totalDistributions = allFlowsToDate
      .filter(cf => cf.type === "DISTRIBUTION")
      .reduce((sum, cf) => sum + cf.amount, 0);

    const lpMetrics = calculateLPMetrics(totalContributions, totalDistributions, nav);

    result.push({
      quarter: `Q${Math.floor(quarterDate.getMonth() / 3) + 1} ${quarterDate.getFullYear()}`,
      date: quarterDate.toISOString().split('T')[0],
      nav,
      distributions,
      contributions,
      tvpi: lpMetrics.tvpi,
      dpi: lpMetrics.dpi,
      rvpi: lpMetrics.rvpi,
      irr: calculateIRR(allFlowsToDate, nav) * 100,
    });
  }

  return result;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const value = String(item[key]);
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

function formatStage(stage: string): string {
  const stageLabels: Record<string, string> = {
    SEED: "Seed",
    SERIES_A: "Series A",
    SERIES_B: "Series B",
    SERIES_C: "Series C",
    GROWTH: "Growth",
  };
  return stageLabels[stage] || stage;
}

export function formatCurrency(amount: number, decimals: number = 0): string {
  if (amount >= 1e9) {
    return `$${(amount / 1e9).toFixed(decimals)}B`;
  }
  if (amount >= 1e6) {
    return `$${(amount / 1e6).toFixed(decimals)}M`;
  }
  if (amount >= 1e3) {
    return `$${(amount / 1e3).toFixed(decimals)}K`;
  }
  return `$${amount.toFixed(decimals)}`;
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatMultiple(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}x`;
}

// =============================================================================
// SAMPLE FUND DATA
// =============================================================================

export const SAMPLE_INVESTMENTS: Investment[] = [
  {
    id: "inv-1",
    companyId: "c1",
    companyName: "Acme Corp",
    investmentDate: "2021-03-15",
    initialAmount: 2500000,
    currentValue: 8750000,
    realizedValue: 0,
    isExited: false,
    stage: "SERIES_A",
    sector: "Enterprise SaaS",
    geography: "North America",
    vintageYear: 2021,
    ownershipPercentage: 12.5,
    cashFlows: [
      { date: "2021-03-15", amount: -2500000, type: "INVESTMENT", companyId: "c1", companyName: "Acme Corp" },
    ],
  },
  {
    id: "inv-2",
    companyId: "c2",
    companyName: "TechFlow",
    investmentDate: "2021-06-20",
    initialAmount: 1500000,
    currentValue: 4500000,
    realizedValue: 0,
    isExited: false,
    stage: "SEED",
    sector: "FinTech",
    geography: "North America",
    vintageYear: 2021,
    ownershipPercentage: 15.0,
    cashFlows: [
      { date: "2021-06-20", amount: -1500000, type: "INVESTMENT", companyId: "c2", companyName: "TechFlow" },
    ],
  },
  {
    id: "inv-3",
    companyId: "c3",
    companyName: "DataVault",
    investmentDate: "2022-01-10",
    initialAmount: 3000000,
    currentValue: 0,
    realizedValue: 9000000,
    isExited: true,
    exitDate: "2024-06-15",
    exitMultiple: 3.0,
    stage: "SERIES_A",
    sector: "Data Infrastructure",
    geography: "North America",
    vintageYear: 2022,
    ownershipPercentage: 10.0,
    cashFlows: [
      { date: "2022-01-10", amount: -3000000, type: "INVESTMENT", companyId: "c3", companyName: "DataVault" },
      { date: "2024-06-15", amount: 9000000, type: "DISTRIBUTION", companyId: "c3", companyName: "DataVault" },
    ],
  },
  {
    id: "inv-4",
    companyId: "c4",
    companyName: "CloudSync",
    investmentDate: "2022-04-05",
    initialAmount: 2000000,
    currentValue: 6000000,
    realizedValue: 0,
    isExited: false,
    stage: "SEED",
    sector: "Enterprise SaaS",
    geography: "Europe",
    vintageYear: 2022,
    ownershipPercentage: 18.0,
    cashFlows: [
      { date: "2022-04-05", amount: -2000000, type: "INVESTMENT", companyId: "c4", companyName: "CloudSync" },
    ],
  },
  {
    id: "inv-5",
    companyId: "c5",
    companyName: "QuantumAI",
    investmentDate: "2022-09-12",
    initialAmount: 4000000,
    currentValue: 12000000,
    realizedValue: 0,
    isExited: false,
    stage: "SERIES_A",
    sector: "AI/ML",
    geography: "North America",
    vintageYear: 2022,
    ownershipPercentage: 8.0,
    cashFlows: [
      { date: "2022-09-12", amount: -4000000, type: "INVESTMENT", companyId: "c5", companyName: "QuantumAI" },
    ],
  },
  {
    id: "inv-6",
    companyId: "c6",
    companyName: "BioTech Labs",
    investmentDate: "2023-02-28",
    initialAmount: 3500000,
    currentValue: 5250000,
    realizedValue: 0,
    isExited: false,
    stage: "SERIES_B",
    sector: "HealthTech",
    geography: "North America",
    vintageYear: 2023,
    ownershipPercentage: 5.0,
    cashFlows: [
      { date: "2023-02-28", amount: -3500000, type: "INVESTMENT", companyId: "c6", companyName: "BioTech Labs" },
    ],
  },
  {
    id: "inv-7",
    companyId: "c7",
    companyName: "SecureNet",
    investmentDate: "2023-05-18",
    initialAmount: 2500000,
    currentValue: 3750000,
    realizedValue: 0,
    isExited: false,
    stage: "SERIES_A",
    sector: "Cybersecurity",
    geography: "North America",
    vintageYear: 2023,
    ownershipPercentage: 10.0,
    cashFlows: [
      { date: "2023-05-18", amount: -2500000, type: "INVESTMENT", companyId: "c7", companyName: "SecureNet" },
    ],
  },
  {
    id: "inv-8",
    companyId: "c8",
    companyName: "GreenEnergy",
    investmentDate: "2023-08-10",
    initialAmount: 1800000,
    currentValue: 2700000,
    realizedValue: 0,
    isExited: false,
    stage: "SEED",
    sector: "CleanTech",
    geography: "Europe",
    vintageYear: 2023,
    ownershipPercentage: 12.0,
    cashFlows: [
      { date: "2023-08-10", amount: -1800000, type: "INVESTMENT", companyId: "c8", companyName: "GreenEnergy" },
    ],
  },
  {
    id: "inv-9",
    companyId: "c9",
    companyName: "LogiChain",
    investmentDate: "2023-11-22",
    initialAmount: 2200000,
    currentValue: 2640000,
    realizedValue: 0,
    isExited: false,
    stage: "SEED",
    sector: "Supply Chain",
    geography: "Asia Pacific",
    vintageYear: 2023,
    ownershipPercentage: 14.0,
    cashFlows: [
      { date: "2023-11-22", amount: -2200000, type: "INVESTMENT", companyId: "c9", companyName: "LogiChain" },
    ],
  },
  {
    id: "inv-10",
    companyId: "c10",
    companyName: "EduPlatform",
    investmentDate: "2024-01-15",
    initialAmount: 1500000,
    currentValue: 1650000,
    realizedValue: 0,
    isExited: false,
    stage: "SEED",
    sector: "EdTech",
    geography: "North America",
    vintageYear: 2024,
    ownershipPercentage: 16.0,
    cashFlows: [
      { date: "2024-01-15", amount: -1500000, type: "INVESTMENT", companyId: "c10", companyName: "EduPlatform" },
    ],
  },
  {
    id: "inv-11",
    companyId: "c11",
    companyName: "RetailOS",
    investmentDate: "2024-04-08",
    initialAmount: 2800000,
    currentValue: 2800000,
    realizedValue: 0,
    isExited: false,
    stage: "SERIES_A",
    sector: "Retail Tech",
    geography: "North America",
    vintageYear: 2024,
    ownershipPercentage: 9.0,
    cashFlows: [
      { date: "2024-04-08", amount: -2800000, type: "INVESTMENT", companyId: "c11", companyName: "RetailOS" },
    ],
  },
  {
    id: "inv-12",
    companyId: "c12",
    companyName: "PropTech Solutions",
    investmentDate: "2024-07-22",
    initialAmount: 3200000,
    currentValue: 3200000,
    realizedValue: 0,
    isExited: false,
    stage: "SERIES_A",
    sector: "PropTech",
    geography: "Europe",
    vintageYear: 2024,
    ownershipPercentage: 7.5,
    cashFlows: [
      { date: "2024-07-22", amount: -3200000, type: "INVESTMENT", companyId: "c12", companyName: "PropTech Solutions" },
    ],
  },
];

export const SAMPLE_FUND_INFO = {
  name: "Mortis Ventures Fund I",
  vintageYear: 2021,
  committedCapital: 100000000,
  managementFeeRate: 0.02,
  carriedInterestRate: 0.20,
  hurdleRate: 0.08,
  investmentPeriod: 5, // years
  fundLife: 10, // years
};

// Calculate all cash flows from investments
export function getAllCashFlows(investments: Investment[]): CashFlow[] {
  return investments.flatMap(inv => inv.cashFlows);
}

// Calculate comprehensive fund metrics
export function calculateFundMetrics(
  investments: Investment[],
  fundInfo: typeof SAMPLE_FUND_INFO
): FundMetrics {
  const allCashFlows = getAllCashFlows(investments);
  const totalInvested = investments.reduce((sum, inv) => sum + inv.initialAmount, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalRealizedValue = investments.reduce((sum, inv) => sum + inv.realizedValue, 0);
  const totalDistributions = totalRealizedValue;

  const moicResults = calculateMOIC(investments);
  const lpMetrics = calculateLPMetrics(totalInvested, totalDistributions, totalCurrentValue);

  // Calculate fees
  const yearsSinceInception = (Date.now() - new Date(`${fundInfo.vintageYear}-01-01`).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const managementFees = fundInfo.committedCapital * fundInfo.managementFeeRate * yearsSinceInception;

  // Calculate carry (simplified)
  const totalValue = totalCurrentValue + totalRealizedValue;
  const profit = totalValue - totalInvested;
  const carriedInterest = Math.max(0, profit * fundInfo.carriedInterestRate);

  const checkSizes = investments.map(inv => inv.initialAmount).sort((a, b) => a - b);
  const medianCheckSize = checkSizes[Math.floor(checkSizes.length / 2)] || 0;

  return {
    grossIRR: calculateIRR(allCashFlows, totalCurrentValue),
    netIRR: calculateNetIRR(allCashFlows, totalCurrentValue, fundInfo.managementFeeRate, fundInfo.carriedInterestRate, fundInfo.hurdleRate),
    sinceInceptionIRR: calculateIRR(allCashFlows, totalCurrentValue),

    realizedMOIC: moicResults.realized,
    unrealizedMOIC: moicResults.unrealized,
    totalMOIC: moicResults.total,

    tvpi: lpMetrics.tvpi,
    dpi: lpMetrics.dpi,
    rvpi: lpMetrics.rvpi,

    committedCapital: fundInfo.committedCapital,
    calledCapital: totalInvested + managementFees,
    deployedCapital: totalInvested,
    dryPowder: fundInfo.committedCapital - totalInvested - managementFees,
    reserveAllocation: fundInfo.committedCapital * 0.15, // 15% reserve
    managementFees,
    carriedInterest,

    totalInvestments: investments.length,
    activeInvestments: investments.filter(inv => !inv.isExited).length,
    exitedInvestments: investments.filter(inv => inv.isExited).length,
    averageCheckSize: totalInvested / investments.length,
    medianCheckSize,

    topQuartileThreshold: 0.25, // 25% IRR benchmark
    medianBenchmark: 0.15, // 15% IRR benchmark
    pmeRatio: 1.35, // Public Market Equivalent (vs S&P 500)
  };
}

