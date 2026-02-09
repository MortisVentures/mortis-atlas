"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LockClosedIcon,
  LockOpen1Icon,
  GearIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  CopyIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";

interface TwoFactorStatus {
  enabled: boolean;
  verifiedAt: string | null;
}

interface SetupData {
  qrCode?: string;
  uri: string;
  backupCodes: string[];
}

type Step = "status" | "setup" | "verify" | "backup" | "disable";

export default function SecuritySettingsPage() {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [step, setStep] = useState<Step>("status");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/2fa/setup");
      const json = await res.json();
      if (json.data) {
        setStatus(json.data);
      }
    } catch {
      console.error("Failed to fetch 2FA status");
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const initSetup = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to initialize 2FA setup");
      }

      setSetupData(json.data);
      setStep("setup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start setup");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Verification failed");
      }

      setSuccess("Two-factor authentication has been enabled!");
      setStep("backup");
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, code }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to disable 2FA");
      }

      setSuccess("Two-factor authentication has been disabled");
      setStep("status");
      setPassword("");
      setCode("");
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    if (setupData?.backupCodes) {
      navigator.clipboard.writeText(setupData.backupCodes.join("\n"));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  const resetFlow = () => {
    setStep("status");
    setSetupData(null);
    setCode("");
    setPassword("");
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Security Settings
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Manage your account security and two-factor authentication
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <CrossCircledIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
          <CheckCircledIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      {/* Status Card */}
      {step === "status" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {status?.enabled ? (
                <LockClosedIcon className="w-5 h-5 text-green-600" />
              ) : (
                <LockOpen1Icon className="w-5 h-5 text-neutral-400" />
              )}
              Two-Factor Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  Status:{" "}
                  {status?.enabled ? (
                    <span className="text-green-600">Enabled</span>
                  ) : (
                    <span className="text-neutral-500">Disabled</span>
                  )}
                </p>
                {status?.verifiedAt && (
                  <p className="text-sm text-neutral-500 mt-1">
                    Enabled on{" "}
                    {new Date(status.verifiedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              {status?.enabled ? (
                <Button
                  variant="outline"
                  onClick={() => setStep("disable")}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Disable 2FA
                </Button>
              ) : (
                <Button onClick={initSetup} disabled={loading}>
                  {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
                  Enable 2FA
                </Button>
              )}
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Two-factor authentication adds an extra layer of security to your
              account by requiring a verification code from your authenticator
              app when signing in.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Setup Step */}
      {step === "setup" && setupData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GearIcon className="w-5 h-5" />
              Set Up Authenticator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              <p className="mb-4">
                Scan this QR code with your authenticator app (like Google
                Authenticator, Authy, or 1Password).
              </p>
            </div>

            {setupData.qrCode ? (
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={setupData.qrCode}
                    alt="2FA QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <p className="text-xs font-mono break-all">{setupData.uri}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Enter the 6-digit code from your authenticator app
              </label>
              <div className="flex gap-3">
                <Input
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className="font-mono text-center text-lg tracking-widest"
                  maxLength={6}
                />
                <Button onClick={verifyCode} disabled={code.length !== 6 || loading}>
                  {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
                  Verify
                </Button>
              </div>
            </div>

            <Button variant="ghost" onClick={resetFlow} className="w-full">
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Verify Step - Show backup codes */}
      {step === "backup" && setupData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircledIcon className="w-5 h-5 text-green-600" />
              Save Your Backup Codes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Important:</strong> Save these backup codes in a secure
                location. Each code can only be used once to recover access if
                you lose your authenticator device.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg font-mono text-sm">
              {setupData.backupCodes.map((code, i) => (
                <div key={i} className="py-1">
                  {code}
                </div>
              ))}
            </div>

            <Button onClick={copyBackupCodes} variant="outline" className="w-full">
              <CopyIcon className="mr-2 h-4 w-4" />
              {copiedCodes ? "Copied!" : "Copy All Codes"}
            </Button>

            <Button onClick={resetFlow} className="w-full">
              Done
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Disable Step */}
      {step === "disable" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <LockOpen1Icon className="w-5 h-5" />
              Disable Two-Factor Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                Disabling 2FA will make your account less secure. You will need
                to enter your password to confirm.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  2FA Code (optional, for verification)
                </label>
                <Input
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className="font-mono"
                  maxLength={6}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={resetFlow} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={disable2FA}
                disabled={!password || loading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
                Disable 2FA
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
