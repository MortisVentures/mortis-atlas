import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import InboxDashboard from "./inbox-dashboard";

export const metadata = {
  title: "Inbox | Mortis Atlas",
  description: "Review email contacts and create from suggestions",
};

export default async function InboxPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return <InboxDashboard />;
}
