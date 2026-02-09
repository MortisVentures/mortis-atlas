import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createLPUser() {
  const hashedPassword = await bcrypt.hash("TestLP2024!@#", 12);

  // Create LP user
  const user = await prisma.user.upsert({
    where: { email: "lp-test@mortis.vc" },
    update: {
      role: "LP",
      isActive: true,
      password: hashedPassword,
    },
    create: {
      email: "lp-test@mortis.vc",
      name: "Test LP Investor",
      role: "LP",
      password: hashedPassword,
      isActive: true,
    },
  });

  console.log("Created LP User:", user.email);

  // Create LP Profile with sample data
  const lpProfile = await prisma.lPProfile.upsert({
    where: { userId: user.id },
    update: {
      entityName: "Acme Family Office",
      entityType: "Family Office",
      commitmentAmount: 2500000,
      calledCapital: 1250000,
      distributions: 150000,
      fundAccess: ["Fund I"],
      quarterlyReportsEmail: true,
      capitalCallsEmail: true,
      taxDocumentsEmail: true,
      accreditedInvestor: true,
      kycVerified: true,
      kycVerifiedAt: new Date(),
    },
    create: {
      userId: user.id,
      entityName: "Acme Family Office",
      entityType: "Family Office",
      commitmentAmount: 2500000,
      calledCapital: 1250000,
      distributions: 150000,
      fundAccess: ["Fund I"],
      quarterlyReportsEmail: true,
      capitalCallsEmail: true,
      taxDocumentsEmail: true,
      accreditedInvestor: true,
      kycVerified: true,
      kycVerifiedAt: new Date(),
    },
  });

  console.log("Created LP Profile:", lpProfile.entityName);
  console.log("");
  console.log("=== LP Test Account ===");
  console.log("Email: lp-test@mortis.vc");
  console.log("Password: TestLP2024!@#");
  console.log("");
  console.log("LP Profile:");
  console.log("  Entity: Acme Family Office");
  console.log("  Commitment: $2,500,000");
  console.log("  Called: $1,250,000 (50%)");
  console.log("  Distributions: $150,000");
}

createLPUser()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
