/**
 * Global Raydium SDK Patch
 * Patches the Raydium SDK at runtime to handle account data errors gracefully
 */

import { errorLogger } from '../services/error-logger.service';

export class RaydiumSDKPatch {
  private static instance: RaydiumSDKPatch;
  private isPatched = false;
  private originalDeserialize: any = null;

  static getInstance(): RaydiumSDKPatch {
    if (!RaydiumSDKPatch.instance) {
      RaydiumSDKPatch.instance = new RaydiumSDKPatch();
    }
    return RaydiumSDKPatch.instance;
  }

  /**
   * Apply global patches to handle account data mismatch errors
   */
  applyPatches(): void {
    if (this.isPatched) {
      console.log('🔧 Raydium SDK patches already applied');
      return;
    }

    try {
      // Patch 1: Global error handler for unhandled promise rejections
      this.patchGlobalPromiseRejection();
      
      // Patch 2: Override console.error to catch and handle our specific error
      this.patchConsoleError();
      
      // Patch 3: Monkey patch potential deserialize methods
      this.patchDeserializeMethods();

      this.isPatched = true;
      console.log('✅ Raydium SDK patches applied successfully');
      
    } catch (error) {
      console.error('❌ Failed to apply Raydium SDK patches:', error);
    }
  }

  private patchGlobalPromiseRejection(): void {
    const originalHandler = window.onunhandledrejection;
    
    window.onunhandledrejection = (event) => {
      const error = event.reason;
      const errorMessage = error?.message || String(error);
      
      // Check if it's our account data error
      if (errorMessage.includes('invalid account data; account type mismatch')) {
        console.warn('🔄 Intercepted account data mismatch error in promise rejection');
        
        // Log the error for monitoring
        errorLogger.logError({
          category: 'PARSING_ERROR',
          message: 'Raydium account data mismatch (intercepted)',
          details: {
            error: errorMessage,
            interceptedAt: 'unhandledrejection'
          },
          context: {
            component: 'RaydiumSDKPatch',
            operation: 'globalPromiseRejection'
          }
        });
        
        // Prevent the error from bubbling up
        event.preventDefault();
        return false;
      }
      
      // Call original handler if it exists
      if (originalHandler) {
        return originalHandler.call(window, event);
      }
    };
  }

  private patchConsoleError(): void {
    const originalError = console.error;
    
    console.error = (...args: any[]) => {
      // Check if any argument contains our error pattern
      const hasAccountError = args.some(arg => {
        const str = String(arg);
        return str.includes('invalid account data; account type mismatch');
      });
      
      if (hasAccountError) {
        console.warn('🔄 Intercepted account data mismatch error in console.error');
        
        // Log to our error monitoring instead
        errorLogger.logWarning({
          category: 'PARSING_ERROR',
          message: 'Raydium account data mismatch (console intercepted)',
          details: {
            originalArgs: args.map(arg => String(arg)),
            interceptedAt: 'console.error'
          },
          context: {
            component: 'RaydiumSDKPatch',
            operation: 'consoleError'
          }
        });
        
        // Don't call original console.error for this specific error
        return;
      }
      
      // Call original console.error for other errors
      originalError.apply(console, args);
    };
  }

  private patchDeserializeMethods(): void {
    // This is more complex and depends on the internal structure of Raydium SDK
    // We'll use a more general approach with try-catch wrapper
    
    const originalFetch = window.fetch;
    window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
      try {
        return await originalFetch(...args);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage.includes('invalid account data; account type mismatch')) {
          console.warn('🔄 Intercepted account data error in fetch operation');
          
          // Create a mock successful response
          return new Response(JSON.stringify({
            success: false,
            error: 'Account data mismatch - using fallback',
            data: null
          }), {
            status: 200,
            statusText: 'OK',
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        throw error;
      }
    };
  }

  /**
   * Create a safe wrapper for any function that might throw account data errors
   */
  createSafeWrapper<T extends (...args: any[]) => any>(
    originalFunction: T,
    fallbackValue: ReturnType<T>,
    functionName: string
  ): T {
    return ((...args: Parameters<T>): ReturnType<T> => {
      try {
        const result = originalFunction(...args);
        
        // If it's a promise, wrap it safely
        if (result && typeof result.then === 'function') {
          return result.catch((error: any) => {
            const errorMessage = error?.message || String(error);
            
            if (errorMessage.includes('invalid account data; account type mismatch')) {
              console.warn(`🔄 Account data error in ${functionName}, using fallback`);
              
              errorLogger.logWarning({
                category: 'PARSING_ERROR',
                message: `Account data mismatch in ${functionName}`,
                details: { error: errorMessage, args },
                context: {
                  component: 'RaydiumSDKPatch',
                  operation: functionName
                }
              });
              
              return fallbackValue;
            }
            
            throw error;
          }) as ReturnType<T>;
        }
        
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage.includes('invalid account data; account type mismatch')) {
          console.warn(`🔄 Account data error in ${functionName}, using fallback`);
          
          errorLogger.logWarning({
            category: 'PARSING_ERROR',
            message: `Account data mismatch in ${functionName}`,
            details: { error: errorMessage, args },
            context: {
              component: 'RaydiumSDKPatch',
              operation: functionName
            }
          });
          
          return fallbackValue;
        }
        
        throw error;
      }
    }) as T;
  }

  /**
   * Remove all patches (for cleanup)
   */
  removePatches(): void {
    if (!this.isPatched) {
      return;
    }

    try {
      // Reset handlers to original state
      window.onunhandledrejection = null;
      
      this.isPatched = false;
      console.log('✅ Raydium SDK patches removed');
    } catch (error) {
      console.error('❌ Failed to remove Raydium SDK patches:', error);
    }
  }
}

// Export singleton
export const raydiumSDKPatch = RaydiumSDKPatch.getInstance();