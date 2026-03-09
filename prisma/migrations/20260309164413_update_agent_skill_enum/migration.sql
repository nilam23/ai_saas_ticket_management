/*
  Warnings:

  - The primary key for the `agent_skill_map` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `skill` on the `agent_skill_map` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AgentSkill" AS ENUM ('BUG', 'FEATURE_REQUEST', 'BILLING', 'TECHNICAL', 'SUPPORT', 'GENERAL');

-- AlterTable
ALTER TABLE "agent_skill_map" DROP CONSTRAINT "agent_skill_map_pkey",
DROP COLUMN "skill",
ADD COLUMN     "skill" "AgentSkill" NOT NULL,
ADD CONSTRAINT "agent_skill_map_pkey" PRIMARY KEY ("agentId", "skill");

-- CreateIndex
CREATE INDEX "agent_skill_map_skill_idx" ON "agent_skill_map"("skill");
