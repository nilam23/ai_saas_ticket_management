export type StructuralValidationResult = {
  passed: boolean;
  reasons: string[];
};

export type GroundingValidationResult = {
  passed: boolean;
  reason?: string;
};

export type SemanticRelevanceValidationResult = {
  passed: boolean;
  reason?: string;
};
