import Agent from '../models/Agent.model';
import Sale from '../models/Sale.model';
import { broadcastSaleUpdate } from './websocket.service';
import logger from '../utils/logger';

export class SalesService {
  async recordSale(saleData: any) {
    try {
      const agent = await Agent.findById(saleData.agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      const sale = new Sale({
        agentId: saleData.agentId,
        amount: saleData.saleAmount,
        productId: saleData.productId,
        customerId: saleData.customerId,
        source: saleData.metadata?.source,
        dealType: saleData.metadata?.dealType,
        timestamp: saleData.timestamp || new Date(),
      });

      await sale.save();

      agent.dailySales += 1;
      agent.dailyRevenue += saleData.saleAmount;
      agent.weeklySales += 1;
      agent.weeklyRevenue += saleData.saleAmount;
      agent.monthlySales += 1;
      agent.monthlyRevenue += saleData.saleAmount;
      agent.totalSales += 1;
      agent.totalRevenue += saleData.saleAmount;
      agent.lastSaleTime = new Date();
      agent.averageTicketSize = agent.totalRevenue / agent.totalSales;

      await agent.save();

      const previousRank = await this.getAgentRank(agent._id.toString());

      await this.updateLeaderboardRankings();

      const newRank = await this.getAgentRank(agent._id.toString());

      broadcastSaleUpdate({
        agentId: agent._id.toString(),
        agentName: agent.name,
        saleAmount: saleData.saleAmount,
        dailySales: agent.dailySales,
        dailyRevenue: agent.dailyRevenue,
        weeklySales: agent.weeklySales,
        weeklyRevenue: agent.weeklyRevenue,
        previousRank,
        newRank,
      });

      logger.info(`Sale recorded for agent ${agent.name}: $${saleData.saleAmount}`);

      return {
        saleId: sale._id.toString(),
        processed: true,
        agentStats: {
          newDailyTotal: agent.dailyRevenue,
          newWeeklyTotal: agent.weeklyRevenue,
          newRank,
        },
      };
    } catch (error) {
      logger.error('Error recording sale:', error);
      throw error;
    }
  }

  async getSalesSummary(period: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay() + 1));
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    const sales = await Sale.find({
      timestamp: { $gte: startDate },
    }).lean();

    const agents = await Agent.find({ isActive: true }).lean();
    const topAgent = agents.reduce((top, agent) => {
      const revenue = period === 'today' ? agent.dailyRevenue :
                      period === 'week' ? agent.weeklyRevenue :
                      agent.monthlyRevenue;
      return revenue > (top?.revenue || 0) ? { ...agent, revenue } : top;
    }, null as any);

    return {
      period,
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.amount, 0),
      topAgent: topAgent?.name || 'N/A',
      averagePerAgent: agents.length > 0
        ? sales.reduce((sum, sale) => sum + sale.amount, 0) / agents.length
        : 0,
      growthRate: 0,
    };
  }

  private async getAgentRank(agentId: string): Promise<number> {
    const agent = await Agent.findById(agentId).lean();
    if (!agent) return 0;

    const higherRanked = await Agent.countDocuments({
      isActive: true,
      dailyRevenue: { $gt: agent.dailyRevenue },
    });

    return higherRanked + 1;
  }

  private async updateLeaderboardRankings() {
    const agents = await Agent.find({ isActive: true })
      .sort({ dailyRevenue: -1 })
      .lean();

    const updates = agents.map((agent, index) => ({
      updateOne: {
        filter: { _id: agent._id },
        update: { $set: { currentRank: index + 1 } },
      },
    }));

    if (updates.length > 0) {
      await Agent.bulkWrite(updates);
    }
  }
}