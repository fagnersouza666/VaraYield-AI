export type PageView = 'dashboard' | 'portfolio' | 'analytics' | 'risk-management' | 'settings';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface ProtocolData {
  readonly name: string;
  readonly apy: string;
  readonly change: string;
  readonly positive: boolean;
  readonly poolId?: string;
}

export interface PortfolioData {
  readonly totalValueLocked: number;
  readonly currentAPY: number;
  readonly weeklyChange: number;
  readonly protocols: readonly ProtocolData[];
}

export interface OptimizationResult {
  readonly lastOptimized: string;
  readonly nextRebalance: string;
}

export interface AppState {
  readonly currentPage: PageView;
  readonly riskLevel: RiskLevel;
  readonly isOptimizing: boolean;
  readonly lastOptimizationTime: string;
  readonly nextRebalanceTime: string;
  
  setCurrentPage: (page: PageView) => void;
  setRiskLevel: (level: RiskLevel) => void;
  setOptimizing: (isOptimizing: boolean) => void;
  updateOptimizationTimes: (lastTime: string, nextTime: string) => void;
}

export interface RaydiumHookReturn {
  readonly portfolioData: PortfolioData;
  readonly loading: boolean;
  readonly error: string | null;
  readonly connected: boolean;
  readonly raydium: unknown;
  optimizePortfolio: () => Promise<OptimizationResult | undefined>;
  refreshData: () => Promise<void>;
}

export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

export interface RaydiumPoolData {
  readonly id?: string;
  readonly name?: string;
  readonly apy?: number;
}

export interface RaydiumPoolList {
  readonly data?: readonly RaydiumPoolData[];
}