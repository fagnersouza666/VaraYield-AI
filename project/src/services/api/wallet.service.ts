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

  private async retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 3, delay: number = 1000): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError!;
  }

  async getWalletBalances(publicKey: PublicKey): Promise<WalletBalance> {
    console.log('🔍 Fetching wallet balances for:', publicKey.toString());
    
    try {
      // Get SOL balance with retry logic
      let solBalance: number;
      let solBalanceFormatted: number;
      
      try {
        console.log('📡 Fetching SOL balance...');
        solBalance = await this.retryOperation(() => this.connection.getBalance(publicKey));
        solBalanceFormatted = solBalance / 1e9; // Convert lamports to SOL
        console.log('💰 SOL balance:', solBalanceFormatted, 'SOL');
      } catch (solError) {
        console.warn('⚠️ Failed to fetch SOL balance, using 0:', solError);
        solBalance = 0;
        solBalanceFormatted = 0;
      }

      // Get token accounts with proper error handling and retry
      let tokenAccounts;
      try {
        console.log('🪙 Fetching token accounts...');
        tokenAccounts = await this.retryOperation(() => 
          this.connection.getParsedTokenAccountsByOwner(
            publicKey,
            { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
          )
        );
        console.log('📊 Found', tokenAccounts.value.length, 'token accounts');
      } catch (tokenError) {
        console.warn('⚠️ Failed to fetch token accounts, using empty array:', tokenError);
        tokenAccounts = { value: [] };
      }

      // Process token balances with safety checks
      const tokenBalances: TokenBalance[] = [];
      
      for (const account of tokenAccounts.value) {
        try {
          const parsedData = account.account.data as ParsedAccountData;
          const tokenInfo = parsedData?.parsed?.info;
          
          if (tokenInfo?.tokenAmount?.uiAmount && tokenInfo.tokenAmount.uiAmount > 0) {
            const mint = tokenInfo.mint;
            const knownToken = KNOWN_TOKENS[mint];
            
            const tokenBalance: TokenBalance = {
              mint,
              symbol: knownToken?.symbol || 'UNKNOWN',
              name: knownToken?.name || 'Unknown Token',
              balance: parseInt(tokenInfo.tokenAmount.amount || '0'),
              decimals: tokenInfo.tokenAmount.decimals || 0,
              uiAmount: tokenInfo.tokenAmount.uiAmount || 0,
              logoUri: knownToken?.logoUri,
            };
            
            tokenBalances.push(tokenBalance);
          }
        } catch (parseError) {
          console.warn('Failed to parse token account:', parseError);
          continue; // Skip this token and continue with others
        }
      }

      // Get token prices with error handling
      let prices;
      try {
        prices = await this.getTokenPrices([
          'So11111111111111111111111111111111111111112', // SOL
          ...tokenBalances.map(t => t.mint)
        ]);
      } catch (priceError) {
        console.warn('Failed to fetch prices, using defaults:', priceError);
        prices = [
          {
            mint: 'So11111111111111111111111111111111111111112',
            price: 98.45,
            change24h: 5.2,
          }
        ];
      }

      // Calculate USD values safely
      const solPrice = prices.find(p => p.mint === 'So11111111111111111111111111111111111111112')?.price || 98.45;
      const solValue = solBalanceFormatted * solPrice;

      const tokenBalancesWithValues = tokenBalances.map(token => {
        const price = prices.find(p => p.mint === token.mint)?.price || 0;
        return {
          ...token,
          value: token.uiAmount * price,
        };
      });

      const totalValue = solValue + tokenBalancesWithValues.reduce((sum, token) => sum + (token.value || 0), 0);

      console.log('💼 Final wallet summary:');
      console.log('  - SOL:', solBalanceFormatted, 'SOL ($' + solValue.toFixed(2) + ')');
      console.log('  - Tokens:', tokenBalancesWithValues.length);
      console.log('  - Total Value: $' + totalValue.toFixed(2));

      return {
        solBalance: solBalanceFormatted,
        tokenBalances: tokenBalancesWithValues,
        totalValue,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to get wallet balances:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to fetch wallet balances';
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Network connection failed. Please check your internet connection and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. The Solana network may be experiencing high load.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        }
      }
      
      throw new RaydiumError(errorMessage, { 
        publicKey: publicKey.toString(), 
        originalError: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
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
      console.log('💰 Fetching real prices for tokens:', mints);
      
      // Use CoinGecko API for real price data
      const solanaTokens = mints.map(mint => {
        // Map Solana mint addresses to CoinGecko IDs
        const tokenMap: Record<string, string> = {
          'So11111111111111111111111111111111111111112': 'solana',
          'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'usd-coin',
          '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 'raydium',
          'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'tether',
          'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'marinade-staked-sol',
        };
        return tokenMap[mint] || null;
      }).filter(Boolean);

      if (solanaTokens.length === 0) {
        return mints.map(mint => ({ mint, price: 0, change24h: 0 }));
      }

      // Fetch prices from CoinGecko (free tier, no API key needed)
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${solanaTokens.join(',')}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const priceData = await response.json();
      console.log('📈 Price data received:', priceData);

      // Map back to our format
      return mints.map(mint => {
        const tokenMap: Record<string, string> = {
          'So11111111111111111111111111111111111111112': 'solana',
          'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'usd-coin',
          '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 'raydium',
          'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'tether',
          'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'marinade-staked-sol',
        };
        
        const coinGeckoId = tokenMap[mint];
        const data = coinGeckoId ? priceData[coinGeckoId] : null;

        return {
          mint,
          price: data?.usd || 0,
          change24h: data?.usd_24h_change || 0,
          marketCap: data?.usd_market_cap,
          volume24h: data?.usd_24h_vol,
        };
      });
    } catch (error) {
      console.warn('Failed to fetch real prices, using fallback:', error);
      
      // Fallback to basic prices if API fails
      return mints.map(mint => {
        const fallbackPrices: Record<string, number> = {
          'So11111111111111111111111111111111111111112': 100, // Approximate SOL price
          'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 1, // USDC
          'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 1, // USDT
        };
        
        return {
          mint,
          price: fallbackPrices[mint] || 0,
          change24h: 0,
        };
      });
    }
  }

  subscribeToBalanceUpdates(publicKey: PublicKey, callback: (balance: WalletBalance) => void): () => void {
    // Simplified implementation - just return a no-op cleanup function
    // Real-time subscriptions can cause performance issues and infinite loops
    console.log('Balance updates subscription disabled for performance');
    
    return () => {
      // No cleanup needed
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