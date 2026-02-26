export enum AuditLogAction {
  TENANT_CREATE = 'TENANT_CREATE',
  ADMIN_CREATE = 'ADMIN_CREATE',
  AGENT_CREATE = 'AGENT_CREATE',
  LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
}

export enum AuditLogEntityType {
  TENANT = 'TENANT',
  USER = 'USER',
}
