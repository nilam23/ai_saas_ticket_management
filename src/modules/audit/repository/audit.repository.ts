import { PrismaService } from 'src/infra/prisma/prisma.service';
import { CreateAuditLogInput } from '../types/audit.type';
import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async createAuditLog(
    createAuditLogInput: CreateAuditLogInput,
  ): Promise<{ id: string }> {
    const auditLogData: Prisma.AuditLogCreateInput = {
      tenantId: createAuditLogInput.tenantId,
      actorUserId: createAuditLogInput.actorUserId,
      action: createAuditLogInput.action,
      entityType: createAuditLogInput.entityType,
      entityId: createAuditLogInput.entityId,
      ...(createAuditLogInput.beforeState && {
        beforeState: createAuditLogInput.beforeState,
      }),
      ...(createAuditLogInput.afterState && {
        afterState: createAuditLogInput.afterState,
      }),
      ...(createAuditLogInput.ipAddress && {
        ipAddress: createAuditLogInput.ipAddress,
      }),
      ...(createAuditLogInput.userAgent && {
        userAgent: createAuditLogInput.userAgent,
      }),
    };

    return this.prisma.auditLog.create({
      data: auditLogData,
      select: {
        id: true,
      },
    });
  }
}
