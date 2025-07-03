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
import { RPCFallbackService } from '../rpc-fallback.service';
import { MockWalletService } from '../mock-wallet.service';
import { PRODUCTION_CONFIG, isProductionMode } from '../../config/production';
import { errorLogger, logRPCError, logWalletError } from '../error-logger.service';

export type WalletMode = 'real' | 'error' | 'demo';

export class SolanaWalletService implements WalletService {
  private rpcFallback: RPCFallbackService;
  private mockService: MockWalletService;
  private walletMode: WalletMode = 'real'; // Production mode: only real blockchain data

  constructor(
    private connection: Connection,
    private httpClient?: HttpClient
  ) {
    this.rpcFallback = RPCFallbackService.getInstance();
    this.mockService = new MockWalletService();
    
    // Force production mode if configured
    if (isProductionMode()) {
      this.walletMode = 'real';
      console.log('🏭 Production mode detected - wallet service configured for real data only');
    }
  }

  private async retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 3, delay: number = 2000): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if it's a rate limit (403) or auth error (401)
        const errorMessage = lastError.message.toLowerCase();
        if (errorMessage.includes('403') || errorMessage.includes('forbidden') || 
            errorMessage.includes('rate limit') || errorMessage.includes('401') || 
            errorMessage.includes('unauthorized')) {
          console.warn(`⚠️ RPC error (${errorMessage}) (attempt ${attempt}/${maxRetries}). Waiting ${delay * attempt}ms...`);
          
          if (attempt === maxRetries) {
            throw new RaydiumError('RPC endpoint error. The endpoint may require authentication or be rate limited. Please try again later.', {
              originalError: lastError,
              endpoint: this.connection?.rpcEndpoint
            });
          }
          
          // Exponential backoff for RPC errors
          await new Promise(resolve => setTimeout(resolve, delay * attempt * 2));
        } else {
          if (attempt === maxRetries) {
            throw lastError;
          }
          
          // Normal retry delay
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }
    
    throw lastError!;
  }

  async getWalletBalances(publicKey: PublicKey): Promise<WalletBalance> {
    console.log('🔍 Fetching wallet balances for:', publicKey.toString());
    console.log('🔧 Wallet mode:', this.walletMode);
    
    // Production mode: only real blockchain data, no mock fallbacks
    console.log('🏭 Production mode: using only real blockchain data');
    
    try {
      // Get SOL balance using fallback service
      let solBalance: number;
      let solBalanceFormatted: number;
      
      try {
        console.log('📡 Fetching SOL balance with fallback...');
        solBalance = await this.rpcFallback.getWalletBalance(publicKey);
        solBalanceFormatted = solBalance / 1e9; // Convert lamports to SOL
        console.log('💰 SOL balance:', solBalanceFormatted, 'SOL');
      } catch (solError) {
        console.error('❌ Failed to fetch SOL balance with all endpoints:', solError);
        
        // Log the RPC error for monitoring
        logRPCError(
          this.connection?.rpcEndpoint || 'unknown',
          solError,
          { 
            walletAddress: publicKey.toString(),
            operation: 'getWalletBalance'
          }
        );
        
        // Production mode: always throw real errors, never use mock data
        throw new RaydiumError(
          'Não foi possível conectar aos servidores da Solana. Todos os endpoints RPC estão indisponíveis ou com limite de taxa.', 
          {
            originalError: solError,
            suggestion: 'Configure um provedor RPC pago para produção (Helius, QuickNode, Alchemy) ou tente novamente mais tarde'
          }
        );
      }

      // Get token accounts using fallback service
      let tokenAccounts;
      let token2022Accounts;
      
      try {
        console.log('🪙 Fetching SPL token accounts with fallback...');
        tokenAccounts = await this.rpcFallback.getTokenAccounts(
          publicKey,
          new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
        );
        console.log('📊 Found', tokenAccounts.value.length, 'SPL token accounts');
      } catch (tokenError) {
        console.error('❌ Failed to fetch SPL token accounts with all endpoints:', tokenError);
        
        // Log the RPC error for monitoring
        logRPCError(
          this.connection?.rpcEndpoint || 'unknown',
          tokenError,
          { 
            walletAddress: publicKey.toString(),
            operation: 'getTokenAccounts_SPL'
          }
        );
        
        // Production mode: always throw real errors for token accounts too
        throw new RaydiumError(
          'Não foi possível buscar as contas de tokens SPL. Servidores RPC indisponíveis.', 
          {
            originalError: tokenError,
            suggestion: 'Configure um provedor RPC confiável para produção ou tente novamente mais tarde'
          }
        );
      }

      // Also check for Token-2022 program accounts
      try {
        console.log('🪙 Fetching Token-2022 accounts with fallback...');
        token2022Accounts = await this.rpcFallback.getTokenAccounts(
          publicKey,
          new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
        );
        console.log('📊 Found', token2022Accounts.value.length, 'Token-2022 accounts');
      } catch (token2022Error) {
        console.warn('⚠️ Failed to fetch Token-2022 accounts with all endpoints, using empty array:', token2022Error);
        
        // Log the RPC warning for monitoring
        errorLogger.logWarning({
          category: 'RPC_ERROR',
          message: 'Failed to fetch Token-2022 accounts, using empty array',
          details: token2022Error,
          context: {
            walletAddress: publicKey.toString(),
            rpcEndpoint: this.connection?.rpcEndpoint,
            operation: 'getTokenAccounts_Token2022'
          },
          component: 'WalletService'
        });
        
        token2022Accounts = { value: [] };
      }

      // Combine all token accounts
      const allTokenAccounts = [
        ...tokenAccounts.value,
        ...token2022Accounts.value
      ];
      
      console.log('📊 Total token accounts (combined):', allTokenAccounts.length);

      // Process token balances with safety checks
      const tokenBalances: TokenBalance[] = [];
      
      console.log('🔍 Processing', allTokenAccounts.length, 'token accounts...');
      
      for (let i = 0; i < allTokenAccounts.length; i++) {
        const account = allTokenAccounts[i];
        try {
          console.log(`📄 Account ${i + 1}:`, {
            pubkey: account.pubkey.toString(),
            owner: account.account.owner.toString(),
            lamports: account.account.lamports
          });

          const parsedData = account.account.data as ParsedAccountData;
          const tokenInfo = parsedData?.parsed?.info;
          
          console.log(`🪙 Token info for account ${i + 1}:`, {
            mint: tokenInfo?.mint,
            tokenAmount: tokenInfo?.tokenAmount,
            state: tokenInfo?.state,
            owner: tokenInfo?.owner
          });

          // Include tokens with actual balance (exclude 0 balance accounts)
          if (tokenInfo?.mint && tokenInfo?.tokenAmount && (parseFloat(tokenInfo.tokenAmount.amount || '0') > 0)) {
            const mint = tokenInfo.mint;
            const knownToken = KNOWN_TOKENS[mint];
            const uiAmount = tokenInfo.tokenAmount.uiAmount || 0;
            
            const tokenBalance: TokenBalance = {
              mint,
              symbol: knownToken?.symbol || `TOKEN_${mint.slice(0, 8)}`,
              name: knownToken?.name || `Unknown Token (${mint.slice(0, 8)})`,
              balance: parseInt(tokenInfo.tokenAmount.amount || '0'),
              decimals: tokenInfo.tokenAmount.decimals || 0,
              uiAmount,
              logoUri: knownToken?.logoUri,
            };
            
            console.log(`✅ Added token ${i + 1}:`, {
              symbol: tokenBalance.symbol,
              uiAmount: tokenBalance.uiAmount,
              rawAmount: tokenBalance.balance,
              decimals: tokenBalance.decimals,
              mint: mint.slice(0, 8) + '...'
            });
            
            tokenBalances.push(tokenBalance);
          } else {
            console.log(`❌ Skipped account ${i + 1}: missing mint or tokenAmount`);
          }
        } catch (parseError) {
          console.warn(`⚠️ Failed to parse token account ${i + 1}:`, parseError);
          continue;
        }
      }

      console.log('📊 Total tokens found:', tokenBalances.length);

      // Get token prices with error handling
      let prices;
      try {
        prices = await this.getTokenPrices([
          'So11111111111111111111111111111111111111112', // SOL
          ...tokenBalances.map(t => t.mint)
        ]);
      } catch (priceError) {
        console.warn('Failed to fetch prices, using defaults:', priceError);
        
        // Log price fetch warning
        errorLogger.logWarning({
          category: 'API_ERROR',
          message: 'Failed to fetch token prices, using fallback values',
          details: priceError,
          context: {
            walletAddress: publicKey.toString(),
            operation: 'getTokenPrices'
          },
          component: 'WalletService'
        });
        
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
      console.log('  - Token details:', tokenBalancesWithValues.map(t => `${t.symbol}: ${t.uiAmount} ($${(t.value || 0).toFixed(2)})`));
      console.log('  - Total Value: $' + totalValue.toFixed(2));

      return {
        solBalance: solBalanceFormatted,
        tokenBalances: tokenBalancesWithValues,
        totalValue,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to get wallet balances:', error);
      
      // Log wallet error for monitoring
      logWalletError(
        'WalletService',
        error,
        {
          walletAddress: publicKey.toString(),
          rpcEndpoint: this.connection?.rpcEndpoint,
          operation: 'getWalletBalances'
        }
      );
      
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
          'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt': 'serum',
          'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'bonk',
          'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': 'jupiter-exchange-solana',
          'hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux': 'helium',
          'So11111111111111111111111111111111111111111': 'solana', // wSOL same as SOL
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
          'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt': 'serum',
          'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'bonk',
          'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': 'jupiter-exchange-solana',
          'hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux': 'helium',
          'So11111111111111111111111111111111111111111': 'solana', // wSOL same as SOL
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
      
      // Log price API error
      errorLogger.logWarning({
        category: 'API_ERROR',
        message: 'CoinGecko API failed, using fallback prices',
        details: error,
        context: {
          operation: 'getTokenPrices',
          mints: mints.slice(0, 5) // Log first 5 mints to avoid huge logs
        },
        component: 'WalletService'
      });
      
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
    if (this.walletMode === 'demo') {
      return this.mockService.subscribeToBalanceUpdates(publicKey, callback);
    }

    // Simplified implementation - just return a no-op cleanup function
    // Real-time subscriptions can cause performance issues and infinite loops
    console.log('Balance updates subscription disabled for performance');
    
    return () => {
      // No cleanup needed
    };
  }

  // Utility methods for debugging and control
  setWalletMode(mode: WalletMode): void {
    this.walletMode = mode;
    console.log(`🔧 Wallet mode changed to: ${mode}`);
    
    switch (mode) {
      case 'real':
        console.log('📡 Will attempt to use real RPC endpoints');
        break;
      case 'error':
        console.log('❌ Will show errors when RPC fails (no mock fallback)');
        break;
      case 'demo':
        console.log('🎭 Will use demonstration data when RPC fails');
        break;
    }
  }

  getWalletMode(): WalletMode {
    return this.walletMode;
  }

  // Legacy methods for backward compatibility
  enableMockFallback(): void {
    this.setWalletMode('demo');
  }

  disableMockFallback(): void {
    this.setWalletMode('error');
  }

  isMockMode(): boolean {
    return this.walletMode === 'demo';
  }

  getMockService(): MockWalletService {
    return this.mockService;
  }

  getRPCStatus(): any {
    return this.rpcFallback.getEndpointStatus();
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