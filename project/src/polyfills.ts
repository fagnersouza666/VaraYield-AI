/**
 * Browser polyfills for Node.js modules required by Solana/Raydium SDKs
 */

import { Buffer } from 'buffer';

// Make Buffer globally available
if (typeof window !== 'undefined') {
  // Buffer polyfill
  if (!window.Buffer) {
    window.Buffer = Buffer;
  }
  
  if (!globalThis.Buffer) {
    globalThis.Buffer = Buffer;
  }

  // Global polyfill
  if (!window.global) {
    window.global = globalThis;
  }

  // Process polyfill
  if (!window.process) {
    window.process = {
      env: {},
      version: '',
      platform: 'browser',
      nextTick: (fn: Function) => setTimeout(fn, 0),
      cwd: () => '/',
      chdir: () => {},
      stdout: {
        write: console.log
      },
      stderr: {
        write: console.error
      }
    } as any;
  }

  if (!globalThis.process) {
    globalThis.process = window.process;
  }

  console.log('✅ Node.js polyfills loaded for browser compatibility');
}

// Export for TypeScript
declare global {
  interface Window {
    Buffer: typeof Buffer;
    global: typeof globalThis;
    process: any;
  }
  
  var Buffer: typeof import('buffer').Buffer;
  var process: any;
  var global: typeof globalThis;
}

export { Buffer };