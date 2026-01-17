-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "fundingAmount" DECIMAL(15,2),
ADD COLUMN     "fundingRound" TEXT,
ADD COLUMN     "twitterHandle" TEXT;
