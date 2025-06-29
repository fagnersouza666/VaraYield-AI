import React, { Suspense, lazy } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { useAppStore } from './store/useAppStore';

// Lazy loading das páginas
const Dashboard = lazy(() => import('./components/Dashboard'));
const Portfolio = lazy(() => import('./components/Portfolio'));
const Analytics = lazy(() => import('./components/Analytics'));
const RiskManagement = lazy(() => import('./components/RiskManagement'));
const Settings = lazy(() => import('./components/Settings'));

function App() {
  const { currentPage } = useAppStore();

  const renderCurrentPage = () => {
    const LoadingSpinner = () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );

    return (
      <Suspense fallback={<LoadingSpinner />}>
        {(() => {
          switch (currentPage) {
            case 'dashboard':
              return <Dashboard />;
            case 'portfolio':
              return <Portfolio />;
            case 'analytics':
              return <Analytics />;
            case 'risk-management':
              return <RiskManagement />;
            case 'settings':
              return <Settings />;
            default:
              return <Dashboard />;
          }
        })()}
      </Suspense>
    );
  };

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