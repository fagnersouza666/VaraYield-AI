import React, { createContext, useContext, ReactNode } from 'react';
import { RaydiumService, HttpRaydiumService, MockRaydiumService } from './api/raydium.service';
import { FetchHttpClient } from './api/http-client';

interface Services {
  raydiumService: RaydiumService;
}

const ServicesContext = createContext<Services | null>(null);

interface ServiceProviderProps {
  children: ReactNode;
  baseUrl?: string;
  useMockServices?: boolean;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ 
  children, 
  baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  useMockServices = import.meta.env.DEV // Use mock services in development by default
}) => {
  const services: Services = React.useMemo(() => {
    if (useMockServices) {
      return {
        raydiumService: new MockRaydiumService(),
      };
    }

    const httpClient = new FetchHttpClient(
      10000, // 10 second timeout
      3      // 3 retries
    );
    
    return {
      raydiumService: new HttpRaydiumService(baseUrl, httpClient),
    };
  }, [baseUrl, useMockServices]);

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = (): Services => {
  const services = useContext(ServicesContext);
  if (!services) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return services;
};

// Individual service hooks for convenience
export const useRaydiumService = (): RaydiumService => {
  const { raydiumService } = useServices();
  return raydiumService;
};

// Hook for accessing services in components that need multiple services
export const useServiceContext = () => {
  const services = useServices();
  return services;
};