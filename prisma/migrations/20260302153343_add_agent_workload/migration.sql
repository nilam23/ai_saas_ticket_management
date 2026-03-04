-- CreateTable
CREATE TABLE "agent_workload" (
    "agentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "activeTicketCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_workload_pkey" PRIMARY KEY ("agentId")
);

-- CreateIndex
CREATE INDEX "agent_workload_tenantId_idx" ON "agent_workload"("tenantId");

-- CreateIndex
CREATE INDEX "agent_workload_activeTicketCount_idx" ON "agent_workload"("activeTicketCount");

-- AddForeignKey
ALTER TABLE "agent_workload" ADD CONSTRAINT "agent_workload_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_workload" ADD CONSTRAINT "agent_workload_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
