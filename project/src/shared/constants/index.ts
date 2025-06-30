export const APP_CONFIG = {
  OPTIMIZATION: {
    DEFAULT_REBALANCE_INTERVAL_HOURS: 2,
    MIN_APY_THRESHOLD: 5,
    MAX_APY_THRESHOLD: 25,
    SIMULATION_DELAY_MS: 2000,
  },
  UI: {
    LOADING_SPINNER_SIZE: 8,
    GRID_COLS_MD: 3,
    CARD_PADDING: 6,
    BORDER_RADIUS: '2xl',
    LANGUAGE_OPTIONS: ['English', 'Spanish', 'Chinese'],
    SLIPPAGE_OPTIONS: ['0.5%', '1%', '3%'],
    GAS_PRICE_OPTIONS: ['Fast', 'Standard', 'Safe'],
  },
  PORTFOLIO: {
    DEFAULT_TOTAL_VALUE: 124523.67,
    DEFAULT_APY: 8.92,
    DEFAULT_WEEKLY_CHANGE: 2.5,
    TOP_POOLS_LIMIT: 3,
    DEFAULT_LAST_OPTIMIZATION: 'Today, 14:30 UTC',
    DEFAULT_NEXT_REBALANCE: '2h 15m',
  },
  DATE_TIME: {
    UTC_TIMEZONE: 'UTC',
    TIME_FORMAT: {
      hour12: false,
      hour: '2-digit' as const,
      minute: '2-digit' as const,
    },
  },
  APP: {
    VERSION: 'v1.0.0',
    NAME: 'VaraYield AI',
  },
} as const;

export const DEFAULT_PROTOCOLS = [
  { name: 'Raydium', apy: '12.5%', change: '+2.3%', positive: true },
  { name: 'Orca', apy: '9.8%', change: '+1.2%', positive: true },
  { name: 'Marinade', apy: '6.8%', change: '+0.5%', positive: true },
] as const;

export const RISK_LEVELS = ['low', 'medium', 'high'] as const;

export const PAGE_VIEWS = {
  DASHBOARD: 'dashboard',
  PORTFOLIO: 'portfolio',
  ANALYTICS: 'analytics',
  RISK_MANAGEMENT: 'risk-management',
  SETTINGS: 'settings',
} as const;

export const ERROR_MESSAGES = {
  RAYDIUM_INIT_FAILED: 'Failed to initialize Raydium SDK',
  POOL_DATA_FETCH_FAILED: 'Failed to fetch pool data',
  OPTIMIZATION_FAILED: 'Failed to optimize portfolio',
  WALLET_NOT_CONNECTED: 'Wallet is not connected',
  NETWORK_ERROR: 'Network connection error',
} as const;