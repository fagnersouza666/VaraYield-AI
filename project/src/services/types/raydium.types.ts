export interface RaydiumPoolData {
  readonly id: string;
  readonly name: string;
  readonly apy: number;
  readonly tvl: number;
  readonly volume24h: number;
  readonly tokenA: {
    readonly symbol: string;
    readonly mint: string;
    readonly decimals: number;
  };
  readonly tokenB: {
    readonly symbol: string;
    readonly mint: string;  
    readonly decimals: number;
  };
  readonly lpMint: string;
  readonly status: 'active' | 'inactive' | 'paused';
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PortfolioPosition {
  readonly poolId: string;
  readonly allocation: number; // percentage
  readonly value: number;
  readonly apy: number;
  readonly risk: 'low' | 'medium' | 'high';
}

export interface PortfolioOptimizationRequest {
  readonly riskLevel: 'low' | 'medium' | 'high';
  readonly targetAllocation?: number;
  readonly excludePools?: string[];
  readonly minApy?: number;
  readonly maxRisk?: number;
}

export interface PortfolioOptimizationResult {
  readonly positions: readonly PortfolioPosition[];
  readonly expectedApy: number;
  readonly riskScore: number;
  readonly rebalanceRequired: boolean;
  readonly optimizedAt: string;
  readonly nextRebalanceAt: string;
}

export interface RaydiumService {
  getPoolData(poolIds?: string[]): Promise<RaydiumPoolData[]>;
  getTopPools(limit?: number): Promise<RaydiumPoolData[]>;
  optimizePortfolio(request: PortfolioOptimizationRequest): Promise<PortfolioOptimizationResult>;
  getPoolById(poolId: string): Promise<RaydiumPoolData>;
}