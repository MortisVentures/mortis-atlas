/**
 * Enhanced Audit Logging System
 *
 * Provides comprehensive audit logging for sensitive operations:
 * - All CRUD operations on sensitive models (Deal, ICMemo, Document)
 * - Role changes
 * - Failed login attempts
 * - 2FA events
 * - Session creation/destruction
 * - Document access
 */

import { prisma } from "@/lib/db/prisma";
import { AuditAction } from "@prisma/client";
import { headers } from "next/headers";

// ============================================
// Types
// ============================================

export interface AuditLogParams {
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  description?: string;
  changes?: Record<string, { before?: unknown; after?: unknown }>;
  metadata?: Record<string, unknown>;
}

export interface AuditContext {
  ipAddress?: string;
  userAgent?: string;
  requestPath?: string;
}

// ============================================
// Context Extraction
// ============================================

/**
 * Extract audit context from Next.js headers
 */
export async function getAuditContext(): Promise<AuditContext> {
  try {
    const headersList = await headers();

    // Get IP address
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() || realIp || undefined;

    // Get user agent
    const userAgent = headersList.get("user-agent") || undefined;

    // Get request path (if available)
    const referer = headersList.get("referer");
    const requestPath = referer ? new URL(referer).pathname : undefined;

    return { ipAddress, userAgent, requestPath };
  } catch {
    return {};
  }
}

// ============================================
// Core Logging Function
// ============================================

/**
 * Create an audit log entry
 * Captures IP, user agent, and request path automatically
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    const context = await getAuditContext();

    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        description: params.description,
        changes: params.changes ? JSON.parse(JSON.stringify(params.changes)) : undefined,
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        requestPath: context.requestPath,
      },
    });
  } catch (error) {
    // Log errors but don't throw - audit failures shouldn't break operations
    console.error("Audit log creation failed:", error);
  }
}

// ============================================
// Convenience Functions
// ============================================

/**
 * Log a CREATE operation
 */
export async function logCreate(
  userId: string,
  entityType: string,
  entityId: string,
  description?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAudit({
    userId,
    action: "CREATE",
    entityType,
    entityId,
    description: description || `Created ${entityType}`,
    metadata,
  });
}

/**
 * Log a READ operation (for sensitive data access)
 */
export async function logRead(
  userId: string,
  entityType: string,
  entityId: string,
  description?: string
): Promise<void> {
  await logAudit({
    userId,
    action: "READ",
    entityType,
    entityId,
    description: description || `Viewed ${entityType}`,
  });
}

/**
 * Log an UPDATE operation with change tracking
 */
export async function logUpdate(
  userId: string,
  entityType: string,
  entityId: string,
  changes: Record<string, { before?: unknown; after?: unknown }>,
  description?: string
): Promise<void> {
  await logAudit({
    userId,
    action: "UPDATE",
    entityType,
    entityId,
    description: description || `Updated ${entityType}`,
    changes,
  });
}

/**
 * Log a DELETE operation
 */
export async function logDelete(
  userId: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAudit({
    userId,
    action: "DELETE",
    entityType,
    entityId,
    description: `Deleted ${entityType}`,
    metadata,
  });
}

/**
 * Log a document view
 */
export async function logDocumentView(
  userId: string,
  documentId: string,
  documentName: string
): Promise<void> {
  await logAudit({
    userId,
    action: "VIEW",
    entityType: "Document",
    entityId: documentId,
    description: `Viewed document: ${documentName}`,
  });
}

/**
 * Log a document download
 */
export async function logDocumentDownload(
  userId: string,
  documentId: string,
  documentName: string
): Promise<void> {
  await logAudit({
    userId,
    action: "DOWNLOAD",
    entityType: "Document",
    entityId: documentId,
    description: `Downloaded document: ${documentName}`,
  });
}

/**
 * Log a document share
 */
export async function logDocumentShare(
  userId: string,
  documentId: string,
  documentName: string,
  sharedWith?: string[]
): Promise<void> {
  await logAudit({
    userId,
    action: "SHARE",
    entityType: "Document",
    entityId: documentId,
    description: `Shared document: ${documentName}`,
    metadata: sharedWith ? { sharedWith } : undefined,
  });
}

/**
 * Log a role change
 */
export async function logRoleChange(
  adminUserId: string,
  targetUserId: string,
  previousRole: string,
  newRole: string
): Promise<void> {
  await logAudit({
    userId: adminUserId,
    action: "ROLE_CHANGE",
    entityType: "User",
    entityId: targetUserId,
    description: `Changed user role from ${previousRole} to ${newRole}`,
    changes: { role: { before: previousRole, after: newRole } },
  });
}

/**
 * Log user deactivation
 */
export async function logUserDeactivate(
  adminUserId: string,
  targetUserId: string,
  reason?: string
): Promise<void> {
  await logAudit({
    userId: adminUserId,
    action: "USER_DEACTIVATE",
    entityType: "User",
    entityId: targetUserId,
    description: `Deactivated user account`,
    metadata: reason ? { reason } : undefined,
  });
}

/**
 * Log user invitation
 */
export async function logUserInvite(
  adminUserId: string,
  invitedEmail: string,
  role: string
): Promise<void> {
  await logAudit({
    userId: adminUserId,
    action: "USER_INVITE",
    entityType: "User",
    description: `Invited ${invitedEmail} as ${role}`,
    metadata: { invitedEmail, role },
  });
}

/**
 * Log a failed login attempt
 */
export async function logLoginFailed(
  email: string,
  reason: string
): Promise<void> {
  // For failed logins, we don't have a userId - use system context
  try {
    const context = await getAuditContext();

    await prisma.auditLog.create({
      data: {
        // Use a system user ID or null handling
        userId: "system",
        action: "LOGIN_FAILED",
        entityType: "Authentication",
        description: `Failed login attempt for ${email}: ${reason}`,
        metadata: { email, reason },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to log login failure:", error);
  }
}

/**
 * Log a data export
 */
export async function logExport(
  userId: string,
  entityType: string,
  format: string,
  recordCount: number
): Promise<void> {
  await logAudit({
    userId,
    action: "EXPORT",
    entityType,
    description: `Exported ${recordCount} ${entityType} records as ${format}`,
    metadata: { format, recordCount },
  });
}

// ============================================
// Query Functions
// ============================================

export interface AuditLogFilters {
  userId?: string;
  action?: AuditAction;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Query audit logs with filters
 */
export async function getAuditLogs(
  filters: AuditLogFilters,
  pagination: { page?: number; limit?: number } = {}
) {
  const page = pagination.page ?? 1;
  const limit = pagination.limit ?? 50;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (filters.userId) where.userId = filters.userId;
  if (filters.action) where.action = filters.action;
  if (filters.entityType) where.entityType = filters.entityType;
  if (filters.entityId) where.entityId = filters.entityId;

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate)
      (where.createdAt as Record<string, unknown>).gte = filters.startDate;
    if (filters.endDate)
      (where.createdAt as Record<string, unknown>).lte = filters.endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data: logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit),
    },
  };
}

/**
 * Get audit statistics for dashboard
 */
export async function getAuditStats(days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await prisma.auditLog.groupBy({
    by: ["action"],
    where: {
      createdAt: { gte: startDate },
    },
    _count: { id: true },
  });

  return stats.reduce(
    (acc, stat) => {
      acc[stat.action] = stat._count.id;
      return acc;
    },
    {} as Record<string, number>
  );
}
