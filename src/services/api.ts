import axios from 'axios';
import { LeaderboardData } from '../types/agent';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const fetchDailyLeaderboard = async (): Promise<LeaderboardData> => {
  const response = await api.get('/leaderboard/daily');
  return response.data;
};

export const fetchWeeklyLeaderboard = async (): Promise<LeaderboardData> => {
  const response = await api.get('/leaderboard/weekly');
  return response.data;
};

export const fetchStats = async () => {
  const response = await api.get('/analytics/summary');
  return response.data;
};

export const fetchAgentDetails = async (agentId: string) => {
  const response = await api.get(`/agents/${agentId}`);
  return response.data;
};

export const fetchAgentHistory = async (
  agentId: string,
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await api.get(`/agents/${agentId}/history?${params.toString()}`);
  return response.data;
};

export default api;