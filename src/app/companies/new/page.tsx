import Link from "next/link";
import { redirect } from "next/navigation";
import { CompanyForm } from "@/components/companies/company-form";
import { auth } from "@/lib/auth";

export default async function NewCompanyPage() {
  // Get authenticated user
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/companies"
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
          Back to Companies
        </Link>
        <h1 className="text-3xl font-bold mt-2">Add Company</h1>
        <p className="text-muted-foreground mt-1">
          Add a new company to your pipeline
        </p>
      </div>

      {/* Form */}
      <CompanyForm mode="create" />
    </div>
  );
}
