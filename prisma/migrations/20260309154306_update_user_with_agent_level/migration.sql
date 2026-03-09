/*
  Warnings:

  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'AGENT', 'CUSTOMER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AgentLevel" AS ENUM ('JUNIOR', 'MID', 'SENIOR');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "agentLevel" "AgentLevel",
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'AGENT';

-- DropEnum
DROP TYPE "Role";
