import { Connection, PublicKey } from '@solana/web3.js';
import { RaydiumError } from '../../utils/errors';

export interface PoolMetrics {
  id: string;
  name: string;
  tokenA: {
    mint: string;
    symbol: string;
    amount: number;
    uiAmount: number;
  };
  tokenB: {
    mint: string;
    symbol: string;
    amount: number;
    uiAmount: number;
  };
  tvl: number; // Total Value Locked
  volume24h: number;
  fees24h: number;
  apy: number;
  price: number;
  priceChange24h: number;
  lpTokenSupply: number;
  lpBurnPercentage: number;
  marketCap: number;
  lastUpdated: string;
}

export interface PoolAnalytics {
  pools: PoolMetrics[];
  totalTVL: number;
  totalVolume24h: number;
  totalFees24h: number;
  averageAPY: number;
  topPerformers: PoolMetrics[];
  riskMetrics: {
    lowRisk: PoolMetrics[];
    mediumRisk: PoolMetrics[];
    highRisk: PoolMetrics[];
  };
}

export interface NewPoolAlert {
  poolId: string;
  tokenPair: string;
  initialLiquidity: number;
  timestamp: string;
  riskScore: number;
  potentialAPY: number;
}

export class PoolAnalyticsService {
  constructor(
    private connection: Connection,
    private raydiumProgramId: PublicKey = new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8')
  ) {}

  async getPoolMetrics(poolIds: string[]): Promise<PoolMetrics[]> {
    try {
      console.log('📊 Fetching pool metrics for', poolIds.length, 'pools');
      
      const pools: PoolMetrics[] = [];
      
      for (const poolId of poolIds) {
        try {
          const poolMetrics = await this.fetchSinglePoolMetrics(poolId);
          if (poolMetrics) {
            pools.push(poolMetrics);
          }
        } catch (error) {
          console.warn(`Failed to fetch metrics for pool ${poolId}:`, error);
          continue;
        }
      }

      return pools.sort((a, b) => b.tvl - a.tvl); // Sort by TVL descending
    } catch (error) {
      console.error('Failed to get pool metrics:', error);
      throw new RaydiumError('Failed to fetch pool analytics', { poolIds, error });
    }
  }

  private async fetchSinglePoolMetrics(poolId: string): Promise<PoolMetrics | null> {
    try {
      // This would integrate with Raydium SDK or direct RPC calls
      // For now, we'll return mock data with realistic structure
      const mockPool: PoolMetrics = {
        id: poolId,
        name: `Pool ${poolId.slice(0, 8)}`,
        tokenA: {
          mint: 'So11111111111111111111111111111111111111112',
          symbol: 'SOL',
          amount: 1000000000000, // in lamports
          uiAmount: 1000, // in SOL
        },
        tokenB: {
          mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          symbol: 'USDC',
          amount: 95000000000, // in micro USDC
          uiAmount: 95000, // in USDC
        },
        tvl: 190000, // $190k TVL
        volume24h: 50000,
        fees24h: 150,
        apy: 12.5,
        price: 95.0,
        priceChange24h: 2.3,
        lpTokenSupply: 10000,
        lpBurnPercentage: 85.5, // High burn rate is good
        marketCap: 2500000,
        lastUpdated: new Date().toISOString(),
      };

      return mockPool;
    } catch (error) {
      console.error(`Failed to fetch metrics for pool ${poolId}:`, error);
      return null;
    }
  }

  async getPoolAnalytics(): Promise<PoolAnalytics> {
    try {
      // Get popular pool IDs - in real implementation, this would come from Raydium API
      const popularPoolIds = [
        '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2', // SOL-USDC
        '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1', // RAY-SOL
        '7qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm', // SRM-SOL
      ];

      const pools = await this.getPoolMetrics(popularPoolIds);
      
      const totalTVL = pools.reduce((sum, pool) => sum + pool.tvl, 0);
      const totalVolume24h = pools.reduce((sum, pool) => sum + pool.volume24h, 0);
      const totalFees24h = pools.reduce((sum, pool) => sum + pool.fees24h, 0);
      const averageAPY = pools.length > 0 ? pools.reduce((sum, pool) => sum + pool.apy, 0) / pools.length : 0;

      // Sort by performance for top performers
      const topPerformers = [...pools]
        .sort((a, b) => (b.apy + b.priceChange24h) - (a.apy + a.priceChange24h))
        .slice(0, 5);

      // Risk categorization based on LP burn percentage and volatility
      const riskMetrics = {
        lowRisk: pools.filter(p => p.lpBurnPercentage > 80 && Math.abs(p.priceChange24h) < 5),
        mediumRisk: pools.filter(p => p.lpBurnPercentage > 50 && p.lpBurnPercentage <= 80),
        highRisk: pools.filter(p => p.lpBurnPercentage <= 50 || Math.abs(p.priceChange24h) > 10),
      };

      return {
        pools,
        totalTVL,
        totalVolume24h,
        totalFees24h,
        averageAPY,
        topPerformers,
        riskMetrics,
      };
    } catch (error) {
      console.error('Failed to get pool analytics:', error);
      throw new RaydiumError('Failed to fetch pool analytics', { error });
    }
  }

  async monitorNewPools(callback: (alert: NewPoolAlert) => void): Promise<() => void> {
    try {
      console.log('🔍 Starting new pool monitoring...');
      
      // Monitor Raydium program for new pool creation
      const subscriptionId = this.connection.onProgramAccountChange(
        this.raydiumProgramId,
        (updatedAccountInfo, context) => {
          this.handlePotentialNewPool(updatedAccountInfo, context, callback);
        },
        'confirmed'
      );

      // Return cleanup function
      return () => {
        console.log('🛑 Stopping new pool monitoring');
        this.connection.removeProgramAccountChangeListener(subscriptionId);
      };
    } catch (error) {
      console.error('Failed to start pool monitoring:', error);
      throw new RaydiumError('Failed to start pool monitoring', { error });
    }
  }

  private async handlePotentialNewPool(
    updatedAccountInfo: any,
    context: any,
    callback: (alert: NewPoolAlert) => void
  ) {
    try {
      // Parse account data to detect new pool creation
      // This is a simplified version - real implementation would decode pool state
      const poolId = updatedAccountInfo.accountId.toString();
      
      // Mock new pool alert
      const alert: NewPoolAlert = {
        poolId,
        tokenPair: 'NEW-SOL',
        initialLiquidity: 50000,
        timestamp: new Date().toISOString(),
        riskScore: Math.random() * 100, // 0-100 risk score
        potentialAPY: 15 + Math.random() * 85, // 15-100% APY estimate
      };

      console.log('🚨 New pool detected:', alert);
      callback(alert);
    } catch (error) {
      console.warn('Failed to process potential new pool:', error);
    }
  }

  async getOptimalPoolsForYield(
    targetAmount: number,
    riskTolerance: 'low' | 'medium' | 'high',
    minAPY: number = 5
  ): Promise<PoolMetrics[]> {
    try {
      const analytics = await this.getPoolAnalytics();
      let candidatePools: PoolMetrics[] = [];

      // Filter by risk tolerance
      switch (riskTolerance) {
        case 'low':
          candidatePools = analytics.riskMetrics.lowRisk;
          break;
        case 'medium':
          candidatePools = [...analytics.riskMetrics.lowRisk, ...analytics.riskMetrics.mediumRisk];
          break;
        case 'high':
          candidatePools = analytics.pools;
          break;
      }

      // Filter by minimum APY and sufficient liquidity
      const optimalPools = candidatePools
        .filter(pool => pool.apy >= minAPY && pool.tvl >= targetAmount * 0.1) // 10% of target amount in TVL
        .sort((a, b) => {
          // Score based on APY, TVL, and LP burn rate
          const scoreA = a.apy + (a.tvl / 1000000) + a.lpBurnPercentage;
          const scoreB = b.apy + (b.tvl / 1000000) + b.lpBurnPercentage;
          return scoreB - scoreA;
        })
        .slice(0, 10); // Top 10 pools

      console.log(`💰 Found ${optimalPools.length} optimal pools for ${targetAmount} with ${riskTolerance} risk`);
      return optimalPools;
    } catch (error) {
      console.error('Failed to get optimal pools:', error);
      throw new RaydiumError('Failed to find optimal pools', { targetAmount, riskTolerance, minAPY, error });
    }
  }

  async getPoolPerformanceHistory(poolId: string, days: number = 30): Promise<{
    dates: string[];
    tvl: number[];
    apy: number[];
    volume: number[];
    price: number[];
  }> {
    try {
      // Mock historical data - in real implementation, this would come from stored data or external API
      const dates: string[] = [];
      const tvl: number[] = [];
      const apy: number[] = [];
      const volume: number[] = [];
      const price: number[] = [];

      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);

        // Generate realistic mock data with trends
        const baseTVL = 100000;
        const baseAPY = 12;
        const baseVolume = 25000;
        const basePrice = 95;

        tvl.push(baseTVL + Math.random() * 50000 - 25000);
        apy.push(baseAPY + Math.sin(i * 0.1) * 3 + Math.random() * 2 - 1);
        volume.push(baseVolume + Math.random() * 30000 - 15000);
        price.push(basePrice + Math.sin(i * 0.05) * 10 + Math.random() * 4 - 2);
      }

      return { dates, tvl, apy, volume, price };
    } catch (error) {
      console.error('Failed to get pool performance history:', error);
      throw new RaydiumError('Failed to fetch pool history', { poolId, days, error });
    }
  }
}