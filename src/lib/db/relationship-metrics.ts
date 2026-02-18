import { prisma } from "./prisma";
import { RelationshipHeat } from "@prisma/client";

// =============================================================================
// RELATIONSHIP METRICS QUERIES
// =============================================================================

/**
 * Get relationship metrics for a company
 */
export async function getCompanyMetrics(companyId: string, userId: string) {
  return prisma.relationshipMetrics.findUnique({
    where: {
      userId_entityType_entityId: {
        userId,
        entityType: "company",
        entityId: companyId,
      },
    },
  });
}

/**
 * Get relationship metrics for a contact
 */
export async function getContactMetrics(contactId: string, userId: string) {
  return prisma.relationshipMetrics.findUnique({
    where: {
      userId_entityType_entityId: {
        userId,
        entityType: "contact",
        entityId: contactId,
      },
    },
  });
}

/**
 * Get all company metrics for a user, sorted by heat
 */
export async function getAllCompanyMetrics(
  userId: string,
  options: {
    heat?: RelationshipHeat;
    limit?: number;
    offset?: number;
  } = {}
) {
  const { heat, limit = 50, offset = 0 } = options;

  const where = {
    userId,
    entityType: "company",
    ...(heat && { heat }),
  };

  const [metrics, total] = await Promise.all([
    prisma.relationshipMetrics.findMany({
      where,
      orderBy: { heatScore: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.relationshipMetrics.count({ where }),
  ]);

  return { metrics, total };
}

/**
 * Get all contact metrics for a user
 */
export async function getAllContactMetrics(
  userId: string,
  options: {
    heat?: RelationshipHeat;
    limit?: number;
    offset?: number;
  } = {}
) {
  const { heat, limit = 50, offset = 0 } = options;

  const where = {
    userId,
    entityType: "contact",
    ...(heat && { heat }),
  };

  const [metrics, total] = await Promise.all([
    prisma.relationshipMetrics.findMany({
      where,
      orderBy: { heatScore: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.relationshipMetrics.count({ where }),
  ]);

  return { metrics, total };
}

/**
 * Get heat distribution summary
 */
export async function getHeatDistribution(userId: string, entityType: "company" | "contact") {
  const counts = await prisma.relationshipMetrics.groupBy({
    by: ["heat"],
    where: {
      userId,
      entityType,
    },
    _count: { id: true },
  });

  const distribution: Record<RelationshipHeat, number> = {
    HOT: 0,
    WARM: 0,
    COOLING: 0,
    COLD: 0,
  };

  for (const count of counts) {
    distribution[count.heat] = count._count.id;
  }

  return distribution;
}

/**
 * Get companies with cooling or cold relationships
 */
export async function getCoolingRelationships(userId: string) {
  const metrics = await prisma.relationshipMetrics.findMany({
    where: {
      userId,
      entityType: "company",
      heat: { in: ["COOLING", "COLD"] },
      totalMeetings: { gt: 0 }, // Only include companies with prior engagement
    },
    orderBy: { daysSinceLastMeeting: "desc" },
    take: 10,
  });

  // Fetch company details
  const companyIds = metrics.map((m) => m.entityId);
  const companies = await prisma.company.findMany({
    where: { id: { in: companyIds } },
    select: { id: true, name: true, stage: true },
  });

  const companyMap = new Map(companies.map((c) => [c.id, c]));

  return metrics.map((m) => ({
    ...m,
    company: companyMap.get(m.entityId) || null,
  }));
}

/**
 * Get hot relationships
 */
export async function getHotRelationships(userId: string) {
  const metrics = await prisma.relationshipMetrics.findMany({
    where: {
      userId,
      entityType: "company",
      heat: "HOT",
    },
    orderBy: { heatScore: "desc" },
    take: 10,
  });

  const companyIds = metrics.map((m) => m.entityId);
  const companies = await prisma.company.findMany({
    where: { id: { in: companyIds } },
    select: { id: true, name: true, stage: true },
  });

  const companyMap = new Map(companies.map((c) => [c.id, c]));

  return metrics.map((m) => ({
    ...m,
    company: companyMap.get(m.entityId) || null,
  }));
}

/**
 * Get relationship trend alerts (companies that are cooling significantly)
 */
export async function getRelationshipAlerts(userId: string) {
  return prisma.relationshipMetrics.findMany({
    where: {
      userId,
      entityType: "company",
      trendDirection: { lt: -0.3 }, // Declining by more than 30%
      totalMeetings: { gt: 2 }, // Has had some engagement
    },
    orderBy: { trendDirection: "asc" },
    take: 5,
  });
}
