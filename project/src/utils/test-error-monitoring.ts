/**
 * Test utility to demonstrate error monitoring capabilities
 * This file helps validate that the error logging system works correctly
 */

import { errorLogger, logRPCError, logWalletError } from '../services/error-logger.service';

export const testErrorMonitoring = () => {
  console.log('🧪 Testing Error Monitoring System...');

  // Test 1: Basic error logging
  errorLogger.logError({
    category: 'NETWORK_ERROR',
    message: 'Test network connection failed',
    details: {
      statusCode: 503,
      endpoint: 'https://test-endpoint.com'
    },
    context: {
      component: 'TestSystem',
      operation: 'connectionTest'
    }
  });

  // Test 2: RPC-specific error
  logRPCError(
    'https://api.mainnet-beta.solana.com',
    new Error('Rate limit exceeded'),
    {
      operation: 'getBalance',
      walletAddress: '11111111111111111111111111111111'
    }
  );

  // Test 3: Wallet-specific error
  logWalletError(
    'Phantom',
    new Error('User rejected transaction'),
    {
      operation: 'signTransaction',
      transactionType: 'swap'
    }
  );

  // Test 4: Warning
  errorLogger.logWarning({
    category: 'VALIDATION_ERROR',
    message: 'Invalid token amount detected',
    details: {
      inputAmount: -100,
      tokenSymbol: 'SOL'
    },
    context: {
      component: 'SwapForm'
    }
  });

  // Test 5: Info log
  errorLogger.logInfo({
    message: 'Error monitoring system test completed',
    details: {
      testsRun: 5,
      timestamp: new Date().toISOString()
    },
    context: {
      component: 'TestSystem'
    }
  });

  console.log('✅ Error monitoring test completed. Check the error dashboard to see logged errors.');
  
  // Return stats for verification
  return errorLogger.getStats();
};

// Export for global testing access
if (typeof window !== 'undefined') {
  (window as any).testErrorMonitoring = testErrorMonitoring;
}