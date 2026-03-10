/*
  Warnings:

  - The `category` column on the `tickets` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `sentiment` column on the `tickets` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('BUG', 'FEATURE_REQUEST', 'BILLING', 'TECHNICAL', 'SUPPORT', 'GENERAL');

-- CreateEnum
CREATE TYPE "TicketSentiment" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'FRUSTRATED');

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "category",
ADD COLUMN     "category" "TicketCategory",
DROP COLUMN "sentiment",
ADD COLUMN     "sentiment" "TicketSentiment";

-- CreateTable
CREATE TABLE "agent_skill_map" (
    "agentId" TEXT NOT NULL,
    "skill" "TicketCategory" NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "agent_skill_map_pkey" PRIMARY KEY ("agentId","skill")
);

-- CreateIndex
CREATE INDEX "agent_skill_map_agentId_idx" ON "agent_skill_map"("agentId");

-- CreateIndex
CREATE INDEX "agent_skill_map_tenantId_idx" ON "agent_skill_map"("tenantId");

-- CreateIndex
CREATE INDEX "agent_skill_map_skill_idx" ON "agent_skill_map"("skill");

-- AddForeignKey
ALTER TABLE "agent_skill_map" ADD CONSTRAINT "agent_skill_map_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_skill_map" ADD CONSTRAINT "agent_skill_map_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
