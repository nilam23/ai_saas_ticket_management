import { createId } from '@paralleldrive/cuid2';

export abstract class BaseEvent<T> {
  public readonly id: string;
  public readonly occurredAt: Date;
  public readonly name: string;
  public readonly payload: T;

  constructor(name: string, payload: T) {
    this.id = createId();
    this.occurredAt = new Date();
    this.name = name;
    this.payload = payload;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      occurredAt: this.occurredAt,
      payload: this.payload,
    };
  }
}
