import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

export class PhantomWalletAdapterWithTimeout extends PhantomWalletAdapter {
  private connectTimeout: number = 8000; // 8 seconds timeout for better UX

  constructor(config: { network?: WalletAdapterNetwork } = {}) {
    super(config);
  }

  async connect(): Promise<void> {
    console.log('🔌 Attempting to connect to Phantom wallet with timeout...');
    
    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeoutId = setTimeout(() => {
        console.error('❌ Phantom wallet connection timed out after', this.connectTimeout, 'ms');
        reject(new Error('Wallet connection timed out. Please ensure Phantom is unlocked and try again.'));
      }, this.connectTimeout);

      // Attempt connection
      super.connect()
        .then(() => {
          clearTimeout(timeoutId);
          console.log('✅ Phantom wallet connected successfully');
          resolve();
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          console.error('❌ Phantom wallet connection failed:', error);
          
          // Provide user-friendly error messages
          if (error.message.includes('User rejected')) {
            reject(new Error('Connection rejected by user. Please approve the connection in Phantom.'));
          } else if (error.message.includes('not found')) {
            reject(new Error('Phantom wallet not found. Please install Phantom browser extension.'));
          } else {
            reject(new Error(`Connection failed: ${error.message}`));
          }
        });
    });
  }
}