import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Community, { ICommunity } from '../models/Community';
import Message from '../models/Message';

// List all communities (public + user's private communities)
export const listCommunities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { search, category } = req.query;

    // Build query
    const query: any = {
      $or: [
        { isPublic: true },
        ...(userId ? [{ members: userId }] : [])
      ]
    };

    // Add search filter
    if (search) {
      query.$text = { $search: search as string };
    }

    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    const communities = await Community.find(query)
      .sort({ lastActivity: -1 })
      .populate('createdBy', 'name email avatar')
      .select('-__v');

    // Add unread count for authenticated users
    const communitiesWithUnread = await Promise.all(
      communities.map(async (community) => {
        let unreadCount = 0;
        
        if (userId) {
          unreadCount = await Message.countDocuments({
            community: community._id,
            readBy: { $ne: userId }
          });
        }

        return {
          ...community.toObject(),
          unreadCount,
          memberCount: community.members.length
        };
      })
    );

    res.status(200).json({
      success: true,
      data: communitiesWithUnread
    });
  } catch (error) {
    console.error('❌ Error listing communities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch communities',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get single community details
export const getCommunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const community = await Community.findById(id)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar')
      .populate('admins', 'name email avatar')
      .select('-__v');

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    // Check access for private communities
    if (!community.isPublic && userId && !community.members.some((m: any) => m._id.toString() === userId)) {
      res.status(403).json({
        success: false,
        message: 'You do not have access to this private community'
      });
      return;
    }

    // Get unread count
    let unreadCount = 0;
    if (userId) {
      unreadCount = await Message.countDocuments({
        community: community._id,
        readBy: { $ne: userId }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...community.toObject(),
        unreadCount,
        memberCount: community.members.length
      }
    });
  } catch (error) {
    console.error('❌ Error getting community:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Create new community
export const createCommunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { name, description, avatar, category, isPublic } = req.body;

    // Validation
    if (!name || name.trim().length < 3) {
      res.status(400).json({
        success: false,
        message: 'Community name must be at least 3 characters'
      });
      return;
    }

    // Create community
    const community = await Community.create({
      name: name.trim(),
      description: description?.trim() || '',
      avatar: avatar || '',
      category: category || 'general',
      isPublic: isPublic !== false, // Default to public
      createdBy: userId,
      members: [userId],
      admins: [userId],
      lastActivity: new Date()
    });

    const populatedCommunity = await Community.findById(community._id)
      .populate('createdBy', 'name email avatar')
      .select('-__v');

    console.log('✅ Community created:', community.name);

    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      data: {
        ...populatedCommunity!.toObject(),
        memberCount: 1,
        unreadCount: 0
      }
    });
  } catch (error: any) {
    console.error('❌ Error creating community:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e: any) => e.message);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create community',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update community (admins only)
export const updateCommunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const community = await Community.findById(id);

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    // Check if user is admin
    if (!community.admins.some((adminId) => adminId.toString() === userId)) {
      res.status(403).json({
        success: false,
        message: 'Only admins can update this community'
      });
      return;
    }

    // Update allowed fields
    const { name, description, avatar, category, isPublic } = req.body;

    if (name !== undefined) community.name = name.trim();
    if (description !== undefined) community.description = description.trim();
    if (avatar !== undefined) community.avatar = avatar;
    if (category !== undefined) community.category = category;
    if (isPublic !== undefined) community.isPublic = isPublic;

    await community.save();

    const updatedCommunity = await Community.findById(id)
      .populate('createdBy', 'name email avatar')
      .select('-__v');

    console.log('✅ Community updated:', community.name);

    res.status(200).json({
      success: true,
      message: 'Community updated successfully',
      data: updatedCommunity
    });
  } catch (error: any) {
    console.error('❌ Error updating community:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e: any) => e.message);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update community',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Delete community (creator only)
export const deleteCommunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const community = await Community.findById(id);

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    // Check if user is creator
    if (community.createdBy.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Only the creator can delete this community'
      });
      return;
    }

    // Delete all messages in the community
    await Message.deleteMany({ community: id });

    // Delete community
    await Community.findByIdAndDelete(id);

    console.log('✅ Community deleted:', community.name);

    res.status(200).json({
      success: true,
      message: 'Community deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting community:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete community',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Join community
export const joinCommunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const community = await Community.findById(id);

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    // Check if already a member
    if (community.members.some((memberId) => memberId.toString() === userId)) {
      res.status(400).json({
        success: false,
        message: 'You are already a member of this community'
      });
      return;
    }

    // Check if community is private
    if (!community.isPublic) {
      res.status(403).json({
        success: false,
        message: 'This is a private community. You need an invitation to join.'
      });
      return;
    }

    // Add user to members
    community.members.push(userId as any);
    community.lastActivity = new Date();
    await community.save();

    console.log('✅ User joined community:', community.name);

    res.status(200).json({
      success: true,
      message: 'Successfully joined the community'
    });
  } catch (error) {
    console.error('❌ Error joining community:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join community',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Leave community
export const leaveCommunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const community = await Community.findById(id);

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    // Check if user is a member
    const memberIndex = community.members.findIndex((memberId) => memberId.toString() === userId);
    
    if (memberIndex === -1) {
      res.status(400).json({
        success: false,
        message: 'You are not a member of this community'
      });
      return;
    }

    // Creator cannot leave their own community
    if (community.createdBy.toString() === userId) {
      res.status(400).json({
        success: false,
        message: 'Creator cannot leave the community. Delete it instead.'
      });
      return;
    }

    // Remove user from members
    community.members.splice(memberIndex, 1);

    // Remove from admins if applicable
    const adminIndex = community.admins.findIndex((adminId) => adminId.toString() === userId);
    if (adminIndex !== -1) {
      community.admins.splice(adminIndex, 1);
    }

    await community.save();

    console.log('✅ User left community:', community.name);

    res.status(200).json({
      success: true,
      message: 'Successfully left the community'
    });
  } catch (error) {
    console.error('❌ Error leaving community:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave community',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get community members
export const getCommunityMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const community = await Community.findById(id)
      .populate('members', 'name email avatar')
      .populate('admins', 'name email avatar');

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    // Check access for private communities
    if (!community.isPublic && userId && !community.members.some((m: any) => m._id.toString() === userId)) {
      res.status(403).json({
        success: false,
        message: 'You do not have access to this private community'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        members: community.members,
        admins: community.admins,
        totalCount: community.members.length
      }
    });
  } catch (error) {
    console.error('❌ Error getting community members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community members',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
