import { z } from 'zod';

// Asset validation
export const AssetSchema = z.object({
  id: z.string().min(1, 'Asset ID is required'),
  symbol: z.string().min(1, 'Asset symbol is required').max(10, 'Symbol too long'),
  name: z.string().min(1, 'Asset name is required').max(100, 'Name too long'),
  logoUrl: z.string().url('Invalid logo URL').optional(),
  decimals: z.number().int().min(0).max(18),
  mintAddress: z.string().min(32, 'Invalid mint address').max(44, 'Invalid mint address'),
  price: z.number().min(0, 'Price cannot be negative'),
  priceChange24h: z.number(),
  marketCap: z.number().min(0).optional(),
});

// Position validation
export const AddPositionSchema = z.object({
  assetId: z.string().min(1, 'Asset is required'),
  quantity: z.number().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive').optional(),
  poolId: z.string().optional(),
});

export const UpdatePositionSchema = z.object({
  quantity: z.number().positive('Quantity must be positive').optional(),
  targetAllocation: z.number()
    .min(0, 'Allocation cannot be negative')
    .max(100, 'Allocation cannot exceed 100%')
    .optional(),
});

// Rebalance validation
export const AllocationTargetSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  targetAllocation: z.number()
    .min(0, 'Allocation cannot be negative')
    .max(100, 'Allocation cannot exceed 100%'),
});

export const RebalanceSchema = z.object({
  allocations: z.array(AllocationTargetSchema)
    .min(1, 'At least one allocation is required')
    .refine(
      (allocations) => {
        const total = allocations.reduce((sum, alloc) => sum + alloc.targetAllocation, 0);
        return Math.abs(total - 100) < 0.01; // Allow for small floating point errors
      },
      {
        message: 'Total allocations must equal 100%',
      }
    ),
  maxSlippage: z.number()
    .min(0.1, 'Minimum slippage is 0.1%')
    .max(10, 'Maximum slippage is 10%')
    .default(1),
  prioritizeGas: z.boolean().default(false),
});

// Portfolio filters
export const PortfolioFilterSchema = z.object({
  minValue: z.number().min(0).optional(),
  assetTypes: z.array(z.string()).optional(),
  showSmallPositions: z.boolean().default(true),
  sortBy: z.enum(['value', 'allocation', 'pnl', 'symbol', 'performance']).default('value'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Performance period validation
export const PerformancePeriodSchema = z.enum(['24h', '7d', '30d', '90d', '1y', 'all']);

// Transaction validation
export const TransactionSchema = z.object({
  type: z.enum(['buy', 'sell', 'swap', 'stake', 'unstake']),
  assetId: z.string().min(1, 'Asset is required'),
  quantity: z.number().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
  fee: z.number().min(0, 'Fee cannot be negative').default(0),
  poolId: z.string().optional(),
});

// Search schema
export const AssetSearchSchema = z.object({
  query: z.string()
    .min(1, 'Search query is required')
    .max(50, 'Query too long')
    .trim(),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(20),
  includeStablecoins: z.boolean().default(true),
  minMarketCap: z.number().min(0).optional(),
});

// Portfolio settings
export const PortfolioSettingsSchema = z.object({
  autoRebalance: z.boolean().default(false),
  rebalanceThreshold: z.number()
    .min(1, 'Minimum threshold is 1%')
    .max(50, 'Maximum threshold is 50%')
    .default(5),
  maxSlippage: z.number()
    .min(0.1, 'Minimum slippage is 0.1%')
    .max(10, 'Maximum slippage is 10%')
    .default(1),
  riskTolerance: z.enum(['low', 'medium', 'high']).default('medium'),
  notifications: z.object({
    rebalanceAlerts: z.boolean().default(true),
    priceAlerts: z.boolean().default(false),
    performanceReports: z.boolean().default(true),
  }).default({}),
  currency: z.enum(['USD', 'SOL', 'BTC']).default('USD'),
});

// Risk assessment
export const RiskAssessmentSchema = z.object({
  portfolioValue: z.number().positive('Portfolio value must be positive'),
  investmentHorizon: z.enum(['short', 'medium', 'long']),
  riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  primaryGoal: z.enum(['preservation', 'income', 'growth', 'speculation']),
});

// Export type inference
export type AddPositionFormData = z.infer<typeof AddPositionSchema>;
export type UpdatePositionFormData = z.infer<typeof UpdatePositionSchema>;
export type RebalanceFormData = z.infer<typeof RebalanceSchema>;
export type PortfolioFilterFormData = z.infer<typeof PortfolioFilterSchema>;
export type TransactionFormData = z.infer<typeof TransactionSchema>;
export type AssetSearchFormData = z.infer<typeof AssetSearchSchema>;
export type PortfolioSettingsFormData = z.infer<typeof PortfolioSettingsSchema>;
export type RiskAssessmentFormData = z.infer<typeof RiskAssessmentSchema>;
export type PerformancePeriod = z.infer<typeof PerformancePeriodSchema>;

// Validation utilities
export const validateAddPosition = (data: unknown) => {
  return AddPositionSchema.safeParse(data);
};

export const validateRebalance = (data: unknown) => {
  return RebalanceSchema.safeParse(data);
};

export const validatePortfolioSettings = (data: unknown) => {
  return PortfolioSettingsSchema.safeParse(data);
};

export const validateAllocationTotal = (allocations: { targetAllocation: number }[]) => {
  const total = allocations.reduce((sum, alloc) => sum + alloc.targetAllocation, 0);
  return Math.abs(total - 100) < 0.01;
};