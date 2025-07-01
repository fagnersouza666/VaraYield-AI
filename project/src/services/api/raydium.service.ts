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
  private mockPools: RaydiumPoolData[] = [
    {
      id: 'pool-1',
      name: 'SOL-USDC',
      apy: 12.5,
      tvl: 1250000,
      volume24h: 850000,
      tokenA: { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
      tokenB: { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
      lpMint: 'lp-mint-1',
      status: 'active',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pool-2',
      name: 'RAY-SOL',
      apy: 9.8,
      tvl: 980000,
      volume24h: 650000,
      tokenA: { symbol: 'RAY', mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', decimals: 6 },
      tokenB: { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
      lpMint: 'lp-mint-2',
      status: 'active',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pool-3',
      name: 'mSOL-SOL',
      apy: 6.8,
      tvl: 2100000,
      volume24h: 450000,
      tokenA: { symbol: 'mSOL', mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', decimals: 9 },
      tokenB: { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
      lpMint: 'lp-mint-3',
      status: 'active',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    },
  ];

  async getPoolData(poolIds?: string[]): Promise<RaydiumPoolData[]> {
    await this.delay(500); // Simulate network delay
    
    if (poolIds?.length) {
      return this.mockPools.filter(pool => poolIds.includes(pool.id));
    }
    
    return this.mockPools;
  }

  async getTopPools(limit: number = 10): Promise<RaydiumPoolData[]> {
    await this.delay(300);
    
    return this.mockPools
      .sort((a, b) => b.apy - a.apy)
      .slice(0, limit);
  }

  async getPoolById(poolId: string): Promise<RaydiumPoolData> {
    await this.delay(200);
    
    const pool = this.mockPools.find(p => p.id === poolId);
    if (!pool) {
      throw new RaydiumError(`Pool with ID ${poolId} not found`);
    }
    
    return pool;
  }

  async optimizePortfolio(request: PortfolioOptimizationRequest): Promise<PortfolioOptimizationResult> {
    await this.delay(2000); // Simulate optimization time
    
    const positions: PortfolioPosition[] = this.mockPools.map((pool, index) => ({
      poolId: pool.id,
      allocation: index === 0 ? 50 : index === 1 ? 30 : 20,
      value: 1000 * (index + 1),
      apy: pool.apy,
      risk: request.riskLevel,
    }));

    const expectedApy = positions.reduce((acc, pos) => acc + (pos.apy * pos.allocation / 100), 0);
    const riskMultiplier = request.riskLevel === 'low' ? 1 : request.riskLevel === 'medium' ? 1.5 : 2;
    
    return {
      positions,
      expectedApy,
      riskScore: expectedApy * riskMultiplier / 10,
      rebalanceRequired: true,
      optimizedAt: new Date().toISOString(),
      nextRebalanceAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}