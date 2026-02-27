import {
  Controller,
  Logger,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import type { Request } from 'express';
import { UploadDocHandler } from './handlers/upload-doc.handler';
import { HttpResponse } from 'src/shared/handlers/base-http.handler';

@UseGuards(JwtAuthGuard)
@Controller('tenant')
export class TenantController {
  private readonly logger = new Logger(TenantController.name);

  constructor(private readonly uploadDocHandler: UploadDocHandler) {}

  @Post(':tenantId/docs')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Param('tenantId') tenantId: string,
    @Req() request: Request,
  ): Promise<HttpResponse<void>> {
    this.logger.log(
      `Request to upload document: ${file.originalname} for the tenant: ${tenantId}`,
    );
    return this.uploadDocHandler.handle({
      file,
      auditContext: {
        actorUserId: request.user.id,
        tenantId,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });
  }
}
