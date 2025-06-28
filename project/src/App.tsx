import React from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Portfolio from './components/Portfolio';
import Analytics from './components/Analytics';
import RiskManagement from './components/RiskManagement';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import { useAppStore } from './store/useAppStore';

function App() {
  const { currentPage } = useAppStore();

  const renderCurrentPage = () => {
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