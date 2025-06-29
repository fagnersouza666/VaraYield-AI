import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AppState } from '../types';

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
    }),
    { name: 'app-store' }
  )
);