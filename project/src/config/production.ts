/**
 * Production Configuration for VaraYield AI
 * 
 * This file contains production-specific settings that ensure
 * the application runs with real blockchain data only.
 */

export const PRODUCTION_CONFIG = {
  // Force production mode
  FORCE_PRODUCTION_MODE: import.meta.env.VITE_FORCE_PRODUCTION_MODE === 'true',
  
  // Only allow real data, no mock/demo fallbacks
  ALLOW_MOCK_DATA: false,
  ALLOW_DEMO_MODE: false,
  
  // Wallet service configuration
  WALLET_MODE: 'real' as const,
  USE_ENHANCED_SERVICE: true,
  
  // RPC Configuration for production
  RPC_CONFIG: {
    TIMEOUT: 30000, // 30 seconds for production
    MAX_RETRIES: 5, // More retries for reliability
    RETRY_DELAY: 2000, // 2 seconds between retries
    DISABLE_RETRY_ON_RATE_LIMIT: false,
  },
  
  // Token fetching configuration
  TOKEN_CONFIG: {
    INCLUDE_ZERO_BALANCE: false, // Don't fetch empty accounts
    INCLUDE_TOKEN_2022: true, // Support new token standard
    MAX_ACCOUNTS_PER_REQUEST: 1000,
    FILTER_DUST_AMOUNTS: true, // Filter very small amounts
    MIN_DUST_THRESHOLD: 0.000001, // Minimum amount to consider
  },
  
  // Price fetching configuration
  PRICE_CONFIG: {
    PRIMARY_SOURCE: 'coingecko',
    FALLBACK_SOURCES: ['jupiter', 'default'],
    CACHE_DURATION: 60000, // 1 minute cache
    REQUEST_TIMEOUT: 10000, // 10 seconds timeout
  },
  
  // Logging configuration for production
  LOGGING: {
    ENABLE_CONSOLE_LOGS: true,
    LOG_LEVEL: 'info', // info, warn, error
    LOG_RPC_REQUESTS: true,
    LOG_PERFORMANCE: true,
  },
  
  // Error handling
  ERROR_CONFIG: {
    SHOW_DETAILED_ERRORS: true,
    INCLUDE_STACK_TRACES: false, // Don't expose stack traces to users
    LOG_ERRORS_TO_CONSOLE: true,
  },
  
  // Performance monitoring
  PERFORMANCE: {
    ENABLE_METRICS: true,
    WARN_SLOW_REQUESTS: 5000, // Warn if request takes > 5s
    ENABLE_REQUEST_TIMING: true,
  }
} as const;

/**
 * Get the current wallet mode for production
 */
export const getProductionWalletMode = () => {
  return PRODUCTION_CONFIG.WALLET_MODE;
};

/**
 * Check if application is running in production mode
 */
export const isProductionMode = () => {
  return (
    import.meta.env.NODE_ENV === 'production' ||
    PRODUCTION_CONFIG.FORCE_PRODUCTION_MODE ||
    import.meta.env.VITE_FORCE_PRODUCTION_MODE === 'true'
  );
};

/**
 * Get RPC configuration for production
 */
export const getProductionRPCConfig = () => {
  return PRODUCTION_CONFIG.RPC_CONFIG;
};

/**
 * Check if mock data is allowed (always false in production)
 */
export const isMockDataAllowed = () => {
  return !isProductionMode() && PRODUCTION_CONFIG.ALLOW_MOCK_DATA;
};

/**
 * Check if demo mode is allowed (always false in production)
 */
export const isDemoModeAllowed = () => {
  return !isProductionMode() && PRODUCTION_CONFIG.ALLOW_DEMO_MODE;
};

/**
 * Production-ready RPC endpoints
 */
export const PRODUCTION_RPC_ENDPOINTS = [
  {
    url: import.meta.env.VITE_VARA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    name: 'Primary Mainnet',
    priority: 1,
    production: true,
  },
  {
    url: import.meta.env.VITE_VARA_RPC_BACKUP_1 || 'https://rpc.ankr.com/solana',
    name: 'Ankr Mainnet',
    priority: 2,
    production: true,
  },
  {
    url: import.meta.env.VITE_VARA_RPC_BACKUP_2 || 'https://solana-mainnet.rpc.extrnode.com',
    name: 'ExtrNode Mainnet',
    priority: 3,
    production: true,
  },
  {
    url: import.meta.env.VITE_VARA_RPC_BACKUP_3 || 'https://mainnet.helius-rpc.com',
    name: 'Helius Public',
    priority: 4,
    production: true,
  },
] as const;

/**
 * Recommended production RPC providers
 */
export const RECOMMENDED_PRODUCTION_PROVIDERS = [
  {
    name: 'Helius',
    url: 'https://helius.dev/',
    description: 'High-performance Solana infrastructure optimized for DeFi',
    pricing: 'Free tier: 100k requests/day, Paid: $99+/month',
    features: ['Enhanced APIs', 'Webhooks', 'Analytics', 'Priority support'],
    recommended: true,
  },
  {
    name: 'QuickNode',
    url: 'https://quicknode.com/chains/solana',
    description: 'Global Solana network with low latency',
    pricing: 'Free tier: 50k requests/day, Paid: $9+/month',
    features: ['Global endpoints', 'WebSocket support', 'Load balancing'],
    recommended: true,
  },
  {
    name: 'Alchemy',
    url: 'https://alchemy.com/solana',
    description: 'Enterprise-grade Solana infrastructure',
    pricing: 'Free tier: 100k requests/day, Usage-based pricing',
    features: ['Enhanced APIs', 'Debug tools', 'Analytics dashboard'],
    recommended: true,
  },
  {
    name: 'Ankr',
    url: 'https://ankr.com/rpc/solana/',
    description: 'Decentralized RPC service',
    pricing: 'Free tier: 500k requests/day, Paid: $99+/month',
    features: ['Decentralized', 'High availability', 'Global coverage'],
    recommended: false,
  },
] as const;

export default PRODUCTION_CONFIG;