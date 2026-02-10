"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  EnvelopeClosedIcon,
  PersonIcon,
  ReloadIcon,
  MixerHorizontalIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import {
  DashboardLayout,
  DashboardContent,
  PageHeader,
} from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProposalsList } from "@/components/email/proposals-list";
import { ContactProposalModal } from "@/components/email/contact-proposal-modal";
import { useProposals, Proposal } from "@/hooks/use-proposals";
import { cn } from "@/lib/utils";

// =============================================================================
// STATS CARD
// =============================================================================

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
  variant?: "default" | "success" | "warning";
}

function StatCard({
  title,
  value,
  icon,
  description,
  variant = "default",
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "border-neutral-200 dark:border-neutral-700",
        variant === "success" && "border-l-4 border-l-green-500",
        variant === "warning" && "border-l-4 border-l-yellow-500"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {title}
            </p>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {value}
            </p>
            {description && (
              <p className="text-xs text-neutral-400 mt-1">{description}</p>
            )}
          </div>
          <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// INBOX DASHBOARD
// =============================================================================

export default function InboxDashboard() {
  const router = useRouter();
  const [selectedProposal, setSelectedProposal] = React.useState<Proposal | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("proposals");

  const {
    proposals,
    stats,
    isLoading,
    error,
    refetch,
    createContact,
    dismiss,
  } = useProposals();

  // Handle proposal selection
  const handleSelectProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsModalOpen(true);
  };

  // Handle quick create (uses parsed data directly)
  const handleQuickCreate = async (proposal: Proposal) => {
    const firstName =
      proposal.signatureInfo?.firstName ||
      proposal.parsedName.firstName ||
      proposal.name?.split(" ")[0] ||
      "Unknown";
    const lastName =
      proposal.signatureInfo?.lastName ||
      proposal.parsedName.lastName ||
      proposal.name?.split(" ").slice(1).join(" ") ||
      "";

    const result = await createContact(proposal.id, {
      firstName,
      lastName,
      role: proposal.signatureInfo?.title,
      phone: proposal.signatureInfo?.phone,
      linkedinUrl: proposal.signatureInfo?.linkedIn,
      companyId: proposal.companyMatches[0]?.id,
    });

    if (result.success) {
      toast.success(`Contact "${firstName} ${lastName}" created`);
    } else {
      toast.error(result.error || "Failed to create contact");
    }
  };

  // Handle dismiss
  const handleDismiss = async (proposalId: string) => {
    const result = await dismiss(proposalId);
    if (result.success) {
      toast.success("Proposal dismissed");
    } else {
      toast.error(result.error || "Failed to dismiss");
    }
  };

  // Handle modal create
  const handleModalCreate = async (data: {
    firstName: string;
    lastName: string;
    role?: string;
    phone?: string;
    linkedinUrl?: string;
    companyId?: string;
    createCompany?: { name: string; website?: string };
  }) => {
    if (!selectedProposal) return;

    const result = await createContact(selectedProposal.id, data);

    if (result.success) {
      toast.success(`Contact "${data.firstName} ${data.lastName}" created`);
      setIsModalOpen(false);
      setSelectedProposal(null);

      // Navigate to new contact
      if (result.contactId) {
        router.push(`/contacts/${result.contactId}`);
      }
    } else {
      toast.error(result.error || "Failed to create contact");
    }
  };

  return (
    <DashboardLayout>
      <DashboardContent>
        {/* Header */}
        <PageHeader
          title="Inbox"
          description="Review suggested contacts from your email activity"
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/settings/integrations")}
              >
                <MixerHorizontalIcon className="size-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <ReloadIcon
                  className={cn("size-4 mr-2", isLoading && "animate-spin")}
                />
                Refresh
              </Button>
            </div>
          }
        />

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              title="Pending Suggestions"
              value={stats.pending}
              icon={<EnvelopeClosedIcon className="size-5 text-neutral-500" />}
              description="Unknown senders to review"
            />
            <StatCard
              title="High Priority"
              value={stats.highPriority}
              icon={<PersonIcon className="size-5 text-green-500" />}
              description="Score 50+ (likely relevant)"
              variant="success"
            />
            <StatCard
              title="This Week"
              value={stats.thisWeek}
              icon={<EnvelopeClosedIcon className="size-5 text-yellow-500" />}
              description="New contacts this week"
              variant="warning"
            />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
            <CardContent className="p-4 text-red-600 dark:text-red-400">
              {error}
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="proposals">
              Suggestions
              {stats && stats.pending > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 text-xs bg-tactical-500/20 text-tactical-600"
                >
                  {stats.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="threads">Email Threads</TabsTrigger>
          </TabsList>

          <TabsContent value="proposals" className="mt-0">
            <ProposalsList
              proposals={proposals}
              isLoading={isLoading}
              onSelect={handleSelectProposal}
              onDismiss={handleDismiss}
              onQuickCreate={handleQuickCreate}
            />
          </TabsContent>

          <TabsContent value="threads" className="mt-0">
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <EnvelopeClosedIcon className="size-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Email Threads
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-4">
                  Connect your email account to see synced email threads here.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push("/settings/integrations")}
                >
                  Connect Email
                  <ChevronRightIcon className="size-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact Proposal Modal */}
        <ContactProposalModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          proposal={selectedProposal}
          onSubmit={handleModalCreate}
          onDismiss={() => {
            if (selectedProposal) {
              handleDismiss(selectedProposal.id);
            }
            setIsModalOpen(false);
            setSelectedProposal(null);
          }}
        />
      </DashboardContent>
    </DashboardLayout>
  );
}
