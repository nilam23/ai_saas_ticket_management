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
    this.logger.debug(
      `Creating audit log. Audit Log Object: ${JSON.stringify(createAuditLogInput)}`,
    );
    const auditLog =
      await this.auditRepository.createAuditLog(createAuditLogInput);
    this.logger.debug(`Audit log created. ID: ${auditLog.id}`);
  }
}
