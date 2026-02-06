import { z } from "zod";
import { ActivityType } from "@prisma/client";

// Activity type enum schema
const activityTypeSchema = z.nativeEnum(ActivityType);

// Create activity schema
export const createActivitySchema = z.object({
  type: activityTypeSchema,
  subject: z.string().min(1, "Subject is required").max(200),
  description: z.string().max(2000).optional().nullable(),
  activityDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional().nullable(),
  completed: z.boolean().optional().default(false),
  companyId: z.string().cuid().optional().nullable(),
  dealId: z.string().cuid().optional().nullable(),
  contactId: z.string().cuid().optional().nullable(),
});

// Update activity schema (all fields optional)
export const updateActivitySchema = z.object({
  type: activityTypeSchema.optional(),
  subject: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  activityDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional().nullable(),
  completed: z.boolean().optional(),
  companyId: z.string().cuid().optional().nullable(),
  dealId: z.string().cuid().optional().nullable(),
  contactId: z.string().cuid().optional().nullable(),
});

// Filter schema for GET requests
export const activityFilterSchema = z.object({
  companyId: z.string().cuid().optional(),
  dealId: z.string().cuid().optional(),
  contactId: z.string().cuid().optional(),
  type: z.string().optional().transform((val) => {
    if (!val) return undefined;
    const types = val.split(",");
    // Validate each type
    return types.filter((t) => Object.values(ActivityType).includes(t as ActivityType)) as ActivityType[];
  }),
  completed: z.string().optional().transform((val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return undefined;
  }),
  upcoming: z.string().optional().transform((val) => val === "true"),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type ActivityFilterInput = z.infer<typeof activityFilterSchema>;
