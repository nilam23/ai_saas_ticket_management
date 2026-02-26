import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    this.logger.debug('Initializing Prisma connection...');
    await this.$connect();
    this.logger.debug('Prisma connection established successfully');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.debug('Closing Prisma connection...');
    await this.$disconnect();
    this.logger.debug('Prisma connection closed successfully');
  }
}
