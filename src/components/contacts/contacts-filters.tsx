"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useCallback, useState, useTransition } from "react";

export function ContactsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.push(`/contacts?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  return (
    <div className="flex gap-4 items-center">
      <div className="relative flex-1 max-w-md">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <Input
          placeholder="Search by name, email, or company..."
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            updateFilters("search", e.target.value);
          }}
          className="pl-9"
        />
      </div>
      {isPending && (
        <div className="text-xs text-muted-foreground">Loading...</div>
      )}
    </div>
  );
}
