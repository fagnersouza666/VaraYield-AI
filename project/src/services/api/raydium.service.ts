import { 
  RaydiumService,
  RaydiumPoolData,
  PortfolioOptimizationRequest,
  PortfolioOptimizationResult,
  PortfolioPosition
} from '../types/raydium.types';
import { HttpClient, ApiResponse } from '../types/api.types';
import { RaydiumError, ApiError, handleApiError } from '../../utils/errors';

export class HttpRaydiumService implements RaydiumService {
  constructor(
    private baseUrl: string,
    private httpClient: HttpClient
  ) {}

  async getPoolData(poolIds?: string[]): Promise<RaydiumPoolData[]> {
    try {
      const params = new URLSearchParams();
      if (poolIds?.length) {
        params.append('pools', poolIds.join(','));
      }

      const url = `${this.baseUrl}/pools${poolIds?.length ? `?${params}` : ''}`;
      const response = await this.httpClient.get<ApiResponse<RaydiumPoolData[]>>(url);

      if (!response.success) {
        throw new RaydiumError(
          'Failed to fetch pool data',
          { poolIds, error: response.error }
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof RaydiumError) {
        throw error;
      }
      handleApiError(error);
    }
  }

  async getTopPools(limit: number = 10): Promise<RaydiumPoolData[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        sortBy: 'apy',
        order: 'desc'
      });

      const response = await this.httpClient.get<ApiResponse<RaydiumPoolData[]>>(
        `${this.baseUrl}/pools/top?${params}`
      );

      if (!response.success) {
        throw new RaydiumError(
          'Failed to fetch top pools',
          { limit, error: response.error }
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof RaydiumError) {
        throw error;
      }
      handleApiError(error);
    }
  }

  async getPoolById(poolId: string): Promise<RaydiumPoolData> {
    if (!poolId) {
      throw new RaydiumError('Pool ID is required');
    }

    try {
      const response = await this.httpClient.get<ApiResponse<RaydiumPoolData>>(
        `${this.baseUrl}/pools/${poolId}`
      );

      if (!response.success) {
        throw new RaydiumError(
          `Failed to fetch pool data for ${poolId}`,
          { poolId, error: response.error }
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof RaydiumError) {
        throw error;
      }
      handleApiError(error);
    }
  }

  async optimizePortfolio(request: PortfolioOptimizationRequest): Promise<PortfolioOptimizationResult> {
    try {
      // Validate request
      this.validateOptimizationRequest(request);

      const response = await this.httpClient.post<ApiResponse<PortfolioOptimizationResult>>(
        `${this.baseUrl}/optimize`,
        request
      );

      if (!response.success) {
        throw new RaydiumError(
          'Failed to optimize portfolio',
          { request, error: response.error }
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof RaydiumError) {
        throw error;
      }
      handleApiError(error);
    }
  }

  private validateOptimizationRequest(request: PortfolioOptimizationRequest): void {
    const { riskLevel, targetAllocation, minApy, maxRisk } = request;

    if (!['low', 'medium', 'high'].includes(riskLevel)) {
      throw new RaydiumError('Invalid risk level', { riskLevel });
    }

    if (targetAllocation !== undefined && (targetAllocation < 0 || targetAllocation > 100)) {
      throw new RaydiumError('Target allocation must be between 0 and 100', { targetAllocation });
    }

    if (minApy !== undefined && minApy < 0) {
      throw new RaydiumError('Minimum APY cannot be negative', { minApy });
    }

    if (maxRisk !== undefined && (maxRisk < 0 || maxRisk > 10)) {
      throw new RaydiumError('Max risk must be between 0 and 10', { maxRisk });
    }
  }
}

// Mock implementation for development/testing
export class MockRaydiumService implements RaydiumService {
  async getPoolData(poolIds?: string[]): Promise<RaydiumPoolData[]> {
    // Não retorna dados mockados - aguarda conexão real
    throw new RaydiumError('Pool data not available - waiting for real API connection', { code: 'NO_DATA' });
  }

  async getTopPools(limit: number = 10): Promise<RaydiumPoolData[]> {
    // Não retorna dados mockados - aguarda conexão real
    throw new RaydiumError('Top pools data not available - waiting for real API connection', { code: 'NO_DATA' });
  }

  async getPoolById(poolId: string): Promise<RaydiumPoolData> {
    // Não retorna dados mockados - aguarda conexão real
    throw new RaydiumError('Pool data not available - waiting for real API connection', { code: 'NO_DATA' });
  }

  async optimizePortfolio(request: PortfolioOptimizationRequest): Promise<PortfolioOptimizationResult> {
    // Não retorna otimização mockada - aguarda conexão real
    throw new RaydiumError('Portfolio optimization not available - waiting for real API connection', { code: 'NO_DATA' });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}