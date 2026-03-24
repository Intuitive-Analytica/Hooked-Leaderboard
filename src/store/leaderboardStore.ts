import { create } from 'zustand';
import { Agent } from '../types/agent';

interface LeaderboardStore {
  dailyData: Agent[] | null;
  weeklyData: Agent[] | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  setDailyData: (data: Agent[]) => void;
  setWeeklyData: (data: Agent[]) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'connecting') => void;
}

const useLeaderboardStore = create<LeaderboardStore>((set) => ({
  dailyData: null,
  weeklyData: null,
  connectionStatus: 'disconnected',

  setDailyData: (data) => set({ dailyData: data }),

  setWeeklyData: (data) => set({ weeklyData: data }),

  updateAgent: (agentId, updates) =>
    set((state) => ({
      dailyData: state.dailyData?.map((agent) =>
        agent.id === agentId ? { ...agent, ...updates } : agent
      ) || null,
      weeklyData: state.weeklyData?.map((agent) =>
        agent.id === agentId ? { ...agent, ...updates } : agent
      ) || null,
    })),

  setConnectionStatus: (status) => set({ connectionStatus: status }),
}));

export default useLeaderboardStore;