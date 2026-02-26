import { Logger } from '@nestjs/common';
import { AuditRepository } from '../repository/audit.repository';
import { CreateAuditLogInput } from '../types/audit.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly auditRepository: AuditRepository) {}

  public async createAuditLog(
    createAuditLogInput: CreateAuditLogInput,
  ): Promise<void> {
    this.logger.log(
      `Creating audit log. Action: ${createAuditLogInput.action}, Entity Type: ${createAuditLogInput.entityType}, Entity ID: ${createAuditLogInput.entityId}`,
    );
    const auditLog =
      await this.auditRepository.createAuditLog(createAuditLogInput);
    this.logger.log(
      `Audit log created successfully. Audit log ID: ${auditLog.id}`,
    );
  }
}
