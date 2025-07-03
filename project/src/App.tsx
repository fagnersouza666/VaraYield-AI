import React, { Suspense, lazy, useEffect } from 'react';
import { QueryProvider } from './contexts/QueryProvider';
import { ServiceProvider } from './services/service-provider';
import { WalletProvider } from './components/WalletProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { useAppStore } from './store/useAppStore';
import { PAGE_VIEWS } from './shared/constants';
import { WalletConnectionDebug } from './components/debug/WalletConnectionDebug';
import { WalletDebugger } from './components/debug/WalletDebugger';
import { resolveWalletProviderConflicts } from './utils/wallet-provider-fix';
import { errorLogger } from './services/error-logger.service';
import { interceptLocalhostRequests } from './services/api/mock-api-server';
import { testBufferPolyfill } from './utils/buffer-test';
import { handleRaydiumError, solanaErrorHandler } from './utils/solana-error-handler';
import { safeRaydiumService } from './services/safe-raydium.service';
import { raydiumSDKPatch } from './utils/raydium-sdk-patch';

// Lazy loading das páginas
const Dashboard = lazy(() => import('./components/Dashboard'));
const Portfolio = lazy(() => import('./components/Portfolio'));
const Analytics = lazy(() => import('./components/Analytics'));
const RiskManagement = lazy(() => import('./components/RiskManagement'));
const Settings = lazy(() => import('./components/Settings'));
const SimpleWalletDebug = lazy(() => import('./components/debug/SimpleWalletDebug'));
const PoolAnalyticsDashboard = lazy(() => import('./components/pools/PoolAnalyticsDashboard'));

const AppContent: React.FC = () => {
  const { currentPage } = useAppStore();

  const renderPageComponent = () => {
    switch (currentPage) {
      case PAGE_VIEWS.DASHBOARD:
        return <Dashboard />;
      case PAGE_VIEWS.PORTFOLIO:
        return <Portfolio />;
      case PAGE_VIEWS.ANALYTICS:
        return <Analytics />;
      case PAGE_VIEWS.POOL_ANALYTICS:
        return <PoolAnalyticsDashboard />;
      case PAGE_VIEWS.RISK_MANAGEMENT:
        return <RiskManagement />;
      case PAGE_VIEWS.SETTINGS:
        return <Settings />;
      case PAGE_VIEWS.DEBUG:
        return <WalletDebugger />;
      default:
        return <Dashboard />;
    }
  };

  const renderCurrentPage = () => (
    <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." />}>
      <ErrorBoundary>
        {renderPageComponent()}
      </ErrorBoundary>
    </Suspense>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <ErrorBoundary>
        <Header />
      </ErrorBoundary>
      <div className="flex">
        <ErrorBoundary>
          <Sidebar />
        </ErrorBoundary>
        <main className="flex-1 p-8">
          {renderCurrentPage()}
        </main>
      </div>
      <WalletConnectionDebug />
    </div>
  );
};

function App() {
  useEffect(() => {
    // Apply Raydium SDK patches FIRST (before any SDK operations)
    raydiumSDKPatch.applyPatches();
    
    // Initialize localhost request interceptor (prevents connection errors)
    interceptLocalhostRequests();
    
    // Initialize wallet provider conflict resolution
    resolveWalletProviderConflicts();
    
    // Initialize error monitoring
    errorLogger.logInfo({
      message: 'VaraYield AI application started',
      details: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        interceptorsEnabled: true,
        raydiumPatchesApplied: true
      },
      context: {
        component: 'App'
      }
    });

    // Test Buffer polyfill
    setTimeout(() => {
      const bufferTestResult = testBufferPolyfill();
      if (!bufferTestResult.success) {
        errorLogger.logError({
          category: 'UNKNOWN_ERROR',
          message: 'Buffer polyfill validation failed',
          details: bufferTestResult,
          context: {
            component: 'App',
            operation: 'bufferPolyfillTest'
          }
        });
      }
    }, 1000);

    // Expose utilities globally for debugging
    if (typeof window !== 'undefined') {
      (window as any).errorLogger = errorLogger;
      (window as any).testErrorMonitoring = () => {
        return import('./utils/test-error-monitoring').then(module => 
          module.testErrorMonitoring()
        );
      };
      (window as any).resolveWalletConflicts = resolveWalletProviderConflicts;
      (window as any).testBufferPolyfill = testBufferPolyfill;
      (window as any).solanaErrorHandler = solanaErrorHandler;
      (window as any).safeRaydiumService = safeRaydiumService;
      (window as any).raydiumSDKPatch = raydiumSDKPatch;
    }
  }, []);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Try to handle Solana/Raydium specific errors first
        const wasSolanaError = handleRaydiumError(error, {
          componentStack: errorInfo.componentStack,
          url: window.location.href
        });

        if (!wasSolanaError) {
          // Log to our error monitoring system for non-Solana errors
          errorLogger.logError({
            category: 'UNKNOWN_ERROR',
            message: 'App-level React error boundary triggered',
            details: {
              error: error.message,
              stack: error.stack,
              componentStack: errorInfo.componentStack
            },
            context: {
              component: 'App',
              url: window.location.href
            }
          });
        } else {
          console.warn('⚠️ Solana account error handled gracefully, app should continue working');
        }
        
        console.error('App-level error:', error, errorInfo);
      }}
    >
      <WalletProvider>
        <QueryProvider>
          <ServiceProvider>
            <AppContent />
          </ServiceProvider>
        </QueryProvider>
      </WalletProvider>
    </ErrorBoundary>
  );
}

export default App;