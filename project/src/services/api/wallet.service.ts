import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js';
import { 
  WalletService, 
  WalletBalance, 
  TokenBalance, 
  TokenMetadata, 
  TokenPrice,
  KNOWN_TOKENS 
} from '../types/wallet.types';
import { HttpClient } from '../types/api.types';
import { RaydiumError, handleApiError } from '../../utils/errors';

export class SolanaWalletService implements WalletService {
  constructor(
    private connection: Connection,
    private httpClient?: HttpClient
  ) {}

  async getWalletBalances(publicKey: PublicKey): Promise<WalletBalance> {
    try {
      // Get SOL balance
      const solBalance = await this.connection.getBalance(publicKey);
      const solBalanceFormatted = solBalance / 1e9; // Convert lamports to SOL

      // Get token accounts
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      // Process token balances
      const tokenBalances: TokenBalance[] = [];
      
      for (const account of tokenAccounts.value) {
        const parsedData = account.account.data as ParsedAccountData;
        const tokenInfo = parsedData.parsed.info;
        
        if (tokenInfo.tokenAmount.uiAmount > 0) {
          const mint = tokenInfo.mint;
          const knownToken = KNOWN_TOKENS[mint];
          
          const tokenBalance: TokenBalance = {
            mint,
            symbol: knownToken?.symbol || 'UNKNOWN',
            name: knownToken?.name || 'Unknown Token',
            balance: parseInt(tokenInfo.tokenAmount.amount),
            decimals: tokenInfo.tokenAmount.decimals,
            uiAmount: tokenInfo.tokenAmount.uiAmount,
            logoUri: knownToken?.logoUri,
          };
          
          tokenBalances.push(tokenBalance);
        }
      }

      // Get token prices to calculate USD values
      const prices = await this.getTokenPrices([
        'So11111111111111111111111111111111111111112', // SOL
        ...tokenBalances.map(t => t.mint)
      ]);

      // Calculate USD values
      const solPrice = prices.find(p => p.mint === 'So11111111111111111111111111111111111111112')?.price || 0;
      const solValue = solBalanceFormatted * solPrice;

      const tokenBalancesWithValues = tokenBalances.map(token => {
        const price = prices.find(p => p.mint === token.mint)?.price || 0;
        return {
          ...token,
          value: token.uiAmount * price,
        };
      });

      const totalValue = solValue + tokenBalancesWithValues.reduce((sum, token) => sum + (token.value || 0), 0);

      return {
        solBalance: solBalanceFormatted,
        tokenBalances: tokenBalancesWithValues,
        totalValue,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to get wallet balances:', error);
      throw new RaydiumError('Failed to fetch wallet balances', { publicKey: publicKey.toString(), error });
    }
  }

  async getTokenMetadata(mints: string[]): Promise<TokenMetadata[]> {
    try {
      // For now, use known tokens. In production, you'd query a token registry
      return mints.map(mint => {
        const knownToken = KNOWN_TOKENS[mint];
        if (knownToken) {
          return {
            mint,
            symbol: knownToken.symbol,
            name: knownToken.name,
            decimals: knownToken.decimals,
            logoUri: knownToken.logoUri,
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
    } catch (error) {
      console.error('Failed to get token metadata:', error);
      throw new RaydiumError('Failed to fetch token metadata', { mints, error });
    }
  }

  async getTokenPrices(mints: string[]): Promise<TokenPrice[]> {
    try {
      // Mock prices for development - in production, use real price API
      const mockPrices: Record<string, TokenPrice> = {
        'So11111111111111111111111111111111111111112': {
          mint: 'So11111111111111111111111111111111111111112',
          price: 98.45,
          change24h: 5.2,
          marketCap: 42000000000,
          volume24h: 1500000000,
        },
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
          mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          price: 1.0,
          change24h: 0.01,
          marketCap: 25000000000,
          volume24h: 2000000000,
        },
        '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': {
          mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
          price: 2.34,
          change24h: -1.8,
          marketCap: 234000000,
          volume24h: 15000000,
        },
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {
          mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
          price: 1.0,
          change24h: -0.02,
          marketCap: 24000000000,
          volume24h: 1800000000,
        },
        'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': {
          mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
          price: 105.67,
          change24h: 4.8,
          marketCap: 450000000,
          volume24h: 25000000,
        },
      };

      return mints.map(mint => mockPrices[mint] || {
        mint,
        price: 0,
        change24h: 0,
      });
    } catch (error) {
      console.error('Failed to get token prices:', error);
      throw new RaydiumError('Failed to fetch token prices', { mints, error });
    }
  }

  subscribeToBalanceUpdates(publicKey: PublicKey, callback: (balance: WalletBalance) => void): () => void {
    let isSubscribed = true;
    
    const updateBalances = async () => {
      if (!isSubscribed) return;
      
      try {
        const balance = await this.getWalletBalances(publicKey);
        callback(balance);
      } catch (error) {
        console.error('Failed to update balances:', error);
      }
    };

    // Initial load
    updateBalances();

    // Set up periodic updates (every 30 seconds)
    const interval = setInterval(updateBalances, 30000);

    // Subscribe to account changes for real-time updates
    const subscriptionId = this.connection.onAccountChange(
      publicKey,
      () => {
        // Debounce updates
        setTimeout(updateBalances, 1000);
      },
      'confirmed'
    );

    // Return cleanup function
    return () => {
      isSubscribed = false;
      clearInterval(interval);
      this.connection.removeAccountChangeListener(subscriptionId);
    };
  }
}

// HTTP-based wallet service for when we need to query external APIs
export class HttpWalletService implements WalletService {
  constructor(
    private baseUrl: string,
    private httpClient: HttpClient
  ) {}

  async getWalletBalances(publicKey: PublicKey): Promise<WalletBalance> {
    try {
      const response = await this.httpClient.get<WalletBalance>(
        `${this.baseUrl}/wallet/${publicKey.toString()}/balances`
      );
      return response;
    } catch (error) {
      handleApiError(error);
    }
  }

  async getTokenMetadata(mints: string[]): Promise<TokenMetadata[]> {
    try {
      const response = await this.httpClient.post<TokenMetadata[]>(
        `${this.baseUrl}/tokens/metadata`,
        { mints }
      );
      return response;
    } catch (error) {
      handleApiError(error);
    }
  }

  async getTokenPrices(mints: string[]): Promise<TokenPrice[]> {
    try {
      const response = await this.httpClient.post<TokenPrice[]>(
        `${this.baseUrl}/tokens/prices`,
        { mints }
      );
      return response;
    } catch (error) {
      handleApiError(error);
    }
  }

  subscribeToBalanceUpdates(publicKey: PublicKey, callback: (balance: WalletBalance) => void): () => void {
    // For HTTP service, we'll just poll periodically
    let isSubscribed = true;
    
    const updateBalances = async () => {
      if (!isSubscribed) return;
      
      try {
        const balance = await this.getWalletBalances(publicKey);
        callback(balance);
      } catch (error) {
        console.error('Failed to update balances:', error);
      }
    };

    // Initial load
    updateBalances();

    // Poll every 60 seconds
    const interval = setInterval(updateBalances, 60000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }
}