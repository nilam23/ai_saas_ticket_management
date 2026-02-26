export type CreateAuditLogInput = {
  tenantId: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
};

export type AuditContext = {
  tenantId?: string;
  actorUserId?: string;
  ipAddress?: string;
  userAgent?: string;
};
