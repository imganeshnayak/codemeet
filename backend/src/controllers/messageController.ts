import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Message, { IMessage } from '../models/Message';
import Community from '../models/Community';

// Get messages for a community
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { communityId } = req.params;
    const userId = req.user?.userId;
    const { limit = 50, before } = req.query;

    // Check if community exists
    const community = await Community.findById(communityId);

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    // Check if user has access
    if (!community.isPublic && userId && !community.members.some((m) => m.toString() === userId)) {
      res.status(403).json({
        success: false,
        message: 'You do not have access to this community'
      });
      return;
    }

    // Build query
    const query: any = { community: communityId };

    // Add pagination
    if (before) {
      query.createdAt = { $lt: new Date(before as string) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('sender', 'name email avatar')
      .select('-__v');

    // Reverse to show oldest first
    const sortedMessages = messages.reverse();

    res.status(200).json({
      success: true,
      data: sortedMessages,
      hasMore: messages.length === Number(limit)
    });
  } catch (error) {
    console.error('❌ Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Send a message
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { communityId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { text, type = 'text', fileUrl } = req.body;

    // Validation
    if (!text || text.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Message text is required'
      });
      return;
    }

    // Check if community exists
    const community = await Community.findById(communityId);

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    // Check if user is a member
    if (!community.members.some((m) => m.toString() === userId)) {
      res.status(403).json({
        success: false,
        message: 'You must be a member to send messages'
      });
      return;
    }

    // Create message
    const message = await Message.create({
      community: communityId,
      sender: userId,
      text: text.trim(),
      type,
      fileUrl: fileUrl || undefined,
      readBy: [userId] // Sender has already read their own message
    });

    // Update community last activity
    community.lastActivity = new Date();
    await community.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email avatar')
      .select('-__v');

    console.log('✅ Message sent in community:', community.name);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error: any) {
    console.error('❌ Error sending message:', error);

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
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Edit a message
export const editMessage = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Message text is required'
      });
      return;
    }

    const message = await Message.findById(id);

    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Message not found'
      });
      return;
    }

    // Check if user is the sender
    if (message.sender.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      });
      return;
    }

    // Update message
    message.text = text.trim();
    message.isEdited = true;
    await message.save();

    const updatedMessage = await Message.findById(id)
      .populate('sender', 'name email avatar')
      .select('-__v');

    console.log('✅ Message edited');

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: updatedMessage
    });
  } catch (error) {
    console.error('❌ Error editing message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to edit message',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Delete a message
export const deleteMessage = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const message = await Message.findById(id);

    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Message not found'
      });
      return;
    }

    // Check if user is the sender or a community admin
    const community = await Community.findById(message.community);

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    const isSender = message.sender.toString() === userId;
    const isAdmin = community.admins.some((adminId) => adminId.toString() === userId);

    if (!isSender && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own messages or be an admin'
      });
      return;
    }

    await Message.findByIdAndDelete(id);

    console.log('✅ Message deleted');

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Mark messages as read
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { communityId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Check if community exists
    const community = await Community.findById(communityId);

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    // Check if user is a member
    if (!community.members.some((m) => m.toString() === userId)) {
      res.status(403).json({
        success: false,
        message: 'You must be a member of this community'
      });
      return;
    }

    // Mark all unread messages as read
    const result = await Message.updateMany(
      {
        community: communityId,
        readBy: { $ne: userId }
      },
      {
        $addToSet: { readBy: userId }
      }
    );

    console.log(`✅ Marked ${result.modifiedCount} messages as read`);

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      markedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('❌ Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
