import { Router } from 'express';
import {
  listUsers,
  updateUser,
  deleteUser,
  getIssueStats,
  getIssueVoters,
} from '../controllers/adminController';
import { revokeVote, bulkResolveIssues, openrouterCheck } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// User management
router.get('/users', authenticate, authorize('admin'), listUsers);
router.patch('/users/:id', authenticate, authorize('admin'), updateUser);
router.delete('/users/:id', authenticate, authorize('admin'), deleteUser);

// Issues admin
router.get('/issues/stats', authenticate, authorize('admin'), getIssueStats);
router.get('/issues/:id/voters', authenticate, authorize('admin'), getIssueVoters);
router.post('/issues/:id/revoke-vote', authenticate, authorize('admin'), revokeVote);
router.post('/issues/bulk-resolve', authenticate, authorize('admin'), bulkResolveIssues);
router.get('/openrouter/check', authenticate, authorize('admin'), openrouterCheck);

export default router;
