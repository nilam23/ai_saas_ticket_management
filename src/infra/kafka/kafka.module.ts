import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaProducer } from './service/kafka-producer.service';
import { Partitioners } from 'kafkajs';
import {
  KAFKA_BROKER,
  KAFKA_CLIENT_ID,
} from 'src/shared/utils/env-config.utils';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          producerOnlyMode: true,
          client: {
            clientId: KAFKA_CLIENT_ID,
            brokers: [KAFKA_BROKER],
          },
          producer: {
            createPartitioner: Partitioners.LegacyPartitioner,
          },
        },
      },
    ]),
  ],
  providers: [KafkaProducer],
  exports: [KafkaProducer],
})
export class KafkaModule {}
