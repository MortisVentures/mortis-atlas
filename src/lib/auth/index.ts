import { getServerSession } from "next-auth";
import { authOptions } from "./config";

/**
 * Get the current session on the server side
 */
export async function auth() {
  return getServerSession(authOptions);
}

/**
 * Get the current user from session, or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Check if user is authenticated (use in server components)
 */
export async function isAuthenticated() {
  const session = await auth();
  return !!session?.user;
}

export { authOptions } from "./config";
