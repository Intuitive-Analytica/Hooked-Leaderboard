import { useQuery } from '@tanstack/react-query';
import { fetchDailyLeaderboard, fetchWeeklyLeaderboard } from '../services/api';
import useLeaderboardStore from '../store/leaderboardStore';
import { useEffect } from 'react';

const useLeaderboard = () => {
  const { setDailyData, setWeeklyData, dailyData, weeklyData } = useLeaderboardStore();

  const dailyQuery = useQuery({
    queryKey: ['leaderboard', 'daily'],
    queryFn: fetchDailyLeaderboard,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchIntervalInBackground: true, // Keep refetching even when tab is not focused
    refetchOnWindowFocus: true,
    staleTime: 20000, // Consider data stale after 20 seconds
  });

  const weeklyQuery = useQuery({
    queryKey: ['leaderboard', 'weekly'],
    queryFn: fetchWeeklyLeaderboard,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchIntervalInBackground: true, // Keep refetching even when tab is not focused
    refetchOnWindowFocus: true,
    staleTime: 20000, // Consider data stale after 20 seconds
  });

  useEffect(() => {
    if (dailyQuery.data) {
      setDailyData(dailyQuery.data.agents);
    }
  }, [dailyQuery.data, setDailyData]);

  useEffect(() => {
    if (weeklyQuery.data) {
      setWeeklyData(weeklyQuery.data.agents);
    }
  }, [weeklyQuery.data, setWeeklyData]);

  return {
    dailyData: dailyQuery.data,
    weeklyData: weeklyQuery.data,
    isLoading: dailyQuery.isLoading || weeklyQuery.isLoading,
    error: dailyQuery.error || weeklyQuery.error,
    refetch: () => {
      dailyQuery.refetch();
      weeklyQuery.refetch();
    },
  };
};

export default useLeaderboard;