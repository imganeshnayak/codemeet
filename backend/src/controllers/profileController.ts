import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';
import User from '../models/User';
import Issue from '../models/Issue';
import Community from '../models/Community';
import Message from '../models/Message';

/**
 * Get current user's profile
 * @route GET /api/profile
 */
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user statistics
    const [issuesCount, communitiesCount, messagesCount] = await Promise.all([
      Issue.countDocuments({ reportedBy: userId }),
      Community.countDocuments({ members: userId }),
      Message.countDocuments({ sender: userId }),
    ]);

    // Get issue statistics by status

    const issueStats = await Issue.aggregate([
      { $match: { reportedBy: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    console.log('DEBUG: issueStats aggregation result:', issueStats);
    console.log('DEBUG: issueStats aggregation result:', issueStats);

    const stats = {
      totalIssues: issuesCount,
      totalCommunities: communitiesCount,
      totalMessages: messagesCount,
      issuesByStatus: issueStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
    };

    return res.status(200).json({
      success: true,
      data: {
        user,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update user profile
 * @route PATCH /api/profile
 */
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name, phone, address, avatar } = req.body;

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Name must be at least 2 characters long',
        });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (address !== undefined) updateData.address = address.trim();
    if (avatar !== undefined) updateData.avatar = avatar.trim();

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update notification settings
 * @route PATCH /api/profile/notifications
 */
export const updateNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { emailUpdates, pushNotifications, issueUpdates, communityMessages } = req.body;

    const updateData: any = {};
    if (emailUpdates !== undefined) updateData['notifications.emailUpdates'] = emailUpdates;
    if (pushNotifications !== undefined) updateData['notifications.pushNotifications'] = pushNotifications;
    if (issueUpdates !== undefined) updateData['notifications.issueUpdates'] = issueUpdates;
    if (communityMessages !== undefined) updateData['notifications.communityMessages'] = communityMessages;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification settings',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get user activity history
 * @route GET /api/profile/activity
 */
export const getActivity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const limit = parseInt(req.query.limit as string) || 20;

    // Get recent issues
    const recentIssues = await Issue.find({ reportedBy: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title status category createdAt')
      .lean();

    // Get recent messages in communities
    const recentMessages = await Message.find({ sender: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('community', 'name')
      .select('text community createdAt')
      .lean();

    // Combine and sort by date
    const activities = [
      ...recentIssues.map((issue) => ({
        id: issue._id,
        type: 'issue' as const,
        title: `Reported ${issue.category}: ${issue.title}`,
        date: issue.createdAt,
        status: issue.status,
      })),
      ...recentMessages.map((msg) => ({
        id: msg._id,
        type: 'comment' as const,
        title: `Commented in ${(msg.community as any)?.name || 'community'}`,
        date: msg.createdAt,
        status: 'completed' as const,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch activity',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update user avatar
 * @route PATCH /api/profile/avatar
 */
export const updateAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { avatar } = req.body;

    if (!avatar || typeof avatar !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Avatar URL is required',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { avatar: avatar.trim() } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update avatar',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
