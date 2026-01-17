"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { CompanyStage } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/lib/auth";

// Validation schema
const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  stage: z.nativeEnum(CompanyStage),
  sector: z.string().optional(),
  location: z.string().optional(),
  foundedYear: z.coerce.number().int().min(1900).max(2100).optional().or(z.literal("")),
  employeeCount: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export async function createCompany(formData: FormData) {
  // Get authenticated user
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }
  const userId = session.user.id;

  const rawData = {
    name: formData.get("name") as string,
    website: formData.get("website") as string,
    description: formData.get("description") as string,
    stage: formData.get("stage") as CompanyStage,
    sector: formData.get("sector") as string,
    location: formData.get("location") as string,
    foundedYear: formData.get("foundedYear") as string,
    employeeCount: formData.get("employeeCount") as string,
    linkedinUrl: formData.get("linkedinUrl") as string,
    notes: formData.get("notes") as string,
  };

  const validated = companySchema.parse(rawData);

  const company = await prisma.company.create({
    data: {
      name: validated.name,
      website: validated.website || null,
      description: validated.description || null,
      stage: validated.stage,
      sector: validated.sector || null,
      location: validated.location || null,
      foundedYear: validated.foundedYear ? Number(validated.foundedYear) : null,
      employeeCount: validated.employeeCount || null,
      linkedinUrl: validated.linkedinUrl || null,
      notes: validated.notes || null,
      userId,
    },
  });

  revalidatePath("/companies");
  redirect(`/companies/${company.id}`);
}

export async function updateCompany(id: string, formData: FormData) {
  // Get authenticated user
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Verify ownership
  const existing = await prisma.company.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!existing || existing.userId !== session.user.id) {
    throw new Error("Not authorized to update this company");
  }

  const rawData = {
    name: formData.get("name") as string,
    website: formData.get("website") as string,
    description: formData.get("description") as string,
    stage: formData.get("stage") as CompanyStage,
    sector: formData.get("sector") as string,
    location: formData.get("location") as string,
    foundedYear: formData.get("foundedYear") as string,
    employeeCount: formData.get("employeeCount") as string,
    linkedinUrl: formData.get("linkedinUrl") as string,
    notes: formData.get("notes") as string,
  };

  const validated = companySchema.parse(rawData);

  await prisma.company.update({
    where: { id },
    data: {
      name: validated.name,
      website: validated.website || null,
      description: validated.description || null,
      stage: validated.stage,
      sector: validated.sector || null,
      location: validated.location || null,
      foundedYear: validated.foundedYear ? Number(validated.foundedYear) : null,
      employeeCount: validated.employeeCount || null,
      linkedinUrl: validated.linkedinUrl || null,
      notes: validated.notes || null,
    },
  });

  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
  redirect(`/companies/${id}`);
}

export async function deleteCompany(id: string) {
  // Get authenticated user
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Verify ownership
  const existing = await prisma.company.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!existing || existing.userId !== session.user.id) {
    throw new Error("Not authorized to delete this company");
  }

  await prisma.company.delete({
    where: { id },
  });

  revalidatePath("/companies");
  redirect("/companies");
}
