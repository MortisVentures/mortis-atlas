import { notFound } from "next/navigation";
import { getContactWithFullDetails } from "@/lib/db/contacts";
import { ContactDetailView, type ContactDetailData } from "@/components/contacts";

// =============================================================================
// SAMPLE DATA (for development - matches contacts list page)
// =============================================================================

const SAMPLE_CONTACTS: Record<string, ContactDetailData> = {
  ct1: {
    id: "ct1",
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah@techflow.ai",
    phone: "+1 (415) 555-0123",
    role: "CEO",
    linkedinUrl: "https://linkedin.com/in/sarahchen",
    notes: "Met at TechCrunch Disrupt 2024. Strong technical background with 10+ years in AI/ML. Previously led engineering at DataScale (acquired by Google). Very responsive and transparent communication style.",
    isPrimary: true,
    createdAt: "2024-06-15T10:00:00Z",
    updatedAt: "2024-12-20T14:30:00Z",
    company: {
      id: "c1",
      name: "TechFlow AI",
      stage: "ENGAGED",
      sector: "AI/ML",
      website: "https://techflow.ai",
      location: "San Francisco, CA",
    },
    deals: [
      {
        id: "d1",
        dealName: "TechFlow AI - Series A",
        stage: "DEEP_DIVE",
        amount: 5000000,
        valuation: 25000000,
        probability: 65,
        expectedClose: "2025-03-15T00:00:00Z",
        createdAt: "2024-11-01T00:00:00Z",
        company: { id: "c1", name: "TechFlow AI" },
      },
    ],
    activities: [
      {
        id: "a1",
        type: "MEETING",
        subject: "Deep Dive Technical Review",
        description: "Reviewed architecture, scalability plans, and technical roadmap with CTO.",
        activityDate: "2024-12-18T15:00:00Z",
        company: { id: "c1", name: "TechFlow AI" },
        deal: { id: "d1", dealName: "TechFlow AI - Series A" },
      },
      {
        id: "a2",
        type: "EMAIL",
        subject: "Follow-up: Data Room Access",
        description: "Sent data room credentials and requested financials for Q3.",
        activityDate: "2024-12-15T09:30:00Z",
        company: { id: "c1", name: "TechFlow AI" },
        deal: { id: "d1", dealName: "TechFlow AI - Series A" },
      },
      {
        id: "a3",
        type: "CALL",
        subject: "Initial Screening Call",
        description: "30-minute intro call to discuss company vision and funding needs.",
        activityDate: "2024-11-10T14:00:00Z",
        company: { id: "c1", name: "TechFlow AI" },
        deal: null,
      },
    ],
    _count: { deals: 1, activities: 3 },
  },
  ct2: {
    id: "ct2",
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike@datasync.io",
    phone: "+1 (650) 555-0456",
    role: "CTO",
    linkedinUrl: "https://linkedin.com/in/mikejohnson",
    notes: "Technical co-founder, ex-Stripe infrastructure team. Deep expertise in distributed systems and real-time data processing.",
    isPrimary: true,
    createdAt: "2024-05-20T08:00:00Z",
    updatedAt: "2024-12-19T11:00:00Z",
    company: {
      id: "c2",
      name: "DataSync Pro",
      stage: "DUE_DILIGENCE",
      sector: "Data Infrastructure",
      website: "https://datasync.io",
      location: "Palo Alto, CA",
    },
    deals: [
      {
        id: "d2",
        dealName: "DataSync Pro - Seed Extension",
        stage: "PARTNER_REVIEW",
        amount: 2500000,
        valuation: 15000000,
        probability: 75,
        expectedClose: "2025-02-01T00:00:00Z",
        createdAt: "2024-10-15T00:00:00Z",
        company: { id: "c2", name: "DataSync Pro" },
      },
    ],
    activities: [
      {
        id: "a4",
        type: "MEETING",
        subject: "Partner Review Presentation",
        description: "Presented investment thesis to partnership committee.",
        activityDate: "2024-12-17T10:00:00Z",
        company: { id: "c2", name: "DataSync Pro" },
        deal: { id: "d2", dealName: "DataSync Pro - Seed Extension" },
      },
    ],
    _count: { deals: 1, activities: 1 },
  },
  ct3: {
    id: "ct3",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily@quantumlabs.io",
    phone: "+1 (617) 555-0789",
    role: "CFO",
    linkedinUrl: "https://linkedin.com/in/emilydavis",
    notes: "Strong finance background, previously VP Finance at Moderna. Very detail-oriented on financial projections.",
    isPrimary: false,
    createdAt: "2024-07-10T12:00:00Z",
    updatedAt: "2024-12-10T16:00:00Z",
    company: {
      id: "c3",
      name: "Quantum Labs",
      stage: "QUALIFIED",
      sector: "Quantum Computing",
      website: "https://quantumlabs.io",
      location: "Boston, MA",
    },
    deals: [],
    activities: [
      {
        id: "a5",
        type: "EMAIL",
        subject: "Financial Model Review",
        description: "Received updated 5-year financial projections.",
        activityDate: "2024-12-08T11:00:00Z",
        company: { id: "c3", name: "Quantum Labs" },
        deal: null,
      },
    ],
    _count: { deals: 0, activities: 1 },
  },
  ct4: {
    id: "ct4",
    firstName: "Alex",
    lastName: "Wong",
    email: "alex@financeos.io",
    phone: "+1 (212) 555-0321",
    role: "Founder",
    linkedinUrl: "https://linkedin.com/in/alexwong",
    notes: "Serial entrepreneur, 2nd company. First company (PayStack) acquired by Stripe. Strong network in fintech space.",
    isPrimary: true,
    createdAt: "2024-04-05T14:00:00Z",
    updatedAt: "2024-12-15T09:00:00Z",
    company: {
      id: "c4",
      name: "FinanceOS",
      stage: "ENGAGED",
      sector: "FinTech",
      website: "https://financeos.io",
      location: "New York, NY",
    },
    deals: [
      {
        id: "d3",
        dealName: "FinanceOS - Series A",
        stage: "MEETING_SCHEDULED",
        amount: 8000000,
        valuation: 40000000,
        probability: 40,
        expectedClose: "2025-04-30T00:00:00Z",
        createdAt: "2024-12-01T00:00:00Z",
        company: { id: "c4", name: "FinanceOS" },
      },
    ],
    activities: [],
    _count: { deals: 1, activities: 0 },
  },
  ct5: {
    id: "ct5",
    firstName: "Jennifer",
    lastName: "Lee",
    email: "jennifer@healthbridge.com",
    phone: "+1 (858) 555-0654",
    role: "CEO",
    linkedinUrl: "https://linkedin.com/in/jenniferlee",
    notes: "Healthcare industry veteran, 15+ years. Former SVP at United Health. Strong regulatory expertise.",
    isPrimary: true,
    createdAt: "2024-03-15T16:00:00Z",
    updatedAt: "2024-11-28T10:00:00Z",
    company: {
      id: "c5",
      name: "HealthBridge",
      stage: "PORTFOLIO",
      sector: "HealthTech",
      website: "https://healthbridge.com",
      location: "San Diego, CA",
    },
    deals: [
      {
        id: "d4",
        dealName: "HealthBridge - Series B",
        stage: "CLOSED_WON",
        amount: 15000000,
        valuation: 80000000,
        probability: 100,
        expectedClose: "2024-09-01T00:00:00Z",
        createdAt: "2024-06-01T00:00:00Z",
        company: { id: "c5", name: "HealthBridge" },
      },
    ],
    activities: [
      {
        id: "a6",
        type: "MEETING",
        subject: "Quarterly Board Meeting",
        description: "Q3 board meeting - reviewed financials, product roadmap, and hiring plan.",
        activityDate: "2024-11-15T13:00:00Z",
        company: { id: "c5", name: "HealthBridge" },
        deal: null,
      },
    ],
    _count: { deals: 1, activities: 1 },
  },
  ct6: {
    id: "ct6",
    firstName: "David",
    lastName: "Brown",
    email: "david@cloudscale.io",
    phone: "+1 (206) 555-0987",
    role: "VP Engineering",
    linkedinUrl: "https://linkedin.com/in/davidbrown",
    notes: "Technical lead, reports to CEO. Good source for technical DD questions.",
    isPrimary: false,
    createdAt: "2024-08-22T11:00:00Z",
    updatedAt: "2024-12-01T15:00:00Z",
    company: {
      id: "c6",
      name: "CloudScale",
      stage: "PROSPECT",
      sector: "Cloud Infrastructure",
      website: "https://cloudscale.io",
      location: "Seattle, WA",
    },
    deals: [],
    activities: [
      {
        id: "a7",
        type: "INTRO",
        subject: "Intro from John at Sequoia",
        description: "Warm intro from John Smith, partner at Sequoia. Company raising Series A.",
        activityDate: "2024-11-20T09:00:00Z",
        company: { id: "c6", name: "CloudScale" },
        deal: null,
      },
    ],
    _count: { deals: 0, activities: 1 },
  },
};

// =============================================================================
// SERVER COMPONENT - DATA FETCHING
// =============================================================================

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactDetailPage({ params }: PageProps) {
  const { id } = await params;

  // First try to get from database
  const dbContact = await getContactWithFullDetails(id);

  // If found in database, map to component format
  if (dbContact) {
    const contactData: ContactDetailData = {
      id: dbContact.id,
      firstName: dbContact.firstName,
      lastName: dbContact.lastName,
      email: dbContact.email,
      phone: dbContact.phone,
      role: dbContact.role,
      linkedinUrl: dbContact.linkedinUrl,
      notes: dbContact.notes,
      isPrimary: dbContact.isPrimary,
      createdAt: dbContact.createdAt.toISOString(),
      updatedAt: dbContact.updatedAt.toISOString(),
      company: dbContact.company
        ? {
            id: dbContact.company.id,
            name: dbContact.company.name,
            stage: dbContact.company.stage,
            sector: dbContact.company.sector,
            website: dbContact.company.website,
            location: dbContact.company.location,
          }
        : null,
      deals: dbContact.deals.map((d) => ({
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
      activities: dbContact.activities.map((a) => ({
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
      _count: dbContact._count,
    };

    return <ContactDetailView contact={contactData} />;
  }

  // Fallback to sample data for development
  const sampleContact = SAMPLE_CONTACTS[id];
  if (sampleContact) {
    return <ContactDetailView contact={sampleContact} />;
  }

  // Neither database nor sample data has this contact
  notFound();
}

// =============================================================================
// METADATA
// =============================================================================

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  // First try database
  const dbContact = await getContactWithFullDetails(id);
  if (dbContact) {
    const fullName = `${dbContact.firstName} ${dbContact.lastName}`;
    return {
      title: `${fullName} | Mortis Atlas`,
      description: dbContact.role
        ? `${fullName} - ${dbContact.role}${dbContact.company ? ` at ${dbContact.company.name}` : ""}`
        : `View contact details for ${fullName}`,
    };
  }

  // Fallback to sample data
  const sampleContact = SAMPLE_CONTACTS[id];
  if (sampleContact) {
    const fullName = `${sampleContact.firstName} ${sampleContact.lastName}`;
    return {
      title: `${fullName} | Mortis Atlas`,
      description: sampleContact.role
        ? `${fullName} - ${sampleContact.role}${sampleContact.company ? ` at ${sampleContact.company.name}` : ""}`
        : `View contact details for ${fullName}`,
    };
  }

  return {
    title: "Contact Not Found | Mortis Atlas",
  };
}
