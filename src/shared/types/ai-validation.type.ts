export type StructuralValidationResult = {
  passed: boolean;
  reasons: string[];
};

export type GroundingValidationResult = {
  passed: boolean;
  score: number;
  reason?: string;
};

export type SemanticRelevanceValidationResult = {
  passed: boolean;
  score: number;
  reason?: string;
};
