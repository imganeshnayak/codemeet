import { Request, Response } from 'express';
import blockchainService from '../config/blockchain';
import Issue from '../models/Issue';

/**
 * Get blockchain service status
 */
export const getBlockchainStatus = async (req: Request, res: Response) => {
  try {
    const isEnabled = blockchainService.isBlockchainEnabled();
    const balance = isEnabled ? await blockchainService.getBalance() : '0';
    
    res.json({
      success: true,
      data: {
        enabled: isEnabled,
        walletAddress: process.env.WALLET_ADDRESS,
        balance: `${balance} ETH`,
        network: process.env.ETH_RPC_URL?.includes('sepolia') ? 'Sepolia Testnet' : 'Unknown',
        contractAddress: process.env.CONTRACT_ADDRESS
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get blockchain status',
      error: error.message
    });
  }
};

/**
 * Record an issue on blockchain
 */
export const recordIssueOnBlockchain = async (req: Request, res: Response) => {
  try {
    const { issueId } = req.params;
    
    if (!blockchainService.isBlockchainEnabled()) {
      return res.status(503).json({
        success: false,
        message: 'Blockchain service is not enabled'
      });
    }

    // Find the issue
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check if already recorded
    if (issue.blockchainTxHash) {
      return res.status(400).json({
        success: false,
        message: 'Issue already recorded on blockchain',
        data: {
          txHash: issue.blockchainTxHash,
          etherscanLink: blockchainService.getEtherscanLink(issue.blockchainTxHash)
        }
      });
    }

    // Record on blockchain (only pass issueId and title)
    const result = await blockchainService.recordIssue(
      issueId,
      issue.title
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to record issue on blockchain',
        error: result.error
      });
    }

    // Update issue with blockchain data
    issue.blockchainTxHash = result.txHash;
    issue.blockchainVerified = true;
    issue.blockchainTimestamp = new Date();
    await issue.save();

    res.json({
      success: true,
      message: 'Issue recorded on blockchain successfully',
      data: {
        issueId: issue._id,
        txHash: result.txHash,
        etherscanLink: blockchainService.getEtherscanLink(result.txHash!),
        timestamp: issue.blockchainTimestamp
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to record issue on blockchain',
      error: error.message
    });
  }
};

/**
 * Verify a blockchain transaction
 */
export const verifyBlockchainTransaction = async (req: Request, res: Response) => {
  try {
    const { txHash } = req.params;

    if (!blockchainService.isBlockchainEnabled()) {
      return res.status(503).json({
        success: false,
        message: 'Blockchain service is not enabled'
      });
    }

    const transaction = await blockchainService.getTransaction(txHash);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: {
        txHash: transaction.hash,
        blockNumber: transaction.blockNumber,
        from: transaction.from,
        to: transaction.to,
        value: transaction.value?.toString(),
        confirmed: transaction.blockNumber !== null,
        etherscanLink: blockchainService.getEtherscanLink(txHash)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify transaction',
      error: error.message
    });
  }
};

/**
 * Get all blockchain-verified issues
 */
export const getBlockchainVerifiedIssues = async (req: Request, res: Response) => {
  try {
    const issues = await Issue.find({
      blockchainVerified: true,
      blockchainTxHash: { $exists: true }
    })
      .populate('reportedBy', 'name email avatar')
      .select('title category status blockchainTxHash blockchainTimestamp votes')
      .sort({ blockchainTimestamp: -1 });

    const issuesWithLinks = issues.map(issue => ({
      ...issue.toObject(),
      etherscanLink: blockchainService.getEtherscanLink(issue.blockchainTxHash!)
    }));

    res.json({
      success: true,
      count: issues.length,
      data: issuesWithLinks
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get blockchain-verified issues',
      error: error.message
    });
  }
};
