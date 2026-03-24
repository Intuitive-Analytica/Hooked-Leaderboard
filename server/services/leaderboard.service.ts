import { ObjectId } from 'mongodb';
import { startOfDay, startOfWeek } from 'date-fns';
import Lead from '../models/Lead.model';
import AgentMaster from '../models/AgentMaster.model';
import Disposition from '../models/Disposition.model';
import logger from '../utils/logger';

export class LeaderboardService {
  private agencyId: string;

  constructor() {
    this.agencyId = process.env.AGENCY_ID || '694459ed8112d1c6dac765ea';
  }

  async getDailyLeaderboard() {
    try {
      const today = startOfDay(new Date());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const salesData = await this.getSalesData(today, tomorrow);

      return {
        date: today.toISOString(),
        agents: salesData.agents,
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

      const salesData = await this.getSalesData(monday, now);

      return {
        weekStart: monday.toISOString(),
        weekEnd: now.toISOString(),
        agents: salesData.agents,
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