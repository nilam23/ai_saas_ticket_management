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

@Injectable()
export class TenantDocService {
  private readonly logger = new Logger(TenantDocService.name);

  constructor(
    private readonly tenantDocRepository: TenantDocRepository,
    private s3Service: AwsS3Service,
    private auditService: AuditService,
  ) {}

  public async uploadTenantDoc(
    file: Express.Multer.File,
    auditContext: AuditContext,
  ) {
    const fileKey: string = `tenant-docs/${auditContext.tenantId}/${formatDateToYMD()}/${file.originalname}`;
    this.logger.log(`Uploading doc with the key: ${fileKey} to S3`);
    await this.s3Service.uploadFile(fileKey, file.buffer);
    this.logger.log(`Doc with the key ${fileKey} uploaded to S3`);

    this.logger.log(`Creating metadata for the doc with the key: ${fileKey}`);
    const docMetadata = await this.tenantDocRepository.createDocMetadata({
      fileKey,
      fileName: file.originalname,
      tenantId: auditContext.tenantId!,
      uploadedBy: auditContext.actorUserId!,
    });
    this.logger.log(
      `Metadata created successfully for the doc with the key: ${fileKey}`,
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

    this.logger.log(
      `Doc: ${file.originalname} uploaded successfully for the tenant: ${auditContext.tenantId}`,
    );
  }
}
