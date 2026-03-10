import { Module } from '@nestjs/common';
import { KafkaModule } from 'src/infra/kafka/kafka.module';
import { AiProviderService } from './service/ai-provider.service';

@Module({
  imports: [KafkaModule],
  providers: [AiProviderService],
  exports: [AiProviderService],
})
export class AiCoreModule {}
