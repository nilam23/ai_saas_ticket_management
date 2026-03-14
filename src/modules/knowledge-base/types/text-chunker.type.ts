export type ChunkOptions = {
  chunkSize: number;
  chunkOverlap: number;
  separators?: string[];
};

export type TextChunk = {
  content: string;
  index: number;
  startChar: number;
  endChar: number;
};

export type ChunkTextInput = {
  docId: string;
  tenantId: string;
  text: string;
  options: ChunkOptions;
};
