import React, { Suspense, lazy } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { useAppStore } from './store/useAppStore';
import { PAGE_VIEWS } from './shared/constants';

// Lazy loading das páginas
const Dashboard = lazy(() => import('./components/Dashboard'));
const Portfolio = lazy(() => import('./components/Portfolio'));
const Analytics = lazy(() => import('./components/Analytics'));
const RiskManagement = lazy(() => import('./components/RiskManagement'));
const Settings = lazy(() => import('./components/Settings'));

function App() {
  const { currentPage } = useAppStore();

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    </div>
  );

  const renderPageComponent = () => {
    switch (currentPage) {
      case PAGE_VIEWS.DASHBOARD:
        return <Dashboard />;
      case PAGE_VIEWS.PORTFOLIO:
        return <Portfolio />;
      case PAGE_VIEWS.ANALYTICS:
        return <Analytics />;
      case PAGE_VIEWS.RISK_MANAGEMENT:
        return <RiskManagement />;
      case PAGE_VIEWS.SETTINGS:
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const renderCurrentPage = () => (
    <Suspense fallback={<LoadingSpinner />}>
      {renderPageComponent()}
    </Suspense>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}

export default App;