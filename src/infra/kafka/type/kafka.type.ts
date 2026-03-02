export type EventEnvelope<T> = {
  id: string;
  name: string;
  occurredAt: Date;
  payload: T;
};
