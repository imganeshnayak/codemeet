import mongoose, { Document, Schema, Types } from 'mongoose';

export type IssuePriority = 'low' | 'medium' | 'high';
export type IssueStatus = 'pending' | 'in-progress' | 'resolved' | 'rejected';

export interface IIssue extends Document {
  title: string;
  description: string;
  category: string;
  priority: IssuePriority;
  status: IssueStatus;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  images: string[];
  aiSummary?: string;
  reportedBy: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  votes: number;
  votedBy: Types.ObjectId[];
  comments: {
    user: Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  submittedAt?: Date;
  submissionStatus: 'draft' | 'submitted' | 'under-review';
  createdAt: Date;
  updatedAt: Date;
}

const issueSchema = new Schema<IIssue>(
  {
    title: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
      minlength: [5, 'Description must be at least 5 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'pothole',
        'streetlight',
        'garbage',
        'water',
        'drainage',
        'graffiti',
        'traffic',
        'other',
      ],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved', 'rejected'],
      default: 'pending',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (coords: number[]) {
            return coords.length === 2 &&
                   coords[0] >= -180 && coords[0] <= 180 &&
                   coords[1] >= -90 && coords[1] <= 90;
          },
          message: 'Invalid coordinates',
        },
      },
      address: String,
    },
    images: {
      type: [String],
      default: [],
    },
    aiSummary: {
      type: String,
      trim: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    votes: {
      type: Number,
      default: 0,
    },
    votedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        text: {
          type: String,
          required: true,
          maxlength: [500, 'Comment cannot exceed 500 characters'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    submittedAt: {
      type: Date,
    },
    submissionStatus: {
      type: String,
      enum: ['draft', 'submitted', 'under-review'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
issueSchema.index({ location: '2dsphere' });

// Indexes for faster queries
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ reportedBy: 1 });

export default mongoose.model<IIssue>('Issue', issueSchema);
