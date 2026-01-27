import { prisma } from "./prisma";
import { Company, CompanyStage, DealSource, Prisma } from "@prisma/client";

// ============================================
// Types
// ============================================

export interface CompanyFilters {
  stage?: CompanyStage;
  sector?: string;
  search?: string;
  userId?: string;
  sourceType?: DealSource;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface CompanyInput {
  name: string;
  website?: string | null;
  description?: string | null;
  stage?: CompanyStage;
  sector?: string | null;
  location?: string | null;
  foundedYear?: number | null;
  employeeCount?: string | null;
  fundingRound?: string | null;
  fundingAmount?: number | null;
  valuation?: number | null;
  linkedinUrl?: string | null;
  twitterHandle?: string | null;
  logoUrl?: string | null;
  notes?: string | null;
  userId: string;
  // Source Attribution
  sourceType?: DealSource | null;
  sourceChannel?: string | null;
  sourceDetail?: string | null;
  referrerContactId?: string | null;
  referralDate?: Date | null;
}

export interface CompanyUpdate {
  name?: string;
  website?: string | null;
  description?: string | null;
  stage?: CompanyStage;
  sector?: string | null;
  location?: string | null;
  foundedYear?: number | null;
  employeeCount?: string | null;
  fundingRound?: string | null;
  fundingAmount?: number | null;
  valuation?: number | null;
  linkedinUrl?: string | null;
  twitterHandle?: string | null;
  logoUrl?: string | null;
  notes?: string | null;
  // Source Attribution
  sourceType?: DealSource | null;
  sourceChannel?: string | null;
  sourceDetail?: string | null;
  referrerContactId?: string | null;
  referralDate?: Date | null;
}

export interface CompanyWithRelations extends Company {
  contacts: { id: string; firstName: string; lastName: string; role: string | null; isPrimary: boolean }[];
  deals: { id: string; dealName: string; stage: string; amount: Prisma.Decimal | null }[];
  referrerContact: {
    id: string;
    firstName: string;
    lastName: string;
    company: { name: string } | null;
  } | null;
  _count: {
    contacts: number;
    deals: number;
    activities: number;
  };
}

export interface CompanyStats {
  total: number;
  byStage: Record<CompanyStage, number>;
  bySector: { sector: string; count: number }[];
  recentlyUpdated: number;
}

// ============================================
// Query Functions
// ============================================

/**
 * Get companies with optional filtering and pagination
 */
export async function getCompanies(
  filters?: CompanyFilters,
  pagination?: PaginationParams
): Promise<PaginatedResponse<CompanyWithRelations>> {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 20;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.CompanyWhereInput = {};

  if (filters?.stage) {
    where.stage = filters.stage;
  }

  if (filters?.sector) {
    where.sector = filters.sector;
  }

  if (filters?.userId) {
    where.userId = filters.userId;
  }

  if (filters?.sourceType) {
    where.sourceType = filters.sourceType;
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { sector: { contains: filters.search, mode: "insensitive" } },
      { location: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  // Execute queries in parallel
  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        contacts: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            isPrimary: true,
          },
          orderBy: { isPrimary: "desc" },
          take: 3,
        },
        deals: {
          select: {
            id: true,
            dealName: true,
            stage: true,
            amount: true,
          },
          orderBy: { updatedAt: "desc" },
          take: 3,
        },
        referrerContact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            contacts: true,
            deals: true,
            activities: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.company.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: companies as CompanyWithRelations[],
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * Get a single company by ID with all relations
 */
export async function getCompanyById(
  id: string
): Promise<CompanyWithRelations | null> {
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      contacts: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          isPrimary: true,
        },
        orderBy: { isPrimary: "desc" },
      },
      deals: {
        select: {
          id: true,
          dealName: true,
          stage: true,
          amount: true,
        },
        orderBy: { updatedAt: "desc" },
      },
      _count: {
        select: {
          contacts: true,
          deals: true,
          activities: true,
        },
      },
    },
  });

  return company as CompanyWithRelations | null;
}

/**
 * Get company with full details including activities
 */
export async function getCompanyWithFullDetails(id: string) {
  return prisma.company.findUnique({
    where: { id },
    include: {
      contacts: {
        orderBy: { isPrimary: "desc" },
      },
      deals: {
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      },
      activities: {
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { activityDate: "desc" },
        take: 20,
      },
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: {
          contacts: true,
          deals: true,
          activities: true,
        },
      },
    },
  });
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Create a new company
 */
export async function createCompany(data: CompanyInput): Promise<Company> {
  return prisma.company.create({
    data: {
      name: data.name,
      website: data.website,
      description: data.description,
      stage: data.stage ?? "PROSPECT",
      sector: data.sector,
      location: data.location,
      foundedYear: data.foundedYear,
      employeeCount: data.employeeCount,
      fundingRound: data.fundingRound,
      fundingAmount: data.fundingAmount,
      valuation: data.valuation,
      linkedinUrl: data.linkedinUrl,
      twitterHandle: data.twitterHandle,
      logoUrl: data.logoUrl,
      notes: data.notes,
      userId: data.userId,
      // Source Attribution
      sourceType: data.sourceType,
      sourceChannel: data.sourceChannel,
      sourceDetail: data.sourceDetail,
      referrerContactId: data.referrerContactId,
    },
  });
}

/**
 * Update an existing company
 */
export async function updateCompany(
  id: string,
  data: CompanyUpdate
): Promise<Company> {
  return prisma.company.update({
    where: { id },
    data,
  });
}

/**
 * Delete a company (hard delete - cascades to related records)
 * Note: For soft delete, add a `deletedAt` field to the schema
 */
export async function deleteCompany(id: string): Promise<Company> {
  return prisma.company.delete({
    where: { id },
  });
}

/**
 * Soft delete a company by marking it as deleted
 * Requires adding `deletedAt DateTime?` to Company model
 */
// export async function softDeleteCompany(id: string): Promise<Company> {
//   return prisma.company.update({
//     where: { id },
//     data: { deletedAt: new Date() },
//   });
// }

// ============================================
// Analytics Functions
// ============================================

/**
 * Get aggregate statistics for companies
 */
export async function getCompanyStats(userId?: string): Promise<CompanyStats> {
  const where: Prisma.CompanyWhereInput = userId ? { userId } : {};

  // Get total count
  const total = await prisma.company.count({ where });

  // Get count by stage
  const stageGroups = await prisma.company.groupBy({
    by: ["stage"],
    where,
    _count: { id: true },
  });

  const byStage = Object.values(CompanyStage).reduce(
    (acc, stage) => {
      const found = stageGroups.find((g) => g.stage === stage);
      acc[stage] = found?._count.id ?? 0;
      return acc;
    },
    {} as Record<CompanyStage, number>
  );

  // Get count by sector (top 10)
  const sectorGroups = await prisma.company.groupBy({
    by: ["sector"],
    where: {
      ...where,
      sector: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  const bySector = sectorGroups
    .filter((g) => g.sector !== null)
    .map((g) => ({
      sector: g.sector as string,
      count: g._count.id,
    }));

  // Get recently updated (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentlyUpdated = await prisma.company.count({
    where: {
      ...where,
      updatedAt: { gte: sevenDaysAgo },
    },
  });

  return {
    total,
    byStage,
    bySector,
    recentlyUpdated,
  };
}

/**
 * Get unique sectors for filtering
 */
export async function getUniqueSectors(userId?: string): Promise<string[]> {
  const where: Prisma.CompanyWhereInput = {
    sector: { not: null },
    ...(userId ? { userId } : {}),
  };

  const sectors = await prisma.company.findMany({
    where,
    select: { sector: true },
    distinct: ["sector"],
    orderBy: { sector: "asc" },
  });

  return sectors
    .map((s) => s.sector)
    .filter((s): s is string => s !== null);
}

/**
 * Get source types in use for filtering
 */
export async function getUniqueSourceTypes(userId?: string): Promise<DealSource[]> {
  const where: Prisma.CompanyWhereInput = {
    sourceType: { not: null },
    ...(userId ? { userId } : {}),
  };

  const sources = await prisma.company.findMany({
    where,
    select: { sourceType: true },
    distinct: ["sourceType"],
  });

  return sources
    .map((s) => s.sourceType)
    .filter((s): s is DealSource => s !== null);
}

/**
 * Search companies by name (for autocomplete)
 */
export async function searchCompanies(
  query: string,
  limit: number = 10,
  userId?: string
): Promise<Pick<Company, "id" | "name" | "stage" | "sector">[]> {
  return prisma.company.findMany({
    where: {
      name: { contains: query, mode: "insensitive" },
      ...(userId ? { userId } : {}),
    },
    select: {
      id: true,
      name: true,
      stage: true,
      sector: true,
    },
    take: limit,
    orderBy: { name: "asc" },
  });
}
