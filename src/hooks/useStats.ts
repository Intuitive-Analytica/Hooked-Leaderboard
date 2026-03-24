import { useQuery } from '@tanstack/react-query';
import { fetchStats } from '../services/api';

interface Stats {
  totalRevenue: number;
  totalSales: number;
  activeAgents: number;
  topPerformer: string;
}

const useStats = () => {
  const { data: stats, isLoading, error } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: fetchStats,
    refetchInterval: 30000,
  });

  return {
    stats,
    isLoading,
    error,
  };
};

export default useStats;