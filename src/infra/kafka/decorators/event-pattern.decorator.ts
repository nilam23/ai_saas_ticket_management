import { EventPattern } from '@nestjs/microservices';
import { KafkaEvent, KafkaTopic } from '../enums/kafka.enum';

export function KafkaEventPattern(
  topicName: KafkaTopic,
  eventName: KafkaEvent,
): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value as
      | ((...args: unknown[]) => unknown)
      | undefined;

    if (!originalMethod) {
      return;
    }

    descriptor.value = function (...args: unknown[]) {
      const payload = args[0];

      if (
        typeof payload === 'object' &&
        payload !== null &&
        'name' in payload &&
        (payload as { name: unknown }).name === eventName
      ) {
        const method = originalMethod.bind(this) as (
          ...innerArgs: unknown[]
        ) => unknown;
        return method(...args);
      }

      return undefined;
    };

    EventPattern(topicName)(target, propertyKey, descriptor);
  };
}
