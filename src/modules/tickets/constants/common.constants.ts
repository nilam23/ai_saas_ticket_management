export const RESPONSE_GENERATION_LLM_TEMP = 0.3;
export const RESPONSE_GENERATION_LLM_NUM_PREDICT = 400;
export const MIN_RESPONSE_LENGTH = 20;
export const MAX_RESPONSE_LENGTH = 300;
export const MIN_GROUNDING_SCORE = 0.6;
export const MIN_RELEVANCE_SCORE = 0.7;
export const PROMPT_LEAK_PATTERNS = [
  /you are an ai assistant/i,
  /<\|system\|>/i,
  /<\|user\|>/i,
  /<chunk/i,
  /knowledge context/i,
  /customer question/i,
  /rules:/i,
];
export const AI_DEFAULT_RESPONSE = `I don't have enough information in the knowledge base to answer this question.`;
