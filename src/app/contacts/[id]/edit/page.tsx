import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getContactById } from "@/lib/db/contacts";
import { ContactForm } from "@/components/contacts/contact-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditContactPage({ params }: PageProps) {
  // Get authenticated user
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { id } = await params;
  const contact = await getContactById(id);

  if (!contact) {
    notFound();
  }

  // Verify ownership
  if (contact.userId !== session.user.id) {
    notFound();
  }

  // Get user's companies for the dropdown
  const companies = await prisma.company.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/contacts/${contact.id}`}
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
          Back to {contact.firstName} {contact.lastName}
        </Link>
        <h1 className="text-3xl font-bold mt-2">Edit Contact</h1>
        <p className="text-muted-foreground mt-1">
          Update information for {contact.firstName} {contact.lastName}
        </p>
      </div>

      {/* Form */}
      <ContactForm
        contact={contact}
        companies={companies}
        mode="edit"
      />
    </div>
  );
}
