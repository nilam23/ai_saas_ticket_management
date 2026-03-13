export type CreateKnowledgeChunksInput = {
  tenantId: string;
  docId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
};
