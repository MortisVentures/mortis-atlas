import { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  HomeIcon,
  FileTextIcon,
  DownloadIcon,
  GearIcon,
  ExitIcon,
} from "@radix-ui/react-icons";

interface LPLayoutProps {
  children: ReactNode;
}

const lpNavItems = [
  { href: "/lp/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/lp/reports", label: "Quarterly Reports", icon: FileTextIcon },
  { href: "/lp/documents", label: "Documents", icon: DownloadIcon },
  { href: "/lp/capital-calls", label: "Capital Calls", icon: FileTextIcon },
];

export default async function LPLayout({ children }: LPLayoutProps) {
  const session = await auth();

  // Verify user is authenticated and has LP or ADMIN role
  if (!session?.user) {
    redirect("/auth/login");
  }

  if (!["LP", "ADMIN"].includes(session.user.role)) {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 flex flex-col">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <Link href="/lp/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                Mortis Ventures
              </span>
              <span className="block text-xs text-neutral-500">LP Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {lpNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {session.user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {session.user.name || "LP User"}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {session.user.email}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/settings"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
            >
              <GearIcon className="w-3 h-3" />
              Settings
            </Link>
            <Link
              href="/api/auth/signout"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
            >
              <ExitIcon className="w-3 h-3" />
              Sign Out
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
