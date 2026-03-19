import { Injectable, Logger } from '@nestjs/common';
import {
  BaseHttpHandler,
  HttpResponse,
} from 'src/shared/handlers/base-http.handler';
import { normalizeError } from 'src/shared/utils/error.utils';
import { S3UploadException } from 'src/infra/aws/exceptions';
import { UploadDocHandlerEvent } from '../../types/api-handler-event.type';
import { TenantDocService } from '../../service/tenant-doc.service';

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
      this.logger.debug(
        `Handling request to upload doc. File Name: ${file.originalname}, TenantID: ${auditContext.tenantId}`,
      );
      await this.tenantDocService.uploadTenantDoc(file, auditContext);
      return this.created();
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error uploading doc. File Name: ${file.originalname}, TenantID: ${auditContext.tenantId}, Error: ${message}`,
      );
      if (error instanceof S3UploadException) {
        return this.badRequest(message);
      }
      return this.internalServerError(message);
    }
  }
}
