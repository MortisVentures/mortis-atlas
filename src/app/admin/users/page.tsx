"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PersonIcon,
  MagnifyingGlassIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  Pencil1Icon,
  LockClosedIcon,
} from "@radix-ui/react-icons";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  PARTNER: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  ANALYST: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  LP: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [showInactive, setShowInactive] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      if (showInactive) params.set("includeInactive", "true");

      const res = await fetch(`/api/admin/users?${params}`);
      const json = await res.json();
      if (json.data) {
        setUsers(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, showInactive]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Users
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage user accounts, roles, and access
          </p>
        </div>
        <Button>
          <PersonIcon className="w-4 h-4 mr-2" />
          Invite User
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
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="PARTNER">Partner</option>
              <option value="ANALYST">Analyst</option>
              <option value="LP">LP</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-neutral-300 dark:border-neutral-600"
              />
              Show inactive
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {loading ? "Loading..." : `${users.length} Users`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-neutral-500">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center text-neutral-500">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">
                      User
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">
                      2FA
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">
                      Last Login
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center text-sm font-medium text-neutral-600 dark:text-neutral-300">
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-100">
                              {user.name || "Unnamed User"}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            ROLE_COLORS[user.role] || "bg-neutral-100"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {user.isActive ? (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                            <CheckCircledIcon className="w-4 h-4" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
                            <CrossCircledIcon className="w-4 h-4" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {user.twoFactorEnabled ? (
                          <LockClosedIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <span className="text-xs text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                        {formatDate(user.lastLoginAt)}
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`/admin/users/${user.id}`}>
                            <Pencil1Icon className="w-4 h-4" />
                          </a>
                        </Button>
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
