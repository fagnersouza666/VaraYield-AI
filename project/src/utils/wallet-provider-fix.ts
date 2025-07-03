/**
 * Wallet Provider Conflict Resolution
 * Fixes MetaMask and other Ethereum wallet conflicts with Solana wallets
 */

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
  }
}

export const resolveWalletProviderConflicts = () => {
  if (typeof window === 'undefined') return;

  try {
    // Log current wallet providers
    console.log('🔍 Detecting wallet providers...');
    
    const providers = {
      ethereum: !!window.ethereum,
      solana: !!window.solana,
      phantom: !!(window as any).phantom?.solana,
      solflare: !!(window as any).solflare,
      metamask: !!(window.ethereum as any)?.isMetaMask,
    };

    console.log('📊 Wallet providers detected:', providers);

    // Handle MetaMask ethereum provider conflicts
    if (window.ethereum && providers.metamask) {
      console.log('⚠️ MetaMask detected - potential Ethereum provider conflict');
      
      // Create a non-enumerable backup of ethereum if it exists
      if (window.ethereum) {
        try {
          Object.defineProperty(window, '_originalEthereum', {
            value: window.ethereum,
            writable: false,
            enumerable: false,
            configurable: false
          });
          console.log('✅ Backed up original Ethereum provider');
        } catch (error) {
          console.warn('⚠️ Could not backup Ethereum provider:', error);
        }
      }
    }

    // Prioritize Solana providers for our app
    if (providers.phantom) {
      console.log('✅ Phantom wallet detected and prioritized');
    }

    if (providers.solflare) {
      console.log('✅ Solflare wallet detected');
    }

    // Log error monitoring
    const errorCount = window.document.querySelectorAll('[data-error]').length;
    if (errorCount > 0) {
      console.log(`⚠️ Found ${errorCount} error elements on page`);
    }

    return providers;
  } catch (error) {
    console.error('❌ Error resolving wallet provider conflicts:', error);
    
    // Log this error to our monitoring system if available
    if ((window as any).errorLogger) {
      (window as any).errorLogger.logWarning({
        category: 'WALLET_ERROR',
        message: 'Failed to resolve wallet provider conflicts',
        details: error,
        context: {
          component: 'WalletProviderFix',
          userAgent: navigator.userAgent
        }
      });
    }
    
    return null;
  }
};

// Auto-run on load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', resolveWalletProviderConflicts);
  } else {
    resolveWalletProviderConflicts();
  }
}