import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TeamDashboard from "./team-dashboard";

/**
 * Dashboard Page with Role-Based Routing
 *
 * - LP users are redirected to /lp/dashboard (limited view)
 * - Team members (ADMIN, PARTNER, ANALYST) see the full dashboard
 */
export default async function DashboardPage() {
  const session = await auth();

  // Require authentication
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Redirect LP users to their dedicated portal
  if (session.user.role === "LP") {
    redirect("/lp/dashboard");
  }

  // Team members see the full dashboard
  return <TeamDashboard />;
}
