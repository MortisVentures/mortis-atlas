import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Protected layout - requires authentication
 * All routes under (protected) will require a valid session
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return <>{children}</>;
}
