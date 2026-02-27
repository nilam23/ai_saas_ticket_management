-- CreateTable
CREATE TABLE "tenant_docs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_docs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tenant_docs_tenantId_idx" ON "tenant_docs"("tenantId");

-- CreateIndex
CREATE INDEX "tenant_docs_uploadedBy_idx" ON "tenant_docs"("uploadedBy");
