import React, { Suspense, lazy } from 'react';
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
        return <SimpleWalletDebug />;
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
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to external service in production
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