import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonIcon } from "@radix-ui/react-icons";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          General Settings
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PersonIcon className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-neutral-500">Name</label>
              <p className="text-neutral-900 dark:text-neutral-100">
                {session.user.name || "Not set"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-500">Email</label>
              <p className="text-neutral-900 dark:text-neutral-100">
                {session.user.email}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-500">Role</label>
              <p className="text-neutral-900 dark:text-neutral-100 capitalize">
                {session.user.role?.toLowerCase().replace("_", " ") || "Unknown"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
