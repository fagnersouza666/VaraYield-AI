import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@solana/web3.js', '@raydium-io/raydium-sdk-v2'],
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar bibliotecas do Solana em chunks menores
          'solana-core': ['@solana/web3.js'],
          'solana-wallet': [
            '@solana/wallet-adapter-react',
            '@solana/wallet-adapter-react-ui',
            '@solana/wallet-adapter-wallets',
            '@solana/wallet-adapter-base'
          ],
          'raydium': ['@raydium-io/raydium-sdk-v2'],
          'ui-libs': ['lucide-react', 'clsx'],
          'state': ['zustand']
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Aumentar limite para evitar warnings
    target: 'es2020',
    sourcemap: false, // Desabilitar sourcemaps em produção
  },
  server: {
    host: true,
    port: 5173,
  },
});
