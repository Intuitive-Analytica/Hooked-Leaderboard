import { motion, AnimatePresence } from 'framer-motion';
import AgentRow from './AgentRow';
import LoadingSkeleton from './LoadingSkeleton';
import { Agent } from '../types/agent';

interface LeaderboardProps {
  data: Agent[] | null;
  isLoading: boolean;
  error: Error | null;
  view: 'daily' | 'weekly';
}

const Leaderboard = ({ data, isLoading, error, view }: LeaderboardProps) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-500">Failed to load leaderboard data</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">No agents found</p>
      </div>
    );
  }

  // Calculate the maximum revenue for the progress bar
  const maxRevenue = Math.max(...data.map(agent =>
    view === 'daily' ? agent.dailyRevenue : agent.weeklyRevenue
  ));

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {data.map((agent, index) => (
          <motion.div
            key={agent.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              layout: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              delay: index * 0.05,
            }}
          >
            <AgentRow agent={agent} rank={index + 1} view={view} maxRevenue={maxRevenue} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Leaderboard;