import React from 'react';
import { Zap } from 'lucide-react';

interface OptimizationStatusProps {
  readonly lastOptimizationTime: string;
  readonly nextRebalanceTime: string;
  readonly isOptimizing: boolean;
  readonly loading: boolean;
  readonly onOptimize: () => Promise<void>;
}

const OptimizationInfo: React.FC<{
  readonly lastOptimizationTime: string;
  readonly nextRebalanceTime: string;
}> = ({ lastOptimizationTime, nextRebalanceTime }) => (
  <div className="space-y-2">
    <p className="text-sm text-gray-400 flex items-center">
      <span className="w-32">Next rebalance:</span>
      <span className="font-medium text-gray-200">{nextRebalanceTime}</span>
    </p>
    <p className="text-sm text-gray-400 flex items-center">
      <span className="w-32">Last optimized:</span>
      <span className="font-medium text-gray-200">{lastOptimizationTime}</span>
    </p>
  </div>
);

const OptimizeButton: React.FC<{
  readonly isOptimizing: boolean;
  readonly loading: boolean;
  readonly onOptimize: () => Promise<void>;
}> = ({ isOptimizing, loading, onOptimize }) => {
  const isDisabled = isOptimizing || loading;
  const buttonText = isOptimizing ? 'Optimizing...' : 'Optimize Now';

  return (
    <button 
      onClick={onOptimize}
      disabled={isDisabled}
      className="flex items-center bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-900/20"
    >
      <Zap className={`h-5 w-5 mr-2 ${isOptimizing ? 'animate-spin' : ''}`} />
      {buttonText}
    </button>
  );
};

const OptimizationStatus: React.FC<OptimizationStatusProps> = ({
  lastOptimizationTime,
  nextRebalanceTime,
  isOptimizing,
  loading,
  onOptimize
}) => {
  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            AI Optimization Status
          </h2>
          <OptimizationInfo 
            lastOptimizationTime={lastOptimizationTime}
            nextRebalanceTime={nextRebalanceTime}
          />
        </div>
        <OptimizeButton 
          isOptimizing={isOptimizing}
          loading={loading}
          onOptimize={onOptimize}
        />
      </div>
    </div>
  );
};

export default OptimizationStatus;