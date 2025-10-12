import { Request, Response } from 'express';
import Issue from '../models/Issue';
import { validationResult } from 'express-validator';

// Create issue
export const createIssue = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      console.error('Request body:', req.body);
      res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
      return;
    }

    const { 
      title, 
      description, 
      category, 
      priority, 
      location, 
      images, 
      reportedBy, 
      aiSummary,
      submissionStatus 
    } = req.body;
    
    console.log('Creating issue with data:', {
      title,
      description,
      category,
      priority,
      location,
      images: images?.length || 0,
      aiSummary: aiSummary ? 'provided' : 'none',
      submissionStatus
    });


    const reporter = reportedBy || (req as any).user?.userId || undefined; // optional
    console.log('DEBUG: reporter value:', reporter);

    // If submissionStatus is 'submitted', set submittedAt timestamp
    const issueData: any = {
      title,
      description,
      category,
      priority,
      location,
      images: images || [],
      reportedBy: reporter,
      submissionStatus: submissionStatus || 'draft',
      status: 'pending', // Always set status to 'pending' for new issues
    };
    console.log('DEBUG: issueData.reportedBy:', issueData.reportedBy);

    if (aiSummary) {
      issueData.aiSummary = aiSummary;
    }

    if (submissionStatus === 'submitted') {
      issueData.submittedAt = new Date();
    }

    const issue = await Issue.create(issueData);
    console.log('Issue created successfully:', issue._id);

    res.status(201).json({ success: true, data: { issue } });
  } catch (error: any) {
    console.error('Issue creation error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message
      }));
      res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: validationErrors
      });
      return;
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create issue.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// List issues (simple pagination + filters)
export const listIssues = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const status = req.query.status as string | undefined;

    const filter: any = {};
    if (status) filter.status = status;

    const issues = await Issue.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
    const total = await Issue.countDocuments(filter);

    res.status(200).json({ success: true, data: { issues, page, limit, total } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to list issues.' });
  }
};

// Get issue by id
export const getIssue = async (req: Request, res: Response): Promise<void> => {
  try {
    const issue = await Issue.findById(req.params.id).lean();
    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found.' });
      return;
    }
    res.status(200).json({ success: true, data: { issue } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to get issue.' });
  }
};

// Update issue (partial)
export const updateIssue = async (req: Request, res: Response): Promise<void> => {
  try {
    const updates = req.body;
    const issue = await Issue.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found.' });
      return;
    }
    res.status(200).json({ success: true, data: { issue } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update issue.' });
  }
};

// Delete issue
export const deleteIssue = async (req: Request, res: Response): Promise<void> => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Issue deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete issue.' });
  }
};

// Vote on issue
export const voteIssue = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required to vote.' });
      return;
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found.' });
      return;
    }

    // Check if user already voted
    const alreadyVoted = issue.votedBy.some((id: any) => id.toString() === userId);
    if (alreadyVoted) {
      res.status(400).json({ success: false, message: 'You have already voted for this issue.' });
      return;
    }

    issue.votedBy.push(userId);
    issue.votes = issue.votedBy.length;
    await issue.save();

    res.status(200).json({ success: true, data: { issue }, message: 'Vote recorded.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to vote.' });
  }
};

// Unvote (remove vote from issue)
export const unvoteIssue = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required to unvote.' });
      return;
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found.' });
      return;
    }

    const voteIndex = issue.votedBy.findIndex((id: any) => id.toString() === userId);
    if (voteIndex === -1) {
      res.status(400).json({ success: false, message: 'You have not voted for this issue.' });
      return;
    }

    issue.votedBy.splice(voteIndex, 1);
    issue.votes = issue.votedBy.length;
    await issue.save();

    res.status(200).json({ success: true, data: { issue }, message: 'Vote removed.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to unvote.' });
  }
};
