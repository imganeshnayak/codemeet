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
  [body('title').isString().isLength({ min: 3 }), body('description').isString().isLength({ min: 5 })],
  createIssue
);

router.patch('/:id', authenticate, updateIssue);
router.delete('/:id', authenticate, deleteIssue);

// Voting endpoints
router.post('/:id/vote', authenticate, voteIssue);
router.delete('/:id/vote', authenticate, unvoteIssue);

export default router;
