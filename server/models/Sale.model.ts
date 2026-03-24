import mongoose, { Schema, Document } from 'mongoose';

export interface ISale extends Document {
  agentId: mongoose.Types.ObjectId;
  amount: number;
  productId?: string;
  customerId?: string;
  source?: string;
  dealType?: string;
  notes?: string;
  timestamp: Date;
  createdAt: Date;
}

const SaleSchema: Schema = new Schema(
  {
    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'Agent',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    productId: {
      type: String,
    },
    customerId: {
      type: String,
    },
    source: {
      type: String,
      enum: ['inbound', 'outbound', 'referral', 'online'],
    },
    dealType: {
      type: String,
      enum: ['new', 'upsell', 'renewal'],
    },
    notes: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

SaleSchema.index({ agentId: 1, timestamp: -1 });
SaleSchema.index({ timestamp: -1 });
SaleSchema.index({ amount: -1 });

export default mongoose.model<ISale>('Sale', SaleSchema);