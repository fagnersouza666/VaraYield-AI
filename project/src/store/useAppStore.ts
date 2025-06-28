import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type PageView = 'dashboard' | 'portfolio' | 'analytics' | 'risk-management' | 'settings';
export type RiskLevel = 'low' | 'medium' | 'high';

interface AppState {
  currentPage: PageView;
  riskLevel: RiskLevel;
  isOptimizing: boolean;
  lastOptimizationTime: string;
  nextRebalanceTime: string;
  
  setCurrentPage: (page: PageView) => void;
  setRiskLevel: (level: RiskLevel) => void;
  setOptimizing: (isOptimizing: boolean) => void;
  updateOptimizationTimes: (lastTime: string, nextTime: string) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      currentPage: 'dashboard',
      riskLevel: 'high',
      isOptimizing: false,
      lastOptimizationTime: 'Today, 14:30 UTC',
      nextRebalanceTime: '2h 15m',
      
      setCurrentPage: (page) => set({ currentPage: page }),
      setRiskLevel: (level) => set({ riskLevel: level }),
      setOptimizing: (isOptimizing) => set({ isOptimizing }),
      updateOptimizationTimes: (lastTime, nextTime) => 
        set({ lastOptimizationTime: lastTime, nextRebalanceTime: nextTime }),
    })
  )
);