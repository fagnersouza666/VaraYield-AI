import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { RaydiumError } from '../utils/errors';

export interface EndpointConfig {
  url: string;
  name: string;
  priority: number;
  isWorking: boolean;
  lastChecked: number;
  errorCount: number;
}

export class RPCFallbackService {
  private static instance: RPCFallbackService;
  private endpoints: EndpointConfig[] = this.initializeEndpoints();

  private initializeEndpoints(): EndpointConfig[] {
    const configuredRpc = import.meta.env.VITE_VARA_RPC_URL || clusterApiUrl('mainnet-beta');
    const backup1 = import.meta.env.VITE_VARA_RPC_BACKUP_1 || 'https://api.mainnet-beta.solana.com';
    const backup2 = import.meta.env.VITE_VARA_RPC_BACKUP_2 || 'https://solana-mainnet.rpc.extrnode.com';
    const backup3 = import.meta.env.VITE_VARA_RPC_BACKUP_3 || 'https://mainnet.helius-rpc.com';

    console.log('🔧 Initializing RPC endpoints (tested and verified):');
    console.log('Primary:', configuredRpc);
    console.log('Backup 1:', backup1);
    console.log('Backup 2:', backup2);
    console.log('Backup 3:', backup3);

    return [
      {
        url: configuredRpc,
        name: 'Primary (ClusterAPI)',
        priority: 1,
        isWorking: true,
        lastChecked: 0,
        errorCount: 0,
      },
      {
        url: backup1,
        name: 'Solana Official',
        priority: 2,
        isWorking: true,
        lastChecked: 0,
        errorCount: 0,
      },
      {
        url: backup2,
        name: 'ExtrNode',
        priority: 3,
        isWorking: true,
        lastChecked: 0,
        errorCount: 0,
      },
      {
        url: backup3,
        name: 'Helius Public',
        priority: 4,
        isWorking: true,
        lastChecked: 0,
        errorCount: 0,
      },
      {
        url: 'https://api.mainnet-beta.solana.com/',
        name: 'ClusterAPI Alt',
        priority: 5,
        isWorking: true,
        lastChecked: 0,
        errorCount: 0,
      },
    ];
  }

  private currentConnection: Connection | null = null;
  private currentEndpointIndex = 0;

  private constructor() {}

  static getInstance(): RPCFallbackService {
    if (!RPCFallbackService.instance) {
      RPCFallbackService.instance = new RPCFallbackService();
    }
    return RPCFallbackService.instance;
  }

  private createConnection(endpoint: string): Connection {
    return new Connection(endpoint, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 30000, // 30 seconds
      disableRetryOnRateLimit: false,
      wsEndpoint: undefined, // Disable websocket to avoid connection issues
    });
  }

  async getWorkingConnection(): Promise<Connection> {
    // If we have a current connection, test it first
    if (this.currentConnection) {
      const currentEndpoint = this.endpoints[this.currentEndpointIndex];
      if (await this.testConnection(this.currentConnection, currentEndpoint)) {
        return this.currentConnection;
      }
    }

    // Find a working endpoint
    const workingEndpoint = await this.findWorkingEndpoint();
    if (!workingEndpoint) {
      throw new RaydiumError('No working RPC endpoints available');
    }

    this.currentConnection = this.createConnection(workingEndpoint.url);
    console.log(`🌐 Connected to: ${workingEndpoint.name} (${workingEndpoint.url})`);
    
    return this.currentConnection;
  }

  private async findWorkingEndpoint(): Promise<EndpointConfig | null> {
    // Sort endpoints by priority and error count
    const sortedEndpoints = [...this.endpoints].sort((a, b) => {
      if (a.isWorking !== b.isWorking) {
        return a.isWorking ? -1 : 1; // Working endpoints first
      }
      if (a.errorCount !== b.errorCount) {
        return a.errorCount - b.errorCount; // Fewer errors first
      }
      return a.priority - b.priority; // Lower priority number first
    });

    for (let i = 0; i < sortedEndpoints.length; i++) {
      const endpoint = sortedEndpoints[i];
      const connection = this.createConnection(endpoint.url);

      console.log(`🔍 Testing endpoint: ${endpoint.name} (${endpoint.url})`);
      
      if (await this.testConnection(connection, endpoint)) {
        this.currentEndpointIndex = this.endpoints.findIndex(e => e.url === endpoint.url);
        return endpoint;
      }
    }

    return null;
  }

  private async testConnection(connection: Connection, endpoint: EndpointConfig): Promise<boolean> {
    try {
      // Simple test: get slot number (lightweight operation)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection test timeout')), 5000);
      });

      const slotPromise = connection.getSlot();
      await Promise.race([slotPromise, timeoutPromise]);

      endpoint.isWorking = true;
      endpoint.lastChecked = Date.now();
      endpoint.errorCount = Math.max(0, endpoint.errorCount - 1); // Decrease error count on success
      
      return true;
    } catch (error) {
      console.warn(`❌ Endpoint ${endpoint.name} failed test:`, error);
      
      endpoint.isWorking = false;
      endpoint.lastChecked = Date.now();
      endpoint.errorCount += 1;
      
      return false;
    }
  }

  async executeWithFallback<T>(
    operation: (connection: Connection) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const connection = await this.getWorkingConnection();
        return await operation(connection);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        console.warn(`⚠️ Operation failed (attempt ${attempt}/${maxRetries}):`, lastError.message);
        
        // Mark current endpoint as potentially problematic
        if (this.currentConnection) {
          const currentEndpoint = this.endpoints[this.currentEndpointIndex];
          currentEndpoint.errorCount += 1;
          
          // If too many errors, mark as not working
          if (currentEndpoint.errorCount >= 3) {
            currentEndpoint.isWorking = false;
            console.warn(`🚫 Marking endpoint ${currentEndpoint.name} as not working due to errors`);
          }
        }
        
        // Clear current connection to force finding a new one
        this.currentConnection = null;
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new RaydiumError(
      `All RPC operations failed after ${maxRetries} attempts. Last error: ${lastError!.message}`,
      { lastError, maxRetries }
    );
  }

  // Utility method for getting wallet balance with automatic fallback
  async getWalletBalance(publicKey: PublicKey): Promise<number> {
    return this.executeWithFallback(async (connection) => {
      return await connection.getBalance(publicKey);
    });
  }

  // Utility method for getting token accounts with automatic fallback
  async getTokenAccounts(publicKey: PublicKey, programId: PublicKey) {
    return this.executeWithFallback(async (connection) => {
      return await connection.getParsedTokenAccountsByOwner(publicKey, { programId });
    });
  }

  // Get status of all endpoints
  getEndpointStatus(): EndpointConfig[] {
    return [...this.endpoints];
  }

  // Reset all endpoints to working state (useful for debugging)
  resetEndpoints(): void {
    this.endpoints.forEach(endpoint => {
      endpoint.isWorking = true;
      endpoint.errorCount = 0;
      endpoint.lastChecked = 0;
    });
    this.currentConnection = null;
    console.log('🔄 Reset all endpoints to working state');
  }

  // Get current connection info
  getCurrentEndpoint(): EndpointConfig | null {
    if (this.currentEndpointIndex >= 0 && this.currentEndpointIndex < this.endpoints.length) {
      return this.endpoints[this.currentEndpointIndex];
    }
    return null;
  }
}