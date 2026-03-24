import mongoose, { Schema, Document } from 'mongoose';

export interface IDisposition extends Document {
  status: string;
  description: string;
  agencyId: mongoose.Types.ObjectId;
  color?: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DispositionSchema: Schema = new Schema(
  {
    status: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    agencyId: {
      type: Schema.Types.ObjectId,
      ref: 'Agency',
      required: true,
    },
    color: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'dispositions',
  }
);

DispositionSchema.index({ status: 1, agencyId: 1 });
DispositionSchema.index({ agencyId: 1, isActive: 1 });

export default mongoose.model<IDisposition>('Disposition', DispositionSchema);