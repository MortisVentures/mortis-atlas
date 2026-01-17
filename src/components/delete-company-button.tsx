"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteCompany } from "@/app/actions/company";

interface DeleteCompanyButtonProps {
  companyId: string;
  companyName: string;
}

export function DeleteCompanyButton({
  companyId,
  companyName,
}: DeleteCompanyButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteCompany(companyId);
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Company</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{companyName}</strong>? This
            action cannot be undone. All associated contacts, deals, and
            activities will also be deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete Company"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
