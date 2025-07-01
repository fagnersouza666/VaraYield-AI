import { PublicKey } from '@solana/web3.js';
import {
  PortfolioService,
  PortfolioSummary,
  Position,
  Asset,
  PortfolioPerformance,
  RebalanceRecommendation,
  AddPositionRequest,
  UpdatePositionRequest,
  RebalanceRequest,
  RebalanceResult,
  Transaction,
} from '../types/portfolio.types';
import { WalletService, TokenBalance } from '../types/wallet.types';
import { RaydiumError } from '../../utils/errors';

export class WalletPortfolioService implements PortfolioService {
  constructor(
    private walletService: WalletService,
    private publicKey: PublicKey | null = null
  ) {}

  setPublicKey(publicKey: PublicKey | null) {
    this.publicKey = publicKey;
  }

  async getPortfolio(): Promise<{ summary: PortfolioSummary; positions: Position[] }> {
    if (!this.publicKey) {
      throw new RaydiumError('Wallet not connected');
    }

    try {
      const walletBalance = await this.walletService.getWalletBalances(this.publicKey);
      
      // Convert wallet balances to portfolio positions
      const positions = await this.convertTokenBalancesToPositions(walletBalance.tokenBalances);
      
      // Add SOL as a position (always include SOL, even with 0 balance for display)
      const solAsset: Asset = {
        id: 'sol',
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        mintAddress: 'So11111111111111111111111111111111111111112',
        price: 98.45, // This should come from price service
        priceChange24h: 5.2,
        marketCap: 42000000000,
      };

      const solValue = walletBalance.solBalance * solAsset.price;
      const totalValueWithSol = walletBalance.totalValue > 0 ? walletBalance.totalValue : solValue;
      
      const solPosition: Position = {
        id: 'sol-position',
        asset: solAsset,
        quantity: walletBalance.solBalance,
        value: solValue,
        allocation: totalValueWithSol > 0 ? (solValue / totalValueWithSol) * 100 : 0,
        averagePrice: solAsset.price,
        pnl: 0, // Would need historical data to calculate
        pnlPercentage: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Only add SOL position if balance > 0
      if (walletBalance.solBalance > 0) {
        positions.unshift(solPosition);
      }

      // Recalculate allocations with correct total
      const finalTotalValue = Math.max(totalValueWithSol, 0.01); // Avoid division by zero
      const finalPositions = positions.map(pos => ({
        ...pos,
        allocation: (pos.value / finalTotalValue) * 100,
      }));

      // Calculate portfolio summary
      const summary = this.calculatePortfolioSummary(finalPositions, finalTotalValue);

      return { summary, positions: finalPositions };
    } catch (error) {
      console.error('Failed to get wallet portfolio:', error);
      
      // Return empty portfolio on error instead of throwing
      const emptySummary: PortfolioSummary = {
        totalValue: 0,
        totalPnl: 0,
        totalPnlPercentage: 0,
        dailyChange: 0,
        dailyChangePercentage: 0,
        weeklyChange: 0,
        weeklyChangePercentage: 0,
        monthlyChange: 0,
        monthlyChangePercentage: 0,
        totalPositions: 0,
        lastUpdated: new Date().toISOString(),
      };

      return { summary: emptySummary, positions: [] };
    }
  }

  private async convertTokenBalancesToPositions(tokenBalances: readonly TokenBalance[]): Promise<Position[]> {
    const positions: Position[] = [];
    
    try {
      // Get total value for allocation calculation
      const totalValue = tokenBalances.reduce((sum, token) => sum + (token.value || 0), 0);

      for (const tokenBalance of tokenBalances) {
        try {
          if (tokenBalance.uiAmount > 0) {
            const asset: Asset = {
              id: tokenBalance.mint.toLowerCase(),
              symbol: tokenBalance.symbol || 'UNKNOWN',
              name: tokenBalance.name || 'Unknown Token',
              decimals: tokenBalance.decimals || 0,
              mintAddress: tokenBalance.mint,
              price: tokenBalance.value && tokenBalance.uiAmount > 0 ? tokenBalance.value / tokenBalance.uiAmount : 0,
              priceChange24h: 0, // Would need to get from price service
            };

            const position: Position = {
              id: `${tokenBalance.mint}-position`,
              asset,
              quantity: tokenBalance.uiAmount,
              value: tokenBalance.value || 0,
              allocation: totalValue > 0 ? ((tokenBalance.value || 0) / totalValue) * 100 : 0,
              averagePrice: asset.price,
              pnl: 0, // Would need historical purchase data
              pnlPercentage: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            positions.push(position);
          }
        } catch (tokenError) {
          console.warn('Failed to convert token to position:', tokenBalance.mint, tokenError);
          continue; // Skip this token and continue
        }
      }

      return positions.sort((a, b) => b.value - a.value); // Sort by value descending
    } catch (error) {
      console.error('Failed to convert token balances to positions:', error);
      return []; // Return empty array on error
    }
  }

  private calculatePortfolioSummary(positions: Position[], totalValue: number): PortfolioSummary {
    const totalPnl = positions.reduce((sum, pos) => sum + pos.pnl, 0);
    const totalPnlPercentage = totalValue > 0 ? (totalPnl / totalValue) * 100 : 0;

    return {
      totalValue,
      totalPnl,
      totalPnlPercentage,
      dailyChange: 0, // Would need historical data
      dailyChangePercentage: 0,
      weeklyChange: 0,
      weeklyChangePercentage: 0,
      monthlyChange: 0,
      monthlyChangePercentage: 0,
      totalPositions: positions.length,
      lastUpdated: new Date().toISOString(),
    };
  }

  // For wallet-based portfolio, these operations are not supported
  async getPortfolioPerformance(period: PortfolioPerformance['period']): Promise<PortfolioPerformance> {
    // Mock data - in real implementation, you'd store historical snapshots
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
    // For wallet portfolio, provide basic rebalancing suggestions
    return [
      {
        id: 'wallet-rebalance-1',
        reason: 'Consider diversifying your holdings across more assets',
        priority: 'medium',
        allocations: [],
        estimatedCost: 0,
        estimatedGain: 0,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  async addPosition(request: AddPositionRequest): Promise<Position> {
    throw new RaydiumError('Adding positions not supported for wallet portfolio. Use Solana wallet to manage tokens.');
  }

  async updatePosition(positionId: string, request: UpdatePositionRequest): Promise<Position> {
    throw new RaydiumError('Updating positions not supported for wallet portfolio. Use Solana wallet to manage tokens.');
  }

  async removePosition(positionId: string): Promise<void> {
    throw new RaydiumError('Removing positions not supported for wallet portfolio. Use Solana wallet to manage tokens.');
  }

  async executeRebalance(request: RebalanceRequest): Promise<RebalanceResult> {
    throw new RaydiumError('Rebalancing not supported for wallet portfolio. Use Solana wallet to swap tokens.');
  }

  async getTransactionHistory(limit: number = 50): Promise<Transaction[]> {
    // In real implementation, you'd query transaction history from the blockchain
    return [];
  }

  async getAvailableAssets(): Promise<Asset[]> {
    // Return assets that can be traded on Solana
    const knownAssets: Asset[] = [
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

    return knownAssets;
  }

  private getPeriodDays(period: PortfolioPerformance['period']): number {
    switch (period) {
      case '24h': return 1;
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      case 'all': return 730;
      default: return 30;
    }
  }
}