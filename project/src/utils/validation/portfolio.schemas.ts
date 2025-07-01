import { z } from 'zod';

// Risk level validation
export const RiskLevelSchema = z.enum(['low', 'medium', 'high'], {
  errorMap: () => ({ message: 'Risk level must be low, medium, or high' }),
});

// Portfolio optimization request schema
export const PortfolioOptimizationSchema = z.object({
  riskLevel: RiskLevelSchema,
  targetAllocation: z
    .number()
    .min(0, 'Target allocation cannot be negative')
    .max(100, 'Target allocation cannot exceed 100%')
    .optional(),
  excludePools: z
    .array(z.string().min(1, 'Pool ID cannot be empty'))
    .optional(),
  minApy: z
    .number()
    .min(0, 'Minimum APY cannot be negative')
    .max(100, 'Minimum APY cannot exceed 100%')
    .optional(),
  maxRisk: z
    .number()
    .min(0, 'Maximum risk score cannot be negative')
    .max(10, 'Maximum risk score cannot exceed 10')
    .optional(),
});

// Settings form schema
export const SettingsFormSchema = z.object({
  language: z.enum(['English', 'Spanish', 'Chinese'], {
    errorMap: () => ({ message: 'Please select a valid language' }),
  }),
  slippage: z.enum(['0.5%', '1%', '3%'], {
    errorMap: () => ({ message: 'Please select a valid slippage tolerance' }),
  }),
  gasPrice: z.enum(['Fast', 'Standard', 'Safe'], {
    errorMap: () => ({ message: 'Please select a valid gas price setting' }),
  }),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }),
  riskTolerance: RiskLevelSchema,
  autoRebalance: z.boolean(),
  rebalanceThreshold: z
    .number()
    .min(1, 'Rebalance threshold must be at least 1%')
    .max(50, 'Rebalance threshold cannot exceed 50%'),
});

// Pool filter schema
export const PoolFilterSchema = z.object({
  minApy: z
    .number()
    .min(0, 'Minimum APY cannot be negative')
    .optional(),
  maxApy: z
    .number()
    .min(0, 'Maximum APY cannot be negative')
    .optional(),
  minTvl: z
    .number()
    .min(0, 'Minimum TVL cannot be negative')
    .optional(),
  tokens: z
    .array(z.string().min(1, 'Token symbol cannot be empty'))
    .optional(),
  status: z.enum(['active', 'inactive', 'paused']).optional(),
}).refine(
  (data) => {
    if (data.minApy !== undefined && data.maxApy !== undefined) {
      return data.minApy <= data.maxApy;
    }
    return true;
  },
  {
    message: 'Minimum APY cannot be greater than maximum APY',
    path: ['minApy'],
  }
);

// Search schema
export const SearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query cannot be empty')
    .max(100, 'Search query cannot exceed 100 characters')
    .trim(),
  filters: PoolFilterSchema.optional(),
  sortBy: z.enum(['apy', 'tvl', 'volume', 'name']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional(),
});

// Wallet connection schema
export const WalletConnectionSchema = z.object({
  publicKey: z
    .string()
    .min(32, 'Invalid public key')
    .max(44, 'Invalid public key')
    .regex(/^[A-Za-z0-9+/]*={0,2}$/, 'Invalid base58 public key format'),
  walletName: z
    .string()
    .min(1, 'Wallet name is required')
    .max(50, 'Wallet name cannot exceed 50 characters'),
});

// Export type inference
export type PortfolioOptimizationFormData = z.infer<typeof PortfolioOptimizationSchema>;
export type SettingsFormData = z.infer<typeof SettingsFormSchema>;
export type PoolFilterFormData = z.infer<typeof PoolFilterSchema>;
export type SearchFormData = z.infer<typeof SearchSchema>;
export type WalletConnectionFormData = z.infer<typeof WalletConnectionSchema>;
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

// Validation utilities
export const validateRiskLevel = (value: unknown): value is RiskLevel => {
  return RiskLevelSchema.safeParse(value).success;
};

export const validatePortfolioOptimization = (data: unknown) => {
  return PortfolioOptimizationSchema.safeParse(data);
};

export const validateSettings = (data: unknown) => {
  return SettingsFormSchema.safeParse(data);
};