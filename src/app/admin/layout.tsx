import { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  DashboardIcon,
  PersonIcon,
  ReaderIcon,
  GearIcon,
  ArrowLeftIcon,
} from "@radix-ui/react-icons";

interface AdminLayoutProps {
  children: ReactNode;
}

const adminNavItems = [
  { href: "/admin", label: "Overview", icon: DashboardIcon },
  { href: "/admin/users", label: "Users", icon: PersonIcon },
  { href: "/admin/audit", label: "Audit Logs", icon: ReaderIcon },
  { href: "/admin/settings", label: "Settings", icon: GearIcon },
];

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();

  // Verify user is authenticated and has ADMIN role
  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 dark:bg-neutral-950 text-white flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-4">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to App
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <span className="font-semibold text-white block">Admin Panel</span>
              <span className="text-xs text-neutral-500">System Management</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center text-sm font-medium">
              {session.user.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session.user.name || "Admin"}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
