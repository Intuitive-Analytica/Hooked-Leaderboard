import { useState, useEffect } from 'react';
import Leaderboard from '../components/Leaderboard';
import StatsOverview from '../components/StatsOverview';
import useLeaderboard from '../hooks/useLeaderboard';

const Dashboard = () => {
  const { dailyData, weeklyData, isLoading, error } = useLeaderboard();
  const [view, setView] = useState<'daily' | 'weekly'>('daily');

  return (
    <div className="space-y-6">
      <StatsOverview view={view} data={view === 'daily' ? dailyData : weeklyData} />

      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
          Sales Leaderboard
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView('daily')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'daily'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setView('weekly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'weekly'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      <Leaderboard
        data={view === 'daily' ? dailyData?.agents : weeklyData?.agents}
        isLoading={isLoading}
        error={error}
        view={view}
      />
    </div>
  );
};

export default Dashboard;