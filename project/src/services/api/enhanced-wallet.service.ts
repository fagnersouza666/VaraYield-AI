import { Connection, PublicKey, GetProgramAccountsFilter, ParsedAccountData, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { 
  WalletService, 
  WalletBalance, 
  TokenBalance, 
  TokenMetadata, 
  TokenPrice,
  KNOWN_TOKENS 
} from '../types/wallet.types';
import { RaydiumError } from '../../utils/errors';
import { RPCFallbackService } from '../rpc-fallback.service';

export interface EnhancedTokenBalance extends TokenBalance {
  isToken2022?: boolean;
  programId?: string;
}

export class EnhancedSolanaWalletService implements WalletService {
  private rpcFallback: RPCFallbackService;

  constructor(private connection: Connection) {
    this.rpcFallback = RPCFallbackService.getInstance();
  }

  async getWalletBalances(publicKey: PublicKey): Promise<WalletBalance> {
    console.log('🔍 Enhanced wallet service - Fetching balances for:', publicKey.toString());
    
    try {
      // Get SOL balance using fallback
      const solBalance = await this.getSolBalance(publicKey);
      
      // Get all token accounts using the optimized method
      const tokenBalances = await this.getAllTokenAccounts(publicKey);
      
      // Get token prices
      const prices = await this.getTokenPrices([
        'So11111111111111111111111111111111111111112', // SOL
        ...tokenBalances.map(t => t.mint)
      ]);

      // Calculate values
      const solPrice = prices.find(p => p.mint === 'So11111111111111111111111111111111111111112')?.price || 0;
      const solValue = solBalance * solPrice;

      const tokenBalancesWithValues = tokenBalances.map(token => {
        const price = prices.find(p => p.mint === token.mint)?.price || 0;
        return {
          ...token,
          value: token.uiAmount * price,
        };
      });

      const totalValue = solValue + tokenBalancesWithValues.reduce((sum, token) => sum + (token.value || 0), 0);

      console.log('✅ Enhanced wallet service - Total portfolio value:', totalValue);

      return {
        walletAddress: publicKey.toString(),
        solBalance,
        solValue,
        tokenBalances: tokenBalancesWithValues,
        totalValue,
        lastUpdated: new Date().toISOString(),
      };

    } catch (error) {
      console.error('❌ Enhanced wallet service failed:', error);
      throw new RaydiumError(
        'Failed to fetch wallet data from Solana mainnet',
        { originalError: error }
      );
    }
  }

  private async getSolBalance(publicKey: PublicKey): Promise<number> {
    const balanceInLamports = await this.rpcFallback.executeWithFallback(
      async (connection) => connection.getBalance(publicKey)
    );
    return balanceInLamports / LAMPORTS_PER_SOL;
  }

  /**
   * Get all token accounts using the most efficient method from Solana best practices
   * Uses getParsedProgramAccounts with filters for optimal performance
   */
  private async getAllTokenAccounts(publicKey: PublicKey): Promise<EnhancedTokenBalance[]> {
    console.log('🪙 Fetching all token accounts using optimized method...');
    
    const walletString = publicKey.toString();
    
    // Filters for token accounts owned by this wallet
    const filters: GetProgramAccountsFilter[] = [
      {
        dataSize: 165, // Size of token account (bytes)
      },
      {
        memcmp: {
          offset: 32, // Location of owner field in token account
          bytes: walletString, // Owner address (wallet)
        },
      }
    ];

    const allTokenBalances: EnhancedTokenBalance[] = [];

    try {
      // Get SPL Token accounts (original token program)
      console.log('📡 Fetching SPL Token accounts...');
      const splTokenAccounts = await this.rpcFallback.executeWithFallback(
        async (connection) => connection.getParsedProgramAccounts(
          TOKEN_PROGRAM_ID,
          { filters }
        )
      );
      
      console.log('📊 Found', splTokenAccounts.length, 'SPL token accounts');
      
      // Process SPL token accounts
      for (const account of splTokenAccounts) {
        const tokenBalance = this.parseTokenAccount(account, false);
        if (tokenBalance) {
          allTokenBalances.push(tokenBalance);
        }
      }

    } catch (error) {
      console.warn('⚠️ Failed to fetch SPL token accounts:', error);
    }

    try {
      // Get Token-2022 accounts (new token program)
      console.log('📡 Fetching Token-2022 accounts...');
      const token2022Accounts = await this.rpcFallback.executeWithFallback(
        async (connection) => connection.getParsedProgramAccounts(
          TOKEN_2022_PROGRAM_ID,
          { filters }
        )
      );
      
      console.log('📊 Found', token2022Accounts.length, 'Token-2022 accounts');
      
      // Process Token-2022 accounts
      for (const account of token2022Accounts) {
        const tokenBalance = this.parseTokenAccount(account, true);
        if (tokenBalance) {
          allTokenBalances.push(tokenBalance);
        }
      }

    } catch (error) {
      console.warn('⚠️ Failed to fetch Token-2022 accounts:', error);
    }

    // Filter out zero balance tokens and sort by value
    const nonZeroTokens = allTokenBalances.filter(token => token.uiAmount > 0);
    
    console.log('✅ Total non-zero token balances found:', nonZeroTokens.length);
    
    return nonZeroTokens;
  }

  /**
   * Parse a token account and extract balance information
   */
  private parseTokenAccount(
    account: { pubkey: PublicKey; account: any }, 
    isToken2022: boolean = false
  ): EnhancedTokenBalance | null {
    try {
      const parsedData = account.account.data as ParsedAccountData;
      const tokenInfo = parsedData?.parsed?.info;
      
      if (!tokenInfo?.mint || !tokenInfo?.tokenAmount) {
        return null;
      }

      // Only include tokens with positive balance
      const amount = parseFloat(tokenInfo.tokenAmount.amount || '0');
      if (amount <= 0) {
        return null;
      }

      const mint = tokenInfo.mint;
      const knownToken = KNOWN_TOKENS[mint];
      const uiAmount = tokenInfo.tokenAmount.uiAmount || 0;
      const decimals = tokenInfo.tokenAmount.decimals || 0;

      return {
        mint,
        symbol: knownToken?.symbol || this.generateTokenSymbol(mint),
        name: knownToken?.name || this.generateTokenName(mint),
        balance: amount,
        decimals,
        uiAmount,
        logoUri: knownToken?.logoUri,
        isToken2022,
        programId: isToken2022 ? TOKEN_2022_PROGRAM_ID.toString() : TOKEN_PROGRAM_ID.toString(),
      };

    } catch (error) {
      console.warn('⚠️ Failed to parse token account:', error);
      return null;
    }
  }

  /**
   * Generate a readable symbol for unknown tokens
   */
  private generateTokenSymbol(mint: string): string {
    return `TOKEN_${mint.slice(0, 4).toUpperCase()}`;
  }

  /**
   * Generate a readable name for unknown tokens
   */
  private generateTokenName(mint: string): string {
    return `Unknown Token (${mint.slice(0, 8)}...)`;
  }

  /**
   * Get token prices from multiple sources with fallback
   */
  async getTokenPrices(mints: string[]): Promise<TokenPrice[]> {
    console.log('💰 Fetching token prices for', mints.length, 'tokens');
    
    try {
      // Primary: CoinGecko API
      return await this.getTokenPricesFromCoinGecko(mints);
    } catch (error) {
      console.warn('⚠️ CoinGecko failed, trying Jupiter API:', error);
      
      try {
        // Fallback: Jupiter API
        return await this.getTokenPricesFromJupiter(mints);
      } catch (jupiterError) {
        console.warn('⚠️ Jupiter failed, using default prices:', jupiterError);
        
        // Final fallback: default prices for major tokens
        return this.getDefaultTokenPrices(mints);
      }
    }
  }

  private async getTokenPricesFromCoinGecko(mints: string[]): Promise<TokenPrice[]> {
    // Map Solana mints to CoinGecko IDs
    const coinGeckoIds = mints.map(mint => {
      if (mint === 'So11111111111111111111111111111111111111112') return 'solana';
      if (mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') return 'usd-coin';
      if (mint === 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') return 'tether';
      return null;
    }).filter(Boolean) as string[];

    if (coinGeckoIds.length === 0) {
      throw new Error('No supported tokens for CoinGecko');
    }

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIds.join(',')}&vs_currencies=usd&include_24hr_change=true`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    const prices: TokenPrice[] = [];
    
    mints.forEach(mint => {
      let coinGeckoId: string | null = null;
      if (mint === 'So11111111111111111111111111111111111111112') coinGeckoId = 'solana';
      if (mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') coinGeckoId = 'usd-coin';
      if (mint === 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') coinGeckoId = 'tether';
      
      if (coinGeckoId && data[coinGeckoId]) {
        prices.push({
          mint,
          price: data[coinGeckoId].usd || 0,
          change24h: data[coinGeckoId].usd_24h_change || 0,
        });
      }
    });

    return prices;
  }

  private async getTokenPricesFromJupiter(mints: string[]): Promise<TokenPrice[]> {
    // Jupiter price API (alternative)
    const response = await fetch('https://price.jup.ag/v4/price?ids=' + mints.join(','));
    
    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.status}`);
    }

    const data = await response.json();
    
    return mints.map(mint => ({
      mint,
      price: data.data?.[mint]?.price || 0,
      change24h: 0, // Jupiter doesn't provide 24h change
    }));
  }

  private getDefaultTokenPrices(mints: string[]): TokenPrice[] {
    // Default prices for major tokens when APIs fail
    const defaultPrices: Record<string, number> = {
      'So11111111111111111111111111111111111111112': 180, // SOL
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 1, // USDC
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 1, // USDT
    };

    return mints.map(mint => ({
      mint,
      price: defaultPrices[mint] || 0,
      change24h: 0,
    }));
  }

  // Legacy methods for compatibility
  async getTokenMetadata(mint: string): Promise<TokenMetadata | null> {
    console.warn('⚠️ getTokenMetadata is deprecated - use enhanced token data from getWalletBalances');
    return null;
  }
}