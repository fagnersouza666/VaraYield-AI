# VaraYield AI - Referências Tecnológicas e Padrões

## 📋 Bibliotecas Principais (Context7 Verified)

### 🌐 Solana Ecosystem
```json
{
  "@solana/web3.js": "^1.95.3",
  "@coral-xyz/anchor": "^0.30.1",
  "@solana/wallet-adapter-react": "^0.15.35",
  "@solana/wallet-adapter-react-ui": "^0.9.35",
  "@solana/wallet-adapter-wallets": "^0.19.32",
  "@raydium-io/raydium-sdk-v2": "^0.1.82"
}
```

**Context7 IDs encontrados:**
- Solana Web3.js: `/solana-foundation/solana-web3.js` (oficial)
- Anchor Framework: `/solana-foundation/anchor` (438 snippets)
- Wallet Adapter: `/anza-xyz/wallet-adapter` (45 snippets, trust 7.6)
- Raydium SDK: `/raydium-io/raydium-sdk-v2` (12 snippets, trust 8.1)

### ⚛️ Frontend Stack
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "@types/react": "^18.3.12",
  "@types/react-dom": "^18.3.1",
  "typescript": "^5.6.3",
  "vite": "^6.0.1",
  "@vitejs/plugin-react": "^4.3.3"
}
```

**Context7 IDs encontrados:**
- React: `/reactjs/react.dev` (2791 snippets, trust 9)
- TypeScript: `/microsoft/typescript` (26981 snippets, trust 9.9)
- Vite: `/vitejs/vite` v7.0.0 (629 snippets, trust 8.3)

### 🎨 Styling & UI
```json
{
  "tailwindcss": "^3.4.14",
  "@tailwindcss/typography": "^0.5.15",
  "lucide-react": "^0.454.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1"
}
```

**Context7 IDs encontrados:**
- TailwindCSS: `/tailwindlabs/tailwindcss.com` (2026 snippets, trust 8)
- Tailwind Animate: `/jamiebuilds/tailwindcss-animate` (185 snippets, trust 8.7)

## 🏗️ Padrões de Projeto

### 1. Estrutura de Componentes React + TypeScript
```typescript
// src/components/common/Button.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes&lt;HTMLButtonElement&gt;,
    VariantProps&lt;typeof buttonVariants&gt; {
  asChild?: boolean;
}

const Button = React.forwardRef&lt;HTMLButtonElement, ButtonProps&gt;(
  ({ className, variant, size, asChild = false, ...props }, ref) =&gt; {
    return (
      &lt;button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      /&gt;
    );
  }
);

Button.displayName = "Button";
export { Button, buttonVariants };
```

### 2. Conexão Solana Wallet
```typescript
// src/components/WalletConnection.tsx
import React, { FC, useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

require('@solana/wallet-adapter-react-ui/styles.css');

const WalletConnectionProvider: FC&lt;{ children: React.ReactNode }&gt; = ({ children }) =&gt; {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() =&gt; clusterApiUrl(network), [network]);
  
  const wallets = useMemo(() =&gt; [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network }),
  ], [network]);

  return (
    &lt;ConnectionProvider endpoint={endpoint}&gt;
      &lt;WalletProvider wallets={wallets} autoConnect&gt;
        &lt;WalletModalProvider&gt;
          {children}
        &lt;/WalletModalProvider&gt;
      &lt;/WalletProvider&gt;
    &lt;/ConnectionProvider&gt;
  );
};

export default WalletConnectionProvider;
```

### 3. Hook Customizado Solana
```typescript
// src/hooks/useSolana.ts
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useCallback } from 'react';

export const useSolana = () =&gt; {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const getBalance = useCallback(async () =&gt; {
    if (!publicKey) return 0;
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9; // Convert lamports to SOL
  }, [connection, publicKey]);

  const sendSol = useCallback(async (to: string, amount: number) =&gt; {
    if (!publicKey) throw new Error('Wallet not connected');
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(to),
        lamports: amount * 1e9, // Convert SOL to lamports
      })
    );

    const signature = await sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, 'processed');
    return signature;
  }, [publicKey, sendTransaction, connection]);

  return {
    connected: !!publicKey,
    publicKey,
    getBalance,
    sendSol,
    connection,
  };
};
```

### 4. Anchor Program Integration
```typescript
// src/lib/anchor-setup.ts
import { Program, Provider, Wallet, AnchorProvider } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { VaraYieldOptimizer } from '../types/vara_yield_optimizer';
import IDL from '../idl/vara_yield_optimizer.json';

export const PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID_HERE');

export const getProgram = (connection: Connection, wallet: Wallet) =&gt; {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'processed',
  });
  
  return new Program&lt;VaraYieldOptimizer&gt;(
    IDL as VaraYieldOptimizer,
    PROGRAM_ID,
    provider
  );
};

export const initializeVault = async (
  program: Program&lt;VaraYieldOptimizer&gt;,
  authority: PublicKey
) =&gt; {
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), authority.toBuffer()],
    PROGRAM_ID
  );

  const tx = await program.methods
    .initializeVault()
    .accounts({
      vault: vaultPda,
      authority,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { tx, vaultPda };
};
```

### 5. Raydium Integration Pattern
```typescript
// src/lib/raydium-integration.ts
import { Raydium, TxVersion, parseTokenAccountResp } from '@raydium-io/raydium-sdk-v2';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

export class RaydiumService {
  private raydium: Raydium;
  
  constructor(connection: Connection) {
    this.raydium = Raydium.load({
      connection,
      cluster: 'devnet', // or 'mainnet'
      disableFeatureCheck: true,
      disableLoadToken: false,
    });
  }

  async getPoolInfo(poolId: string) {
    const pool = await this.raydium.liquidity.getPoolInfoFromRpc({
      poolId: new PublicKey(poolId),
    });
    return pool;
  }

  async swapTokens(params: {
    inputToken: string;
    outputToken: string;
    amount: number;
    slippage: number;
  }) {
    const { inputToken, outputToken, amount, slippage } = params;
    
    const swapTransaction = await this.raydium.trade.swap({
      poolInfo: await this.getPoolInfo('POOL_ID'),
      amountIn: amount,
      tokenIn: new PublicKey(inputToken),
      tokenOut: new PublicKey(outputToken),
      slippage,
      txVersion: TxVersion.V0,
    });

    return swapTransaction;
  }
}
```

### 6. State Management com Zustand
```typescript
// src/store/useVaraStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface VaraState {
  // Wallet State
  connected: boolean;
  publicKey: string | null;
  balance: number;
  
  // Optimization State
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  activeProtocols: string[];
  totalDeposited: number;
  currentAPY: number;
  
  // Actions
  setConnected: (connected: boolean) =&gt; void;
  setPublicKey: (key: string | null) =&gt; void;
  setBalance: (balance: number) =&gt; void;
  setRiskLevel: (level: 'conservative' | 'moderate' | 'aggressive') =&gt; void;
  updatePortfolioData: (data: any) =&gt; void;
}

export const useVaraStore = create&lt;VaraState&gt;()(
  devtools(
    persist(
      (set, get) =&gt; ({
        // Initial State
        connected: false,
        publicKey: null,
        balance: 0,
        riskLevel: 'moderate',
        activeProtocols: [],
        totalDeposited: 0,
        currentAPY: 0,
        
        // Actions
        setConnected: (connected) =&gt; set({ connected }),
        setPublicKey: (publicKey) =&gt; set({ publicKey }),
        setBalance: (balance) =&gt; set({ balance }),
        setRiskLevel: (riskLevel) =&gt; set({ riskLevel }),
        updatePortfolioData: (data) =&gt; set({
          totalDeposited: data.totalDeposited,
          currentAPY: data.currentAPY,
          activeProtocols: data.activeProtocols,
        }),
      }),
      { name: 'vara-storage' }
    )
  )
);
```

### 7. TailwindCSS Configuration
```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        vara: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 8. Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

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
    include: ['@solana/web3.js', '@coral-xyz/anchor'],
  },
  server: {
    host: true,
    port: 3000,
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
});
```

## 🔧 Utilitários Essenciais

### CSS Utils
```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatNumber = (num: number, decimals = 2) =&gt; {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatSOL = (lamports: number) =&gt; {
  return (lamports / 1e9).toFixed(4);
};
```

## 🚀 Scripts de Desenvolvimento

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  }
}
```

## 📁 Estrutura de Arquivos Recomendada

```
src/
├── components/
│   ├── common/           # Componentes reutilizáveis
│   ├── wallet/          # Componentes de carteira
│   ├── defi/            # Componentes DeFi específicos
│   └── ui/              # Componentes base UI
├── hooks/               # Custom hooks
├── lib/                 # Utilitários e configurações
├── store/               # Estado global (Zustand)
├── types/               # Definições TypeScript
├── utils/               # Funções utilitárias
└── constants/           # Constantes da aplicação
```

---

**Versões verificadas via Context7:**
- React: 18.3.1+ (2791 snippets, trust 9)
- TypeScript: 5.6.3+ (26981 snippets, trust 9.9)  
- Vite: 7.0.0+ (629 snippets, trust 8.3)
- TailwindCSS: 3.4.14+ (2026 snippets, trust 8)
- Solana Web3.js: Latest (oficial)
- Anchor: 0.30.1+ (438 snippets)
- Wallet Adapter: Latest (45 snippets, trust 7.6)
- Raydium SDK V2: Latest (12 snippets, trust 8.1)