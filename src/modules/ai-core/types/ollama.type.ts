export type OllamaModelOptions = {
  stop?: string[];
  temperature?: number;
  top_p?: number;
};

export type OllamaGenerateRequest = {
  model: string;
  prompt: string;
  stream: boolean;
  options?: OllamaModelOptions;
};

export type OllamaGenerateResponse = {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
};

export type OllamaEmbeddingRequest = {
  model: string;
  prompt: string;
  options?: OllamaModelOptions;
};

export type OllamaEmbeddingResponse = {
  embedding: number[];
};
