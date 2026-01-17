import { Suspense } from "react";
import Link from "next/link";
import { getCompanies, getCompanyStats, getUniqueSectors } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CompanyStage } from "@prisma/client";
import { CompaniesFilters } from "@/components/companies-filters";

// Temporary user ID until auth is implemented
const TEMP_USER_ID = "temp-user-id";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    stage?: string;
    sector?: string;
    page?: string;
  }>;
}

// Stage badge colors - Bloomberg dark theme style
const stageBadgeColors: Record<CompanyStage, string> = {
  PROSPECT: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
  QUALIFIED: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  ENGAGED: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
  DUE_DILIGENCE: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  PASSED: "bg-red-500/20 text-red-300 border border-red-500/30",
  PORTFOLIO: "bg-green-500/20 text-green-300 border border-green-500/30",
  EXITED: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
};

const stageLabels: Record<CompanyStage, string> = {
  PROSPECT: "Prospect",
  QUALIFIED: "Qualified",
  ENGAGED: "Engaged",
  DUE_DILIGENCE: "Due Diligence",
  PASSED: "Passed",
  PORTFOLIO: "Portfolio",
  EXITED: "Exited",
};

// Loading skeleton for the table
function TableSkeleton() {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 border-b border-border">
        <div className="flex gap-8">
          {["Company", "Sector", "Stage", "Funding", "Location", "Updated"].map(
            (_, i) => (
              <div
                key={i}
                className="h-4 bg-muted rounded animate-pulse"
                style={{ width: `${60 + i * 10}px` }}
              />
            )
          )}
        </div>
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-4 py-4 border-b border-border last:border-0">
          <div className="flex gap-8 items-center">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Stats cards component
async function PipelineStats() {
  const stats = await getCompanyStats(TEMP_USER_ID);

  const statCards = [
    {
      label: "Total Companies",
      value: stats.total,
      color: "text-foreground",
    },
    {
      label: "Portfolio",
      value: stats.byStage.PORTFOLIO,
      color: "text-green-400",
    },
    {
      label: "Active Pipeline",
      value:
        stats.byStage.PROSPECT +
        stats.byStage.QUALIFIED +
        stats.byStage.ENGAGED +
        stats.byStage.DUE_DILIGENCE,
      color: "text-cyan-400",
    },
    {
      label: "Updated (7d)",
      value: stats.recentlyUpdated,
      color: "text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat) => (
        <Card
          key={stat.label}
          className="bg-card/50 border-border hover:bg-card/80 transition-colors"
        >
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              {stat.label}
            </div>
            <div className={`text-2xl font-mono font-bold mt-1 ${stat.color}`}>
              {stat.value.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Companies table component
async function CompaniesTable({
  search,
  stage,
  sector,
  page,
}: {
  search?: string;
  stage?: string;
  sector?: string;
  page?: number;
}) {
  const { data: companies, pagination } = await getCompanies(
    {
      userId: TEMP_USER_ID,
      search,
      stage: stage as CompanyStage | undefined,
      sector,
    },
    { page: page || 1, limit: 50 }
  );

  const hasFilters = search || stage || sector;

  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-lg">
        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d={hasFilters
                ? "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                : "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              }
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium">
          {hasFilters ? "No matching companies" : "No companies yet"}
        </h3>
        <p className="text-muted-foreground mt-1 mb-4 max-w-sm">
          {hasFilters
            ? "Try adjusting your search or filters to find what you're looking for"
            : "Start building your pipeline by adding your first company"
          }
        </p>
        {!hasFilters && (
          <Link href="/companies/new">
            <Button>Add Company</Button>
          </Link>
        )}
      </div>
    );
  }

  // Calculate total funding per company from deals
  const companiesWithFunding = companies.map((company) => {
    const totalFunding = company.deals.reduce((sum, deal) => {
      return sum + (deal.amount ? Number(deal.amount) : 0);
    }, 0);
    return { ...company, totalFunding };
  });

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="text-xs uppercase tracking-wider font-semibold">
              Company
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold">
              Sector
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold">
              Stage
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold text-right">
              Funding
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold">
              Location
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold">
              Updated
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companiesWithFunding.map((company) => (
            <TableRow
              key={company.id}
              className="hover:bg-muted/20 transition-colors"
            >
              <TableCell>
                <Link
                  href={`/companies/${company.id}`}
                  className="group block"
                >
                  <div className="font-medium group-hover:text-primary transition-colors">
                    {company.name}
                  </div>
                  {company.website && (
                    <div className="text-xs text-muted-foreground font-mono">
                      {company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </div>
                  )}
                </Link>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {company.sector || "—"}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${stageBadgeColors[company.stage]}`}
                >
                  {stageLabels[company.stage]}
                </span>
              </TableCell>
              <TableCell className="text-right font-mono">
                {company.totalFunding > 0 ? (
                  <span className="text-green-400">
                    ${(company.totalFunding / 1000000).toFixed(1)}M
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {company.location || "—"}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground font-mono">
                  {new Date(company.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "2-digit",
                  })}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Table footer with count */}
      <div className="px-4 py-3 border-t border-border bg-muted/20">
        <p className="text-xs text-muted-foreground">
          Showing {companies.length} of {pagination.total} companies
          {(search || stage || sector) && " (filtered)"}
        </p>
      </div>
    </div>
  );
}

// Filters wrapper to fetch sectors
async function FiltersWrapper() {
  const sectors = await getUniqueSectors(TEMP_USER_ID);
  return <CompaniesFilters sectors={sectors} />;
}

export default async function CompaniesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { search, stage, sector, page } = params;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your portfolio and pipeline companies
          </p>
        </div>
        <Link href="/companies/new">
          <Button className="gap-2">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Company
          </Button>
        </Link>
      </div>

      {/* Pipeline Stats */}
      <Suspense
        fallback={
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-card/50 border-border">
                <CardContent className="p-4">
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-16 bg-muted rounded animate-pulse mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <PipelineStats />
      </Suspense>

      {/* Filters */}
      <Suspense
        fallback={
          <div className="flex gap-4 mb-6">
            <div className="h-10 w-64 bg-muted rounded animate-pulse" />
            <div className="h-10 w-40 bg-muted rounded animate-pulse" />
            <div className="h-10 w-40 bg-muted rounded animate-pulse" />
          </div>
        }
      >
        <FiltersWrapper />
      </Suspense>

      {/* Companies Table */}
      <Suspense fallback={<TableSkeleton />}>
        <CompaniesTable
          search={search}
          stage={stage}
          sector={sector}
          page={page ? parseInt(page) : 1}
        />
      </Suspense>
    </div>
  );
}
