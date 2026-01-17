"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";
import {
  FundOverview,
  PerformanceMetrics,
  BenchmarkComparison,
  PortfolioCompany,
  QuarterlyActivity,
  DealActivity,
  UpcomingEvent,
  MarketCommentary,
  formatCurrency,
  formatPercent,
  formatMultiple,
  getQuartile,
} from "@/lib/reports/lp-report";

// =============================================================================
// PDF STYLES
// =============================================================================

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1f2937",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#06b6d4",
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: "#06b6d4",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 20,
    marginBottom: 12,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#06b6d4",
  },
  sectionContent: {
    marginBottom: 15,
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  metricBox: {
    width: "25%",
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
  },
  metricSublabel: {
    fontSize: 7,
    color: "#94a3b8",
    marginTop: 2,
  },
  highlightBox: {
    backgroundColor: "#ecfeff",
    borderWidth: 1,
    borderColor: "#06b6d4",
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#475569",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tableCell: {
    fontSize: 9,
    color: "#374151",
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#374151",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 7,
    fontWeight: "bold",
  },
  badgeGreen: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  badgeRed: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  badgeBlue: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    marginTop: 4,
  },
  progressFill: {
    height: 8,
    backgroundColor: "#06b6d4",
    borderRadius: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#94a3b8",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 40,
    fontSize: 8,
    color: "#94a3b8",
  },
  twoColumn: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    width: "48%",
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  listBullet: {
    width: 10,
    fontSize: 10,
    color: "#06b6d4",
  },
  listText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
  },
});

// =============================================================================
// PDF DOCUMENT COMPONENT
// =============================================================================

interface LPReportPDFProps {
  fundOverview: FundOverview;
  performance: PerformanceMetrics;
  benchmarks: BenchmarkComparison[];
  portfolio: PortfolioCompany[];
  quarterlyActivity: QuarterlyActivity;
  dealActivity: DealActivity;
  upcomingEvents: UpcomingEvent[];
  marketCommentary: MarketCommentary;
  reportPeriod: string;
}

export function LPReportPDF({
  fundOverview,
  performance,
  benchmarks,
  portfolio,
  quarterlyActivity,
  dealActivity,
  upcomingEvents,
  marketCommentary,
  reportPeriod,
}: LPReportPDFProps) {
  const capitalCalledPercent = fundOverview.capitalCalled / fundOverview.capitalCommitted;

  return (
    <Document>
      {/* Page 1: Overview & Performance */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>M</Text>
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.headerTitle}>{fundOverview.fundName}</Text>
              <Text style={styles.headerSubtitle}>Quarterly Report - {reportPeriod}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={{ fontSize: 8, color: "#64748b" }}>CONFIDENTIAL</Text>
          </View>
        </View>

        {/* Fund Overview */}
        <Text style={styles.sectionTitle}>Fund Overview</Text>
        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Fund Size</Text>
            <Text style={styles.metricValue}>{formatCurrency(fundOverview.fundSize)}</Text>
            <Text style={styles.metricSublabel}>Vintage {fundOverview.vintage}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Capital Called</Text>
            <Text style={styles.metricValue}>{formatCurrency(fundOverview.capitalCalled)}</Text>
            <Text style={styles.metricSublabel}>{formatPercent(capitalCalledPercent)} of committed</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Distributions</Text>
            <Text style={styles.metricValue}>{formatCurrency(fundOverview.distributionsToDate)}</Text>
            <Text style={styles.metricSublabel}>To date</Text>
          </View>
          <View style={[styles.metricBox, styles.highlightBox]}>
            <Text style={styles.metricLabel}>NAV</Text>
            <Text style={[styles.metricValue, { color: "#0891b2" }]}>{formatCurrency(fundOverview.nav)}</Text>
            <Text style={styles.metricSublabel}>Net Asset Value</Text>
          </View>
        </View>

        {/* Capital Deployment Bar */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Capital Deployment</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${capitalCalledPercent * 100}%` }]} />
          </View>
          <Text style={{ fontSize: 8, color: "#64748b", marginTop: 4 }}>
            {formatPercent(capitalCalledPercent)} called of {formatCurrency(fundOverview.capitalCommitted)} committed
          </Text>
        </View>

        {/* Performance Summary */}
        <Text style={styles.sectionTitle}>Performance Summary</Text>
        <View style={styles.metricsRow}>
          <View style={[styles.metricBox, styles.highlightBox]}>
            <Text style={styles.metricLabel}>Gross IRR</Text>
            <Text style={[styles.metricValue, { color: "#0891b2" }]}>{formatPercent(performance.grossIRR)}</Text>
          </View>
          <View style={[styles.metricBox, styles.highlightBox]}>
            <Text style={styles.metricLabel}>Net IRR</Text>
            <Text style={[styles.metricValue, { color: "#0891b2" }]}>{formatPercent(performance.netIRR)}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>TVPI</Text>
            <Text style={styles.metricValue}>{formatMultiple(performance.tvpi)}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>DPI</Text>
            <Text style={styles.metricValue}>{formatMultiple(performance.dpi)}</Text>
          </View>
        </View>

        {/* Benchmark Comparison */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: "35%" }]}>Benchmark</Text>
            <Text style={[styles.tableHeaderCell, { width: "20%", textAlign: "right" }]}>Benchmark IRR</Text>
            <Text style={[styles.tableHeaderCell, { width: "20%", textAlign: "right" }]}>Fund IRR</Text>
            <Text style={[styles.tableHeaderCell, { width: "25%", textAlign: "right" }]}>Quartile</Text>
          </View>
          {benchmarks.map((b, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: "35%" }]}>{b.benchmark}</Text>
              <Text style={[styles.tableCell, { width: "20%", textAlign: "right" }]}>{formatPercent(b.benchmarkIRR)}</Text>
              <Text style={[styles.tableCell, { width: "20%", textAlign: "right", fontWeight: "bold" }]}>{formatPercent(performance.netIRR)}</Text>
              <Text style={[styles.tableCell, { width: "25%", textAlign: "right", color: "#059669" }]}>{getQuartile(b.quartile)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Confidential - For Limited Partners Only</Text>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} />
      </Page>

      {/* Page 2: Portfolio Update */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Portfolio Update</Text>

        {/* Portfolio Summary Stats */}
        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Active Companies</Text>
            <Text style={styles.metricValue}>{portfolio.filter(p => p.status === "ACTIVE").length}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Realized</Text>
            <Text style={styles.metricValue}>{portfolio.filter(p => p.status === "REALIZED").length}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Total Invested</Text>
            <Text style={styles.metricValue}>{formatCurrency(portfolio.reduce((s, p) => s + p.totalInvested, 0))}</Text>
          </View>
          <View style={[styles.metricBox, styles.highlightBox]}>
            <Text style={styles.metricLabel}>Current Value</Text>
            <Text style={[styles.metricValue, { color: "#0891b2" }]}>{formatCurrency(portfolio.reduce((s, p) => s + p.currentValue, 0))}</Text>
          </View>
        </View>

        {/* New Investments */}
        {quarterlyActivity.newInvestments.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>New Investments This Quarter</Text>
            {quarterlyActivity.newInvestments.map((inv, i) => (
              <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <View>
                  <Text style={{ fontSize: 9, fontWeight: "bold" }}>{inv.companyName}</Text>
                  <Text style={{ fontSize: 8, color: "#64748b" }}>{inv.round} - {inv.sector}</Text>
                </View>
                <Text style={{ fontSize: 9, fontWeight: "bold" }}>{formatCurrency(inv.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Exits */}
        {quarterlyActivity.exits.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Exits This Quarter</Text>
            {quarterlyActivity.exits.map((exit, i) => (
              <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <View>
                  <Text style={{ fontSize: 9, fontWeight: "bold" }}>{exit.companyName}</Text>
                  <Text style={{ fontSize: 8, color: "#64748b" }}>{exit.exitType}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontSize: 9, fontWeight: "bold", color: "#059669" }}>{formatCurrency(exit.proceeds)}</Text>
                  <Text style={{ fontSize: 8, color: "#64748b" }}>{formatMultiple(exit.moic)} MOIC</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Portfolio Companies Table */}
        <Text style={{ fontSize: 10, fontWeight: "bold", marginTop: 15, marginBottom: 8 }}>Portfolio Companies</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: "25%" }]}>Company</Text>
            <Text style={[styles.tableHeaderCell, { width: "15%" }]}>Sector</Text>
            <Text style={[styles.tableHeaderCell, { width: "15%", textAlign: "right" }]}>Invested</Text>
            <Text style={[styles.tableHeaderCell, { width: "15%", textAlign: "right" }]}>Value</Text>
            <Text style={[styles.tableHeaderCell, { width: "15%", textAlign: "right" }]}>MOIC</Text>
            <Text style={[styles.tableHeaderCell, { width: "15%", textAlign: "center" }]}>Status</Text>
          </View>
          {portfolio.slice(0, 10).map((company, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: "25%" }]}>{company.name}</Text>
              <Text style={[styles.tableCell, { width: "15%", fontSize: 8 }]}>{company.sector}</Text>
              <Text style={[styles.tableCell, { width: "15%", textAlign: "right" }]}>{formatCurrency(company.totalInvested)}</Text>
              <Text style={[styles.tableCell, { width: "15%", textAlign: "right" }]}>{formatCurrency(company.currentValue)}</Text>
              <Text style={[styles.tableCell, { width: "15%", textAlign: "right", color: company.moic >= 2 ? "#059669" : "#374151" }]}>
                {formatMultiple(company.moic)}
              </Text>
              <Text style={[styles.tableCell, { width: "15%", textAlign: "center", fontSize: 7 }]}>{company.status}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Confidential - For Limited Partners Only</Text>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} />
      </Page>

      {/* Page 3: Deal Activity & Events */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Deal Activity</Text>

        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Companies Reviewed</Text>
            <Text style={styles.metricValue}>{dealActivity.companiesReviewed}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>IC Presentations</Text>
            <Text style={styles.metricValue}>{dealActivity.icPresentations}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Term Sheets</Text>
            <Text style={styles.metricValue}>{dealActivity.termSheetsIssued}</Text>
          </View>
          <View style={[styles.metricBox, styles.highlightBox]}>
            <Text style={styles.metricLabel}>Deals Closed</Text>
            <Text style={[styles.metricValue, { color: "#0891b2" }]}>{dealActivity.dealsClosed}</Text>
          </View>
        </View>

        {/* Top Sectors */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Deal Flow by Sector</Text>
          {dealActivity.topSectors.slice(0, 5).map((sector, i) => (
            <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ fontSize: 9 }}>{sector.sector}</Text>
              <Text style={{ fontSize: 9, color: "#64748b" }}>{sector.count} deals</Text>
            </View>
          ))}
        </View>

        {/* Upcoming Events */}
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        {upcomingEvents.slice(0, 6).map((event, i) => (
          <View key={i} style={[styles.card, { marginBottom: 8 }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ fontSize: 8, color: "#0891b2", fontWeight: "bold" }}>{event.type}</Text>
              <Text style={{ fontSize: 8, color: "#64748b" }}>{event.expectedDate}</Text>
            </View>
            <Text style={{ fontSize: 9, fontWeight: "bold" }}>{event.companyName}</Text>
            <Text style={{ fontSize: 8, color: "#64748b", marginTop: 2 }}>{event.description}</Text>
            {event.potentialValue && (
              <Text style={{ fontSize: 8, color: "#059669", marginTop: 2 }}>
                Potential Value: {formatCurrency(event.potentialValue)}
              </Text>
            )}
          </View>
        ))}

        <Text style={styles.footer}>Confidential - For Limited Partners Only</Text>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} />
      </Page>

      {/* Page 4: Market Commentary */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Market Commentary</Text>

        {/* Executive Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Executive Summary</Text>
          <Text style={styles.paragraph}>{marketCommentary.summary}</Text>
        </View>

        {/* Sector Trends */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sector Trends</Text>
          {marketCommentary.sectorTrends.map((sector, i) => (
            <View key={i} style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                <Text style={{ fontSize: 9, fontWeight: "bold" }}>{sector.sector}</Text>
                <Text style={{
                  fontSize: 8,
                  color: sector.trend === "BULLISH" ? "#059669" : sector.trend === "BEARISH" ? "#dc2626" : "#d97706"
                }}>
                  {sector.trend}
                </Text>
              </View>
              <Text style={{ fontSize: 8, color: "#64748b" }}>{sector.commentary}</Text>
            </View>
          ))}
        </View>

        {/* Competitive Landscape */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Competitive Landscape</Text>
          <Text style={styles.paragraph}>{marketCommentary.competitiveLandscape}</Text>
        </View>

        {/* Regulatory Updates */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Regulatory Updates</Text>
          {marketCommentary.regulatoryUpdates.map((update, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.listBullet}>-</Text>
              <Text style={styles.listText}>{update}</Text>
            </View>
          ))}
        </View>

        {/* Outlook */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Outlook</Text>
          <Text style={styles.paragraph}>{marketCommentary.outlook}</Text>
        </View>

        {/* Final Footer */}
        <View style={{
          position: "absolute",
          bottom: 40,
          left: 40,
          right: 40,
          textAlign: "center",
          paddingTop: 15,
          borderTopWidth: 1,
          borderTopColor: "#e2e8f0",
        }}>
          <Text style={{ fontSize: 8, color: "#94a3b8", marginBottom: 4 }}>
            This report is confidential and intended solely for the use of limited partners of {fundOverview.fundName}.
          </Text>
          <Text style={{ fontSize: 7, color: "#94a3b8" }}>
            Generated on {new Date().toLocaleDateString()} | Mortis Ventures
          </Text>
        </View>

        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} />
      </Page>
    </Document>
  );
}

// =============================================================================
// PDF GENERATION UTILITY
// =============================================================================

export async function generateLPReportPDF(props: LPReportPDFProps): Promise<Blob> {
  const doc = <LPReportPDF {...props} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}

export async function downloadLPReportPDF(props: LPReportPDFProps, filename: string): Promise<void> {
  const blob = await generateLPReportPDF(props);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
