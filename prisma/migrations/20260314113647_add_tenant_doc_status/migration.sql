-- CreateEnum
CREATE TYPE "DocStatus" AS ENUM ('UPLOADED', 'SCANNING', 'SCANNED', 'SCANNING_FAILED', 'PROCESSING', 'PROCESSED', 'PROCESSING_FAILED');

-- DropIndex
DROP INDEX "knowledge_chunks_embedding_idx";

-- AlterTable
ALTER TABLE "tenant_docs" ADD COLUMN     "status" "DocStatus" NOT NULL DEFAULT 'UPLOADED';
