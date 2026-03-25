import { TrendData } from '../types/agent';

interface TrendIndicatorProps {
  trend?: TrendData;
  period: 'daily' | 'weekly';
}

const TrendIndicator = ({ trend, period }: TrendIndicatorProps) => {
  if (!trend) {
    return <span className="text-gray-400 text-xs">--</span>;
  }

  // Show -- for neutral (0% change)
  if (trend.value === 0) {
    return <span className="text-gray-400 text-xs">--</span>;
  }

  const isPositive = trend.direction === 'up';
  const color = isPositive ? 'text-green-500' : 'text-red-500';
  const bgColor = isPositive ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20';
  const borderColor = isPositive ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800';
  const arrow = isPositive ? '↑' : '↓';

  return (
    <div className="inline-flex items-center gap-1">
      <span className={`${color} text-xs font-semibold flex items-center`}>
        <span className="text-sm">{arrow}</span>
        <span className="ml-0.5">{Math.abs(trend.value).toFixed(1)}%</span>
      </span>

      {/* Mini sparkline showing trend direction */}
      <svg className="w-6 h-3" viewBox="0 0 24 12">
        <polyline
          fill="none"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth="1.5"
          points={isPositive ? "2,10 12,4 22,2" : "2,2 12,8 22,10"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default TrendIndicator;