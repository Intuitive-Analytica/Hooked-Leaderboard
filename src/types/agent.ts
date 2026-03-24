export interface Agent {
  id: string;
  name: string;
  email?: string;
  team?: string;
  department?: string;
  avatar?: string;
  dailySales: number;
  dailyRevenue: number;
  weeklySales: number;
  weeklyRevenue: number;
  monthlySales?: number;
  monthlyRevenue?: number;
  rank?: number;
  previousRank?: number;
  changeFromPrevious?: number;
  lastSaleTime?: Date;
  joinDate?: Date;
  isActive: boolean;
}

export interface AgentStats {
  currentRank: number;
  dailySales: number;
  weeklySales: number;
  monthlySales: number;
  totalSales: number;
  averageTicket: number;
  conversionRate: number;
}

export interface LeaderboardData {
  date: string;
  agents: Agent[];
  lastUpdated: Date;
}

export interface SaleUpdate {
  agentId: string;
  saleAmount: number;
  timestamp: Date;
  productId?: string;
  customerId?: string;
}