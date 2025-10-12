import mongoose, { Document, Schema } from 'mongoose';

export interface IChatHistory extends Document {
  userId?: mongoose.Types.ObjectId;
  sessionId: string;
  messages: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const chatHistorySchema = new Schema<IChatHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional for anonymous users
    },
    sessionId: {
      type: String,
      required: true,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant'],
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: [5000, 'Message content too long'],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
chatHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IChatHistory>('ChatHistory', chatHistorySchema);
