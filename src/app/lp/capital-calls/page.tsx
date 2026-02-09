import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarIcon,
  CheckCircledIcon,
  ClockIcon,
  ArrowDownIcon,
} from "@radix-ui/react-icons";

async function getLPCapitalData(userId: string) {
  // Get LP profile with fund data
  const lpProfile = await prisma.lPProfile.findUnique({
    where: { userId },
    select: {
      commitmentAmount: true,
      calledCapital: true,
    },
  });

  return { lpProfile };
}

export default async function LPCapitalCallsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { lpProfile } = await getLPCapitalData(session.user.id);

  const commitment = lpProfile?.commitmentAmount
    ? Number(lpProfile.commitmentAmount)
    : 0;
  const called = lpProfile?.calledCapital
    ? Number(lpProfile.calledCapital)
    : 0;
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

  // Mock capital call history - in production this would come from the database
  const capitalCallHistory = [
    {
      id: "1",
      callNumber: 1,
      date: new Date("2024-06-15"),
      dueDate: new Date("2024-07-01"),
      amount: commitment * 0.25,
      percentage: 25,
      status: "completed",
      purpose: "Initial drawdown for Fund I investments",
    },
    {
      id: "2",
      callNumber: 2,
      date: new Date("2024-09-10"),
      dueDate: new Date("2024-09-25"),
      amount: commitment * 0.15,
      percentage: 15,
      status: "completed",
      purpose: "Follow-on investments and fees",
    },
    {
      id: "3",
      callNumber: 3,
      date: new Date("2025-01-15"),
      dueDate: new Date("2025-02-01"),
      amount: commitment * 0.1,
      percentage: 10,
      status: "completed",
      purpose: "New investment opportunity",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Capital Calls
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Track your capital contributions and call history
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-neutral-500 mb-1">Total Commitment</p>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(commitment)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-neutral-500 mb-1">Capital Called</p>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(called)}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {calledPercentage.toFixed(1)}% of commitment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-neutral-500 mb-1">Remaining Unfunded</p>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(commitment - called)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Funding Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-blue-600 dark:text-blue-400">
                  {calledPercentage.toFixed(1)}% Called
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-neutral-600 dark:text-neutral-400">
                  {(100 - calledPercentage).toFixed(1)}% Remaining
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-3 text-xs flex rounded-full bg-neutral-200 dark:bg-neutral-700">
              <div
                style={{ width: `${calledPercentage}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 dark:bg-blue-500 transition-all duration-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capital Call History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Capital Call History</CardTitle>
        </CardHeader>
        <CardContent>
          {capitalCallHistory.length > 0 ? (
            <div className="space-y-4">
              {capitalCallHistory.map((call, index) => (
                <div
                  key={call.id}
                  className={`flex items-start gap-4 py-4 ${
                    index !== capitalCallHistory.length - 1
                      ? "border-b border-neutral-200 dark:border-neutral-700"
                      : ""
                  }`}
                >
                  <div className="flex-shrink-0">
                    {call.status === "completed" ? (
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <CheckCircledIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                    ) : call.status === "pending" ? (
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                        <ClockIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <ArrowDownIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        Capital Call #{call.callNumber}
                      </p>
                      <span
                        className={`text-sm px-2 py-0.5 rounded ${
                          call.status === "completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : call.status === "pending"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      {call.purpose}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        Called:{" "}
                        {call.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span>
                        Due:{" "}
                        {call.dueDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(call.amount)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {call.percentage}% of commitment
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-500">No capital calls yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wire Instructions Notice */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="py-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Capital call notices are sent via email with
            detailed wire instructions. Please ensure your bank details on file
            are current.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
