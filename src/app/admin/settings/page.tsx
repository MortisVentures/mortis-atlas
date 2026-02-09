import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LockClosedIcon,
  GlobeIcon,
  BellIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          System Settings
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Configure security policies and system behavior
        </p>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <LockClosedIcon className="w-4 h-4" />
            Security Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Settings Display */}
          <div className="grid gap-4">
            <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  Session Timeout
                </p>
                <p className="text-sm text-neutral-500">
                  JWT sessions expire after this period
                </p>
              </div>
              <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-sm font-mono">
                30 days
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  Password Requirements
                </p>
                <p className="text-sm text-neutral-500">
                  Minimum password strength
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-sm">
                Strong (12+ chars)
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  Rate Limiting
                </p>
                <p className="text-sm text-neutral-500">
                  Authentication endpoints
                </p>
              </div>
              <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-sm font-mono">
                5 req/min per IP
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  Two-Factor Authentication
                </p>
                <p className="text-sm text-neutral-500">
                  TOTP-based 2FA availability
                </p>
              </div>
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                <CheckCircledIcon className="w-4 h-4" />
                Enabled (Optional)
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  OAuth Account Linking
                </p>
                <p className="text-sm text-neutral-500">
                  Automatic account linking via email
                </p>
              </div>
              <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded text-sm">
                Disabled
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Headers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GlobeIcon className="w-4 h-4" />
            Security Headers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {[
              { header: "Strict-Transport-Security", status: "Active" },
              { header: "X-Frame-Options", status: "SAMEORIGIN" },
              { header: "X-Content-Type-Options", status: "nosniff" },
              { header: "Content-Security-Policy", status: "Configured" },
              { header: "Referrer-Policy", status: "strict-origin-when-cross-origin" },
              { header: "Permissions-Policy", status: "Restricted" },
            ].map((item) => (
              <div
                key={item.header}
                className="flex items-center justify-between py-2 px-3 bg-neutral-50 dark:bg-neutral-800/50 rounded"
              >
                <span className="font-mono text-sm text-neutral-700 dark:text-neutral-300">
                  {item.header}
                </span>
                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircledIcon className="w-3 h-3" />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BellIcon className="w-4 h-4" />
            Audit & Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                Audit Logging
              </p>
              <p className="text-sm text-neutral-500">
                Track all sensitive operations
              </p>
            </div>
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
              <CheckCircledIcon className="w-4 h-4" />
              Enabled
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                Failed Login Tracking
              </p>
              <p className="text-sm text-neutral-500">
                Log failed authentication attempts
              </p>
            </div>
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
              <CheckCircledIcon className="w-4 h-4" />
              Enabled
            </span>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                Document Access Logging
              </p>
              <p className="text-sm text-neutral-500">
                Track document views and downloads
              </p>
            </div>
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
              <CheckCircledIcon className="w-4 h-4" />
              Enabled
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Environment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-neutral-500">Node Environment</p>
              <p className="font-mono text-neutral-900 dark:text-neutral-100">
                {process.env.NODE_ENV || "development"}
              </p>
            </div>
            <div>
              <p className="text-neutral-500">Database</p>
              <p className="font-mono text-neutral-900 dark:text-neutral-100">
                PostgreSQL (Supabase)
              </p>
            </div>
            <div>
              <p className="text-neutral-500">Auth Provider</p>
              <p className="font-mono text-neutral-900 dark:text-neutral-100">
                NextAuth (JWT)
              </p>
            </div>
            <div>
              <p className="text-neutral-500">Rate Limit Backend</p>
              <p className="font-mono text-neutral-900 dark:text-neutral-100">
                In-Memory / Upstash Redis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
