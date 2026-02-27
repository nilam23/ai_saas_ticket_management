import { Injectable, Logger } from '@nestjs/common';
import {
  BaseHttpHandler,
  HttpResponse,
} from 'src/shared/handlers/base-http.handler';
import { UploadDocHandlerEvent } from '../types/api-handler-event.type';
import { normalizeError } from 'src/shared/utils/error.utils';
import { S3UploadException } from 'src/infra/aws/exceptions';
import { TenantDocService } from '../service/tenant-doc.service';

@Injectable()
export class UploadDocHandler extends BaseHttpHandler<
  UploadDocHandlerEvent,
  void
> {
  private readonly logger = new Logger(UploadDocHandler.name);

  constructor(private readonly tenantDocService: TenantDocService) {
    super();
  }

  public async handle(
    event: UploadDocHandlerEvent,
  ): Promise<HttpResponse<void>> {
    const { file, auditContext } = event;
    try {
      this.logger.log(
        `Handling request to upload doc: ${file.originalname} for the tenant: ${auditContext.tenantId}`,
      );
      await this.tenantDocService.uploadTenantDoc(file, auditContext);
      return this.created();
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error uploading doc: ${file.originalname} for the tenant: ${auditContext.tenantId}`,
      );

      if (error instanceof S3UploadException) {
        this.badRequest(message);
      }

      this.handleUnknownError(message);
    }
  }
}
