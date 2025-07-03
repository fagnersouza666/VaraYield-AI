import { Connection } from '@solana/web3.js';

interface EndpointMetrics {
  endpoint: string;
  latency: number;
  successRate: number;
  errorCount: number;
  lastHealthCheck: number;
  consecutiveFailures: number;
  priority: number;
}

export class RPCManager {
  private static instance: RPCManager;
  private endpoints: EndpointMetrics[] = [
    {
      endpoint: 'https://api.mainnet-beta.solana.com',
      latency: 0,
      successRate: 100,
      errorCount: 0,
      lastHealthCheck: 0,
      consecutiveFailures: 0,
      priority: 1
    },
    {
      endpoint: 'https://rpc.ankr.com/solana',
      latency: 0,
      successRate: 100,
      errorCount: 0,
      lastHealthCheck: 0,
      consecutiveFailures: 0,
      priority: 2
    },
    {
      endpoint: 'https://solana-api.projectserum.com',
      latency: 0,
      successRate: 100,
      errorCount: 0,
      lastHealthCheck: 0,
      consecutiveFailures: 0,
      priority: 3
    },
    {
      endpoint: 'https://ssc-dao.genesysgo.net',
      latency: 0,
      successRate: 100,
      errorCount: 0,
      lastHealthCheck: 0,
      consecutiveFailures: 0,
      priority: 4
    }
  ];
  private currentEndpointIndex = 0;
  private currentConnection: Connection | null = null;
  private connectionPool: Map<string, Connection> = new Map();
  private maxRetries = 3;
  private healthCheckInterval = 30000; // 30s

  private constructor() {}

  static getInstance(): RPCManager {
    if (!RPCManager.instance) {
      RPCManager.instance = new RPCManager();
    }
    return RPCManager.instance;
  }

  getCurrentConnection(): Connection {
    const bestEndpoint = this.getBestEndpoint();
    
    if (!this.connectionPool.has(bestEndpoint.endpoint)) {
      const connection = new Connection(bestEndpoint.endpoint, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000,
        wsEndpoint: bestEndpoint.endpoint.replace('https://', 'wss://').replace('http://', 'ws://'),
      });
      this.connectionPool.set(bestEndpoint.endpoint, connection);
      console.log('🌐 Created connection for endpoint:', bestEndpoint.endpoint);
    }
    
    return this.connectionPool.get(bestEndpoint.endpoint)!;
  }

  private getBestEndpoint(): EndpointMetrics {
    // Filtra endpoints saudáveis (menos de 5 falhas consecutivas)
    const healthyEndpoints = this.endpoints.filter(ep => ep.consecutiveFailures < 5);
    
    if (healthyEndpoints.length === 0) {
      // Se todos falharam, reseta contadores e usa o primeiro
      this.endpoints.forEach(ep => ep.consecutiveFailures = 0);
      return this.endpoints[0];
    }
    
    // Ordena por prioridade, depois por latência
    return healthyEndpoints.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.latency - b.latency;
    })[0];
  }

  async executeWithRetry<T>(operation: (connection: Connection) => Promise<T>): Promise<T> {
    const startTime = Date.now();
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const connection = this.getCurrentConnection();
        const result = await operation(connection);
        
        // Sucesso - atualiza métricas positivas
        this.updateEndpointMetrics(true, Date.now() - startTime);
        return result;
        
      } catch (error) {
        lastError = error as Error;
        console.warn(`❌ RPC attempt ${attempt + 1} failed:`, error);
        
        // Atualiza métricas negativas
        this.updateEndpointMetrics(false, Date.now() - startTime);
        
        if (attempt < this.maxRetries - 1) {
          // Aguarda antes de tentar novamente (exponential backoff)
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }
    
    throw new Error(`All ${this.maxRetries} RPC attempts failed. Last error: ${lastError?.message}`);
  }

  private updateEndpointMetrics(success: boolean, latency: number): void {
    const currentEndpoint = this.getBestEndpoint();
    const endpoint = this.endpoints.find(ep => ep.endpoint === currentEndpoint.endpoint);
    
    if (!endpoint) return;
    
    if (success) {
      endpoint.consecutiveFailures = 0;
      endpoint.latency = (endpoint.latency + latency) / 2; // média móvel simples
      endpoint.successRate = Math.min(100, endpoint.successRate + 1);
    } else {
      endpoint.consecutiveFailures++;
      endpoint.errorCount++;
      endpoint.successRate = Math.max(0, endpoint.successRate - 5);
    }
    
    endpoint.lastHealthCheck = Date.now();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getCurrentEndpoint(): string {
    return this.getBestEndpoint().endpoint;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.executeWithRetry(async (connection) => {
        await connection.getSlot();
      });
      return true;
    } catch (error) {
      console.warn('❌ All RPC endpoints failed health check:', error);
      return false;
    }
  }

  getEndpointMetrics(): EndpointMetrics[] {
    return [...this.endpoints];
  }

  // Método para monitoramento contínuo da saúde dos endpoints
  startHealthMonitoring(): void {
    setInterval(async () => {
      for (const endpoint of this.endpoints) {
        try {
          const connection = this.connectionPool.get(endpoint.endpoint) || 
            new Connection(endpoint.endpoint, { commitment: 'confirmed' });
          
          const startTime = Date.now();
          await connection.getSlot();
          
          endpoint.latency = Date.now() - startTime;
          endpoint.consecutiveFailures = 0;
          endpoint.lastHealthCheck = Date.now();
        } catch (error) {
          endpoint.consecutiveFailures++;
          endpoint.errorCount++;
        }
      }
    }, this.healthCheckInterval);
  }
}