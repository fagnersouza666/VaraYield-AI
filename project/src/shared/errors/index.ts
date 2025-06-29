export abstract class BaseError extends Error {
  abstract readonly code: string;
  abstract readonly category: 'VALIDATION' | 'NETWORK' | 'BUSINESS' | 'SYSTEM';

  constructor(
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      category: this.category,
      message: this.message,
      context: this.context,
    };
  }
}

export class ValidationError extends BaseError {
  readonly code = 'VALIDATION_ERROR';
  readonly category = 'VALIDATION' as const;
}

export class NetworkError extends BaseError {
  readonly code = 'NETWORK_ERROR';
  readonly category = 'NETWORK' as const;
}

export class RaydiumInitializationError extends BaseError {
  readonly code = 'RAYDIUM_INIT_ERROR';
  readonly category = 'SYSTEM' as const;
}

export class PoolDataFetchError extends BaseError {
  readonly code = 'POOL_DATA_FETCH_ERROR';
  readonly category = 'NETWORK' as const;
}

export class PortfolioOptimizationError extends BaseError {
  readonly code = 'PORTFOLIO_OPTIMIZATION_ERROR';
  readonly category = 'BUSINESS' as const;
}

export class WalletConnectionError extends BaseError {
  readonly code = 'WALLET_CONNECTION_ERROR';
  readonly category = 'SYSTEM' as const;
}

export const createErrorFromUnknown = (error: unknown): BaseError => {
  if (error instanceof BaseError) {
    return error;
  }

  if (error instanceof Error) {
    return new NetworkError(error.message, { originalError: error.name });
  }

  return new NetworkError('Unknown error occurred', { originalError: String(error) });
};