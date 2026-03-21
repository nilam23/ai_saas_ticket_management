import { Injectable, Logger } from '@nestjs/common';
import { AuditContext } from 'src/modules/audit/types/audit.type';
import { formatDateToYMD } from 'src/shared/utils/common.utils';
import { AwsS3Service } from 'src/infra/aws/aws-s3.service';
import { AuditService } from 'src/modules/audit/service/audit.service';
import {
  AuditLogAction,
  AuditLogEntityType,
} from 'src/modules/audit/enums/audit-log.enum';
import { TenantDocRepository } from '../repository/tenant-doc.repository';
import { TenantDocUploadedEvent } from '../events/tenant-doc-uploaded.event';
import { KafkaTopic } from 'src/infra/kafka/enums/kafka.enum';
import { KafkaProducer } from 'src/infra/kafka/service/kafka-producer.service';
import { UpdateTenantDocInput } from '../types/tenant-doc.type';

@Injectable()
export class TenantDocService {
  private readonly logger = new Logger(TenantDocService.name);

  constructor(
    private readonly tenantDocRepository: TenantDocRepository,
    private s3Service: AwsS3Service,
    private auditService: AuditService,
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  public async uploadTenantDoc(
    file: Express.Multer.File,
    auditContext: AuditContext,
  ) {
    const fileKey: string = `tenant-docs/${auditContext.tenantId}/${formatDateToYMD()}/${file.originalname}`;
    this.logger.debug(`Uploading doc. Key: ${fileKey}`);
    await this.s3Service.uploadFile(fileKey, file.buffer);
    this.logger.debug(`Doc uploaded. Key: ${fileKey} `);

    this.logger.debug(`Creating metadata for the doc. Key: ${fileKey}`);
    const docMetadata = await this.tenantDocRepository.createDocMetadata({
      fileKey,
      fileName: file.originalname,
      tenantId: auditContext.tenantId!,
      uploadedBy: auditContext.actorUserId!,
    });
    this.logger.debug(
      `Metadata created successfully. Key: ${fileKey}, DocID: ${docMetadata.id}`,
    );

    await this.auditService.createAuditLog({
      tenantId: auditContext.tenantId!,
      actorUserId: auditContext.actorUserId!,
      action: AuditLogAction.UPLOAD_DOC,
      entityType: AuditLogEntityType.TENANT_DOC,
      entityId: docMetadata.id,
      afterState: {
        fileKey,
        fileName: file.originalname,
      },
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
    });

    this.logger.debug(
      `Doc uploaded successfully. File Name: ${file.originalname}, TenantID: ${auditContext.tenantId}`,
    );

    const event = new TenantDocUploadedEvent({
      tenantId: auditContext.tenantId!,
      docId: docMetadata.id,
      fileKey,
    });
    this.logger.debug(
      `Emitting event. Topic: ${KafkaTopic.EVENT_BUS}, Event: ${event.name}, Event ID: ${event.id}`,
    );
    this.kafkaProducer.emit(KafkaTopic.EVENT_BUS, event);
  }

  public async updateTenantDoc(
    updateTenantDocInput: UpdateTenantDocInput,
  ): Promise<void> {
    const { docId, tenantId, status } = updateTenantDocInput;
    this.logger.debug(`Updating doc. DocID: ${docId}, TenantID: ${tenantId}`);
    await this.tenantDocRepository.updateTenantDoc(
      { id: docId, tenantId: tenantId },
      {
        ...(status && { status }),
        updatedAt: new Date(),
      },
    );
    this.logger.debug(`Doc updated. DocID: ${docId}, TenantID: ${tenantId}`);
  }
}
