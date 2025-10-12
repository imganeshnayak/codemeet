import { Request, Response } from 'express';
import User from '../models/User';
import Issue from '../models/Issue';
import mongoose from 'mongoose';
import AdminAudit from '../models/AdminAudit';

// List users with filters: role, isActive, search, date range, pagination
export const listUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const role = req.query.role as string | undefined;
    const isActive = req.query.isActive as string | undefined;
    const search = req.query.search as string | undefined;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;

    const filter: any = {};
    if (role) filter.role = role;
    if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true';
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(filter);

    // Enrich users with counts: reportsSubmitted, votesCast
    const userIds = users.map(u => u._id);
    const reportsAgg = await Issue.aggregate([
      { $match: { reportedBy: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) } } },
      { $group: { _id: '$reportedBy', count: { $sum: 1 } } }
    ]);
    const votesAgg = await Issue.aggregate([
      { $match: { votedBy: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) } } },
      { $unwind: '$votedBy' },
      { $match: { votedBy: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) } } },
      { $group: { _id: '$votedBy', count: { $sum: 1 } } }
    ]);

    const reportsMap = new Map(reportsAgg.map((r: any) => [r._id.toString(), r.count]));
    const votesMap = new Map(votesAgg.map((r: any) => [r._id.toString(), r.count]));

    const usersWithCounts = users.map(u => ({
      ...u,
      reportsSubmitted: reportsMap.get(u._id.toString()) || 0,
      votesCast: votesMap.get(u._id.toString()) || 0,
    }));

    res.status(200).json({ success: true, data: { users: usersWithCounts, page, limit, total } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to list users.' });
  }
};

// Update user role / isActive
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    res.status(200).json({ success: true, data: { user } });
    // Audit
    try {
      await AdminAudit.create({ actor: (req as any).user?.userId, action: 'update_user', targetType: 'User', targetId: user._id, details: updates });
    } catch (e) {
      console.warn('Failed to write admin audit', e);
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update user.' });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    // Note: cascade deletion (issues/messages) is not currently implemented here
    res.status(200).json({ success: true, message: 'User deleted.' });
    try {
      await AdminAudit.create({ actor: (req as any).user?.userId, action: 'delete_user', targetType: 'User', targetId: user._id });
    } catch (e) {
      console.warn('Failed to write admin audit', e);
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete user.' });
  }
};

// Issue stats endpoint: counts by status, category, top reported, top voters
export const getIssueStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const total = await Issue.countDocuments({});
    const byStatus = await Issue.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const byCategory = await Issue.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
    const topReported = await Issue.aggregate([
      { $group: { _id: '$reportedBy', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    const topVoted = await Issue.aggregate([
      { $project: { title: 1, votes: 1 } },
      { $sort: { votes: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({ success: true, data: { total, byStatus, byCategory, topReported, topVoted } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to get stats.' });
  }
};

// Revoke a vote for a specific user on an issue (admin moderation)
export const revokeVote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found.' });
      return;
    }

    const voteIndex = issue.votedBy.findIndex((id: any) => id.toString() === userId);
    if (voteIndex === -1) {
      res.status(400).json({ success: false, message: 'User has not voted for this issue.' });
      return;
    }

    issue.votedBy.splice(voteIndex, 1);
    issue.votes = issue.votedBy.length;
    await issue.save();

    // Audit
    try { await AdminAudit.create({ actor: (req as any).user?.userId, action: 'revoke_vote', targetType: 'Issue', targetId: issue._id, details: { revokedUser: userId } }); } catch(e){console.warn('audit fail', e)}

    res.status(200).json({ success: true, data: { issue }, message: 'Vote revoked.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to revoke vote.' });
  }
};

// Bulk resolve issues (admin)
export const bulkResolveIssues = async (req: Request, res: Response): Promise<void> => {
  try {
    const ids: string[] = req.body.ids || [];
    if (!ids.length) {
      res.status(400).json({ success: false, message: 'No issue ids provided.' });
      return;
    }

    const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
    const result = await Issue.updateMany({ _id: { $in: objectIds } }, { $set: { status: 'resolved' } });

    // Audit
    try { await AdminAudit.create({ actor: (req as any).user?.userId, action: 'bulk_resolve', targetType: 'Issue', details: { ids } }); } catch(e){console.warn('audit fail', e)}

    res.status(200).json({ success: true, data: { modifiedCount: result.modifiedCount } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to bulk resolve issues.' });
  }
};

// Check OpenRouter API key and return the status (admin debug)
export const openrouterCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      res.status(400).json({ success: false, message: 'No OPENROUTER_API_KEY configured.' });
      return;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: 'openai/gpt-3.5-turbo', messages: [{ role: 'system', content: 'healthcheck' }, { role: 'user', content: 'ping' }] })
    });

    const text = await response.text();
    res.status(200).json({ success: true, status: response.status, body: text });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'OpenRouter check failed.' });
  }
};

// Get voters for an issue (detailed)
export const getIssueVoters = async (req: Request, res: Response): Promise<void> => {
  try {
    const issue = await Issue.findById(req.params.id).populate({ path: 'votedBy', select: 'name email avatar' }).lean();
    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found.' });
      return;
    }
    res.status(200).json({ success: true, data: { voters: issue.votedBy } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to get voters.' });
  }
};
