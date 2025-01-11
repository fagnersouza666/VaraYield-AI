import React from 'react';
import { BarChart3, Wallet, Settings2, TrendingUp, Shield } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', active: true },
    { icon: Wallet, label: 'Portfolio', active: false },
    { icon: TrendingUp, label: 'Analytics', active: false },
    { icon: Shield, label: 'Risk Management', active: false },
    { icon: Settings2, label: 'Settings', active: false },
  ];

  return (
    <aside className="w-72 bg-gray-800 border-r border-gray-700 min-h-screen px-4 py-8">
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href="#"
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  item.active
                    ? 'bg-indigo-600/20 text-indigo-400'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                }`}
              >
                <item.icon className={`h-5 w-5 mr-3 ${item.active ? 'text-indigo-400' : 'text-gray-400'}`} />
                <span className="font-medium">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;