import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AppState } from '../types';
import { APP_CONFIG } from '../shared/constants';

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      currentPage: 'dashboard',
      riskLevel: 'high',
      isOptimizing: false,
      lastOptimizationTime: APP_CONFIG.PORTFOLIO.DEFAULT_LAST_OPTIMIZATION,
      nextRebalanceTime: APP_CONFIG.PORTFOLIO.DEFAULT_NEXT_REBALANCE,
      
      setCurrentPage: (page) => set({ currentPage: page }),
      setRiskLevel: (level) => set({ riskLevel: level }),
      setOptimizing: (isOptimizing) => set({ isOptimizing }),
      updateOptimizationTimes: (lastTime, nextTime) => 
        set({ lastOptimizationTime: lastTime, nextRebalanceTime: nextTime }),
    }),
    { name: 'app-store' }
  )
);