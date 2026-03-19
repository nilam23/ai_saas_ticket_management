-- CreateEnum
CREATE TYPE "AiResponseStatus" AS ENUM ('AUTO_SEND', 'QUEUE_FOR_REVIEW', 'FAILED');

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "aiResponseConfidence" DOUBLE PRECISION,
ADD COLUMN     "aiResponseStatus" "AiResponseStatus",
ALTER COLUMN "content" DROP NOT NULL;
