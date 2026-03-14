import { DocStatus } from '@prisma/client';

export type CreateTenantDocInput = {
  tenantId: string;
  uploadedBy: string;
  fileName: string;
  fileKey: string;
};

export type UpdateTenantDocInput = {
  docId: string;
  tenantId: string;
  status: DocStatus;
};

export type UpdateTenantDocFilterQuery = {
  id: string;
  tenantId: string;
};

export type UpdateTenantDocUpdateQuery = {
  status?: DocStatus;
  updatedAt: Date;
};
