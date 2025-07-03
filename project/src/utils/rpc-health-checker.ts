import { Connection, clusterApiUrl } from '@solana/web3.js';

export interface RPCEndpoint {
  url: string;
  name: string;
  priority: number;
  isWorking: boolean;
  lastChecked: number;
  responseTime: number;
  errorCount: number;
}

export class RPCHealthChecker {
  private static instance: RPCHealthChecker;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): RPCHealthChecker {
    if (!RPCHealthChecker.instance) {
      RPCHealthChecker.instance = new RPCHealthChecker();
    }
    return RPCHealthChecker.instance;
  }

  /**
   * Test a single RPC endpoint for health and performance
   */
  async testEndpoint(url: string, timeoutMs: number = 5000): Promise<{
    isHealthy: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const connection = new Connection(url, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: timeoutMs,
        disableRetryOnRateLimit: true,
      });

      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), timeoutMs);
      });

      // Test with getSlot (lightweight operation)
      const healthCheckPromise = connection.getSlot();

      // Race between health check and timeout
      await Promise.race([healthCheckPromise, timeoutPromise]);

      const responseTime = Date.now() - startTime;
      
      return {
        isHealthy: true,
        responseTime,
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        isHealthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get a list of reliable mainnet RPC endpoints
   */
  getReliableEndpoints(): RPCEndpoint[] {
    const configuredRpc = import.meta.env.VITE_VARA_RPC_URL || 'https://rpc.ankr.com/solana';
    const backup1 = import.meta.env.VITE_VARA_RPC_BACKUP_1 || 'https://api.mainnet-beta.solana.com';
    const backup2 = import.meta.env.VITE_VARA_RPC_BACKUP_2 || 'https://solana.public-rpc.com';
    const backup3 = import.meta.env.VITE_VARA_RPC_BACKUP_3 || 'https://api.devnet.solana.com';

    return [
      {
        url: configuredRpc,
        name: 'Primary (Ankr)',
        priority: 1,
        isWorking: true,
        lastChecked: 0,
        responseTime: 0,
        errorCount: 0,
      },
      {
        url: backup1,
        name: 'Solana Official',
        priority: 2,
        isWorking: true,
        lastChecked: 0,
        responseTime: 0,
        errorCount: 0,
      },
      {
        url: backup2,
        name: 'Public RPC',
        priority: 3,
        isWorking: true,
        lastChecked: 0,
        responseTime: 0,
        errorCount: 0,
      },
      {
        url: backup3,
        name: 'Devnet Fallback',
        priority: 4,
        isWorking: true,
        lastChecked: 0,
        responseTime: 0,
        errorCount: 0,
      },
      {
        url: clusterApiUrl('mainnet-beta'),
        name: 'ClusterAPI Mainnet',
        priority: 5,
        isWorking: true,
        lastChecked: 0,
        responseTime: 0,
        errorCount: 0,
      },
    ];
  }

  /**
   * Test all endpoints and return the fastest working one
   */
  async findFastestWorkingEndpoint(endpoints?: RPCEndpoint[]): Promise<RPCEndpoint | null> {
    const endpointsToTest = endpoints || this.getReliableEndpoints();
    
    console.log('🔍 Testing RPC endpoints for fastest connection...');
    
    // Test all endpoints concurrently
    const testPromises = endpointsToTest.map(async (endpoint) => {
      const result = await this.testEndpoint(endpoint.url);
      
      return {
        ...endpoint,
        isWorking: result.isHealthy,
        responseTime: result.responseTime,
        lastChecked: Date.now(),
        errorCount: result.isHealthy ? Math.max(0, endpoint.errorCount - 1) : endpoint.errorCount + 1,
      };
    });

    try {
      const results = await Promise.all(testPromises);
      
      // Filter working endpoints and sort by response time
      const workingEndpoints = results
        .filter(endpoint => endpoint.isWorking)
        .sort((a, b) => a.responseTime - b.responseTime);

      if (workingEndpoints.length === 0) {
        console.error('❌ No working RPC endpoints found');
        return null;
      }

      const fastest = workingEndpoints[0];
      console.log(`✅ Fastest RPC endpoint: ${fastest.name} (${fastest.responseTime}ms)`);
      
      return fastest;

    } catch (error) {
      console.error('❌ Error testing RPC endpoints:', error);
      return null;
    }
  }

  /**
   * Get the best RPC connection based on health checks
   */
  async getBestConnection(): Promise<Connection | null> {
    const fastestEndpoint = await this.findFastestWorkingEndpoint();
    
    if (!fastestEndpoint) {
      return null;
    }

    return new Connection(fastestEndpoint.url, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 30000,
      disableRetryOnRateLimit: false,
    });
  }

  /**
   * Start periodic health checks (for background monitoring)
   */
  startPeriodicHealthCheck(intervalMs: number = 5 * 60 * 1000): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      console.log('🔄 Running periodic RPC health check...');
      await this.findFastestWorkingEndpoint();
    }, intervalMs);

    console.log(`✅ Started periodic RPC health check (every ${intervalMs/1000}s)`);
  }

  /**
   * Stop periodic health checks
   */
  stopPeriodicHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('⏹️ Stopped periodic RPC health check');
    }
  }

  /**
   * Get recommended RPC providers for production
   */
  getRecommendedProviders(): Array<{
    name: string;
    website: string;
    description: string;
    pricing: string;
  }> {
    return [
      {
        name: 'Helius',
        website: 'https://helius.dev/',
        description: 'High-performance Solana infrastructure with enhanced APIs',
        pricing: 'Free tier available, paid plans from $99/month',
      },
      {
        name: 'QuickNode',
        website: 'https://quicknode.com/chains/solana',
        description: 'Global Solana network with low latency',
        pricing: 'Free tier available, paid plans from $9/month',
      },
      {
        name: 'Alchemy',
        website: 'https://alchemy.com/solana',
        description: 'Enterprise-grade Solana infrastructure',
        pricing: 'Free tier available, usage-based pricing',
      },
      {
        name: 'Ankr',
        website: 'https://ankr.com/rpc/solana/',
        description: 'Decentralized RPC service',
        pricing: 'Free tier available, paid plans from $99/month',
      },
    ];
  }
}

// Utility function for quick endpoint testing
export async function testRPCEndpoint(url: string): Promise<boolean> {
  const checker = RPCHealthChecker.getInstance();
  const result = await checker.testEndpoint(url, 3000);
  return result.isHealthy;
}

// Utility function to get the best available connection
export async function getBestSolanaConnection(): Promise<Connection | null> {
  const checker = RPCHealthChecker.getInstance();
  return checker.getBestConnection();
}