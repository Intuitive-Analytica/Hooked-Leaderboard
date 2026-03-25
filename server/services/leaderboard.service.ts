import { ObjectId } from 'mongodb';
import { startOfDay, startOfWeek } from 'date-fns';
import Lead from '../models/Lead.model';
import AgentMaster from '../models/AgentMaster.model';
import AgencyMaster from '../models/AgencyMaster.model';
import Disposition from '../models/Disposition.model';
import logger from '../utils/logger';

export class LeaderboardService {
  private agencyId: string;

  constructor() {
    this.agencyId = process.env.AGENCY_ID || '694459ed8112d1c6dac765ea';
  }

  private async getAgencyName(): Promise<string> {
    try {
      const agency = await AgencyMaster.findById(this.agencyId).lean();
      return agency?.agencyName || 'Sales Leaderboard';
    } catch (error) {
      logger.error('Error fetching agency name:', error);
      return 'Sales Leaderboard';
    }
  }

  async getDailyLeaderboard() {
    try {
      const today = startOfDay(new Date());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's data
      const salesData = await this.getSalesData(today, tomorrow);

      // Get yesterday's data for trend calculation
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dayBeforeYesterday = new Date(today);
      const yesterdayData = await this.getSalesData(yesterday, today);

      // Create a map of yesterday's revenue by agent ID
      const yesterdayRevenueMap: { [key: string]: number } = {};
      yesterdayData.agents.forEach(agent => {
        yesterdayRevenueMap[agent.id] = agent.revenue;
      });

      // Add trend data to each agent
      const agentsWithTrends = salesData.agents.map(agent => {
        const yesterdayRevenue = yesterdayRevenueMap[agent.id] || 0;
        let trendValue = 0;
        let direction: 'up' | 'down' | 'neutral' = 'neutral';

        if (yesterdayRevenue > 0) {
          trendValue = ((agent.revenue - yesterdayRevenue) / yesterdayRevenue) * 100;
          direction = trendValue > 0 ? 'up' : trendValue < 0 ? 'down' : 'neutral';
        } else if (agent.revenue > 0) {
          // If no revenue yesterday but revenue today, show as 100% up
          trendValue = 100;
          direction = 'up';
        }

        return {
          ...agent,
          dailyTrend: {
            value: trendValue,
            direction,
            yesterdayRevenue
          }
        };
      });

      const agencyName = await this.getAgencyName();

      return {
        date: today.toISOString(),
        agencyName,
        agents: agentsWithTrends,
        totalSales: salesData.totalSales,
        totalRevenue: salesData.totalRevenue,
        lastUpdated: new Date(),
      };
    } catch (error) {
      logger.error('Error getting daily leaderboard:', error);
      throw error;
    }
  }

  async getWeeklyLeaderboard() {
    try {
      const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
      monday.setHours(0, 0, 0, 0);
      const now = new Date();

      // Get this week's data
      const salesData = await this.getSalesData(monday, now);

      // Get last week's data for the same period (Monday to same day of week)
      const lastMonday = new Date(monday);
      lastMonday.setDate(lastMonday.getDate() - 7);
      const lastWeekSameTime = new Date(now);
      lastWeekSameTime.setDate(lastWeekSameTime.getDate() - 7);
      const lastWeekData = await this.getSalesData(lastMonday, lastWeekSameTime);

      // Create a map of last week's revenue by agent ID
      const lastWeekRevenueMap: { [key: string]: number } = {};
      lastWeekData.agents.forEach(agent => {
        lastWeekRevenueMap[agent.id] = agent.revenue;
      });

      // Add trend data to each agent
      const agentsWithTrends = salesData.agents.map(agent => {
        const lastWeekRevenue = lastWeekRevenueMap[agent.id] || 0;
        let trendValue = 0;
        let direction: 'up' | 'down' | 'neutral' = 'neutral';

        if (lastWeekRevenue > 0) {
          trendValue = ((agent.revenue - lastWeekRevenue) / lastWeekRevenue) * 100;
          direction = trendValue > 0 ? 'up' : trendValue < 0 ? 'down' : 'neutral';
        } else if (agent.revenue > 0) {
          // If no revenue last week but revenue this week, show as 100% up
          trendValue = 100;
          direction = 'up';
        }

        return {
          ...agent,
          weeklyTrend: {
            value: trendValue,
            direction,
            lastWeekRevenue
          }
        };
      });

      const agencyName = await this.getAgencyName();

      return {
        weekStart: monday.toISOString(),
        weekEnd: now.toISOString(),
        agencyName,
        agents: agentsWithTrends,
        totalSales: salesData.totalSales,
        totalRevenue: salesData.totalRevenue,
        lastUpdated: new Date(),
      };
    } catch (error) {
      logger.error('Error getting weekly leaderboard:', error);
      throw error;
    }
  }

  private async getSalesData(startDate: Date, endDate: Date) {
    try {
      const closedDispositions = await Disposition.find({
        status: { $regex: /^Closed/i },
        description: {
          $nin: ['Previously Sold', 'Fake', 'test des', 'test dispo long test dispo long g test dispo long', 'Test sale close']
        }
      }).lean();

      const closedDispositionIds = closedDispositions.map(d => d._id);

      // For accurate daily sales tracking:
      // We use salesDate as the source of truth for when a sale should be credited
      // But we exclude future-dated sales to prevent counting sales before they actually occur
      // salesDate >= startDate AND salesDate < endDate ensures we only count sales for the specific period
      const soldLeads = await Lead.find({
        agencyId: new ObjectId(this.agencyId),
        dispositionId: { $in: closedDispositionIds },
        salesDate: {
          $gte: startDate,
          $lt: endDate
        }
      }).lean();

      const agentIds = [...new Set(soldLeads.map(lead => lead.agentId?.toString()).filter(Boolean))];

      const agentDetails = await AgentMaster.find({
        _id: { $in: agentIds.map(id => new ObjectId(id)) },
        isActive: '1',
        softDelete: { $ne: '1' }
      }).lean();

      const agentMap: { [key: string]: any } = {};
      agentDetails.forEach(agent => {
        const fullName = `${agent.fname || ''} ${agent.lname || ''}`.trim() || 'Unknown Agent';
        agentMap[agent._id.toString()] = {
          id: agent._id.toString(),
          name: fullName,
          email: agent.email,
          sales: 0,
          revenue: 0,
        };
      });

      // Create a set of active agent IDs for quick lookup
      const activeAgentIds = new Set(agentDetails.map(a => a._id.toString()));

      // Only count sales for active agents
      soldLeads.forEach(lead => {
        const agentId = lead.agentId?.toString();
        if (agentId && activeAgentIds.has(agentId) && agentMap[agentId]) {
          agentMap[agentId].sales += 1;
          agentMap[agentId].revenue += lead.earning || lead.amount || 0;
        }
      });

      const agents = Object.values(agentMap)
        .sort((a, b) => {
          // Primary sort by revenue, secondary by sales count if revenue is equal
          if (b.revenue !== a.revenue) {
            return b.revenue - a.revenue;
          }
          return b.sales - a.sales;
        })
        .map((agent, index) => ({
          ...agent,
          rank: index + 1,
          dailySales: agent.sales,
          dailyRevenue: agent.revenue,
          weeklySales: agent.sales,
          weeklyRevenue: agent.revenue,
          isActive: true,
        }));

      const totalSales = agents.reduce((sum, agent) => sum + agent.sales, 0);
      const totalRevenue = agents.reduce((sum, agent) => sum + agent.revenue, 0);

      return {
        agents,
        totalSales,
        totalRevenue,
      };
    } catch (error) {
      logger.error('Error getting sales data:', error);
      throw error;
    }
  }

  async getTopPerformer() {
    const today = startOfDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const salesData = await this.getSalesData(today, tomorrow);
    return salesData.agents[0]?.name || 'N/A';
  }

  async getTodayStats() {
    const today = startOfDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const salesData = await this.getSalesData(today, tomorrow);
    const activeAgents = salesData.agents.filter(a => a.sales > 0).length;

    return {
      totalSales: salesData.totalSales,
      totalRevenue: salesData.totalRevenue,
      activeAgents,
      topPerformer: salesData.agents[0]?.name || 'N/A',
    };
  }
}