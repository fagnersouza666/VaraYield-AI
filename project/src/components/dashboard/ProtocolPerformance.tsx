import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { PortfolioData } from '../../types';

interface ProtocolPerformanceProps {
  readonly portfolioData: PortfolioData;
}

const ProtocolRow: React.FC<{ 
  readonly protocol: PortfolioData['protocols'][0] 
}> = ({ protocol }) => (
  <div className="grid grid-cols-3 gap-4 px-4 py-4 hover:bg-gray-700/30 transition-colors rounded-xl">
    <div className="text-sm font-medium text-gray-200">{protocol.name}</div>
    <div className="text-sm text-gray-200 font-semibold">{protocol.apy}</div>
    <div className={`text-sm flex items-center font-medium ${
      protocol.positive ? 'text-green-400' : 'text-red-400'
    }`}>
      {protocol.positive ? (
        <ArrowUpRight className="h-4 w-4 mr-1" />
      ) : (
        <ArrowDownRight className="h-4 w-4 mr-1" />
      )}
      {protocol.change}
    </div>
  </div>
);

const ProtocolHeader: React.FC = () => (
  <div className="grid grid-cols-3 gap-4 mb-4 px-4 py-3 bg-gray-700/50 rounded-xl">
    <div className="text-sm font-medium text-gray-300">Protocol</div>
    <div className="text-sm font-medium text-gray-300">Current APY</div>
    <div className="text-sm font-medium text-gray-300">24h Change</div>
  </div>
);

const ProtocolPerformance: React.FC<ProtocolPerformanceProps> = ({ 
  portfolioData 
}) => {
  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Protocol Performance</h2>
          <div className="flex space-x-2">
            <span className="px-3 py-1 text-xs font-medium bg-green-900/30 text-green-400 rounded-full">
              Live Data
            </span>
          </div>
        </div>
        <div className="overflow-hidden">
          <ProtocolHeader />
          <div className="space-y-2">
            {portfolioData.protocols.map((protocol, index) => (
              <ProtocolRow key={index} protocol={protocol} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtocolPerformance;