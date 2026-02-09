import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  PersonIcon,
  LockClosedIcon,
  ActivityLogIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";

async function getAdminStats() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    inactiveUsers,
    usersByRole,
    recentLogins,
    failedLogins,
    totalAuditLogs,
    auditLogsByAction,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    }),
    prisma.auditLog.count({
      where: {
        action: "LOGIN",
        createdAt: { gte: twentyFourHoursAgo },
      },
    }),
    prisma.auditLog.count({
      where: {
        action: "LOGIN_FAILED",
        createdAt: { gte: twentyFourHoursAgo },
      },
    }),
    prisma.auditLog.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.auditLog.groupBy({
      by: ["action"],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      byRole: usersByRole.reduce(
        (acc, r) => ({ ...acc, [r.role]: r._count.id }),
        {} as Record<string, number>
      ),
    },
    security: {
      recentLogins,
      failedLogins,
    },
    audit: {
      total: totalAuditLogs,
      byAction: auditLogsByAction.map((a) => ({
        action: a.action,
        count: a._count.id,
      })),
    },
  };
}

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Admin Overview
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          System health and quick access to administrative functions
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <PersonIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Total Users</p>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {stats.users.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <LockClosedIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Logins (24h)</p>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {stats.security.recentLogins}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Failed Logins (24h)</p>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {stats.security.failedLogins}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <ActivityLogIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Audit Events (7d)</p>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {stats.audit.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Users by Role
              <Link
                href="/admin/users"
                className="text-sm font-normal text-blue-600 hover:underline"
              >
                View All →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.users.byRole).map(([role, count]) => (
                <div
                  key={role}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        role === "ADMIN"
                          ? "bg-red-500"
                          : role === "PARTNER"
                          ? "bg-purple-500"
                          : role === "ANALYST"
                          ? "bg-blue-500"
                          : "bg-amber-500"
                      }`}
                    />
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {role.charAt(0) + role.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {count}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between py-2 border-t border-neutral-200 dark:border-neutral-700">
                <span className="text-neutral-500">
                  Active / Inactive
                </span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {stats.users.active} / {stats.users.inactive}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Recent Activity Types (7d)
              <Link
                href="/admin/audit"
                className="text-sm font-normal text-blue-600 hover:underline"
              >
                View Logs →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.audit.byAction.map((item) => (
                <div
                  key={item.action}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {item.action.replace(/_/g, " ")}
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/users"
              className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <PersonIcon className="w-5 h-5 text-blue-600 mb-2" />
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                Manage Users
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                Create, edit, or deactivate user accounts
              </p>
            </Link>
            <Link
              href="/admin/audit"
              className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <ActivityLogIcon className="w-5 h-5 text-purple-600 mb-2" />
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                View Audit Logs
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                Review system activity and security events
              </p>
            </Link>
            <Link
              href="/admin/settings"
              className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <LockClosedIcon className="w-5 h-5 text-green-600 mb-2" />
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                Security Settings
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                Configure authentication and access policies
              </p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
