import { Schema, model, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ipAddress: string;
  userAgent?: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  path: string;
  statusCode: number;
  requestBody?: any;
  responseBody?: any;
  error?: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

const auditLogSchema = new Schema<IAuditLog>({
  userId: String,
  userEmail: String,
  userRole: String,
  ipAddress: { type: String, required: true },
  userAgent: String,
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: String,
  method: { type: String, required: true },
  path: { type: String, required: true },
  statusCode: { type: Number, required: true },
  requestBody: Schema.Types.Mixed,
  responseBody: Schema.Types.Mixed,
  error: String,
  duration: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  metadata: Schema.Types.Mixed,
}, {
  timestamps: true,
});

auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });
auditLogSchema.index({ statusCode: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, timestamp: -1 });

auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

export default model<IAuditLog>('AuditLog', auditLogSchema);