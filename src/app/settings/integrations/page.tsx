"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  EnvelopeClosedIcon,
  CalendarIcon,
  ReloadIcon,
  TrashIcon,
  PlusIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEmailAccounts } from "@/hooks/use-email-accounts";
import { cn } from "@/lib/utils";

// =============================================================================
// INTEGRATION CARD
// =============================================================================

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
  accounts?: {
    id: string;
    email: string;
    lastSyncAt: string | null;
    isActive: boolean;
  }[];
  onConnect: () => void;
  onDisconnect?: (accountId: string) => void;
  onSync?: (accountId?: string) => void;
  isLoading?: boolean;
  isSyncing?: boolean;
  comingSoon?: boolean;
}

function IntegrationCard({
  title,
  description,
  icon,
  isConnected,
  accounts = [],
  onConnect,
  onDisconnect,
  onSync,
  isLoading,
  isSyncing,
  comingSoon,
}: IntegrationCardProps) {
  return (
    <Card className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700">
            {icon}
          </div>
          <div>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {description}
            </p>
          </div>
        </div>
        {comingSoon && (
          <Badge variant="outline" className="text-xs">
            Coming Soon
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <ReloadIcon className="size-4 animate-spin" />
            Loading...
          </div>
        ) : isConnected && accounts.length > 0 ? (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900"
              >
                <div className="flex items-center gap-3">
                  <CheckCircledIcon className="size-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">{account.email}</p>
                    <p className="text-xs text-neutral-500">
                      {account.lastSyncAt
                        ? `Last synced: ${new Date(account.lastSyncAt).toLocaleString()}`
                        : "Never synced"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onSync && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSync(account.id)}
                      disabled={isSyncing}
                    >
                      <ReloadIcon
                        className={cn("size-4", isSyncing && "animate-spin")}
                      />
                    </Button>
                  )}
                  {onDisconnect && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDisconnect(account.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={onConnect}
              className="w-full"
              disabled={comingSoon}
            >
              <PlusIcon className="size-4 mr-2" />
              Add Another Account
            </Button>
          </div>
        ) : (
          <Button
            onClick={onConnect}
            disabled={comingSoon}
            className="w-full"
          >
            <PlusIcon className="size-4 mr-2" />
            Connect {title}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// PAGE CONTENT (uses useSearchParams)
// =============================================================================

function IntegrationsContent() {
  const searchParams = useSearchParams();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const {
    accounts,
    isLoading,
    error,
    connect,
    disconnect,
    sync,
    isSyncing,
  } = useEmailAccounts();

  // Handle success/error from OAuth callback
  useEffect(() => {
    const success = searchParams.get("success");
    const errorParam = searchParams.get("error");

    if (success === "email_connected") {
      toast.success("Email account connected successfully!");
      setShowSuccessMessage(true);
      // Clear query params
      window.history.replaceState({}, "", "/settings/integrations");
    }

    if (errorParam) {
      const errorMessages: Record<string, string> = {
        missing_params: "OAuth callback missing required parameters",
        invalid_state: "Invalid OAuth state - please try again",
        session_expired: "Session expired - please log in again",
        callback_failed: "Failed to connect account - please try again",
        access_denied: "Access was denied - please try again",
      };
      toast.error(errorMessages[errorParam] || `Connection error: ${errorParam}`);
      window.history.replaceState({}, "", "/settings/integrations");
    }
  }, [searchParams]);

  // Handle connect
  const handleConnect = async (provider: "gmail" | "office365") => {
    const authUrl = await connect(provider);
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  // Handle disconnect
  const handleDisconnect = async (accountId: string) => {
    if (confirm("Are you sure you want to disconnect this email account?")) {
      const success = await disconnect(accountId);
      if (success) {
        toast.success("Email account disconnected");
      } else {
        toast.error("Failed to disconnect account");
      }
    }
  };

  // Handle sync
  const handleSync = async (accountId?: string) => {
    const success = await sync(accountId);
    if (success) {
      toast.success("Email sync complete!");
    } else {
      toast.error("Failed to sync emails");
    }
  };

  const gmailAccounts = accounts.filter((a) => a.provider === "GMAIL");
  const office365Accounts = accounts.filter((a) => a.provider === "OFFICE365");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Integrations
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Connect your email and calendar accounts to automatically sync communications.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">
          <ExclamationTriangleIcon className="size-4" />
          {error}
        </div>
      )}

      {showSuccessMessage && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 text-sm">
          <CheckCircledIcon className="size-4" />
          Your email account is connected! We&apos;ll start syncing your emails in the background.
        </div>
      )}

      <div className="grid gap-4">
        {/* Email Section */}
        <div>
          <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
            Email
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <IntegrationCard
              title="Gmail"
              description="Sync emails from your Gmail account"
              icon={<EnvelopeClosedIcon className="size-5 text-red-500" />}
              isConnected={gmailAccounts.length > 0}
              accounts={gmailAccounts}
              onConnect={() => handleConnect("gmail")}
              onDisconnect={handleDisconnect}
              onSync={handleSync}
              isLoading={isLoading}
              isSyncing={isSyncing}
            />
            <IntegrationCard
              title="Office 365"
              description="Sync emails from your Outlook account"
              icon={<EnvelopeClosedIcon className="size-5 text-blue-500" />}
              isConnected={office365Accounts.length > 0}
              accounts={office365Accounts}
              onConnect={() => handleConnect("office365")}
              onDisconnect={handleDisconnect}
              onSync={handleSync}
              isLoading={isLoading}
              isSyncing={isSyncing}
              comingSoon
            />
          </div>
        </div>

        {/* Calendar Section */}
        <div>
          <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
            Calendar
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <IntegrationCard
              title="Google Calendar"
              description="Sync meetings from Google Calendar"
              icon={<CalendarIcon className="size-5 text-blue-500" />}
              isConnected={false}
              onConnect={() => {}}
              isLoading={false}
              comingSoon
            />
            <IntegrationCard
              title="Outlook Calendar"
              description="Sync meetings from Outlook Calendar"
              icon={<CalendarIcon className="size-5 text-blue-600" />}
              isConnected={false}
              onConnect={() => {}}
              isLoading={false}
              comingSoon
            />
          </div>
        </div>
      </div>

      {/* Sync All Button */}
      {accounts.length > 0 && (
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            onClick={() => handleSync()}
            disabled={isSyncing}
            variant="outline"
          >
            <ReloadIcon
              className={cn("size-4 mr-2", isSyncing && "animate-spin")}
            />
            {isSyncing ? "Syncing..." : "Sync All Accounts"}
          </Button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// PAGE COMPONENT (with Suspense boundary)
// =============================================================================

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <IntegrationsContent />
    </Suspense>
  );
}
