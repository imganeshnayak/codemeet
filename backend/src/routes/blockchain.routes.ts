import { Router } from 'express';
import {
  getBlockchainStatus,
  recordIssueOnBlockchain,
  verifyBlockchainTransaction,
  getBlockchainVerifiedIssues
} from '../controllers/blockchainController';
import { authenticateAdmin } from '../middleware/adminAuth.middleware';

const router = Router();

// Get blockchain service status
router.get('/status', getBlockchainStatus);

// Get all blockchain-verified issues
router.get('/verified-issues', getBlockchainVerifiedIssues);

// Verify a blockchain transaction
router.get('/verify/:txHash', verifyBlockchainTransaction);

// Record an issue on blockchain (admin only)
router.post('/record-issue/:issueId', authenticateAdmin, recordIssueOnBlockchain);

export default router;
