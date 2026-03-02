import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { EventEnvelope } from '../type/kafka.type';

@Injectable()
export class KafkaProducer implements OnModuleInit {
  private readonly logger = new Logger(KafkaProducer.name);

  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  emit<T>(topic: string, event: EventEnvelope<T>) {
    this.logger.log(
      `Event received. Topic: ${topic}, Event: ${event.name}, Event ID: ${event.id}`,
    );
    return this.kafkaClient.emit(topic, event);
  }
}
