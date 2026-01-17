import { prisma } from "./prisma";
import { Contact, Prisma } from "@prisma/client";

// ============================================
// Types
// ============================================

export interface ContactFilters {
  companyId?: string;
  search?: string;
  userId?: string;
}

export interface ContactWithRelations extends Contact {
  company: { id: string; name: string; stage: string; sector: string | null } | null;
  deals: {
    id: string;
    dealName: string;
    stage: string;
    amount: Prisma.Decimal | null;
    company: { id: string; name: string } | null;
  }[];
  activities: {
    id: string;
    type: string;
    subject: string;
    description: string | null;
    activityDate: Date;
  }[];
  _count: {
    deals: number;
    activities: number;
  };
}

export interface ContactFullDetails extends Contact {
  company: {
    id: string;
    name: string;
    stage: string;
    sector: string | null;
    website: string | null;
    location: string | null;
  } | null;
  deals: {
    id: string;
    dealName: string;
    stage: string;
    amount: Prisma.Decimal | null;
    valuation: Prisma.Decimal | null;
    probability: number | null;
    expectedClose: Date | null;
    createdAt: Date;
    company: { id: string; name: string } | null;
  }[];
  activities: {
    id: string;
    type: string;
    subject: string;
    description: string | null;
    activityDate: Date;
    company: { id: string; name: string } | null;
    deal: { id: string; dealName: string } | null;
  }[];
  _count: {
    deals: number;
    activities: number;
  };
}

// ============================================
// Query Functions
// ============================================

/**
 * Get a single contact by ID with basic relations
 */
export async function getContactById(
  id: string
): Promise<ContactWithRelations | null> {
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          stage: true,
          sector: true,
        },
      },
      deals: {
        select: {
          id: true,
          dealName: true,
          stage: true,
          amount: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      },
      activities: {
        select: {
          id: true,
          type: true,
          subject: true,
          description: true,
          activityDate: true,
        },
        orderBy: { activityDate: "desc" },
        take: 10,
      },
      _count: {
        select: {
          deals: true,
          activities: true,
        },
      },
    },
  });

  return contact as ContactWithRelations | null;
}

/**
 * Get contact with full details including all activities
 */
export async function getContactWithFullDetails(
  id: string
): Promise<ContactFullDetails | null> {
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          stage: true,
          sector: true,
          website: true,
          location: true,
        },
      },
      deals: {
        select: {
          id: true,
          dealName: true,
          stage: true,
          amount: true,
          valuation: true,
          probability: true,
          expectedClose: true,
          createdAt: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      },
      activities: {
        select: {
          id: true,
          type: true,
          subject: true,
          description: true,
          activityDate: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          deal: {
            select: {
              id: true,
              dealName: true,
            },
          },
        },
        orderBy: { activityDate: "desc" },
        take: 50,
      },
      _count: {
        select: {
          deals: true,
          activities: true,
        },
      },
    },
  });

  return contact as ContactFullDetails | null;
}

/**
 * Get all contacts with optional filtering
 */
export async function getContacts(
  filters?: ContactFilters
): Promise<ContactWithRelations[]> {
  const where: Prisma.ContactWhereInput = {};

  if (filters?.companyId) {
    where.companyId = filters.companyId;
  }

  if (filters?.userId) {
    where.userId = filters.userId;
  }

  if (filters?.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: "insensitive" } },
      { lastName: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { company: { name: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  const contacts = await prisma.contact.findMany({
    where,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          stage: true,
          sector: true,
        },
      },
      deals: {
        select: {
          id: true,
          dealName: true,
          stage: true,
          amount: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 3,
      },
      activities: {
        select: {
          id: true,
          type: true,
          subject: true,
          description: true,
          activityDate: true,
        },
        orderBy: { activityDate: "desc" },
        take: 5,
      },
      _count: {
        select: {
          deals: true,
          activities: true,
        },
      },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return contacts as ContactWithRelations[];
}
