export type RetrieveContextInput = {
  tenantId: string;
  query: string;
};

export type RetrievedContextResult = {
  id: string;
  content: string;
  chunkIndex: number;
  documentId: string;
  similarityScore: number;
};
