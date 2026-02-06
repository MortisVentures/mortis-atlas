import { prisma } from "./prisma";
import { Activity, ActivityType, Prisma } from "@prisma/client";

// Re-export config from the client-safe location
export { ACTIVITY_TYPE_CONFIG } from "@/lib/activities";

// =============================================================================
// TYPES
// =============================================================================

export interface ActivityInput {
  type: ActivityType;
  subject: string;
  description?: string | null;
  activityDate?: Date;
  dueDate?: Date | null;
  completed?: boolean;
  userId: string;
  companyId?: string | null;
  dealId?: string | null;
  contactId?: string | null;
}

export interface ActivityFilters {
  userId: string;
  companyId?: string;
  dealId?: string;
  contactId?: string;
  type?: ActivityType | ActivityType[];
  completed?: boolean;
  upcoming?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface ActivityWithRelations extends Activity {
  company: {
    id: string;
    name: string;
  } | null;
  deal: {
    id: string;
    dealName: string;
  } | null;
  contact: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

// =============================================================================
// ACTIVITY CRUD OPERATIONS
// =============================================================================

export async function getActivities(
  filters: ActivityFilters
): Promise<ActivityWithRelations[]> {
  const where: Prisma.ActivityWhereInput = {
    userId: filters.userId,
  };

  if (filters.companyId) {
    where.companyId = filters.companyId;
  }

  if (filters.dealId) {
    where.dealId = filters.dealId;
  }

  if (filters.contactId) {
    where.contactId = filters.contactId;
  }

  if (filters.type) {
    where.type = Array.isArray(filters.type)
      ? { in: filters.type }
      : filters.type;
  }

  if (filters.completed !== undefined) {
    where.completed = filters.completed;
  }

  if (filters.upcoming) {
    where.activityDate = { gte: new Date() };
  }

  if (filters.startDate || filters.endDate) {
    where.activityDate = {
      ...(filters.startDate && { gte: filters.startDate }),
      ...(filters.endDate && { lte: filters.endDate }),
    };
  }

  return prisma.activity.findMany({
    where,
    include: {
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
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [
      { activityDate: "desc" },
      { createdAt: "desc" },
    ],
    take: filters.limit,
    skip: filters.offset,
  }) as Promise<ActivityWithRelations[]>;
}

export async function getActivityById(
  id: string,
  userId: string
): Promise<ActivityWithRelations | null> {
  return prisma.activity.findFirst({
    where: { id, userId },
    include: {
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
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  }) as Promise<ActivityWithRelations | null>;
}

export async function createActivity(data: ActivityInput): Promise<Activity> {
  const activity = await prisma.activity.create({
    data: {
      type: data.type,
      subject: data.subject,
      description: data.description,
      activityDate: data.activityDate || new Date(),
      dueDate: data.dueDate,
      completed: data.completed ?? false,
      userId: data.userId,
      companyId: data.companyId,
      dealId: data.dealId,
      contactId: data.contactId,
    },
  });

  // Update deal's lastActivityDate if associated with a deal
  if (data.dealId) {
    await prisma.deal.update({
      where: { id: data.dealId },
      data: { lastActivityDate: new Date() },
    });
  }

  return activity;
}

export async function updateActivity(
  id: string,
  userId: string,
  data: Partial<ActivityInput>
): Promise<Activity | null> {
  // Verify ownership
  const existing = await prisma.activity.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return null;
  }

  const { userId: _userId, ...updateData } = data;

  const activity = await prisma.activity.update({
    where: { id },
    data: updateData,
  });

  // Update deal's lastActivityDate if associated with a deal
  if (activity.dealId) {
    await prisma.deal.update({
      where: { id: activity.dealId },
      data: { lastActivityDate: new Date() },
    });
  }

  return activity;
}

export async function deleteActivity(
  id: string,
  userId: string
): Promise<boolean> {
  const existing = await prisma.activity.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return false;
  }

  await prisma.activity.delete({ where: { id } });
  return true;
}

// =============================================================================
// ACTIVITY HELPERS
// =============================================================================

export async function getUpcomingMeetings(
  userId: string,
  limit: number = 5
): Promise<ActivityWithRelations[]> {
  return getActivities({
    userId,
    type: ActivityType.MEETING,
    upcoming: true,
    completed: false,
    limit,
  });
}

export async function getRecentActivities(
  userId: string,
  limit: number = 10
): Promise<ActivityWithRelations[]> {
  return getActivities({
    userId,
    limit,
  });
}

export async function getActivitiesByDeal(
  dealId: string,
  userId: string
): Promise<ActivityWithRelations[]> {
  return getActivities({
    userId,
    dealId,
  });
}

export async function getActivitiesByCompany(
  companyId: string,
  userId: string
): Promise<ActivityWithRelations[]> {
  return getActivities({
    userId,
    companyId,
  });
}

export async function getActivitiesByContact(
  contactId: string,
  userId: string
): Promise<ActivityWithRelations[]> {
  return getActivities({
    userId,
    contactId,
  });
}

export async function markActivityCompleted(
  id: string,
  userId: string,
  completed: boolean = true
): Promise<Activity | null> {
  return updateActivity(id, userId, { completed });
}

