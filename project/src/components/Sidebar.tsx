import React from 'react';
import { BarChart3, Wallet, Settings2, TrendingUp, Shield, Bug, Activity } from 'lucide-react';
import { useAppStore, PageView } from '../store/useAppStore';

const Sidebar = () => {
  const { currentPage, setCurrentPage } = useAppStore();
  
  const menuItems: { icon: React.ComponentType<{ className?: string }>; label: string; page: PageView }[] = [
    { icon: BarChart3, label: 'Dashboard', page: 'dashboard' },
    { icon: Wallet, label: 'Portfolio', page: 'portfolio' },
    { icon: TrendingUp, label: 'Analytics', page: 'analytics' },
    { icon: Activity, label: 'Pool Analytics', page: 'pool-analytics' },
    { icon: Shield, label: 'Risk Management', page: 'risk-management' },
    { icon: Settings2, label: 'Settings', page: 'settings' },
  ];

  const debugItems: { icon: React.ComponentType<{ className?: string }>; label: string; page: PageView }[] = [
    { icon: Bug, label: 'Wallet Debug', page: 'debug' },
  ];

  return (
    <aside className="w-72 bg-gray-800 border-r border-gray-700 min-h-screen px-4 py-8">
      <nav className="space-y-8">
        <div>
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => setCurrentPage(item.page)}
                  className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                    currentPage === item.page
                      ? 'bg-indigo-600/20 text-indigo-400'
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                  }`}
                >
                  <item.icon className={`h-5 w-5 mr-3 ${currentPage === item.page ? 'text-indigo-400' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Debug Tools</h3>
            <ul className="space-y-2">
              {debugItems.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => setCurrentPage(item.page)}
                    className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                      currentPage === item.page
                        ? 'bg-yellow-600/20 text-yellow-400'
                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 mr-3 ${currentPage === item.page ? 'text-yellow-400' : 'text-gray-400'}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;