import { PublicKey } from '@solana/web3.js';

export interface TokenBalance {
  readonly mint: string;
  readonly symbol: string;
  readonly name: string;
  readonly balance: number;
  readonly decimals: number;
  readonly uiAmount: number;
  readonly value?: number; // USD value
  readonly logoUri?: string;
}

export interface TokenMetadata {
  readonly mint: string;
  readonly symbol: string;
  readonly name: string;
  readonly decimals: number;
  readonly logoUri?: string;
  readonly verified?: boolean;
  readonly tags?: string[];
}

export interface WalletBalance {
  readonly solBalance: number;
  readonly tokenBalances: readonly TokenBalance[];
  readonly totalValue: number;
  readonly lastUpdated: string;
}

export interface TokenPrice {
  readonly mint: string;
  readonly price: number;
  readonly change24h: number;
  readonly marketCap?: number;
  readonly volume24h?: number;
}

export interface WalletService {
  getWalletBalances(publicKey: PublicKey): Promise<WalletBalance>;
  getTokenMetadata(mints: string[]): Promise<TokenMetadata[]>;
  getTokenPrices(mints: string[]): Promise<TokenPrice[]>;
  subscribeToBalanceUpdates(publicKey: PublicKey, callback: (balance: WalletBalance) => void): () => void;
}

// Known token list for Solana
export interface KnownToken {
  readonly mint: string;
  readonly symbol: string;
  readonly name: string;
  readonly decimals: number;
  readonly logoUri?: string;
  readonly coingeckoId?: string;
}

export const KNOWN_TOKENS: Record<string, KnownToken> = {
  'So11111111111111111111111111111111111111112': {
    mint: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    coingeckoId: 'solana',
  },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    coingeckoId: 'usd-coin',
  },
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': {
    mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    symbol: 'RAY',
    name: 'Raydium',
    decimals: 6,
    logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
    coingeckoId: 'raydium',
  },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
    coingeckoId: 'tether',
  },
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': {
    mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    symbol: 'mSOL',
    name: 'Marinade staked SOL',
    decimals: 9,
    logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
    coingeckoId: 'marinade-staked-sol',
  },
  'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt': {
    mint: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
    symbol: 'SRM',
    name: 'Serum',
    decimals: 6,
    logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt/logo.png',
    coingeckoId: 'serum',
  },
};