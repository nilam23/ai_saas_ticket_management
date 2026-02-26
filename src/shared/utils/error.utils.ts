const isErrorWithMessage = (error: unknown): error is Error => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  );
};

export const normalizeError = (maybeError: unknown): Error => {
  if (isErrorWithMessage(maybeError)) {
    return maybeError;
  }

  try {
    if (!maybeError) {
      return new Error('An unknown error occurred');
    }
    return new Error(JSON.stringify(maybeError));
  } catch {
    return new Error(String(maybeError));
  }
};
