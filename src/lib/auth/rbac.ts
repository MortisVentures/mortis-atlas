import { UserRole } from "@prisma/client";
import { auth } from "./index";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

// ============================================
// Role Hierarchy & Permissions
// ============================================

/**
 * Role hierarchy - higher index = more permissions
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  LP: 0,
  ANALYST: 1,
  PARTNER: 2,
  ADMIN: 3,
};

/**
 * Check if a role has at least the permission level of another role
 */
export function hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// ============================================
// Server-Side Auth Guards
// ============================================

/**
 * Require authentication - redirect to login if not authenticated
 * Use in server components and API routes
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return session.user;
}

/**
 * Require specific roles - redirect to unauthorized if role doesn't match
 * Use in server components and page protection
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/unauthorized");
  }

  return session.user;
}

/**
 * Require minimum role level - redirect if user doesn't have at least this role level
 */
export async function requireMinRole(minRole: UserRole) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (!hasRoleLevel(session.user.role, minRole)) {
    redirect("/unauthorized");
  }

  return session.user;
}

// ============================================
// Permission Check Functions
// ============================================

/**
 * Check if user can create/edit companies
 */
export function canManageCompanies(role: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.PARTNER, UserRole.ANALYST].includes(role);
}

/**
 * Check if user can view all deals
 */
export function canViewAllDeals(role: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.PARTNER, UserRole.ANALYST].includes(role);
}

/**
 * Check if user can approve IC memos
 */
export function canApproveICMemos(role: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.PARTNER].includes(role);
}

/**
 * Check if user can access fund-level financials
 */
export function canAccessFundFinancials(role: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.PARTNER].includes(role);
}

/**
 * Check if user can access limited fund financials (analysts)
 */
export function canAccessLimitedFinancials(role: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.PARTNER, UserRole.ANALYST].includes(role);
}

/**
 * Check if user can generate LP reports
 */
export function canGenerateLPReports(role: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.PARTNER].includes(role);
}

/**
 * Check if user can view LP contact information
 */
export function canViewLPContacts(role: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.PARTNER].includes(role);
}

/**
 * Check if user can view full portfolio (all companies)
 */
export function canViewFullPortfolio(role: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.PARTNER, UserRole.ANALYST].includes(role);
}

/**
 * Check if user can download quarterly reports
 */
export function canDownloadReports(role: UserRole): boolean {
  // LPs can download their own reports, others can download all
  return true; // LP access is filtered by fund
}

/**
 * Check if user can manage other users
 */
export function canManageUsers(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

/**
 * Check if user can access audit logs
 */
export function canAccessAuditLogs(role: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.PARTNER].includes(role);
}

/**
 * Check if user can access full audit logs (all users)
 */
export function canAccessFullAuditLogs(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

// ============================================
// LP-Specific Access Control
// ============================================

/**
 * Check if LP user can access a specific fund
 */
export async function canLPAccessFund(
  userId: string,
  fundId: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { lpProfile: true },
  });

  if (!user) return false;

  // Non-LP users with appropriate roles can access all funds
  if (user.role !== UserRole.LP) {
    return [UserRole.ADMIN, UserRole.PARTNER, UserRole.ANALYST].includes(user.role);
  }

  // LPs can only access their designated funds
  if (user.lpProfile) {
    return user.lpProfile.fundAccess.includes(fundId);
  }

  return false;
}

// ============================================
// Utility Types
// ============================================

export type Permission =
  | "manage_companies"
  | "view_all_deals"
  | "approve_ic_memos"
  | "access_fund_financials"
  | "generate_lp_reports"
  | "view_lp_contacts"
  | "view_full_portfolio"
  | "manage_users"
  | "access_audit_logs";

/**
 * Check if user has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissionChecks: Record<Permission, (role: UserRole) => boolean> = {
    manage_companies: canManageCompanies,
    view_all_deals: canViewAllDeals,
    approve_ic_memos: canApproveICMemos,
    access_fund_financials: canAccessFundFinancials,
    generate_lp_reports: canGenerateLPReports,
    view_lp_contacts: canViewLPContacts,
    view_full_portfolio: canViewFullPortfolio,
    manage_users: canManageUsers,
    access_audit_logs: canAccessAuditLogs,
  };

  return permissionChecks[permission](role);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  const allPermissions: Permission[] = [
    "manage_companies",
    "view_all_deals",
    "approve_ic_memos",
    "access_fund_financials",
    "generate_lp_reports",
    "view_lp_contacts",
    "view_full_portfolio",
    "manage_users",
    "access_audit_logs",
  ];

  return allPermissions.filter((p) => hasPermission(role, p));
}
