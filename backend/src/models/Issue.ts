import mongoose, { Document, Schema, Types } from 'mongoose';

export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';
export type IssueStatus = 'pending' | 'under-review' | 'in-progress' | 'resolved' | 'rejected';

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
  
  // Admin-related fields
  assignedTo?: Types.ObjectId; // Reference to Admin
  assignedDepartment?: string;
  estimatedResolution?: Date;
  actualResolution?: Date;
  afterPhotos?: string[]; // Photos after issue is resolved
  rejectionReason?: string;
  adminNotes: {
    admin: Types.ObjectId;
    note: string;
    isPublic: boolean;
    timestamp: Date;
  }[];
  statusHistory: {
    status: IssueStatus;
    changedBy: Types.ObjectId; // Admin who changed the status
    reason?: string;
    timestamp: Date;
  }[];
  
  // User engagement
  votes: number;
  votedBy: Types.ObjectId[];
  comments: {
    user: Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  
  submittedAt?: Date;
  submissionStatus: 'draft' | 'submitted' | 'under-review';
  
  // Blockchain integration
  blockchainTxHash?: string; // Transaction hash when issue is recorded on blockchain
  blockchainVerified?: boolean; // Whether the blockchain record is verified
  blockchainTimestamp?: Date; // When it was recorded on blockchain
  
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
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'under-review', 'in-progress', 'resolved', 'rejected'],
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
    
    // Admin-related fields
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    assignedDepartment: {
      type: String,
      trim: true,
    },
    estimatedResolution: {
      type: Date,
    },
    actualResolution: {
      type: Date,
    },
    afterPhotos: {
      type: [String],
      default: [],
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    adminNotes: [
      {
        admin: {
          type: Schema.Types.ObjectId,
          ref: 'Admin',
          required: true,
        },
        note: {
          type: String,
          required: true,
          maxlength: [1000, 'Note cannot exceed 1000 characters'],
        },
        isPublic: {
          type: Boolean,
          default: false,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['pending', 'under-review', 'in-progress', 'resolved', 'rejected'],
          required: true,
        },
        changedBy: {
          type: Schema.Types.ObjectId,
          ref: 'Admin',
          required: true,
        },
        reason: {
          type: String,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
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
    
    // Blockchain integration
    blockchainTxHash: {
      type: String,
    },
    blockchainVerified: {
      type: Boolean,
      default: false,
    },
    blockchainTimestamp: {
      type: Date,
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
issueSchema.index({ assignedTo: 1 });
issueSchema.index({ priority: 1 });
issueSchema.index({ assignedDepartment: 1 });
issueSchema.index({ category: 1 });

export default mongoose.model<IIssue>('Issue', issueSchema);
