import { useState, useEffect, useMemo } from 'react';
import Leaderboard from '../components/Leaderboard';
import StatsOverview from '../components/StatsOverview';
import useLeaderboard from '../hooks/useLeaderboard';

const Dashboard = () => {
  const { dailyData, weeklyData, isLoading, error } = useLeaderboard();
  const [view, setView] = useState<'daily' | 'weekly'>('daily');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAgents = useMemo(() => {
    const agents = view === 'daily' ? dailyData?.agents : weeklyData?.agents;
    if (!agents || !searchTerm.trim()) return agents;

    return agents.filter(agent =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [dailyData?.agents, weeklyData?.agents, view, searchTerm]);

  return (
    <div className="space-y-6">
      <StatsOverview view={view} data={view === 'daily' ? dailyData : weeklyData} />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
              {(view === 'daily' ? dailyData?.agencyName : weeklyData?.agencyName) || 'Sales Leaderboard'}
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text
                         placeholder-gray-500 dark:placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Clear search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchTerm && filteredAgents && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredAgents.length} of {(view === 'daily' ? dailyData?.agents?.length : weeklyData?.agents?.length) || 0} agents
              </span>
            )}
          </div>
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
      </div>

      <Leaderboard
        data={filteredAgents}
        isLoading={isLoading}
        error={error}
        view={view}
      />
    </div>
  );
};

export default Dashboard;