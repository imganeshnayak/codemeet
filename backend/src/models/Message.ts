import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  community: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  isEdited: boolean;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    community: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },
    fileUrl: {
      type: String,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
messageSchema.index({ community: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

export default mongoose.model<IMessage>('Message', messageSchema);
