import { motion } from 'framer-motion';
import { Agent } from '../types/agent';
import { formatCurrency, formatNumber } from '../utils/formatters';
import TrendIndicator from './TrendIndicator';

interface AgentRowProps {
  agent: Agent;
  rank: number;
  view: 'daily' | 'weekly';
  maxRevenue: number;
}

const AgentRow = ({ agent, rank, view, maxRevenue }: AgentRowProps) => {

  const sales = view === 'daily' ? agent.dailySales : agent.weeklySales;
  const revenue = view === 'daily' ? agent.dailyRevenue : agent.weeklyRevenue;
  const progressPercentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
  const avgDeal = sales > 0 ? revenue / sales : 0;

  return (
    <motion.div
      className="leaderboard-row card py-4 px-4"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-4 w-full">
        {/* Rank and avatar */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-400 dark:text-gray-500 w-6 text-center">
            {rank}
          </span>
          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 font-semibold text-sm">
            {agent.name.split(' ').map(n => n[0]?.toUpperCase()).join('').slice(0, 2)}
          </div>
        </div>

        {/* Agent info and progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900 dark:text-dark-text truncate">
                {agent.name}
              </h3>
              <TrendIndicator
                trend={view === 'daily' ? agent.dailyTrend : agent.weeklyTrend}
                period={view}
              />
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 ml-4">
              <span className="hidden sm:flex items-center gap-1">
                <span className="text-gray-900 dark:text-dark-text font-semibold">{formatCurrency(avgDeal)}</span>
                <span>DEAL AVG.</span>
              </span>
              <span className="hidden sm:flex items-center gap-1">
                <span className="text-gray-900 dark:text-dark-text font-semibold">{formatNumber(sales)}</span>
                <span>CLOSED</span>
              </span>
            </div>
          </div>

          {/* Progress bar with revenue pill */}
          <div className="relative">
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-visible relative">
              <motion.div
                className="h-full rounded-full relative overflow-visible"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressPercentage, 80)}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: rank * 0.05 }}
                style={{
                  backgroundColor: '#7839ee'
                }}
              >
                {/* Revenue pill at the end of the progress bar */}
                <div className="absolute right-0 top-1/2 bg-[#7839ee] text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-md z-10"
                  style={{
                    transform: 'translateY(-50%) translateX(50%)'
                  }}
                >
                  {formatCurrency(revenue)}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Additional metrics for mobile */}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400 sm:hidden">
            <span className="flex items-center gap-1">
              <span className="text-gray-900 dark:text-dark-text font-semibold">{formatCurrency(avgDeal)}</span>
              <span>AVG</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-gray-900 dark:text-dark-text font-semibold">{formatNumber(sales)}</span>
              <span>CLOSED</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AgentRow;