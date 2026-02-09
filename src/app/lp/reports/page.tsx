import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DownloadIcon, CalendarIcon, FileTextIcon } from "@radix-ui/react-icons";

async function getLPReports(userId: string) {
  // Get LP profile to check fund access
  const lpProfile = await prisma.lPProfile.findUnique({
    where: { userId },
    select: { fundAccess: true },
  });

  // Get LP-accessible documents that are quarterly reports
  const reports = await prisma.document.findMany({
    where: {
      accessLevel: "LP_ACCESSIBLE",
      documentType: "BOARD_NOTES", // Using BOARD_NOTES for quarterly reports
    },
    select: {
      id: true,
      name: true,
      description: true,
      fileUrl: true,
      fileSize: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return { lpProfile, reports };
}

export default async function LPReportsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { reports } = await getLPReports(session.user.id);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1000000) {
      return `${(bytes / 1000000).toFixed(1)} MB`;
    }
    return `${(bytes / 1000).toFixed(0)} KB`;
  };

  // Group reports by year/quarter (mock structure)
  const quarters = [
    { period: "Q4 2025", published: "January 2026" },
    { period: "Q3 2025", published: "October 2025" },
    { period: "Q2 2025", published: "July 2025" },
    { period: "Q1 2025", published: "April 2025" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Quarterly Reports
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Fund performance updates and portfolio company highlights
        </p>
      </div>

      {/* Reports from Database */}
      {reports.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            Available Reports
          </h2>
          <div className="grid gap-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <FileTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {report.name}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {formatDate(report.createdAt)}
                          </span>
                          <span>{formatFileSize(report.fileSize)}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={report.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quarterly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quarters.map((quarter, index) => (
              <div
                key={quarter.period}
                className={`flex items-center justify-between py-3 ${
                  index !== quarters.length - 1
                    ? "border-b border-neutral-200 dark:border-neutral-700"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-4 h-4 text-neutral-400" />
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {quarter.period}
                  </span>
                </div>
                <span className="text-sm text-neutral-500">
                  Published: {quarter.published}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* No Reports Message */}
      {reports.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileTextIcon className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">
              No quarterly reports are currently available.
            </p>
            <p className="text-sm text-neutral-500 mt-2">
              Reports are typically published within 45 days of quarter-end.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
