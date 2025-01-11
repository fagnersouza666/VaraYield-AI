import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  walletAddress?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  connectWallet: (address: string) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // TODO: Implement actual authentication logic
        set({
          user: { id: '1', email },
          isAuthenticated: true,
        });
      },
      signup: async (email: string, password: string) => {
        // TODO: Implement actual signup logic
        set({
          user: { id: '1', email },
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      connectWallet: (address: string) => {
        set((state) => ({
          user: state.user ? { ...state.user, walletAddress: address } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);