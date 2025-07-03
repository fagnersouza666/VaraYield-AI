import { useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Raydium } from '@raydium-io/raydium-sdk-v2';
import type { RaydiumLoadParams } from '@raydium-io/raydium-sdk-v2';
import { logger } from '../shared/logger';
import {
  RaydiumInitializationError,
  WalletConnectionError,
  createErrorFromUnknown
} from '../shared/errors';
import { ERROR_MESSAGES } from '../shared/constants';
import { objectValidation } from '../shared/validation';
import { safeRaydiumService } from '../services/safe-raydium.service';
import type { Transaction, VersionedTransaction } from '@solana/web3.js';

interface UseRaydiumInitializationReturn {
  initializeRaydium: () => Promise<Raydium | null>;
}

const validateWalletConnection = (publicKey: unknown, signAllTransactions: unknown): void => {
  if (!objectValidation.isNotNull(publicKey)) {
    throw new WalletConnectionError(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
  }
  if (!objectValidation.isNotNull(signAllTransactions)) {
    throw new WalletConnectionError(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
  }
};

const createRaydiumInstance = async (
  params: RaydiumLoadParams
): Promise<Raydium | null> => {
  return await safeRaydiumService.safeExecute(
    async () => await Raydium.load(params),
    null, // fallback to null instead of crashing
    'Raydium.load'
  );
};

export const useRaydiumInitialization = (): UseRaydiumInitializationReturn => {
  const { connection } = useConnection();
  const { publicKey, signAllTransactions } = useWallet();

  const initializeRaydium = useCallback(async (): Promise<Raydium | null> => {
    if (!connection) {
      logger.warn('Connection not available for Raydium initialization');
      return null;
    }

    try {
      validateWalletConnection(publicKey, signAllTransactions);

      logger.info('Initializing Raydium SDK', {
        publicKey: publicKey?.toBase58(),
        connection: !!connection
      });

      // Força o tipo para compatibilidade total com Raydium SDK
      const signAllTx = signAllTransactions as unknown as <T extends Transaction | VersionedTransaction>(txs: T[]) => Promise<T[]>;
      const raydiumInstance = await createRaydiumInstance({
        connection,
        owner: publicKey!,
        signAllTransactions: signAllTx,
        disableLoadToken: false,
      });

      if (raydiumInstance) {
        logger.info('Raydium SDK initialized successfully');
        return raydiumInstance;
      } else {
        logger.warn('Raydium SDK initialization failed due to account data errors, but app will continue');
        return null; // Return null gracefully instead of throwing
      }
    } catch (err) {
      const error = createErrorFromUnknown(err);
      const raydiumError = new RaydiumInitializationError(
        ERROR_MESSAGES.RAYDIUM_INIT_FAILED,
        { originalError: error.message }
      );

      logger.error('Failed to initialize Raydium SDK', raydiumError.toJSON());
      // Nunca lança erro para cima, sempre retorna null para não quebrar a aplicação
      return null;
    }
  }, [connection, publicKey, signAllTransactions]);

  return { initializeRaydium };
};