import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

import { auth } from "@/lib/auth";
import { getDealById } from "@/lib/db/deals";
import {
  DashboardLayout,
  DashboardContent,
  PageHeader,
} from "@/components/layout";
import { DealForm } from "@/components/deals/deal-form";
import { Button } from "@/components/ui/button";

// =============================================================================
// TYPES
// =============================================================================

interface PageProps {
  params: Promise<{ id: string }>;
}

// =============================================================================
// EDIT DEAL PAGE (SERVER COMPONENT)
// =============================================================================

export default async function EditDealPage({ params }: PageProps) {
  // Get authenticated user
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { id } = await params;

  // Fetch deal data from database
  const deal = await getDealById(id, session.user.id);

  if (!deal) {
    notFound();
  }

  // Map deal to form-compatible format (convert Decimal to number, Date to string)
  const formDeal = {
    ...deal,
    amount: deal.amount ? Number(deal.amount) : null,
    valuation: deal.valuation ? Number(deal.valuation) : null,
    roundSize: deal.roundSize ? Number(deal.roundSize) : null,
    postMoneyVal: deal.postMoneyVal ? Number(deal.postMoneyVal) : null,
    ownershipTarget: deal.ownershipTarget ? Number(deal.ownershipTarget) : null,
    expectedClose: deal.expectedClose ? new Date(deal.expectedClose) : null,
    actualClose: deal.actualClose ? new Date(deal.actualClose) : null,
    referralDate: deal.referralDate ? new Date(deal.referralDate) : null,
    company: deal.company,
  };

  return (
    <DashboardLayout>
      <DashboardContent>
        <PageHeader
          title={`Edit: ${deal.dealName}`}
          description={`Update deal information for ${deal.company.name}`}
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Deals", href: "/deals" },
            { label: deal.dealName, href: `/deals/${deal.id}` },
            { label: "Edit" },
          ]}
        />

        {/* Back Button */}
        <div className="mb-6">
          <Link href={`/deals/${deal.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="size-4 mr-2" />
              Back to {deal.dealName}
            </Button>
          </Link>
        </div>

        {/* Form Container */}
        <div className="max-w-3xl">
          <DealForm
            deal={formDeal as Parameters<typeof DealForm>[0]["deal"]}
            companyId={deal.companyId}
            companyName={deal.company.name}
            mode="edit"
          />
        </div>
      </DashboardContent>
    </DashboardLayout>
  );
}

// =============================================================================
// METADATA
// =============================================================================

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return { title: "Edit Deal | Mortis Atlas" };
  }

  const deal = await getDealById(id, session.user.id);

  if (!deal) {
    return { title: "Deal Not Found | Mortis Atlas" };
  }

  return {
    title: `Edit ${deal.dealName} | Mortis Atlas`,
    description: `Edit deal information for ${deal.dealName}`,
  };
}
