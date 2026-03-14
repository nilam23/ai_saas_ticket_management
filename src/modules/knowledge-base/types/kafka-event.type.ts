import { TextChunk } from './text-chunker.type';

export type RetrieveContextEventPayload = {
  tenantId: string;
  query: string;
  topK: number;
};

export type TenantDocParsedEventPayload = {
  tenantId: string;
  docId: string;
  cleanedText: string;
};

export type TenantDocChunkedEventPayload = {
  tenantId: string;
  docId: string;
  chunks: TextChunk[];
};

export type TenantDocEmbeddingGeneratedEventPayload = {
  tenantId: string;
  docId: string;
};
