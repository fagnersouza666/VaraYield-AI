import { Connection } from '@solana/web3.js';

export class RPCManager {
  private static instance: RPCManager;
  private endpoints: string[] = [
    'https://rpc.ankr.com/solana',
    'https://solana-api.projectserum.com',
    'https://ssc-dao.genesysgo.net',
  ];
  private currentEndpointIndex = 0;
  private currentConnection: Connection | null = null;

  private constructor() {}

  static getInstance(): RPCManager {
    if (!RPCManager.instance) {
      RPCManager.instance = new RPCManager();
    }
    return RPCManager.instance;
  }

  getCurrentConnection(): Connection {
    if (!this.currentConnection) {
      this.currentConnection = new Connection(this.endpoints[this.currentEndpointIndex], {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000,
      });
      console.log('🌐 Using RPC endpoint:', this.endpoints[this.currentEndpointIndex]);
    }
    return this.currentConnection;
  }

  async switchToNextEndpoint(): Promise<Connection> {
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % this.endpoints.length;
    this.currentConnection = new Connection(this.endpoints[this.currentEndpointIndex], {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
    });
    
    console.log('🔄 Switched to RPC endpoint:', this.endpoints[this.currentEndpointIndex]);
    return this.currentConnection;
  }

  getCurrentEndpoint(): string {
    return this.endpoints[this.currentEndpointIndex];
  }

  async testConnection(): Promise<boolean> {
    try {
      const connection = this.getCurrentConnection();
      await connection.getSlot();
      return true;
    } catch (error) {
      console.warn('❌ RPC endpoint test failed:', error);
      return false;
    }
  }

  async findWorkingEndpoint(): Promise<Connection> {
    const maxAttempts = this.endpoints.length;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const isWorking = await this.testConnection();
      if (isWorking) {
        return this.getCurrentConnection();
      }
      
      if (attempt < maxAttempts - 1) {
        await this.switchToNextEndpoint();
      }
    }
    
    throw new Error('No working RPC endpoints available');
  }
}