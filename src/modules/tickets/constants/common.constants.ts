export const RESPONSE_GENERATION_LLM_TEMP = 0.3;
export const RESPONSE_GENERATION_LLM_MAX_TOKENS = 400;
export const RESPONSE_GENERATION_LLM_STOP_SEQUENCES = [
  '<|system|>',
  '<|user|>',
  '<|assistant|>',
  '<|end|>',
  'Rules:',
];
export const MIN_RESPONSE_LENGTH = 20;
export const MAX_RESPONSE_LENGTH = 300;
export const MIN_GROUNDING_SCORE = 0.6;
export const MIN_RELEVANCE_SCORE = 0.7;
export const PROMPT_LEAK_PATTERNS = [
  /<\|system\|>/i,
  /<\|user\|>/i,
  /<\|assistant\|>/i,
  /<\|end\|>/i,
  /system prompt/i,
  /hidden instructions/i,
  /the instructions say/i,
  /according to the system/i,
  /the prompt says/i,
  /knowledge context/i,
  /<chunk/i,
  /<\/chunk>/i,
  /you are an ai assistant/i,
  /customer question/i,
  /rules:/i,
];
export const AI_DEFAULT_RESPONSE = `I don't have enough information in the knowledge base to answer this question.`;
