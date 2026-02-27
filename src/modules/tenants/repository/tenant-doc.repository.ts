import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { CreateTenantDocInput } from '../types/tenant-doc.type';
import { Prisma, TenantDoc } from '@prisma/client';

@Injectable()
export class TenantDocRepository {
  constructor(private prisma: PrismaService) {}

  public async createDocMetadata(
    createTenantDocInput: CreateTenantDocInput,
  ): Promise<TenantDoc> {
    const docMetadata: Prisma.TenantDocCreateInput = {
      fileKey: createTenantDocInput.fileKey,
      fileName: createTenantDocInput.fileName,
      tenantId: createTenantDocInput.tenantId,
      uploadedBy: createTenantDocInput.uploadedBy,
    };
    return this.prisma.tenantDoc.create({
      data: docMetadata,
    });
  }
}
