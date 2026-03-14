export type RetrieveContextInput = {
  tenantId: string;
  query: string;
  topK: number;
};

export type RetrievedContextResult = {
  id: string;
  content: string;
  chunkIndex: number;
  documentId: string;
};
