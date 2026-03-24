import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  agencyId: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId;
  dispositionId?: mongoose.Types.ObjectId;
  fname?: string;
  lname?: string;
  email?: string;
  phone?: string;
  salesDate?: Date;
  modifiedDate?: Date;
  createdAt: Date;
  status?: string;
  amount?: number;
  earning?: number;
  faceAmount?: number;
  notes?: string;
}

const LeadSchema: Schema = new Schema(
  {
    agencyId: {
      type: Schema.Types.ObjectId,
      ref: 'Agency',
      required: true,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'AgentMaster',
      required: true,
    },
    dispositionId: {
      type: Schema.Types.ObjectId,
      ref: 'Disposition',
    },
    fname: String,
    lname: String,
    email: String,
    phone: String,
    salesDate: Date,
    modifiedDate: Date,
    status: String,
    amount: Number,
    earning: Number,
    faceAmount: Number,
    notes: String,
  },
  {
    timestamps: true,
    collection: 'leads',
  }
);

LeadSchema.index({ agencyId: 1, dispositionId: 1, modifiedDate: -1 });
LeadSchema.index({ agentId: 1, salesDate: -1 });
LeadSchema.index({ createdAt: -1 });

export default mongoose.model<ILead>('Lead', LeadSchema);