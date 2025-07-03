import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { SolanaWalletService } from './api/wallet.service';
import { HttpRaydiumService, MockRaydiumService } from './api/raydium.service';
import { HttpPortfolioService, MockPortfolioService } from './api/portfolio.service';
import { PoolAnalyticsService } from './api/pool-analytics.service';
import { TechnicalIndicatorsService, HttpTechnicalIndicatorsService, MockTechnicalIndicatorsService } from './api/technical-indicators.service';
import { AdvancedRiskManagerService, HttpAdvancedRiskManagerService, MockAdvancedRiskManagerService } from './api/advanced-risk-manager.service';
import { RealTimeMonitorService, HttpRealTimeMonitorService } from './api/real-time-monitor.service';
import { FetchHttpClient } from './api/http-client';

interface Services {
  walletService: SolanaWalletService;
  raydiumService: HttpRaydiumService | MockRaydiumService;
  portfolioService: HttpPortfolioService | MockPortfolioService;
  poolAnalyticsService: PoolAnalyticsService;
  technicalIndicatorsService: TechnicalIndicatorsService;
  realTimeMonitorService: RealTimeMonitorService;
  advancedRiskManagerService: AdvancedRiskManagerService;
}

const ServicesContext = createContext<Services | null>(null);

interface ServiceProviderProps {
  children: ReactNode;
  baseUrl?: string;
  useMockServices?: boolean;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({
  children,
  baseUrl = import.meta.env.VITE_API_URL || '/api', // Use relative path instead of localhost
  useMockServices = true // Force mock services for production stability
}) => {
  const { connection } = useConnection();

  const services = useMemo(() => {
    if (useMockServices) {
      return {
        raydiumService: new MockRaydiumService(),
        portfolioService: new MockPortfolioService(),
        technicalIndicatorsService: new MockTechnicalIndicatorsService(),
        advancedRiskManagerService: new MockAdvancedRiskManagerService(),
        realTimeMonitorService: new HttpRealTimeMonitorService(baseUrl),
        walletService: new SolanaWalletService(connection),
        poolAnalyticsService: new PoolAnalyticsService(baseUrl),
      };
    }

    const httpClient = new FetchHttpClient(
      10000, // 10 second timeout
      3      // 3 retries
    );

    const raydiumService = new HttpRaydiumService(baseUrl, httpClient);
    const portfolioService = new HttpPortfolioService(baseUrl, httpClient);
    const technicalIndicatorsService = new HttpTechnicalIndicatorsService(baseUrl);
    const advancedRiskManagerService = new HttpAdvancedRiskManagerService(baseUrl);
    const realTimeMonitorService = new HttpRealTimeMonitorService(baseUrl);
    const walletService = new SolanaWalletService(connection);
    const poolAnalyticsService = new PoolAnalyticsService(baseUrl);

    // Expose wallet service globally for debug purposes
    if (typeof window !== 'undefined') {
      (window as any).varaWalletService = walletService;
      (window as any).varaServices = {
        walletService,
        raydiumService,
        portfolioService,
        poolAnalyticsService,
        technicalIndicatorsService,
        realTimeMonitorService,
        advancedRiskManagerService,
      };
    }

    return {
      walletService,
      raydiumService,
      portfolioService,
      poolAnalyticsService,
      technicalIndicatorsService,
      realTimeMonitorService,
      advancedRiskManagerService,
    };
  }, [baseUrl, useMockServices, connection]);

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = (): Services => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};

// Individual service hooks for convenience
export const useRaydiumService = (): HttpRaydiumService | MockRaydiumService => {
  const { raydiumService } = useServices();
  return raydiumService;
};

export const usePortfolioService = (): HttpPortfolioService | MockPortfolioService => {
  const { portfolioService } = useServices();
  return portfolioService;
};

export const useTechnicalIndicatorsService = (): TechnicalIndicatorsService => {
  const { technicalIndicatorsService } = useServices();
  return technicalIndicatorsService;
};

export const useAdvancedRiskManagerService = (): AdvancedRiskManagerService => {
  const { advancedRiskManagerService } = useServices();
  return advancedRiskManagerService;
};

export const useRealTimeMonitorService = (): RealTimeMonitorService => {
  const { realTimeMonitorService } = useServices();
  return realTimeMonitorService;
};

// Hook for accessing services in components that need multiple services
export const useServiceContext = () => {
  const services = useServices();
  return services;
};