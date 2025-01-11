import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  BarChart3, 
  Settings, 
  RefreshCw,
  TrendingUp,
  Shield,
  Activity,
  DollarSign,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

function App() {
  const [riskLevel, setRiskLevel] = useState('moderate');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [protocols, setProtocols] = useState([
    { name: 'Raydium LP', apy: '12.5', allocation: 40, risk: 'Moderate', change: 0 },
    { name: 'Serum DEX', apy: '8.2', allocation: 30, risk: 'Low', change: 0 },
    { name: 'Marinade Staking', apy: '6.8', allocation: 20, risk: 'Low', change: 0 },
    { name: 'Port Finance', apy: '15.3', allocation: 10, risk: 'High', change: 0 },
  ]);
  const [totalApy, setTotalApy] = useState(9.8);
  const [optimizationStage, setOptimizationStage] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const stages = [
    'Analyzing market conditions...',
    'Calculating optimal allocations...',
    'Simulating returns...',
    'Finalizing strategy...'
  ];

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setOptimizationStage(0);
    setShowSuccess(false);

    // Simulate optimization process
    for (let i = 0; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOptimizationStage(i + 1);
    }

    // Calculate new allocations based on risk level
    const newProtocols = protocols.map(protocol => {
      let allocationChange = 0;
      switch (riskLevel) {
        case 'aggressive':
          allocationChange = protocol.risk === 'High' ? 10 : -5;
          break;
        case 'conservative':
          allocationChange = protocol.risk === 'Low' ? 10 : -5;
          break;
        default:
          allocationChange = Math.floor(Math.random() * 11) - 5;
      }
      
      return {
        ...protocol,
        allocation: Math.max(5, Math.min(60, protocol.allocation + allocationChange)),
        change: allocationChange,
        apy: (parseFloat(protocol.apy) + (Math.random() * 2 - 1)).toFixed(1)
      };
    });

    // Normalize allocations to 100%
    const totalAllocation = newProtocols.reduce((sum, p) => sum + p.allocation, 0);
    const normalizedProtocols = newProtocols.map(p => ({
      ...p,
      allocation: Math.round((p.allocation / totalAllocation) * 100)
    }));

    // Calculate new total APY
    const newTotalApy = normalizedProtocols.reduce(
      (sum, p) => sum + (parseFloat(p.apy) * p.allocation / 100),
      0
    );

    await new Promise(resolve => setTimeout(resolve, 500));
    setProtocols(normalizedProtocols);
    setTotalApy(parseFloat(newTotalApy.toFixed(1)));
    setIsOptimizing(false);
    setShowSuccess(true);
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 p-4 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold">VaraYield AI</span>
          </div>
          <button className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors">
            <Wallet className="h-5 w-5" />
            <span>Connect Wallet</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <h3 className="text-gray-400">Total Value Locked</h3>
            </div>
            <p className="text-2xl font-bold">$123,456</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-5 w-5 text-blue-400" />
              <h3 className="text-gray-400">Current APY</h3>
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold">{totalApy}%</p>
              {showSuccess && (
                <span className="text-green-400 text-sm">
                  <ArrowUp className="h-4 w-4 inline" /> Optimized
                </span>
              )}
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-5 w-5 text-purple-400" />
              <h3 className="text-gray-400">Risk Level</h3>
            </div>
            <select 
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white rounded-lg p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-500/20 transition-all"
            >
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>
        </div>

        {/* Main Actions */}
        <div className="flex flex-col items-center mb-8">
          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-8 py-4 rounded-xl text-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Optimizing...</span>
              </>
            ) : (
              <>
                <BarChart3 className="h-5 w-5" />
                <span>Optimize Yield</span>
              </>
            )}
          </button>
          {isOptimizing && (
            <div className="mt-4 text-gray-400">
              {stages[optimizationStage]}
            </div>
          )}
        </div>

        {/* Protocol Allocation Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold">Current Allocation</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left">Protocol</th>
                  <th className="px-6 py-3 text-left">APY</th>
                  <th className="px-6 py-3 text-left">Allocation</th>
                  <th className="px-6 py-3 text-left">Risk Level</th>
                  <th className="px-6 py-3 text-left">Change</th>
                </tr>
              </thead>
              <tbody>
                {protocols.map((protocol, index) => (
                  <tr key={index} className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">{protocol.name}</td>
                    <td className="px-6 py-4 text-green-400">{protocol.apy}%</td>
                    <td className="px-6 py-4">{protocol.allocation}%</td>
                    <td className="px-6 py-4">{protocol.risk}</td>
                    <td className="px-6 py-4">
                      {protocol.change !== 0 && (
                        <span className={`flex items-center ${protocol.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {protocol.change > 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                          {Math.abs(protocol.change)}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
