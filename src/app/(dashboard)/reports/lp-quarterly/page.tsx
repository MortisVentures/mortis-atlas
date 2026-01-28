"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DownloadIcon,
  EnvelopeClosedIcon,
  GearIcon,
  TriangleUpIcon,
  TriangleDownIcon,
  MinusIcon,
  CalendarIcon,
  RocketIcon,
  BarChartIcon,
  FileTextIcon,
  EyeOpenIcon,
  ArchiveIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import {
  BarChart,
  DonutChart,
  AreaChart,
} from "@tremor/react";

import { DistributionModal } from "@/components/reports/report-distribution";
import { downloadLPReportPDF } from "@/components/reports/lp-report-pdf";

import {
  SAMPLE_FUND_OVERVIEW,
  SAMPLE_PERFORMANCE,
  SAMPLE_BENCHMARKS,
  SAMPLE_PORTFOLIO,
  SAMPLE_QUARTERLY_ACTIVITY,
  SAMPLE_DEAL_ACTIVITY,
  SAMPLE_UPCOMING_EVENTS,
  SAMPLE_MARKET_COMMENTARY,
  DEFAULT_TEMPLATE,
  formatCurrency,
  formatPercent,
  formatMultiple,
  getQuartile,
  getQuartileColor,
  getStatusColor,
  getTrendIcon,
  getEventTypeConfig,
  getSectorTrendConfig,
  calculatePortfolioStats,
  generateReportPeriod,
  type PortfolioCompany,
  type ReportTemplate,
} from "@/lib/reports/lp-report";

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function LPQuarterlyReportPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [reportStatus, setReportStatus] = useState<"DRAFT" | "REVIEW" | "APPROVED" | "DISTRIBUTED">("DRAFT");
  const [showTemplateSettings, setShowTemplateSettings] = useState(false);
  const [showDistributionModal, setShowDistributionModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [template, setTemplate] = useState<ReportTemplate>(DEFAULT_TEMPLATE);
  const reportRef = useRef<HTMLDivElement>(null);

  const reportPeriod = generateReportPeriod();
  const portfolioStats = calculatePortfolioStats(SAMPLE_PORTFOLIO);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await downloadLPReportPDF(
        {
          fundOverview: SAMPLE_FUND_OVERVIEW,
          performance: SAMPLE_PERFORMANCE,
          benchmarks: SAMPLE_BENCHMARKS,
          portfolio: SAMPLE_PORTFOLIO,
          quarterlyActivity: SAMPLE_QUARTERLY_ACTIVITY,
          dealActivity: SAMPLE_DEAL_ACTIVITY,
          upcomingEvents: SAMPLE_UPCOMING_EVENTS,
          marketCommentary: SAMPLE_MARKET_COMMENTARY,
          reportPeriod,
        },
        `LP-Report-${reportPeriod.replace(" ", "-")}.pdf`
      );
    } catch (error) {
      console.error("Failed to export PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDistribute = (lpIds: string[], options: { includeDataRoom: boolean; customMessage: string; scheduleTime?: string }) => {
    console.log("Distributing to LPs:", lpIds, options);
    setReportStatus("DISTRIBUTED");
  };

  const statusConfig = {
    DRAFT: { label: "Draft", color: "bg-zinc-500/20 text-zinc-400" },
    REVIEW: { label: "In Review", color: "bg-amber-500/20 text-amber-400" },
    APPROVED: { label: "Approved", color: "bg-emerald-500/20 text-emerald-400" },
    DISTRIBUTED: { label: "Distributed", color: "bg-cyan-500/20 text-cyan-400" },
  };

  const sections = [
    { id: "overview", title: "Fund Overview", icon: FileTextIcon },
    { id: "performance", title: "Performance Summary", icon: BarChartIcon },
    { id: "portfolio", title: "Portfolio Update", icon: RocketIcon },
    { id: "activity", title: "Deal Activity", icon: BarChartIcon },
    { id: "events", title: "Upcoming Events", icon: CalendarIcon },
    { id: "market", title: "Market Commentary", icon: FileTextIcon },
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-zinc-800 p-4 flex flex-col">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">LP Report</h2>
          <p className="text-sm text-zinc-400">{reportPeriod}</p>
          <Badge className={`mt-2 ${statusConfig[reportStatus].color}`}>
            {statusConfig[reportStatus].label}
          </Badge>
        </div>

        {/* Section Navigation */}
        <nav className="flex-1 space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            const sectionConfig = template.sections.find(s => s.id === section.id);

            if (!sectionConfig?.enabled) return null;

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(isActive ? null : section.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "hover:bg-zinc-800 text-zinc-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.title}
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="space-y-2 pt-4 border-t border-zinc-800">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowTemplateSettings(true)}
          >
            <GearIcon className="w-4 h-4 mr-2" />
            Template Settings
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <EyeOpenIcon className="w-4 h-4 mr-2" />
            Preview PDF
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <UpdateIcon className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <DownloadIcon className="w-4 h-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>
          <Button
            className="w-full justify-start"
            onClick={() => setShowDistributionModal(true)}
          >
            <EnvelopeClosedIcon className="w-4 h-4 mr-2" />
            Distribute to LPs
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div ref={reportRef} className="p-8 max-w-5xl mx-auto space-y-8">
          {/* Report Header */}
          <ReportHeader
            fundName={SAMPLE_FUND_OVERVIEW.fundName}
            period={reportPeriod}
            status={reportStatus}
            onStatusChange={setReportStatus}
          />

          {/* Fund Overview Section */}
          <FundOverviewSection
            data={SAMPLE_FUND_OVERVIEW}
            isExpanded={activeSection === "overview" || activeSection === null}
          />

          {/* Performance Summary Section */}
          <PerformanceSummarySection
            performance={SAMPLE_PERFORMANCE}
            benchmarks={SAMPLE_BENCHMARKS}
            isExpanded={activeSection === "performance" || activeSection === null}
          />

          {/* Portfolio Update Section */}
          <PortfolioUpdateSection
            portfolio={SAMPLE_PORTFOLIO}
            activity={SAMPLE_QUARTERLY_ACTIVITY}
            stats={portfolioStats}
            isExpanded={activeSection === "portfolio" || activeSection === null}
          />

          {/* Deal Activity Section */}
          <DealActivitySection
            activity={SAMPLE_DEAL_ACTIVITY}
            isExpanded={activeSection === "activity" || activeSection === null}
          />

          {/* Upcoming Events Section */}
          <UpcomingEventsSection
            events={SAMPLE_UPCOMING_EVENTS}
            isExpanded={activeSection === "events" || activeSection === null}
          />

          {/* Market Commentary Section */}
          <MarketCommentarySection
            commentary={SAMPLE_MARKET_COMMENTARY}
            isExpanded={activeSection === "market" || activeSection === null}
          />

          {/* Report Footer */}
          <ReportFooter />
        </div>
      </div>

      {/* Template Settings Modal */}
      <TemplateSettingsModal
        isOpen={showTemplateSettings}
        onClose={() => setShowTemplateSettings(false)}
        template={template}
        onSave={setTemplate}
      />

      {/* Distribution Modal */}
      <DistributionModal
        isOpen={showDistributionModal}
        onClose={() => setShowDistributionModal(false)}
        reportPeriod={reportPeriod}
        onDistribute={handleDistribute}
      />
    </div>
  );
}

// =============================================================================
// REPORT HEADER
// =============================================================================

interface ReportHeaderProps {
  fundName: string;
  period: string;
  status: "DRAFT" | "REVIEW" | "APPROVED" | "DISTRIBUTED";
  onStatusChange: (status: "DRAFT" | "REVIEW" | "APPROVED" | "DISTRIBUTED") => void;
}

function ReportHeader({ fundName, period, status, onStatusChange }: ReportHeaderProps) {
  return (
    <div className="flex items-start justify-between pb-6 border-b border-zinc-800">
      <div>
        <div className="flex items-center gap-3 mb-2">
          {/* Logo placeholder */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-xl font-bold">
            M
          </div>
          <div>
            <h1 className="text-2xl font-bold">{fundName}</h1>
            <p className="text-zinc-400">Quarterly Report - {period}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as typeof status)}
          className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="DRAFT">Draft</option>
          <option value="REVIEW">In Review</option>
          <option value="APPROVED">Approved</option>
          <option value="DISTRIBUTED">Distributed</option>
        </select>
        <Button variant="outline" size="sm">
          <ArchiveIcon className="w-4 h-4 mr-1" />
          Archive
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// FUND OVERVIEW SECTION
// =============================================================================

interface FundOverviewSectionProps {
  data: typeof SAMPLE_FUND_OVERVIEW;
  isExpanded: boolean;
}

function FundOverviewSection({ data, isExpanded }: FundOverviewSectionProps) {
  const capitalCalledPercent = data.capitalCalled / data.capitalCommitted;

  return (
    <SectionWrapper title="Fund Overview" id="overview" isExpanded={isExpanded}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricBox
          label="Fund Size"
          value={formatCurrency(data.fundSize)}
          sublabel={`Vintage ${data.vintage}`}
        />
        <MetricBox
          label="Capital Called"
          value={formatCurrency(data.capitalCalled)}
          sublabel={`${formatPercent(capitalCalledPercent)} of committed`}
        />
        <MetricBox
          label="Distributions"
          value={formatCurrency(data.distributionsToDate)}
          sublabel="To date"
        />
        <MetricBox
          label="NAV"
          value={formatCurrency(data.nav)}
          sublabel="Net Asset Value"
        />
      </div>

      <Card variant="raised" className="p-4">
        <h4 className="text-sm font-medium text-zinc-400 mb-4">Capital Deployment</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Called vs. Committed</span>
              <span>{formatPercent(capitalCalledPercent)}</span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${capitalCalledPercent * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
            <div>
              <p className="text-xs text-zinc-500">Management Fee</p>
              <p className="text-lg font-semibold">{formatPercent(data.managementFee)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Carried Interest</p>
              <p className="text-lg font-semibold">{formatPercent(data.carriedInterest)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Investment Period End</p>
              <p className="text-lg font-semibold">
                {data.investmentPeriodEnd
                  ? new Date(data.investmentPeriodEnd).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </SectionWrapper>
  );
}

// =============================================================================
// PERFORMANCE SUMMARY SECTION
// =============================================================================

interface PerformanceSummaryProps {
  performance: typeof SAMPLE_PERFORMANCE;
  benchmarks: typeof SAMPLE_BENCHMARKS;
  isExpanded: boolean;
}

function PerformanceSummarySection({ performance, benchmarks, isExpanded }: PerformanceSummaryProps) {
  const irrComparisonData = benchmarks.map(b => ({
    name: b.benchmark.split(" ").slice(0, 2).join(" "),
    "Fund IRR": performance.netIRR * 100,
    "Benchmark IRR": b.benchmarkIRR * 100,
  }));

  return (
    <SectionWrapper title="Performance Summary" id="performance" isExpanded={isExpanded}>
      {/* Key Metrics */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
        <MetricBox
          label="Gross IRR"
          value={formatPercent(performance.grossIRR)}
          variant="highlight"
        />
        <MetricBox
          label="Net IRR"
          value={formatPercent(performance.netIRR)}
          variant="highlight"
        />
        <MetricBox
          label="Gross MOIC"
          value={formatMultiple(performance.grossMOIC)}
        />
        <MetricBox
          label="Net MOIC"
          value={formatMultiple(performance.netMOIC)}
        />
        <MetricBox
          label="TVPI"
          value={formatMultiple(performance.tvpi)}
        />
        <MetricBox
          label="DPI"
          value={formatMultiple(performance.dpi)}
        />
      </div>

      {/* Value Bridge */}
      <Card variant="raised" className="p-4 mb-6">
        <h4 className="text-sm font-medium text-zinc-400 mb-4">Value Attribution</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-zinc-900/50 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Paid-In Capital</p>
            <p className="text-xl font-bold">{formatCurrency(performance.paidInCapital)}</p>
          </div>
          <div className="text-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
            <p className="text-xs text-emerald-400 mb-1">Realized Value</p>
            <p className="text-xl font-bold text-emerald-400">{formatCurrency(performance.realizedValue)}</p>
          </div>
          <div className="text-center p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
            <p className="text-xs text-cyan-400 mb-1">Unrealized Value</p>
            <p className="text-xl font-bold text-cyan-400">{formatCurrency(performance.unrealizedValue)}</p>
          </div>
        </div>
      </Card>

      {/* Benchmark Comparison */}
      <Card variant="raised" className="p-4">
        <h4 className="text-sm font-medium text-zinc-400 mb-4">Benchmark Comparison</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 px-3 text-sm font-medium text-zinc-500">Benchmark</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-zinc-500">Benchmark IRR</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-zinc-500">Fund IRR</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-zinc-500">Outperformance</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-zinc-500">Quartile</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((benchmark) => (
                <tr key={benchmark.benchmark} className="border-b border-zinc-800/50">
                  <td className="py-3 px-3 text-sm">{benchmark.benchmark}</td>
                  <td className="py-3 px-3 text-right text-sm text-zinc-400">
                    {formatPercent(benchmark.benchmarkIRR)}
                  </td>
                  <td className="py-3 px-3 text-right text-sm font-medium">
                    {formatPercent(performance.netIRR)}
                  </td>
                  <td className="py-3 px-3 text-right text-sm text-emerald-400">
                    +{formatPercent(benchmark.fundOutperformanceIRR)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Badge className={getQuartileColor(benchmark.quartile)}>
                      {getQuartile(benchmark.quartile)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <BarChart
            data={irrComparisonData}
            index="name"
            categories={["Fund IRR", "Benchmark IRR"]}
            colors={["cyan", "slate"]}
            valueFormatter={(v) => `${v.toFixed(1)}%`}
            yAxisWidth={50}
            className="h-48"
          />
        </div>
      </Card>
    </SectionWrapper>
  );
}

// =============================================================================
// PORTFOLIO UPDATE SECTION
// =============================================================================

interface PortfolioUpdateSectionProps {
  portfolio: PortfolioCompany[];
  activity: typeof SAMPLE_QUARTERLY_ACTIVITY;
  stats: ReturnType<typeof calculatePortfolioStats>;
  isExpanded: boolean;
}

function PortfolioUpdateSection({ portfolio, activity, stats, isExpanded }: PortfolioUpdateSectionProps) {
  const [showAllCompanies, setShowAllCompanies] = useState(false);

  const portfolioValueData = portfolio
    .filter(p => p.status === "ACTIVE")
    .sort((a, b) => b.currentValue - a.currentValue)
    .map(p => ({
      name: p.name,
      value: p.currentValue / 1000000,
    }));

  return (
    <SectionWrapper title="Portfolio Update" id="portfolio" isExpanded={isExpanded}>
      {/* Portfolio Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <MetricBox label="Active Companies" value={stats.activeCompanies.toString()} />
        <MetricBox label="Realized" value={stats.realizedCompanies.toString()} />
        <MetricBox label="Written Off" value={stats.writtenOff.toString()} />
        <MetricBox label="Total Invested" value={formatCurrency(stats.totalInvested)} />
        <MetricBox label="Current Value" value={formatCurrency(stats.totalValue)} variant="highlight" />
      </div>

      {/* Quarterly Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* New Investments */}
        {activity.newInvestments.length > 0 && (
          <Card variant="raised" className="p-4">
            <h4 className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
              <TriangleUpIcon className="w-4 h-4" />
              New Investments ({activity.newInvestments.length})
            </h4>
            <div className="space-y-2">
              {activity.newInvestments.map((inv) => (
                <div key={inv.companyName} className="p-2 bg-zinc-900/50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{inv.companyName}</p>
                      <p className="text-xs text-zinc-500">{inv.round} - {inv.sector}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(inv.amount)}</p>
                      <p className="text-xs text-zinc-500">{formatPercent(inv.ownership / 100)} ownership</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Markups */}
        {activity.markups.length > 0 && (
          <Card variant="raised" className="p-4">
            <h4 className="text-sm font-medium text-cyan-400 mb-3 flex items-center gap-2">
              <TriangleUpIcon className="w-4 h-4" />
              Markups ({activity.markups.length})
            </h4>
            <div className="space-y-2">
              {activity.markups.map((markup) => (
                <div key={markup.companyName} className="p-2 bg-zinc-900/50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">{markup.companyName}</p>
                    <span className="text-emerald-400 text-sm font-medium">
                      +{formatPercent(markup.percentageChange)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{markup.reason}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Markdowns */}
        {activity.markdowns.length > 0 && (
          <Card variant="raised" className="p-4">
            <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
              <TriangleDownIcon className="w-4 h-4" />
              Markdowns ({activity.markdowns.length})
            </h4>
            <div className="space-y-2">
              {activity.markdowns.map((markdown) => (
                <div key={markdown.companyName} className="p-2 bg-zinc-900/50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">{markdown.companyName}</p>
                    <span className="text-red-400 text-sm font-medium">
                      {formatPercent(markdown.percentageChange)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{markdown.reason}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Exits */}
      {activity.exits.length > 0 && (
        <Card variant="raised" className="p-4 mb-6">
          <h4 className="text-sm font-medium text-zinc-400 mb-3">Exits This Quarter</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 px-3 text-sm font-medium text-zinc-500">Company</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-zinc-500">Exit Type</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-zinc-500">Proceeds</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-zinc-500">MOIC</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-zinc-500">IRR</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-zinc-500">Hold Period</th>
                </tr>
              </thead>
              <tbody>
                {activity.exits.map((exit) => (
                  <tr key={exit.companyName} className="border-b border-zinc-800/50">
                    <td className="py-3 px-3 font-medium">{exit.companyName}</td>
                    <td className="py-3 px-3">
                      <Badge variant="outline">{exit.exitType}</Badge>
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-medium">
                      {formatCurrency(exit.proceeds)}
                    </td>
                    <td className="py-3 px-3 text-right">{formatMultiple(exit.moic)}</td>
                    <td className="py-3 px-3 text-right">{formatPercent(exit.irr)}</td>
                    <td className="py-3 px-3 text-right text-zinc-400">
                      {Math.round(exit.holdingPeriod / 12 * 10) / 10} years
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Full Portfolio Table */}
      <Card variant="raised" className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium text-zinc-400">Portfolio Companies</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllCompanies(!showAllCompanies)}
          >
            {showAllCompanies ? "Show Less" : "Show All"}
            <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform ${showAllCompanies ? "rotate-180" : ""}`} />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 px-3 text-sm font-medium text-zinc-500">Company</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-zinc-500">Sector</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-zinc-500">Invested</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-zinc-500">Value</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-zinc-500">MOIC</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-zinc-500">QoQ Change</th>
                <th className="text-center py-2 px-3 text-sm font-medium text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {(showAllCompanies ? portfolio : portfolio.slice(0, 5)).map((company) => {
                const trend = getTrendIcon(company.valuationChange);
                return (
                  <tr key={company.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/30">
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-xs text-zinc-500">{company.stage}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm text-zinc-400">{company.sector}</td>
                    <td className="py-3 px-3 text-right text-sm">{formatCurrency(company.totalInvested)}</td>
                    <td className="py-3 px-3 text-right text-sm font-medium">{formatCurrency(company.currentValue)}</td>
                    <td className="py-3 px-3 text-right text-sm">
                      <span className={company.moic >= 2 ? "text-emerald-400" : company.moic >= 1 ? "text-zinc-300" : "text-red-400"}>
                        {formatMultiple(company.moic)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-sm">
                      <span className={`flex items-center justify-end gap-1 ${
                        trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-zinc-400"
                      }`}>
                        {trend === "up" && <TriangleUpIcon className="w-3 h-3" />}
                        {trend === "down" && <TriangleDownIcon className="w-3 h-3" />}
                        {trend === "flat" && <MinusIcon className="w-3 h-3" />}
                        {company.valuationChange !== 0 && formatPercent(Math.abs(company.valuationChange))}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge className={getStatusColor(company.status)} variant="outline">
                        {company.status.replace("_", " ")}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Portfolio Value Chart */}
        <div className="mt-6 pt-4 border-t border-zinc-800">
          <h5 className="text-xs font-medium text-zinc-500 mb-3">Portfolio Value Distribution ($M)</h5>
          <DonutChart
            data={portfolioValueData}
            category="value"
            index="name"
            valueFormatter={(v) => `$${v.toFixed(1)}M`}
            colors={["cyan", "emerald", "violet", "amber", "blue", "rose"]}
            className="h-64"
          />
        </div>
      </Card>
    </SectionWrapper>
  );
}

// =============================================================================
// DEAL ACTIVITY SECTION
// =============================================================================

interface DealActivitySectionProps {
  activity: typeof SAMPLE_DEAL_ACTIVITY;
  isExpanded: boolean;
}

function DealActivitySection({ activity, isExpanded }: DealActivitySectionProps) {
  const pipelineData = activity.pipeline.map(p => ({
    name: p.stage,
    "Deals": p.count,
  }));

  return (
    <SectionWrapper title="Deal Activity" id="activity" isExpanded={isExpanded}>
      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricBox label="Companies Reviewed" value={activity.companiesReviewed.toString()} />
        <MetricBox label="IC Presentations" value={activity.icPresentations.toString()} />
        <MetricBox label="Term Sheets Issued" value={activity.termSheetsIssued.toString()} />
        <MetricBox label="Deals Closed" value={activity.dealsClosed.toString()} variant="highlight" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deal Funnel */}
        <Card variant="raised" className="p-4">
          <h4 className="text-sm font-medium text-zinc-400 mb-4">Deal Funnel</h4>
          <AreaChart
            data={pipelineData}
            index="name"
            categories={["Deals"]}
            colors={["cyan"]}
            valueFormatter={(v) => v.toString()}
            className="h-48"
            showLegend={false}
          />
          <p className="text-xs text-zinc-500 mt-2 text-center">
            Pass Rate: {formatPercent(activity.passRate)}
          </p>
        </Card>

        {/* Top Sectors */}
        <Card variant="raised" className="p-4">
          <h4 className="text-sm font-medium text-zinc-400 mb-4">Deal Flow by Sector</h4>
          <div className="space-y-3">
            {activity.topSectors.map((sector, index) => {
              const maxCount = activity.topSectors[0].count;
              const percentage = (sector.count / maxCount) * 100;
              return (
                <div key={sector.sector}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{sector.sector}</span>
                    <span className="text-zinc-400">{sector.count} deals</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="h-full bg-cyan-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Additional Stats */}
      <Card variant="raised" className="p-4 mt-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-zinc-500 mb-1">Average Check Size</p>
            <p className="text-xl font-bold">{formatCurrency(activity.avgCheckSize)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Conversion Rate (Reviewed to Closed)</p>
            <p className="text-xl font-bold">
              {formatPercent(activity.dealsClosed / activity.companiesReviewed)}
            </p>
          </div>
        </div>
      </Card>
    </SectionWrapper>
  );
}

// =============================================================================
// UPCOMING EVENTS SECTION
// =============================================================================

interface UpcomingEventsSectionProps {
  events: typeof SAMPLE_UPCOMING_EVENTS;
  isExpanded: boolean;
}

function UpcomingEventsSection({ events, isExpanded }: UpcomingEventsSectionProps) {
  return (
    <SectionWrapper title="Upcoming Events" id="events" isExpanded={isExpanded}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event) => {
          const config = getEventTypeConfig(event.type);
          return (
            <Card key={event.id} variant="raised" className="p-4">
              <div className="flex items-start justify-between mb-2">
                <Badge className={config.color}>{config.label}</Badge>
                <span className="text-xs text-zinc-500">{event.expectedDate}</span>
              </div>
              <h4 className="font-medium mb-1">{event.companyName}</h4>
              <p className="text-sm text-zinc-400 mb-2">{event.description}</p>
              {event.potentialValue && (
                <p className="text-sm">
                  <span className="text-zinc-500">Potential Value: </span>
                  <span className="text-emerald-400 font-medium">{formatCurrency(event.potentialValue)}</span>
                </p>
              )}
              {event.probability && (
                <p className="text-sm">
                  <span className="text-zinc-500">Probability: </span>
                  <span className="font-medium">{formatPercent(event.probability)}</span>
                </p>
              )}
              {event.notes && (
                <p className="text-xs text-zinc-500 mt-2 italic">{event.notes}</p>
              )}
            </Card>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

// =============================================================================
// MARKET COMMENTARY SECTION
// =============================================================================

interface MarketCommentarySectionProps {
  commentary: typeof SAMPLE_MARKET_COMMENTARY;
  isExpanded: boolean;
}

function MarketCommentarySection({ commentary, isExpanded }: MarketCommentarySectionProps) {
  return (
    <SectionWrapper title="Market Commentary" id="market" isExpanded={isExpanded}>
      {/* Summary */}
      <Card variant="raised" className="p-4 mb-6">
        <h4 className="text-sm font-medium text-zinc-400 mb-2">Executive Summary</h4>
        <p className="text-sm leading-relaxed">{commentary.summary}</p>
      </Card>

      {/* Sector Trends */}
      <Card variant="raised" className="p-4 mb-6">
        <h4 className="text-sm font-medium text-zinc-400 mb-4">Sector Trends</h4>
        <div className="space-y-4">
          {commentary.sectorTrends.map((sector) => {
            const config = getSectorTrendConfig(sector.trend);
            return (
              <div key={sector.sector} className="p-3 bg-zinc-900/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{sector.sector}</span>
                  <span className={`flex items-center gap-1 text-sm ${config.color}`}>
                    {config.icon === "up" && <TriangleUpIcon className="w-3 h-3" />}
                    {config.icon === "down" && <TriangleDownIcon className="w-3 h-3" />}
                    {config.icon === "flat" && <MinusIcon className="w-3 h-3" />}
                    {config.label}
                  </span>
                </div>
                <p className="text-sm text-zinc-400">{sector.commentary}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Competitive Landscape */}
      <Card variant="raised" className="p-4 mb-6">
        <h4 className="text-sm font-medium text-zinc-400 mb-2">Competitive Landscape</h4>
        <p className="text-sm leading-relaxed">{commentary.competitiveLandscape}</p>
      </Card>

      {/* Regulatory Updates */}
      <Card variant="raised" className="p-4 mb-6">
        <h4 className="text-sm font-medium text-zinc-400 mb-3">Regulatory Updates</h4>
        <ul className="space-y-2">
          {commentary.regulatoryUpdates.map((update, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <ChevronRightIcon className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
              <span>{update}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Outlook */}
      <Card variant="raised" className="p-4">
        <h4 className="text-sm font-medium text-zinc-400 mb-2">Outlook</h4>
        <p className="text-sm leading-relaxed">{commentary.outlook}</p>
      </Card>
    </SectionWrapper>
  );
}

// =============================================================================
// REPORT FOOTER
// =============================================================================

function ReportFooter() {
  return (
    <div className="pt-8 border-t border-zinc-800 text-center">
      <p className="text-sm text-zinc-500">
        This report is confidential and intended solely for the use of limited partners of Mortis Ventures Fund I.
      </p>
      <p className="text-xs text-zinc-600 mt-2">
        Generated on {new Date().toLocaleDateString()} | Mortis Ventures
      </p>
    </div>
  );
}

// =============================================================================
// TEMPLATE SETTINGS MODAL
// =============================================================================

interface TemplateSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: ReportTemplate;
  onSave: (template: ReportTemplate) => void;
}

function TemplateSettingsModal({ isOpen, onClose, template, onSave }: TemplateSettingsModalProps) {
  const [localTemplate, setLocalTemplate] = useState(template);

  if (!isOpen) return null;

  const toggleSection = (sectionId: string) => {
    setLocalTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, enabled: !s.enabled } : s
      ),
    }));
  };

  const handleSave = () => {
    onSave(localTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md"
      >
        <h3 className="text-lg font-semibold mb-4">Report Template Settings</h3>

        {/* Sections Toggle */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-zinc-400 mb-3">Report Sections</h4>
          <div className="space-y-2">
            {localTemplate.sections.map((section) => (
              <label
                key={section.id}
                className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800"
              >
                <span className="text-sm">{section.title}</span>
                <input
                  type="checkbox"
                  checked={section.enabled}
                  onChange={() => toggleSection(section.id)}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-cyan-500 focus:ring-cyan-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Brand Colors */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-zinc-400 mb-3">Brand Colors</h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Primary</label>
              <input
                type="color"
                value={localTemplate.brandColors.primary}
                onChange={(e) => setLocalTemplate(prev => ({
                  ...prev,
                  brandColors: { ...prev.brandColors, primary: e.target.value }
                }))}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Secondary</label>
              <input
                type="color"
                value={localTemplate.brandColors.secondary}
                onChange={(e) => setLocalTemplate(prev => ({
                  ...prev,
                  brandColors: { ...prev.brandColors, secondary: e.target.value }
                }))}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Accent</label>
              <input
                type="color"
                value={localTemplate.brandColors.accent}
                onChange={(e) => setLocalTemplate(prev => ({
                  ...prev,
                  brandColors: { ...prev.brandColors, accent: e.target.value }
                }))}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Template</Button>
        </div>
      </motion.div>
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

interface SectionWrapperProps {
  title: string;
  id: string;
  isExpanded: boolean;
  children: React.ReactNode;
}

function SectionWrapper({ title, id, isExpanded, children }: SectionWrapperProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="scroll-mt-8"
    >
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-cyan-500 rounded-full" />
        {title}
      </h2>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

interface MetricBoxProps {
  label: string;
  value: string;
  sublabel?: string;
  variant?: "default" | "highlight";
}

function MetricBox({ label, value, sublabel, variant = "default" }: MetricBoxProps) {
  return (
    <Card
      variant="raised"
      className={`p-4 ${variant === "highlight" ? "border-cyan-500/30 bg-cyan-500/5" : ""}`}
    >
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${variant === "highlight" ? "text-cyan-400" : ""}`}>
        {value}
      </p>
      {sublabel && <p className="text-xs text-zinc-500 mt-1">{sublabel}</p>}
    </Card>
  );
}
