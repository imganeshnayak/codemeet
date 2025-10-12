import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminAudit extends Document {
  actor: mongoose.Types.ObjectId;
  action: string;
  targetType: string;
  targetId?: mongoose.Types.ObjectId;
  details?: any;
  createdAt: Date;
}

const adminAuditSchema = new Schema<IAdminAudit>(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: Schema.Types.ObjectId },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IAdminAudit>('AdminAudit', adminAuditSchema);
