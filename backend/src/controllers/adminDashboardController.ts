import { Request, Response } from 'express';
import Issue from '../models/Issue';
import User from '../models/User';
import Admin from '../models/Admin';
import mongoose from 'mongoose';

// Get dashboard overview metrics
export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    // Get total counts
    const [
      totalIssues,
      pendingIssues,
      inProgressIssues,
      resolvedIssues,
      rejectedIssues,
      totalUsers,
      totalAdmins,
    ] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'pending' }),
      Issue.countDocuments({ status: 'in-progress' }),
      Issue.countDocuments({ status: 'resolved' }),
      Issue.countDocuments({ status: 'rejected' }),
      User.countDocuments(),
      Admin.countDocuments({ isActive: true }),
    ]);

    // Calculate resolution rate
    const resolutionRate =
      totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(2) : '0';

    // Get average response time (time from pending to in-progress)
    const issuesWithResponse = await Issue.find({
      'statusHistory.1': { $exists: true },
    }).select('statusHistory');

    let totalResponseTime = 0;
    let count = 0;

    issuesWithResponse.forEach((issue) => {
      if (issue.statusHistory.length >= 2) {
        const pending = issue.statusHistory[0];
        const inProgress = issue.statusHistory[1];
        const diff = inProgress.timestamp.getTime() - pending.timestamp.getTime();
        totalResponseTime += diff;
        count++;
      }
    });

    const avgResponseTimeMs = count > 0 ? totalResponseTime / count : 0;
    const avgResponseTimeHours = (avgResponseTimeMs / (1000 * 60 * 60)).toFixed(1);

    // Get issues by priority
    const issuesByPriority = await Issue.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get issues by category
    const issuesByCategory = await Issue.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Get recent issues
    const recentIssues = await Issue.find()
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name role')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title category status priority location createdAt');

    res.json({
      metrics: {
        totalIssues,
        pendingIssues,
        inProgressIssues,
        resolvedIssues,
        rejectedIssues,
        totalUsers,
        totalAdmins,
        resolutionRate: parseFloat(resolutionRate),
        avgResponseTime: parseFloat(avgResponseTimeHours),
      },
      issuesByPriority,
      issuesByCategory,
      recentIssues,
    });
  } catch (error) {
    console.error('Get dashboard metrics error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard metrics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get issue trends (daily submissions for last 30 days)
export const getIssueTrends = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days as string);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const trends = await Issue.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ trends });
  } catch (error) {
    console.error('Get issue trends error:', error);
    res.status(500).json({
      error: 'Failed to fetch issue trends',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get geographic distribution of issues
export const getGeographicDistribution = async (req: Request, res: Response) => {
  try {
    const issues = await Issue.find({ status: { $ne: 'resolved' } })
      .select('location title category status priority')
      .limit(500);

    const heatmapData = issues.map((issue) => ({
      lat: issue.location.coordinates[1],
      lng: issue.location.coordinates[0],
      title: issue.title,
      category: issue.category,
      status: issue.status,
      priority: issue.priority,
    }));

    res.json({ heatmapData });
  } catch (error) {
    console.error('Get geographic distribution error:', error);
    res.status(500).json({
      error: 'Failed to fetch geographic distribution',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get admin performance metrics
export const getAdminPerformance = async (req: Request, res: Response) => {
  try {
    const performance = await Issue.aggregate([
      {
        $match: {
          assignedTo: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$assignedTo',
          totalAssigned: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'admins',
          localField: '_id',
          foreignField: '_id',
          as: 'admin',
        },
      },
      { $unwind: '$admin' },
      {
        $project: {
          adminId: '$_id',
          adminName: '$admin.name',
          adminRole: '$admin.role',
          totalAssigned: 1,
          resolved: 1,
          inProgress: 1,
          pending: 1,
          resolutionRate: {
            $multiply: [{ $divide: ['$resolved', '$totalAssigned'] }, 100],
          },
        },
      },
      { $sort: { resolved: -1 } },
    ]);

    res.json({ performance });
  } catch (error) {
    console.error('Get admin performance error:', error);
    res.status(500).json({
      error: 'Failed to fetch admin performance',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get recent activity feed
export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const { limit = 20 } = req.query;

    // Get recent issues
    const recentIssues = await Issue.find()
      .populate('reportedBy', 'name')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .select('title status createdAt reportedBy assignedTo');

    // Get recent status changes
    const issuesWithStatusChanges = await Issue.find({
      'statusHistory.0': { $exists: true },
    })
      .populate('statusHistory.changedBy', 'name')
      .sort({ 'statusHistory.timestamp': -1 })
      .limit(parseInt(limit as string))
      .select('title statusHistory');

    const activities = [
      ...recentIssues.map((issue) => ({
        type: 'new_issue',
        timestamp: issue.createdAt,
        message: `New issue reported: ${issue.title}`,
        user: issue.reportedBy,
        issue: issue._id,
      })),
      ...issuesWithStatusChanges.flatMap((issue) =>
        issue.statusHistory.slice(-3).map((history) => ({
          type: 'status_change',
          timestamp: history.timestamp,
          message: `Issue "${issue.title}" status changed to ${history.status}`,
          admin: history.changedBy,
          issue: issue._id,
          status: history.status,
        }))
      ),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, parseInt(limit as string));

    res.json({ activities });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      error: 'Failed to fetch recent activity',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
