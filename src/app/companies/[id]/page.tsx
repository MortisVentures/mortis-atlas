import { notFound } from "next/navigation";
import { getCompanyWithFullDetails } from "@/lib/db/companies";
import { CompanyDetailView, type CompanyDetailData } from "@/components/companies/company-detail-view";

// =============================================================================
// SERVER COMPONENT - DATA FETCHING
// =============================================================================

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch company data from Prisma
  const company = await getCompanyWithFullDetails(id);

  if (!company) {
    notFound();
  }

  // Map Prisma data to the component's expected format
  const companyData: CompanyDetailData = {
    id: company.id,
    name: company.name,
    description: company.description,
    website: company.website,
    stage: company.stage,
    sector: company.sector,
    location: company.location,
    foundedYear: company.foundedYear,
    employeeCount: company.employeeCount,
    fundingRound: company.fundingRound,
    fundingAmount: company.fundingAmount ? Number(company.fundingAmount) : null,
    valuation: company.valuation ? Number(company.valuation) : null,
    linkedinUrl: company.linkedinUrl,
    twitterHandle: company.twitterHandle,
    logoUrl: company.logoUrl,
    notes: company.notes,
    updatedAt: company.updatedAt.toISOString(),
    tags: company.tags.map((t) => ({
      tag: {
        id: t.tag.id,
        name: t.tag.name,
        color: t.tag.color,
      },
    })),
    contacts: company.contacts.map((c) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      role: c.role,
      linkedinUrl: c.linkedinUrl,
      isPrimary: c.isPrimary,
    })),
    deals: company.deals.map((d) => ({
      id: d.id,
      dealName: d.dealName,
      amount: d.amount ? Number(d.amount) : null,
      valuation: d.valuation ? Number(d.valuation) : null,
      stage: d.stage,
      probability: d.probability,
      expectedClose: d.expectedClose ? d.expectedClose.toISOString() : null,
      notes: d.notes,
      createdAt: d.createdAt.toISOString(),
      contact: d.contact
        ? {
            id: d.contact.id,
            firstName: d.contact.firstName,
            lastName: d.contact.lastName,
          }
        : null,
    })),
    activities: company.activities.map((a) => ({
      id: a.id,
      type: a.type,
      subject: a.subject,
      description: a.description,
      activityDate: a.activityDate.toISOString(),
      contact: a.contact
        ? {
            id: a.contact.id,
            firstName: a.contact.firstName,
            lastName: a.contact.lastName,
          }
        : null,
    })),
    _count: company._count,
  };

  return <CompanyDetailView company={companyData} />;
}

// =============================================================================
// METADATA
// =============================================================================

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const company = await getCompanyWithFullDetails(id);

  if (!company) {
    return {
      title: "Company Not Found | Mortis Atlas",
    };
  }

  return {
    title: `${company.name} | Mortis Atlas`,
    description: company.description || `View details for ${company.name}`,
  };
}
