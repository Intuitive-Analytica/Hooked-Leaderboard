import { FiDollarSign, FiUsers, FiTrendingUp, FiAward } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface StatsOverviewProps {
  view: 'daily' | 'weekly';
  data: any;
}

const StatsOverview = ({ view, data }: StatsOverviewProps) => {
  const isWeekly = view === 'weekly';
  const timeLabel = isWeekly ? 'This Week' : 'Today';

  const totalRevenue = data?.totalRevenue || 0;
  const totalSales = data?.totalSales || 0;
  const activeAgents = data?.agents?.filter((a: any) => a.sales > 0).length || 0;
  const topPerformer = data?.agents?.[0]?.name || '-';

  const statCards = [
    {
      icon: FiDollarSign,
      label: `Total Revenue ${timeLabel}`,
      value: formatCurrency(totalRevenue),
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      icon: FiTrendingUp,
      label: `Total Sales ${timeLabel}`,
      value: formatNumber(totalSales),
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      icon: FiUsers,
      label: 'Active Agents',
      value: formatNumber(activeAgents),
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      icon: FiAward,
      label: 'Top Performer',
      value: topPerformer,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {stat.label}
              </p>
              {!data ? (
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                  {stat.value}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`text-xl ${stat.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsOverview;