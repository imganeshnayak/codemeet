import { Router } from 'express';
import { body } from 'express-validator';
import {
  createIssue,
  listIssues,
  getIssue,
  updateIssue,
  deleteIssue,
  voteIssue,
  unvoteIssue,
} from '../controllers/issueController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public
router.get('/', listIssues);
router.get('/:id', getIssue);

// Protected (create/update/delete)
router.post(
  '/',
  authenticate,
  [
    body('title').isString().trim().notEmpty().withMessage('Title is required'),
    body('description').isString().trim().notEmpty().withMessage('Description is required'),
    body('category').optional().isString().trim(),
    body('priority').optional().isString().trim(),
    body('location').optional().isObject(),
    body('images').optional().isArray(),
    body('aiSummary').optional().isString(),
    body('submissionStatus').optional().isString(),
  ],
  createIssue
);

router.patch('/:id', authenticate, updateIssue);
router.delete('/:id', authenticate, deleteIssue);

// Voting endpoints
router.post('/:id/vote', authenticate, voteIssue);
router.delete('/:id/vote', authenticate, unvoteIssue);

export default router;
