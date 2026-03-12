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
  text: string;
  options: ChunkOptions;
};
