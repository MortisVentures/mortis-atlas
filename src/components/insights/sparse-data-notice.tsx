"use client";

import * as React from "react";
import Link from "next/link";
import { InfoCircledIcon, PlusIcon } from "@radix-ui/react-icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// =============================================================================
// TYPES
// =============================================================================

interface SparseDataNoticeProps {
  message: string;
  actionLabel?: string;
  actionHref?: string;
  variant?: "info" | "warning";
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SparseDataNotice({
  message,
  actionLabel,
  actionHref,
  variant = "info",
}: SparseDataNoticeProps) {
  const bgColor = variant === "warning" ? "bg-warning-base/10" : "bg-muted/30";
  const borderColor = variant === "warning" ? "border-warning-base/20" : "border-border";
  const iconColor = variant === "warning" ? "text-warning-base" : "text-muted-foreground";

  return (
    <Card variant="flat" className={`p-6 ${bgColor} border ${borderColor}`}>
      <div className="flex flex-col items-center text-center gap-4">
        <InfoCircledIcon className={`size-10 ${iconColor}`} />
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground max-w-md">{message}</p>
          {actionLabel && actionHref && (
            <Link href={actionHref}>
              <Button variant="outline" size="sm" className="mt-2">
                <PlusIcon className="size-4 mr-2" />
                {actionLabel}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}

export default SparseDataNotice;
