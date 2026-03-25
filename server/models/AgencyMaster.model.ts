import mongoose, { Schema, Document } from 'mongoose';

export interface IAgencyMaster extends Document {
  agencyName: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: string;
  softDelete?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AgencyMasterSchema: Schema = new Schema(
  {
    agencyName: {
      type: String,
      required: true,
    },
    email: String,
    phone: String,
    address: String,
    isActive: {
      type: String,
      default: '1',
    },
    softDelete: {
      type: String,
      default: '0',
    },
  },
  {
    timestamps: true,
    collection: 'agencymasters',
  }
);

export default mongoose.model<IAgencyMaster>('AgencyMaster', AgencyMasterSchema);