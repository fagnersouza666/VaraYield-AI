export abstract class BaseError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string, public readonly context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    
    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends BaseError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
}

export class ApiError extends BaseError {
  readonly statusCode: number;

  constructor(
    public readonly code: string,
    message: string,
    statusCode: number = 500,
    context?: Record<string, unknown>
  ) {
    super(message, context);
    this.statusCode = statusCode;
  }
}

export class NetworkError extends BaseError {
  readonly code = 'NETWORK_ERROR';
  readonly statusCode = 503;
}

export class NotFoundError extends BaseError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;
}

export class RaydiumError extends BaseError {
  readonly code = 'RAYDIUM_ERROR';
  readonly statusCode = 500;
}

export class OptimizationError extends BaseError {
  readonly code = 'OPTIMIZATION_ERROR';
  readonly statusCode = 500;
}

// Error utilities
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof BaseError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const getErrorCode = (error: unknown): string => {
  if (error instanceof BaseError) {
    return error.code;
  }
  
  return 'UNKNOWN_ERROR';
};

export const isNetworkError = (error: unknown): boolean => {
  return (
    error instanceof NetworkError ||
    error instanceof TypeError ||
    (error instanceof Error && error.message.toLowerCase().includes('network'))
  );
};

export const isValidationError = (error: unknown): boolean => {
  return error instanceof ValidationError;
};

export const handleApiError = (error: unknown): never => {
  if (error instanceof BaseError) {
    throw error;
  }
  
  if (error instanceof Error) {
    throw new ApiError('UNKNOWN_ERROR', error.message, 500, { originalError: error.name });
  }
  
  throw new ApiError('UNKNOWN_ERROR', 'An unexpected error occurred', 500);
};