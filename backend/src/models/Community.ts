import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunity extends Document {
  name: string;
  description: string;
  avatar: string;
  category: string;
  members: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  isPublic: boolean;
  createdBy: mongoose.Types.ObjectId;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

const communitySchema = new Schema<ICommunity>(
  {
    name: {
      type: String,
      required: [true, 'Community name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    avatar: {
      type: String,
      default: 'https://api.dicebear.com/7.x/shapes/svg?seed=community',
    },
    category: {
      type: String,
      required: true,
      enum: ['neighborhood', 'city-wide', 'interest-group', 'emergency', 'general'],
      default: 'general',
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
communitySchema.index({ name: 'text', description: 'text' });
communitySchema.index({ members: 1 });

export default mongoose.model<ICommunity>('Community', communitySchema);
