import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { HealthModule } from './modules/health/health.module';
import { UserModule } from './modules/user/user.module';
import { DatabaseModule } from './infra/prisma/prisma.module';
import { TenantGuard } from './shared/guards/tenant.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuditModule } from './modules/audit/audit.module';
import { TicketModule } from './modules/tickets/ticket.module';
import { AiCoreModule } from './modules/ai-core/ai-core.module';
import { ClassificationModule } from './modules/ticket-classification/classification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    TenantsModule,
    HealthModule,
    UserModule,
    AuditModule,
    TicketModule,
    AiCoreModule,
    ClassificationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
})
export class AppModule {}
