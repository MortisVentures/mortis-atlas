import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import InsightsDashboard from "./insights-dashboard";

/**
 * Insights Engine Page
 *
 * Solo GP decision intelligence system that tracks KPIs,
 * surfaces patterns, and correlates deal outcomes.
 */
export default async function InsightsPage() {
  const session = await auth();

  // Require authentication
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Redirect LP users - they shouldn't see internal insights
  if (session.user.role === "LP") {
    redirect("/lp/dashboard");
  }

  return <InsightsDashboard />;
}
