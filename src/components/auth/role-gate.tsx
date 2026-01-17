"use client";

import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * Client-side component that conditionally renders children based on user role.
 * Use this for hiding UI elements, not for security (use server-side checks for that).
 */
export function RoleGate({ children, allowedRoles, fallback = null }: RoleGateProps) {
  const { data: session, status } = useSession();

  // While loading, show nothing (or fallback)
  if (status === "loading") {
    return <>{fallback}</>;
  }

  // Not authenticated
  if (!session?.user?.role) {
    return <>{fallback}</>;
  }

  // Check if user's role is in allowed roles
  if (!allowedRoles.includes(session.user.role as UserRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook to check if current user has a specific role
 */
export function useHasRole(allowedRoles: UserRole[]): boolean {
  const { data: session } = useSession();

  if (!session?.user?.role) {
    return false;
  }

  return allowedRoles.includes(session.user.role as UserRole);
}

/**
 * Hook to get the current user's role
 */
export function useUserRole(): UserRole | null {
  const { data: session } = useSession();
  return (session?.user?.role as UserRole) ?? null;
}
