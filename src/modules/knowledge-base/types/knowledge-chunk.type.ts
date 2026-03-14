export type CreateKnowledgeChunksInput = {
  tenantId: string;
  docId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
};

export type FetchKnowledgeChunksInput = {
  tenantId: string;
  embeddingVector: string;
  topK: number;
};
