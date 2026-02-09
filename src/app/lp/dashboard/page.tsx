import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DashboardIcon,
  BarChartIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@radix-ui/react-icons";

async function getLPData(userId: string) {
  // Get LP profile with fund data
  const lpProfile = await prisma.lPProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  return { lpProfile };
}

export default async function LPDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { lpProfile } = await getLPData(session.user.id);

  // Calculate derived metrics
  const commitment = lpProfile?.commitmentAmount
    ? Number(lpProfile.commitmentAmount)
    : 0;
  const called = lpProfile?.calledCapital
    ? Number(lpProfile.calledCapital)
    : 0;
  const distributions = lpProfile?.distributions
    ? Number(lpProfile.distributions)
    : 0;
  const unfunded = commitment - called;
  const calledPercentage = commitment > 0 ? (called / commitment) * 100 : 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Welcome, {session.user.name?.split(" ")[0] || "Investor"}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Your investment overview and fund performance
        </p>
      </div>

      {/* Entity Info */}
      {lpProfile?.entityName && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Investing Entity</p>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {lpProfile.entityName}
                </p>
                {lpProfile.entityType && (
                  <p className="text-xs text-neutral-500">{lpProfile.entityType}</p>
                )}
              </div>
              <div className="flex gap-2">
                {lpProfile.kycVerified && (
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                    KYC Verified
                  </span>
                )}
                {lpProfile.accreditedInvestor && (
                  <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                    Accredited
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500 flex items-center gap-2">
              <DashboardIcon className="w-4 h-4" />
              Total Commitment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(commitment)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500 flex items-center gap-2">
              <ArrowDownIcon className="w-4 h-4" />
              Called Capital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(called)}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {calledPercentage.toFixed(1)}% of commitment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500 flex items-center gap-2">
              <ArrowUpIcon className="w-4 h-4" />
              Distributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(distributions)}
            </p>
            {called > 0 && (
              <p className="text-xs text-neutral-500 mt-1">
                DPI: {(distributions / called).toFixed(2)}x
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500 flex items-center gap-2">
              <BarChartIcon className="w-4 h-4" />
              Unfunded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(unfunded)}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Remaining commitment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <a href="/lp/reports">
            <CardContent className="py-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <BarChartIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  Quarterly Reports
                </p>
                <p className="text-sm text-neutral-500">
                  View fund performance and portfolio updates
                </p>
              </div>
            </CardContent>
          </a>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <a href="/lp/documents">
            <CardContent className="py-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <DashboardIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  Documents
                </p>
                <p className="text-sm text-neutral-500">
                  Access tax documents, agreements, and more
                </p>
              </div>
            </CardContent>
          </a>
        </Card>
      </div>

      {/* Notification Preferences */}
      {lpProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Email Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    lpProfile.quarterlyReportsEmail
                      ? "bg-green-500"
                      : "bg-neutral-300"
                  }`}
                />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Quarterly Reports
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    lpProfile.capitalCallsEmail
                      ? "bg-green-500"
                      : "bg-neutral-300"
                  }`}
                />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Capital Calls
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    lpProfile.taxDocumentsEmail
                      ? "bg-green-500"
                      : "bg-neutral-300"
                  }`}
                />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Tax Documents
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No LP Profile Message */}
      {!lpProfile && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-neutral-600 dark:text-neutral-400">
              Your LP profile is being set up. Please contact the fund
              administrator if you need immediate assistance.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
