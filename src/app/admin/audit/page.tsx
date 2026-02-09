"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MagnifyingGlassIcon,
  ReloadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ACTION_COLORS: Record<string, string> = {
  LOGIN: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  LOGOUT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  LOGIN_FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  CREATE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  UPDATE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  ROLE_CHANGE: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  USER_DEACTIVATE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  USER_INVITE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  VIEW: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  DOWNLOAD: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  SHARE: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
};

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "50");
      if (search) params.set("search", search);
      if (actionFilter) params.set("action", actionFilter);

      const res = await fetch(`/api/admin/audit?${params}`);
      const json = await res.json();
      if (json.data) {
        setLogs(json.data);
        setPagination(json.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Audit Logs
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Review system activity and security events
          </p>
        </div>
        <Button variant="outline" onClick={fetchLogs} disabled={loading}>
          <ReloadIcon className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  placeholder="Search by description..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9"
                />
              </div>
            </div>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm"
            >
              <option value="">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="LOGIN_FAILED">Failed Login</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="ROLE_CHANGE">Role Change</option>
              <option value="USER_DEACTIVATE">User Deactivate</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            {loading ? "Loading..." : `${pagination?.total || 0} Events`}
          </CardTitle>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </Button>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
              >
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-neutral-500">
              Loading audit logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-neutral-500">
              No audit logs found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">
                      Timestamp
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">
                      User
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">
                      Action
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">
                      Entity
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">
                      Description
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-neutral-100 dark:border-neutral-800"
                    >
                      <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {log.user.name || "Unknown"}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {log.user.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            ACTION_COLORS[log.action] || "bg-neutral-100"
                          }`}
                        >
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                        {log.entityType}
                        {log.entityId && (
                          <span className="text-xs text-neutral-400 ml-1">
                            ({log.entityId.slice(0, 8)}...)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400 max-w-xs truncate">
                        {log.description || "—"}
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-500 font-mono">
                        {log.ipAddress || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
