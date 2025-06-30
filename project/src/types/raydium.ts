import type { Connection, PublicKey } from '@solana/web3.js';

export interface RaydiumLoadParams {
  connection: Connection;
  owner: PublicKey;
  signAllTransactions: (transactions: unknown[]) => Promise<unknown[]>;
  disableLoadToken: boolean;
}

export interface RaydiumAPI {
  getPoolList: (params: Record<string, unknown>) => Promise<{
    data?: Array<{
      id?: string;
      name?: string;
      apy?: number;
    }>;
  }>;
}

export interface RaydiumInstance {
  api: RaydiumAPI;
}

export interface WalletAdapter {
  publicKey: PublicKey | null;
  signAllTransactions?: (transactions: unknown[]) => Promise<unknown[]>;
}