import { Injectable, Logger } from '@nestjs/common';
import { ProcessDocIngestionInput } from '../types/knowledge-ingestion.type';
import { TenantDocService } from 'src/modules/tenants/service/tenant-doc.service';
import { DocStatus } from '@prisma/client';
import { AuditService } from 'src/modules/audit/service/audit.service';
import { UserService } from 'src/modules/user/service/user.service';
import { getTenantSystemUserEmail } from 'src/shared/utils/common.utils';
import {
  AuditLogAction,
  AuditLogEntityType,
} from 'src/modules/audit/enums/audit-log.enum';

@Injectable()
export class KnowledgeIngestionService {
  private readonly logger = new Logger(KnowledgeIngestionService.name);

  constructor(
    private readonly tenantDocService: TenantDocService,
    private readonly userService: UserService,
    private readonly auditService: AuditService,
  ) {}

  public async processIngestion(
    processDocIngestionInput: ProcessDocIngestionInput,
  ): Promise<void> {
    const { tenantId, docId } = processDocIngestionInput;

    this.logger.debug(
      `Completing ingestion. DocID: ${docId}, TenantID: ${tenantId}`,
    );

    await this.tenantDocService.updateTenantDoc({
      docId,
      tenantId,
      status: DocStatus.PROCESSED,
    });

    const systemUser = await this.userService.getUserData({
      tenantId,
      email: getTenantSystemUserEmail(tenantId),
    });

    this.logger.debug(`System user fetched. TenatID: ${tenantId}`);

    await this.auditService.createAuditLog({
      tenantId,
      actorUserId: systemUser.id,
      action: AuditLogAction.DOC_KNOWLEDGE_INGEST,
      entityType: AuditLogEntityType.TENANT_DOC,
      entityId: docId,
      afterState: { status: DocStatus.PROCESSED },
    });

    this.logger.debug(
      `Ingestion completed. DocID: ${docId}, TenantID: ${tenantId}`,
    );

    return;
  }
}
