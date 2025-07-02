import { PublicKey } from '@solana/web3.js';
import { 
  WalletService, 
  WalletBalance, 
  TokenBalance, 
  TokenMetadata, 
  TokenPrice,
  KNOWN_TOKENS 
} from './types/wallet.types';

/**
 * Mock Wallet Service for development when RPC endpoints are not available
 * This provides realistic mock data for portfolio demonstration
 */
export class MockWalletService implements WalletService {
  private mockTokens: TokenBalance[] = [
    {
      mint: 'So11111111111111111111111111111111111111112',
      symbol: 'SOL',
      name: 'Solana',
      balance: 2500000000, // 2.5 SOL in lamports
      decimals: 9,
      uiAmount: 2.5,
      value: 237.5, // 2.5 SOL * $95
      logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    },
    {
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 15000000000, // 15,000 USDC in micro USDC
      decimals: 6,
      uiAmount: 15000,
      value: 15000, // 1:1 with USD
      logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    },
    {
      mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      symbol: 'RAY',
      name: 'Raydium',
      balance: 850000000, // 850 RAY
      decimals: 6,
      uiAmount: 850,
      value: 1955, // 850 RAY * $2.30
      logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.svg',
    },
    {
      mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      symbol: 'USDT',
      name: 'Tether USD',
      balance: 5000000000, // 5,000 USDT
      decimals: 6,
      uiAmount: 5000,
      value: 5000,
      logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
    },
    {
      mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
      symbol: 'mSOL',
      name: 'Marinade staked SOL',
      balance: 1200000000, // 1.2 mSOL
      decimals: 9,
      uiAmount: 1.2,
      value: 125.4, // 1.2 mSOL * $104.50
      logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
    },
  ];

  async getWalletBalances(publicKey: PublicKey): Promise<WalletBalance> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('🎭 Using MOCK wallet service for:', publicKey.toString());
    console.log('💡 This is demonstration data - connect to mainnet for real balances');

    const solBalance = 2.5; // SOL balance
    const totalValue = this.mockTokens.reduce((sum, token) => sum + (token.value || 0), 0);

    return {
      solBalance,
      tokenBalances: this.mockTokens,
      totalValue,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getTokenMetadata(mints: string[]): Promise<TokenMetadata[]> {
    await new Promise(resolve => setTimeout(resolve, 200));

    return mints.map(mint => {
      const knownToken = KNOWN_TOKENS[mint];
      const mockToken = this.mockTokens.find(t => t.mint === mint);
      
      if (knownToken || mockToken) {
        return {
          mint,
          symbol: knownToken?.symbol || mockToken?.symbol || 'UNKNOWN',
          name: knownToken?.name || mockToken?.name || 'Unknown Token',
          decimals: knownToken?.decimals || mockToken?.decimals || 6,
          logoUri: knownToken?.logoUri || mockToken?.logoUri,
          verified: true,
        };
      }
      
      return {
        mint,
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        decimals: 6,
        verified: false,
      };
    });
  }

  async getTokenPrices(mints: string[]): Promise<TokenPrice[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockPrices: Record<string, { price: number; change24h: number }> = {
      'So11111111111111111111111111111111111111112': { price: 95.0, change24h: 5.2 },
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { price: 1.0, change24h: 0.01 },
      '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': { price: 2.30, change24h: -1.8 },
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { price: 1.0, change24h: 0.02 },
      'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': { price: 104.50, change24h: 4.8 },
    };

    return mints.map(mint => ({
      mint,
      price: mockPrices[mint]?.price || 0,
      change24h: mockPrices[mint]?.change24h || 0,
    }));
  }

  subscribeToBalanceUpdates(publicKey: PublicKey, callback: (balance: WalletBalance) => void): () => void {
    console.log('🎭 Mock wallet subscription started');
    
    // Simulate periodic updates
    const interval = setInterval(async () => {
      try {
        const balance = await this.getWalletBalances(publicKey);
        // Add some random variation to demonstrate updates
        const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
        balance.totalValue *= (1 + variation);
        callback(balance);
      } catch (error) {
        console.error('Mock subscription error:', error);
      }
    }, 30000); // Update every 30 seconds

    return () => {
      console.log('🎭 Mock wallet subscription stopped');
      clearInterval(interval);
    };
  }

  // Utility method to check if this is a mock service
  isMockService(): boolean {
    return true;
  }

  // Method to get all available mock tokens
  getMockTokens(): TokenBalance[] {
    return [...this.mockTokens];
  }

  // Method to add custom mock token for testing
  addMockToken(token: TokenBalance): void {
    this.mockTokens.push(token);
  }

  // Method to update mock token balance
  updateMockToken(mint: string, updates: Partial<TokenBalance>): void {
    const tokenIndex = this.mockTokens.findIndex(t => t.mint === mint);
    if (tokenIndex >= 0) {
      this.mockTokens[tokenIndex] = { ...this.mockTokens[tokenIndex], ...updates };
    }
  }
}