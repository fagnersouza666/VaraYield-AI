import { useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Raydium } from '@raydium-io/raydium-sdk-v2';
import type { RaydiumLoadParams } from '../types/raydium';
import { logger } from '../shared/logger';
import { 
  RaydiumInitializationError, 
  WalletConnectionError,
  createErrorFromUnknown 
} from '../shared/errors';
import { ERROR_MESSAGES } from '../shared/constants';
import { objectValidation } from '../shared/validation';

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
): Promise<Raydium> => {
  return await Raydium.load(params);
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
      
      const raydiumInstance = await createRaydiumInstance({
        connection,
        owner: publicKey!,
        signAllTransactions: signAllTransactions!,
        disableLoadToken: false,
      });
      
      logger.info('Raydium SDK initialized successfully');
      return raydiumInstance;
    } catch (err) {
      const error = createErrorFromUnknown(err);
      const raydiumError = new RaydiumInitializationError(
        ERROR_MESSAGES.RAYDIUM_INIT_FAILED,
        { originalError: error.message }
      );
      
      logger.error('Failed to initialize Raydium SDK', raydiumError.toJSON());
      throw raydiumError;
    }
  }, [connection, publicKey, signAllTransactions]);

  return { initializeRaydium };
};