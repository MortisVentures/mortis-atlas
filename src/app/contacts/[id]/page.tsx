import { notFound, redirect } from "next/navigation";
import { getContactWithFullDetails } from "@/lib/db/contacts";
import { ContactDetailView, type ContactDetailData } from "@/components/contacts";
import { auth } from "@/lib/auth";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ highlight?: string }>;
}

export default async function ContactDetailPage({ params, searchParams }: PageProps) {
  // Get authenticated user
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { id } = await params;
  const { highlight } = await searchParams;
  const contact = await getContactWithFullDetails(id);

  if (!contact) {
    notFound();
  }

  // Verify ownership
  if (contact.userId !== session.user.id) {
    notFound();
  }

  // Map to component format
  const contactData: ContactDetailData = {
    id: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    role: contact.role,
    linkedinUrl: contact.linkedinUrl,
    notes: contact.notes,
    isPrimary: contact.isPrimary,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
    company: contact.company
      ? {
          id: contact.company.id,
          name: contact.company.name,
          stage: contact.company.stage,
          sector: contact.company.sector,
          website: contact.company.website,
          location: contact.company.location,
        }
      : null,
    deals: contact.deals.map((d) => ({
      id: d.id,
      dealName: d.dealName,
      stage: d.stage,
      amount: d.amount ? Number(d.amount) : null,
      valuation: d.valuation ? Number(d.valuation) : null,
      probability: d.probability,
      expectedClose: d.expectedClose ? d.expectedClose.toISOString() : null,
      createdAt: d.createdAt.toISOString(),
      company: d.company
        ? {
            id: d.company.id,
            name: d.company.name,
          }
        : null,
    })),
    activities: contact.activities.map((a) => ({
      id: a.id,
      type: a.type,
      subject: a.subject,
      description: a.description,
      activityDate: a.activityDate.toISOString(),
      company: a.company
        ? {
            id: a.company.id,
            name: a.company.name,
          }
        : null,
      deal: a.deal
        ? {
            id: a.deal.id,
            dealName: a.deal.dealName,
          }
        : null,
    })),
    _count: contact._count,
  };

  return <ContactDetailView contact={contactData} highlightSection={highlight} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const contact = await getContactWithFullDetails(id);

  if (!contact) {
    return {
      title: "Contact Not Found | Mortis Atlas",
    };
  }

  const fullName = `${contact.firstName} ${contact.lastName}`;
  return {
    title: `${fullName} | Mortis Atlas`,
    description: contact.role
      ? `${fullName} - ${contact.role}${contact.company ? ` at ${contact.company.name}` : ""}`
      : `View contact details for ${fullName}`,
  };
}
