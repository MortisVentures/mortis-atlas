import { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

interface SettingsLayoutProps {
  children: ReactNode;
}

const settingsNav = [
  { href: "/settings", label: "General" },
  { href: "/settings/security", label: "Security" },
  { href: "/settings/integrations", label: "Integrations" },
];

export default async function SettingsLayout({ children }: SettingsLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Determine the back link based on user role
  const backLink = session.user.role === "LP" ? "/lp/dashboard" : "/dashboard";
  const backLabel = session.user.role === "LP" ? "Back to LP Portal" : "Back to Dashboard";

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href={backLink}
            className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            {backLabel}
          </Link>
        </div>

        <nav className="mb-8 flex gap-4 border-b border-neutral-200 dark:border-neutral-800">
          {settingsNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="pb-3 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 border-b-2 border-transparent hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
