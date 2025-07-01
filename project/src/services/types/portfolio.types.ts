export interface Asset {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly logoUrl?: string;
  readonly decimals: number;
  readonly mintAddress: string;
  readonly price: number;
  readonly priceChange24h: number;
  readonly marketCap?: number;
}

export interface Position {
  readonly id: string;
  readonly asset: Asset;
  readonly quantity: number;
  readonly value: number;
  readonly allocation: number; // percentage of total portfolio
  readonly averagePrice: number;
  readonly pnl: number;
  readonly pnlPercentage: number;
  readonly poolId?: string;
  readonly apr?: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PortfolioSummary {
  readonly totalValue: number;
  readonly totalPnl: number;
  readonly totalPnlPercentage: number;
  readonly dailyChange: number;
  readonly dailyChangePercentage: number;
  readonly weeklyChange: number;
  readonly weeklyChangePercentage: number;
  readonly monthlyChange: number;
  readonly monthlyChangePercentage: number;
  readonly totalPositions: number;
  readonly lastUpdated: string;
}

export interface PortfolioPerformance {
  readonly period: '24h' | '7d' | '30d' | '90d' | '1y' | 'all';
  readonly data: readonly {
    readonly timestamp: string;
    readonly value: number;
    readonly pnl: number;
  }[];
}

export interface AllocationTarget {
  readonly assetId: string;
  readonly targetAllocation: number; // percentage
  readonly currentAllocation: number; // percentage
  readonly difference: number; // percentage difference
  readonly action: 'buy' | 'sell' | 'hold';
  readonly suggestedAmount?: number;
}

export interface RebalanceRecommendation {
  readonly id: string;
  readonly reason: string;
  readonly priority: 'low' | 'medium' | 'high';
  readonly allocations: readonly AllocationTarget[];
  readonly estimatedCost: number;
  readonly estimatedGain: number;
  readonly createdAt: string;
}

export interface PortfolioHistory {
  readonly date: string;
  readonly totalValue: number;
  readonly positions: readonly Position[];
  readonly transactions: readonly Transaction[];
}

export interface Transaction {
  readonly id: string;
  readonly type: 'buy' | 'sell' | 'swap' | 'stake' | 'unstake';
  readonly assetId: string;
  readonly quantity: number;
  readonly price: number;
  readonly value: number;
  readonly fee: number;
  readonly signature?: string;
  readonly poolId?: string;
  readonly timestamp: string;
}

export interface AddPositionRequest {
  readonly assetId: string;
  readonly quantity: number;
  readonly price?: number;
  readonly poolId?: string;
}

export interface UpdatePositionRequest {
  readonly quantity?: number;
  readonly targetAllocation?: number;
}

export interface RebalanceRequest {
  readonly allocations: readonly {
    readonly assetId: string;
    readonly targetAllocation: number;
  }[];
  readonly maxSlippage?: number;
  readonly prioritizeGas?: boolean;
}

export interface RebalanceResult {
  readonly transactions: readonly Transaction[];
  readonly newAllocations: readonly AllocationTarget[];
  readonly totalCost: number;
  readonly estimatedGain: number;
  readonly executedAt: string;
}

export interface PortfolioService {
  getPortfolio(): Promise<{
    summary: PortfolioSummary;
    positions: Position[];
  }>;
  
  getPortfolioPerformance(period: PortfolioPerformance['period']): Promise<PortfolioPerformance>;
  
  getRebalanceRecommendations(): Promise<RebalanceRecommendation[]>;
  
  addPosition(request: AddPositionRequest): Promise<Position>;
  
  updatePosition(positionId: string, request: UpdatePositionRequest): Promise<Position>;
  
  removePosition(positionId: string): Promise<void>;
  
  executeRebalance(request: RebalanceRequest): Promise<RebalanceResult>;
  
  getTransactionHistory(limit?: number): Promise<Transaction[]>;
  
  getAvailableAssets(): Promise<Asset[]>;
}

// Performance metrics
export interface PortfolioMetrics {
  readonly sharpeRatio: number;
  readonly volatility: number;
  readonly maxDrawdown: number;
  readonly annualizedReturn: number;
  readonly winRate: number;
  readonly averageHoldingPeriod: number; // days
  readonly diversificationScore: number; // 0-100
}

// Risk metrics
export interface RiskMetrics {
  readonly portfolioRisk: 'low' | 'medium' | 'high';
  readonly concentrationRisk: number; // 0-100
  readonly liquidityRisk: number; // 0-100
  readonly correlationRisk: number; // 0-100
  readonly warnings: readonly string[];
  readonly suggestions: readonly string[];
}