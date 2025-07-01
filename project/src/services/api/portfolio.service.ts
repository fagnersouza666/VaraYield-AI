import {
  PortfolioService,
  PortfolioSummary,
  Position,
  PortfolioPerformance,
  RebalanceRecommendation,
  AddPositionRequest,
  UpdatePositionRequest,
  RebalanceRequest,
  RebalanceResult,
  Transaction,
  Asset,
  AllocationTarget,
} from '../types/portfolio.types';
import { HttpClient, ApiResponse } from '../types/api.types';
import { RaydiumError, handleApiError } from '../../utils/errors';

export class HttpPortfolioService implements PortfolioService {
  constructor(
    private baseUrl: string,
    private httpClient: HttpClient
  ) {}

  async getPortfolio(): Promise<{ summary: PortfolioSummary; positions: Position[] }> {
    try {
      const response = await this.httpClient.get<ApiResponse<{
        summary: PortfolioSummary;
        positions: Position[];
      }>>(`${this.baseUrl}/portfolio`);

      if (!response.success) {
        throw new RaydiumError(
          'Failed to fetch portfolio data',
          { error: response.error }
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

  async getPortfolioPerformance(period: PortfolioPerformance['period']): Promise<PortfolioPerformance> {
    try {
      const response = await this.httpClient.get<ApiResponse<PortfolioPerformance>>(
        `${this.baseUrl}/portfolio/performance?period=${period}`
      );

      if (!response.success) {
        throw new RaydiumError(
          `Failed to fetch portfolio performance for ${period}`,
          { period, error: response.error }
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

  async getRebalanceRecommendations(): Promise<RebalanceRecommendation[]> {
    try {
      const response = await this.httpClient.get<ApiResponse<RebalanceRecommendation[]>>(
        `${this.baseUrl}/portfolio/rebalance/recommendations`
      );

      if (!response.success) {
        throw new RaydiumError(
          'Failed to fetch rebalance recommendations',
          { error: response.error }
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

  async addPosition(request: AddPositionRequest): Promise<Position> {
    try {
      const response = await this.httpClient.post<ApiResponse<Position>>(
        `${this.baseUrl}/portfolio/positions`,
        request
      );

      if (!response.success) {
        throw new RaydiumError(
          'Failed to add position',
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

  async updatePosition(positionId: string, request: UpdatePositionRequest): Promise<Position> {
    try {
      const response = await this.httpClient.put<ApiResponse<Position>>(
        `${this.baseUrl}/portfolio/positions/${positionId}`,
        request
      );

      if (!response.success) {
        throw new RaydiumError(
          `Failed to update position ${positionId}`,
          { positionId, request, error: response.error }
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

  async removePosition(positionId: string): Promise<void> {
    try {
      const response = await this.httpClient.delete<ApiResponse<void>>(
        `${this.baseUrl}/portfolio/positions/${positionId}`
      );

      if (!response.success) {
        throw new RaydiumError(
          `Failed to remove position ${positionId}`,
          { positionId, error: response.error }
        );
      }
    } catch (error) {
      if (error instanceof RaydiumError) {
        throw error;
      }
      handleApiError(error);
    }
  }

  async executeRebalance(request: RebalanceRequest): Promise<RebalanceResult> {
    try {
      const response = await this.httpClient.post<ApiResponse<RebalanceResult>>(
        `${this.baseUrl}/portfolio/rebalance/execute`,
        request
      );

      if (!response.success) {
        throw new RaydiumError(
          'Failed to execute rebalance',
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

  async getTransactionHistory(limit: number = 50): Promise<Transaction[]> {
    try {
      const response = await this.httpClient.get<ApiResponse<Transaction[]>>(
        `${this.baseUrl}/portfolio/transactions?limit=${limit}`
      );

      if (!response.success) {
        throw new RaydiumError(
          'Failed to fetch transaction history',
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

  async getAvailableAssets(): Promise<Asset[]> {
    try {
      const response = await this.httpClient.get<ApiResponse<Asset[]>>(
        `${this.baseUrl}/assets`
      );

      if (!response.success) {
        throw new RaydiumError(
          'Failed to fetch available assets',
          { error: response.error }
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
}

// Mock implementation for development/testing
export class MockPortfolioService implements PortfolioService {
  private mockAssets: Asset[] = [
    {
      id: 'sol',
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9,
      mintAddress: 'So11111111111111111111111111111111111111112',
      price: 98.45,
      priceChange24h: 5.2,
      marketCap: 42000000000,
    },
    {
      id: 'usdc',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      price: 1.0,
      priceChange24h: 0.01,
      marketCap: 25000000000,
    },
    {
      id: 'ray',
      symbol: 'RAY',
      name: 'Raydium',
      decimals: 6,
      mintAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      price: 2.34,
      priceChange24h: -1.8,
      marketCap: 234000000,
    },
  ];

  private mockPositions: Position[] = [
    {
      id: 'pos-1',
      asset: this.mockAssets[0], // SOL
      quantity: 10.5,
      value: 1033.73,
      allocation: 65.2,
      averagePrice: 95.50,
      pnl: 30.98,
      pnlPercentage: 3.1,
      poolId: 'pool-1',
      apr: 12.5,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pos-2',
      asset: this.mockAssets[1], // USDC
      quantity: 300,
      value: 300,
      allocation: 18.9,
      averagePrice: 1.0,
      pnl: 0,
      pnlPercentage: 0,
      createdAt: '2024-01-20T14:15:00Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pos-3',
      asset: this.mockAssets[2], // RAY
      quantity: 100,
      value: 234,
      allocation: 14.8,
      averagePrice: 2.50,
      pnl: -16,
      pnlPercentage: -6.4,
      poolId: 'pool-2',
      apr: 9.8,
      createdAt: '2024-02-01T09:45:00Z',
      updatedAt: new Date().toISOString(),
    },
  ];

  private mockSummary: PortfolioSummary = {
    totalValue: 1567.73,
    totalPnl: 14.98,
    totalPnlPercentage: 0.96,
    dailyChange: 23.45,
    dailyChangePercentage: 1.52,
    weeklyChange: 67.89,
    weeklyChangePercentage: 4.5,
    monthlyChange: 156.78,
    monthlyChangePercentage: 11.1,
    totalPositions: 3,
    lastUpdated: new Date().toISOString(),
  };

  async getPortfolio(): Promise<{ summary: PortfolioSummary; positions: Position[] }> {
    await this.delay(500);
    return {
      summary: this.mockSummary,
      positions: this.mockPositions,
    };
  }

  async getPortfolioPerformance(period: PortfolioPerformance['period']): Promise<PortfolioPerformance> {
    await this.delay(300);
    
    const days = this.getPeriodDays(period);
    const data = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      
      const baseValue = 1500;
      const variation = Math.sin(i * 0.1) * 50 + Math.random() * 20;
      const value = baseValue + variation;
      
      return {
        timestamp: date.toISOString(),
        value,
        pnl: value - baseValue,
      };
    });

    return { period, data };
  }

  async getRebalanceRecommendations(): Promise<RebalanceRecommendation[]> {
    await this.delay(400);

    const recommendations: RebalanceRecommendation[] = [
      {
        id: 'rec-1',
        reason: 'SOL allocation is above target by 15.2%',
        priority: 'medium',
        allocations: [
          {
            assetId: 'sol',
            targetAllocation: 50,
            currentAllocation: 65.2,
            difference: -15.2,
            action: 'sell',
            suggestedAmount: 238.47,
          },
          {
            assetId: 'usdc',
            targetAllocation: 30,
            currentAllocation: 18.9,
            difference: 11.1,
            action: 'buy',
            suggestedAmount: 173.96,
          },
          {
            assetId: 'ray',
            targetAllocation: 20,
            currentAllocation: 14.8,
            difference: 5.2,
            action: 'buy',
            suggestedAmount: 81.5,
          },
        ],
        estimatedCost: 12.5,
        estimatedGain: 45.2,
        createdAt: new Date().toISOString(),
      },
    ];

    return recommendations;
  }

  async addPosition(request: AddPositionRequest): Promise<Position> {
    await this.delay(600);

    const asset = this.mockAssets.find(a => a.id === request.assetId);
    if (!asset) {
      throw new RaydiumError(`Asset ${request.assetId} not found`);
    }

    const price = request.price || asset.price;
    const value = request.quantity * price;

    const newPosition: Position = {
      id: `pos-${Date.now()}`,
      asset,
      quantity: request.quantity,
      value,
      allocation: 0, // Would be calculated based on total portfolio
      averagePrice: price,
      pnl: 0,
      pnlPercentage: 0,
      poolId: request.poolId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.mockPositions.push(newPosition);
    return newPosition;
  }

  async updatePosition(positionId: string, request: UpdatePositionRequest): Promise<Position> {
    await this.delay(400);

    const position = this.mockPositions.find(p => p.id === positionId);
    if (!position) {
      throw new RaydiumError(`Position ${positionId} not found`);
    }

    const updatedPosition: Position = {
      ...position,
      ...(request.quantity && { 
        quantity: request.quantity,
        value: request.quantity * position.asset.price,
      }),
      updatedAt: new Date().toISOString(),
    };

    const index = this.mockPositions.findIndex(p => p.id === positionId);
    this.mockPositions[index] = updatedPosition;

    return updatedPosition;
  }

  async removePosition(positionId: string): Promise<void> {
    await this.delay(300);

    const index = this.mockPositions.findIndex(p => p.id === positionId);
    if (index === -1) {
      throw new RaydiumError(`Position ${positionId} not found`);
    }

    this.mockPositions.splice(index, 1);
  }

  async executeRebalance(request: RebalanceRequest): Promise<RebalanceResult> {
    await this.delay(2000);

    const transactions: Transaction[] = request.allocations.map((alloc, index) => ({
      id: `tx-${Date.now()}-${index}`,
      type: 'swap' as const,
      assetId: alloc.assetId,
      quantity: 100, // Mock quantity
      price: 1,
      value: 100,
      fee: 0.5,
      timestamp: new Date().toISOString(),
    }));

    const newAllocations: AllocationTarget[] = request.allocations.map(alloc => ({
      assetId: alloc.assetId,
      targetAllocation: alloc.targetAllocation,
      currentAllocation: alloc.targetAllocation, // After rebalance
      difference: 0,
      action: 'hold' as const,
    }));

    return {
      transactions,
      newAllocations,
      totalCost: 15.5,
      estimatedGain: 45.2,
      executedAt: new Date().toISOString(),
    };
  }

  async getTransactionHistory(limit: number = 50): Promise<Transaction[]> {
    await this.delay(300);

    const mockTransactions: Transaction[] = [
      {
        id: 'tx-1',
        type: 'buy',
        assetId: 'sol',
        quantity: 5.0,
        price: 95.50,
        value: 477.50,
        fee: 2.38,
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        id: 'tx-2',
        type: 'swap',
        assetId: 'ray',
        quantity: 100,
        price: 2.50,
        value: 250,
        fee: 1.25,
        poolId: 'pool-2',
        timestamp: '2024-02-01T09:45:00Z',
      },
    ];

    return mockTransactions.slice(0, limit);
  }

  async getAvailableAssets(): Promise<Asset[]> {
    await this.delay(200);
    return this.mockAssets;
  }

  private getPeriodDays(period: PortfolioPerformance['period']): number {
    switch (period) {
      case '24h': return 1;
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      case 'all': return 730; // 2 years
      default: return 30;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}