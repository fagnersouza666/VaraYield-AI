/**
 * Mock API Server - Production Fallback
 * Provides local API responses to avoid localhost connection errors
 */

export interface MockResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
}

export class MockAPIServer {
  private static instance: MockAPIServer;
  private baseDelay = 500; // Simulate network delay

  static getInstance(): MockAPIServer {
    if (!MockAPIServer.instance) {
      MockAPIServer.instance = new MockAPIServer();
    }
    return MockAPIServer.instance;
  }

  private async simulateDelay(min: number = 300, max: number = 800): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private createResponse<T>(data: T, success: boolean = true): MockResponse<T> {
    return {
      success,
      data,
      error: success ? undefined : 'Mock API Error',
      timestamp: new Date().toISOString()
    };
  }

  async getTopPools(params: { limit?: number; sortBy?: string; order?: string }): Promise<MockResponse> {
    await this.simulateDelay();
    
    const mockPools = [
      {
        id: 'pool-1',
        name: 'SOL-USDC',
        apy: 15.67,
        tvl: 1250000,
        volume24h: 890000,
        fees24h: 2890,
        tokens: ['SOL', 'USDC'],
        risk: 'medium'
      },
      {
        id: 'pool-2', 
        name: 'RAY-SOL',
        apy: 22.45,
        tvl: 890000,
        volume24h: 560000,
        fees24h: 1950,
        tokens: ['RAY', 'SOL'],
        risk: 'high'
      },
      {
        id: 'pool-3',
        name: 'USDC-USDT',
        apy: 8.12,
        tvl: 2100000,
        volume24h: 1200000,
        fees24h: 890,
        tokens: ['USDC', 'USDT'],
        risk: 'low'
      }
    ];

    // Apply sorting
    let pools = [...mockPools];
    if (params.sortBy === 'apy') {
      pools.sort((a, b) => params.order === 'desc' ? b.apy - a.apy : a.apy - b.apy);
    } else if (params.sortBy === 'tvl') {
      pools.sort((a, b) => params.order === 'desc' ? b.tvl - a.tvl : a.tvl - b.tvl);
    }

    // Apply limit
    if (params.limit) {
      pools = pools.slice(0, params.limit);
    }

    return this.createResponse(pools);
  }

  async getPoolAnalytics(poolId: string): Promise<MockResponse> {
    await this.simulateDelay();

    const mockAnalytics = {
      id: poolId,
      performance: {
        apy: 15.67,
        fees24h: 2890,
        volume24h: 890000,
        priceChange24h: 2.45
      },
      metrics: {
        tvl: 1250000,
        utilization: 78.5,
        liquidity: 980000,
        impermanentLoss: -1.2
      },
      history: Array.from({ length: 30 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        apy: 15.67 + (Math.random() - 0.5) * 5,
        tvl: 1250000 + (Math.random() - 0.5) * 200000,
        volume: 890000 + (Math.random() - 0.5) * 300000
      })).reverse()
    };

    return this.createResponse(mockAnalytics);
  }

  async getPortfolioData(walletAddress: string): Promise<MockResponse> {
    await this.simulateDelay();

    const mockPortfolio = {
      totalValue: 15420.50,
      totalGain: 1240.30,
      totalGainPercent: 8.75,
      positions: [
        {
          poolId: 'sol-usdc-pool',
          name: 'SOL-USDC LP',
          amount: 150.75,
          value: 8920.40,
          apy: 15.67,
          gain: 720.30,
          gainPercent: 8.78
        },
        {
          poolId: 'ray-sol-pool', 
          name: 'RAY-SOL LP',
          amount: 89.25,
          value: 4200.80,
          apy: 22.45,
          gain: 380.50,
          gainPercent: 9.95
        },
        {
          poolId: 'usdc-usdt-pool',
          name: 'USDC-USDT LP', 
          amount: 220.50,
          value: 2299.30,
          apy: 8.12,
          gain: 139.50,
          gainPercent: 6.47
        }
      ]
    };

    return this.createResponse(mockPortfolio);
  }

  async handleRequest(url: string, options?: RequestInit): Promise<MockResponse> {
    console.log('🎭 Mock API Server handling request:', url);
    
    try {
      const urlObj = new URL(url, 'http://localhost');
      const path = urlObj.pathname;
      const params = Object.fromEntries(urlObj.searchParams);

      if (path.includes('/pools/top')) {
        return await this.getTopPools(params);
      }
      
      if (path.includes('/pools/') && path.includes('/analytics')) {
        const poolId = path.split('/pools/')[1].split('/analytics')[0];
        return await this.getPoolAnalytics(poolId);
      }
      
      if (path.includes('/portfolio')) {
        const walletAddress = params.wallet || 'demo-wallet';
        return await this.getPortfolioData(walletAddress);
      }

      // Generic success response for unknown endpoints
      return this.createResponse({
        message: 'Mock API response',
        path,
        params
      });

    } catch (error) {
      console.error('Mock API Server error:', error);
      return this.createResponse(null, false);
    }
  }
}

// Create global fetch interceptor for localhost:3001 requests
export const interceptLocalhostRequests = () => {
  if (typeof window === 'undefined') return;

  const mockServer = MockAPIServer.getInstance();
  const originalFetch = window.fetch;

  window.fetch = async (url: string | Request, options?: RequestInit): Promise<Response> => {
    const urlString = typeof url === 'string' ? url : url.url;
    
    // Intercept localhost:3001 requests
    if (urlString.includes('localhost:3001') || urlString.includes('127.0.0.1:3001')) {
      console.log('🔄 Intercepting localhost request, using mock API:', urlString);
      
      try {
        const mockResponse = await mockServer.handleRequest(urlString, options);
        
        return new Response(JSON.stringify(mockResponse), {
          status: mockResponse.success ? 200 : 500,
          statusText: mockResponse.success ? 'OK' : 'Internal Server Error',
          headers: {
            'Content-Type': 'application/json',
            'X-Mock-API': 'true'
          }
        });
      } catch (error) {
        console.error('Mock API interceptor error:', error);
        // Return error response
        return new Response(JSON.stringify({
          success: false,
          error: 'Mock API error',
          data: null
        }), {
          status: 500,
          statusText: 'Internal Server Error',
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // For non-localhost requests, use original fetch
    return originalFetch(url, options);
  };

  console.log('✅ Mock API interceptor installed for localhost:3001 requests');
};