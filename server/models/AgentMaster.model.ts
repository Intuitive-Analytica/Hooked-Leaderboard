import mongoose, { Schema, Document } from 'mongoose';

export interface IAgentMaster extends Document {
  fname?: string;
  lname?: string;
  email: string;
  phone?: string;
  agencyId: mongoose.Types.ObjectId;
  isActive?: string;
  softDelete?: string;
  loginStatus?: string;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AgentMasterSchema: Schema = new Schema(
  {
    fname: String,
    lname: String,
    email: {
      type: String,
      required: true,
    },
    phone: String,
    agencyId: {
      type: Schema.Types.ObjectId,
      ref: 'Agency',
      required: true,
    },
    isActive: {
      type: String,
      default: '1',
    },
    softDelete: {
      type: String,
      default: '0',
    },
    loginStatus: String,
    role: String,
  },
  {
    timestamps: true,
    collection: 'agentmasters',
  }
);

AgentMasterSchema.index({ email: 1 });
AgentMasterSchema.index({ agencyId: 1, isActive: 1 });

export default mongoose.model<IAgentMaster>('AgentMaster', AgentMasterSchema);