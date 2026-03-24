import mongoose, { Schema, Document } from 'mongoose';

export interface IAgent extends Document {
  name: string;
  email: string;
  team?: string;
  department?: string;
  avatar?: string;
  dailySales: number;
  dailyRevenue: number;
  weeklySales: number;
  weeklyRevenue: number;
  monthlySales: number;
  monthlyRevenue: number;
  totalSales: number;
  totalRevenue: number;
  lastSaleTime?: Date;
  joinDate: Date;
  isActive: boolean;
  averageTicketSize: number;
  conversionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    team: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    dailySales: {
      type: Number,
      default: 0,
    },
    dailyRevenue: {
      type: Number,
      default: 0,
    },
    weeklySales: {
      type: Number,
      default: 0,
    },
    weeklyRevenue: {
      type: Number,
      default: 0,
    },
    monthlySales: {
      type: Number,
      default: 0,
    },
    monthlyRevenue: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    lastSaleTime: {
      type: Date,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    averageTicketSize: {
      type: Number,
      default: 0,
    },
    conversionRate: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

AgentSchema.index({ email: 1 });
AgentSchema.index({ dailyRevenue: -1 });
AgentSchema.index({ weeklyRevenue: -1 });
AgentSchema.index({ isActive: 1 });

export default mongoose.model<IAgent>('Agent', AgentSchema);