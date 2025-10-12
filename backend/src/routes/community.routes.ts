import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import {
  listCommunities,
  getCommunity,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers
} from '../controllers/communityController';
import {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markAsRead
} from '../controllers/messageController';

const router = Router();

// ============================================
// COMMUNITY ROUTES
// ============================================

// List all communities (public + user's communities)
router.get('/', listCommunities);

// Get single community details
router.get('/:id', getCommunity);

// Create new community (authenticated)
router.post(
  '/',
  authenticate,
  [
    body('name').trim().notEmpty().withMessage('Community name is required'),
    body('category')
      .optional()
      .isIn(['neighborhood', 'city-wide', 'interest-group', 'emergency', 'general'])
      .withMessage('Invalid category')
  ],
  createCommunity
);

// Update community (authenticated, admins only)
router.patch('/:id', authenticate, updateCommunity);

// Delete community (authenticated, creator only)
router.delete('/:id', authenticate, deleteCommunity);

// Join community (authenticated)
router.post('/:id/join', authenticate, joinCommunity);

// Leave community (authenticated)
router.post('/:id/leave', authenticate, leaveCommunity);

// Get community members
router.get('/:id/members', getCommunityMembers);

// ============================================
// MESSAGE ROUTES (nested under communities)
// ============================================

// Get messages for a community
router.get('/:communityId/messages', getMessages);

// Send a message (authenticated)
router.post(
  '/:communityId/messages',
  authenticate,
  [body('text').trim().notEmpty().withMessage('Message text is required')],
  sendMessage
);

// Mark all messages as read in a community (authenticated)
router.post('/:communityId/messages/read', authenticate, markAsRead);

// Edit a message (authenticated, sender only)
router.patch('/messages/:id', authenticate, editMessage);

// Delete a message (authenticated, sender or admin)
router.delete('/messages/:id', authenticate, deleteMessage);

export default router;
