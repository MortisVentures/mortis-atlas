import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanyById } from "@/lib/db";
import { CompanyForm } from "@/components/companies/company-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCompanyPage({ params }: PageProps) {
  const { id } = await params;
  const company = await getCompanyById(id);

  if (!company) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/companies/${company.id}`}
          className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to {company.name}
        </Link>
        <h1 className="text-3xl font-bold mt-2">Edit Company</h1>
        <p className="text-muted-foreground mt-1">
          Update information for {company.name}
        </p>
      </div>

      {/* Form */}
      <CompanyForm company={company} mode="edit" />
    </div>
  );
}
