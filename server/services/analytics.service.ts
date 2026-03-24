import { LeaderboardService } from './leaderboard.service';
import { startOfDay, subDays } from 'date-fns';

export class AnalyticsService {
  private leaderboardService: LeaderboardService;

  constructor() {
    this.leaderboardService = new LeaderboardService();
  }

  async getSummary() {
    const stats = await this.leaderboardService.getTodayStats();
    return stats;
  }

  async getTrends() {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return startOfDay(date);
    }).reverse();

    const dailyData = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const dayData = await this.leaderboardService.getDailyLeaderboard();

        return {
          date: date.toISOString().split('T')[0],
          totalSales: dayData.totalSales || 0,
          totalRevenue: dayData.totalRevenue || 0,
          activeAgents: dayData.agents.filter((a: any) => a.sales > 0).length,
        };
      })
    );

    const weekTotal = dailyData.reduce((sum, day) => sum + day.totalRevenue, 0);
    const avgDaily = weekTotal / 7;
    const remainingDays = 7 - new Date().getDay();
    const projectedWeek = weekTotal + (avgDaily * remainingDays);
    const projectedMonth = avgDaily * 30;

    return {
      daily: dailyData,
      predictions: {
        endOfWeek: Math.round(projectedWeek),
        endOfMonth: Math.round(projectedMonth),
      },
    };
  }

  async getRankings() {
    const currentData = await this.leaderboardService.getDailyLeaderboard();
    const agents = currentData.agents || [];

    const movements = {
      up: 0,
      down: 0,
      unchanged: agents.length,
    };

    const topPerformers = agents.slice(0, 3).map((a: any) => a.id);

    return {
      movements,
      topPerformers,
      mostImproved: agents[0]?.id || null,
      streaks: {},
    };
  }
}