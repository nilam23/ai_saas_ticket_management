export type RetrieveContextInput = {
  tenantId: string;
  query: string;
  queryEmbeddings: number[];
};

export type RetrievedContextResult = {
  id: string;
  content: string;
  chunkIndex: number;
  documentId: string;
  similarityScore: number;
  embedding: number[];
};

export type RawRetrievedContextResult = Omit<
  RetrievedContextResult,
  'embedding'
> & {
  embedding: string;
};
