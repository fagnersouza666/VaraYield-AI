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
import { EnhancedSolanaWalletService } from './enhanced-wallet.service';

export class WalletPortfolioService implements PortfolioService {
  private publicKey: PublicKey | null = null;
  private enhancedWalletService: EnhancedSolanaWalletService | null = null;
  private useEnhancedService: boolean = true; // Enable enhanced service by default

  constructor(
    private walletService: WalletService,
    publicKey: PublicKey | null = null
  ) {
    this.publicKey = publicKey;
    
    // Try to create enhanced service if we have a connection
    try {
      if ('connection' in walletService && walletService.connection) {
        this.enhancedWalletService = new EnhancedSolanaWalletService(walletService.connection);
        console.log('✅ Enhanced wallet service initialized');
      }
    } catch (error) {
      console.warn('⚠️ Failed to initialize enhanced wallet service, using fallback:', error);
      this.useEnhancedService = false;
    }
  }

  setPublicKey(publicKey: PublicKey | null): void {
    this.publicKey = publicKey;
  }

  async getPortfolio(): Promise<{ summary: PortfolioSummary; positions: Position[] }> {
    if (!this.publicKey) {
      throw new RaydiumError('Wallet not connected');
    }

    try {
      console.log('🔄 Getting portfolio for wallet:', this.publicKey.toString());
      
      // Use enhanced service if available, fallback to regular service
      let walletBalance;
      if (this.useEnhancedService && this.enhancedWalletService) {
        console.log('🚀 Using enhanced wallet service for better performance');
        try {
          walletBalance = await this.enhancedWalletService.getWalletBalances(this.publicKey);
        } catch (enhancedError) {
          console.warn('⚠️ Enhanced service failed, falling back to regular service:', enhancedError);
          walletBalance = await this.walletService.getWalletBalances(this.publicKey);
        }
      } else {
        console.log('📡 Using regular wallet service');
        walletBalance = await this.walletService.getWalletBalances(this.publicKey);
      }

      console.log('📊 Wallet data:', {
        solBalance: walletBalance.solBalance,
        tokenCount: walletBalance.tokenBalances.length,
        totalValue: walletBalance.totalValue
      });

      // Convert wallet balances to portfolio positions
      const positions = await this.convertTokenBalancesToPositions(walletBalance.tokenBalances);

      // Add SOL as a position with proper price handling
      const solAsset: Asset = {
        id: 'sol',
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        mintAddress: 'So11111111111111111111111111111111111111112',
        price: 98.45, // This should come from price service - using fallback price
        priceChange24h: 5.2,
        marketCap: 42000000000,
      };

      // Calculate SOL value with proper handling for zero balances
      const solValue = walletBalance.solBalance * solAsset.price;
      console.log('💰 SOL calculation:', {
        balance: walletBalance.solBalance,
        price: solAsset.price,
        value: solValue
      });

      // Calculate total value including SOL
      const tokenTotalValue = walletBalance.totalValue || 0;
      const totalValueWithSol = tokenTotalValue + solValue;

      console.log('💵 Total value calculation:', {
        tokenTotalValue,
        solValue,
        totalValueWithSol
      });

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

      // Always add SOL position to show wallet structure, even with 0 balance
      positions.unshift(solPosition);

      // Recalculate allocations with correct total
      const finalTotalValue = Math.max(totalValueWithSol, 0);
      const finalPositions = positions.map(pos => ({
        ...pos,
        allocation: finalTotalValue > 0 ? (pos.value / finalTotalValue) * 100 : 0,
      }));

      console.log('📈 Final portfolio calculation:', {
        finalTotalValue,
        positionsCount: finalPositions.length,
        positionsValues: finalPositions.map(p => ({ symbol: p.asset.symbol, value: p.value }))
      });

      // Calculate portfolio summary
      const summary = this.calculatePortfolioSummary(finalPositions, finalTotalValue);

      return { summary, positions: finalPositions };
    } catch (error) {
      console.error('❌ CRITICAL: Failed to get wallet portfolio:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      // Return empty portfolio on error to prevent infinite loading
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
      console.log('🔄 Converting token balances to positions:', {
        tokenCount: tokenBalances.length,
        tokens: tokenBalances.map(t => ({ symbol: t.symbol, balance: t.uiAmount, value: t.value }))
      });

      for (const tokenBalance of tokenBalances) {
        try {
          // Include all tokens with any balance (LP tokens can have tiny values but be worth something)
          if (tokenBalance.uiAmount > 0 || tokenBalance.balance > 0) {
            console.log(`🔄 Processing token: ${tokenBalance.symbol} - Balance: ${tokenBalance.uiAmount} - Raw: ${tokenBalance.balance} - Value: ${tokenBalance.value || 0}`);

            // Calculate price from value and balance, with fallback to 0
            let tokenPrice = 0;
            if (tokenBalance.value && tokenBalance.uiAmount > 0) {
              tokenPrice = tokenBalance.value / tokenBalance.uiAmount;
            }

            const asset: Asset = {
              id: tokenBalance.mint.toLowerCase(),
              symbol: tokenBalance.symbol || 'UNKNOWN',
              name: tokenBalance.name || 'Unknown Token',
              decimals: tokenBalance.decimals || 0,
              mintAddress: tokenBalance.mint,
              price: tokenPrice,
              priceChange24h: 0, // Would need to get from price service
            };

            const tokenValue = tokenBalance.value || 0;

            const position: Position = {
              id: `${tokenBalance.mint}-position`,
              asset,
              quantity: tokenBalance.uiAmount,
              value: tokenValue,
              allocation: 0, // Will be calculated later
              averagePrice: tokenPrice,
              pnl: 0, // Would need historical purchase data
              pnlPercentage: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            positions.push(position);
            console.log(`✅ Added position: ${asset.symbol} - Quantity: ${position.quantity} - Value: $${position.value}`);
          } else {
            console.log(`⏭️ Skipping token with zero balance: ${tokenBalance.symbol}`);
          }
        } catch (tokenError) {
          console.warn('Failed to convert token to position:', tokenBalance.mint, tokenError);
          continue; // Skip this token and continue
        }
      }

      console.log('📊 Conversion complete:', {
        inputTokens: tokenBalances.length,
        outputPositions: positions.length,
        totalValue: positions.reduce((sum, p) => sum + p.value, 0)
      });

      return positions;
    } catch (error) {
      console.error('❌ Failed to convert token balances to positions:', error);
      return [];
    }
  }

  private calculatePortfolioSummary(positions: Position[], totalValue: number): PortfolioSummary {
    const totalPnl = positions.reduce((sum, pos) => sum + pos.pnl, 0);
    const totalPnlPercentage = totalValue > 0 ? (totalPnl / totalValue) * 100 : 0;

    console.log('📈 Portfolio summary calculation:', {
      totalValue,
      totalPnl,
      totalPnlPercentage,
      positionsCount: positions.length
    });

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
      case 'all': return 365;
      default: return 7;
    }
  }
}