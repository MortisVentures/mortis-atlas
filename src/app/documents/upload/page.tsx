import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { DocumentUploadForm } from "@/components/documents/document-upload-form";
import { PageHeader } from "@/components/layout/page-header";
import { UploadIcon } from "@radix-ui/react-icons";

interface PageProps {
  searchParams: Promise<{
    companyId?: string;
    dealId?: string;
  }>;
}

export default async function DocumentUploadPage({ searchParams }: PageProps) {
  // Get authenticated user
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { companyId, dealId } = await searchParams;

  // Fetch pre-selected company if provided
  let company = null;
  if (companyId) {
    company = await prisma.company.findFirst({
      where: { id: companyId, userId: session.user.id },
      select: {
        id: true,
        name: true,
        stage: true,
        sourceType: true,
      },
    });
  }

  // Fetch pre-selected deal if provided
  let deal = null;
  if (dealId) {
    deal = await prisma.deal.findFirst({
      where: { id: dealId, userId: session.user.id },
      select: {
        id: true,
        dealName: true,
        stage: true,
        company: {
          select: { id: true, name: true },
        },
      },
    });

    // If deal is provided, also get the company
    if (deal?.company && !company) {
      company = await prisma.company.findFirst({
        where: { id: deal.company.id, userId: session.user.id },
        select: {
          id: true,
          name: true,
          stage: true,
          sourceType: true,
        },
      });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        icon={<UploadIcon className="size-5 text-white" />}
        iconClassName="bg-gradient-to-br from-blue-500 to-purple-500"
        title="Upload Document"
        description={
          company
            ? `Upload a document for ${company.name}`
            : "Upload and organize a new document"
        }
        backHref="/documents"
        backLabel="Back to Documents"
      />

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <DocumentUploadForm
            company={company}
            deal={deal}
            variant="page"
          />
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Upload Document | Mortis Atlas",
  description: "Upload and organize a new document",
};
