import React from 'react';
import type { RiskLevel } from '../../types';
import { RISK_LEVELS } from '../../shared/constants';

interface RiskSelectorProps {
  readonly currentRiskLevel: RiskLevel;
  readonly onRiskLevelChange: (level: RiskLevel) => void;
}

const RiskSelector: React.FC<RiskSelectorProps> = ({ 
  currentRiskLevel, 
  onRiskLevelChange 
}) => {
  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-medium">Risk Level</h3>
      </div>
      <div className="flex space-x-3">
        {RISK_LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => onRiskLevelChange(level)}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              currentRiskLevel === level
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RiskSelector;