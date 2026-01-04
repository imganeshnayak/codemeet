import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import {
  getProfile,
  updateProfile,
  updateNotifications,
  getActivity,
  updateAvatar,
} from '../controllers/profileController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/profile
 * @desc    Get current user's profile and statistics
 * @access  Private
 */
router.get('/', getProfile);

/**
 * @route   PATCH /api/profile
 * @desc    Update user profile information
 * @access  Private
 */
router.patch(
  '/',
  [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('phone').optional().trim(),
    body('address').optional().trim(),
    body('avatar').optional().trim().isURL().withMessage('Avatar must be a valid URL'),
  ],
  updateProfile
);

/**
 * @route   PATCH /api/profile/notifications
 * @desc    Update notification settings
 * @access  Private
 */
router.patch(
  '/notifications',
  [
    body('emailUpdates').optional().isBoolean(),
    body('pushNotifications').optional().isBoolean(),
    body('issueUpdates').optional().isBoolean(),
    body('communityMessages').optional().isBoolean(),
  ],
  updateNotifications
);

/**
 * @route   GET /api/profile/activity
 * @desc    Get user activity history
 * @access  Private
 */
router.get('/activity', getActivity);

/**
 * @route   PATCH /api/profile/avatar
 * @desc    Update user avatar
 * @access  Private
 */
router.patch(
  '/avatar',
  [body('avatar').trim().notEmpty().withMessage('Avatar URL is required').isURL().withMessage('Avatar must be a valid URL')],
  updateAvatar
);

export default router;
