import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Wallet, Globe, Moon, Sun } from 'lucide-react';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoOptimize, setAutoOptimize] = useState(true);

  const settingsSections = [
    {
      title: 'General',
      icon: SettingsIcon,
      settings: [
        {
          name: 'Dark Mode',
          description: 'Switch between light and dark theme',
          type: 'toggle',
          value: darkMode,
          onChange: setDarkMode,
          icon: darkMode ? Moon : Sun
        },
        {
          name: 'Language',
          description: 'Select your preferred language',
          type: 'select',
          value: 'English',
          options: ['English', 'Portuguese', 'Spanish', 'French'],
          icon: Globe
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        {
          name: 'Push Notifications',
          description: 'Receive notifications about your portfolio',
          type: 'toggle',
          value: notifications,
          onChange: setNotifications
        },
        {
          name: 'Email Alerts',
          description: 'Get email updates for important events',
          type: 'toggle',
          value: true,
          onChange: () => {}
        },
        {
          name: 'Rebalance Alerts',
          description: 'Notify when portfolio needs rebalancing',
          type: 'toggle',
          value: true,
          onChange: () => {}
        }
      ]
    },
    {
      title: 'Trading',
      icon: Wallet,
      settings: [
        {
          name: 'Auto-Optimize',
          description: 'Allow automatic portfolio optimization',
          type: 'toggle',
          value: autoOptimize,
          onChange: setAutoOptimize
        },
        {
          name: 'Slippage Tolerance',
          description: 'Maximum slippage for trades',
          type: 'select',
          value: '1%',
          options: ['0.5%', '1%', '2%', '5%']
        },
        {
          name: 'Gas Price',
          description: 'Transaction priority level',
          type: 'select',
          value: 'Normal',
          options: ['Low', 'Normal', 'High', 'Custom']
        }
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      settings: [
        {
          name: 'Transaction Confirmation',
          description: 'Require confirmation for all transactions',
          type: 'toggle',
          value: true,
          onChange: () => {}
        },
        {
          name: 'Biometric Authentication',
          description: 'Use fingerprint or face ID',
          type: 'toggle',
          value: false,
          onChange: () => {}
        }
      ]
    }
  ];

  const renderSetting = (setting: { name: string; description: string; type: string; value: string | boolean; onChange?: (value: boolean) => void; icon?: React.ComponentType<{ className?: string }>; options?: string[] }, index: number) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
            <div className="flex items-center space-x-3">
              {setting.icon && <setting.icon className="h-5 w-5 text-gray-400" />}
              <div>
                <h3 className="font-semibold text-white">{setting.name}</h3>
                <p className="text-sm text-gray-400">{setting.description}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={setting.value}
                onChange={(e) => setting.onChange?.(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        );
      
      case 'select':
        return (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
            <div className="flex items-center space-x-3">
              {setting.icon && <setting.icon className="h-5 w-5 text-gray-400" />}
              <div>
                <h3 className="font-semibold text-white">{setting.name}</h3>
                <p className="text-sm text-gray-400">{setting.description}</p>
              </div>
            </div>
            <select className="bg-gray-600 text-white px-3 py-2 rounded-lg text-sm border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {setting.options?.map((option: string) => (
                <option key={option} value={option} selected={option === setting.value}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <SettingsIcon className="h-6 w-6 text-indigo-400" />
      </div>

      {settingsSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <section.icon className="h-6 w-6 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">{section.title}</h2>
          </div>
          <div className="space-y-4">
            {section.settings.map((setting, index) => renderSetting(setting, index))}
          </div>
        </div>
      ))}

      {/* Account Information */}
      <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Account Information</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
            <div>
              <h3 className="font-semibold text-white">Version</h3>
              <p className="text-sm text-gray-400">VaraYield AI v1.0.0</p>
            </div>
            <span className="text-sm text-indigo-400">Latest</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
            <div>
              <h3 className="font-semibold text-white">Network</h3>
              <p className="text-sm text-gray-400">Solana Mainnet</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-green-400">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;