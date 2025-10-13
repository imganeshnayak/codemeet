import { ethers } from 'ethers';

// Smart Contract ABI (Application Binary Interface)
// This is a simple ABI for tracking issue reports and votes
const CONTRACT_ABI = [
  // Record an issue on blockchain (matches deployed contract)
  "function recordIssue(string _issueId, string _title)",
  // Record a vote on blockchain (update as needed)
  "function recordVote(string _issueId, bool _support)",
  // Get issue record
  "function getIssue(string _issueId) view returns (string issueId, string title, address reportedBy, uint256 timestamp, uint256 voteCount, bool exists)",
  // Get vote count for an issue
  "function getVoteCount(string _issueId) view returns (uint256)",
  // Events (optional for ethers.js)
  "event IssueRecorded(string indexed issueId, string title, address indexed reportedBy, uint256 timestamp)",
  "event VoteRecorded(string indexed issueId, address indexed voter, bool support, uint256 timestamp)"
];

class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = false;
    
    try {
      const privateKey = process.env.ETH_PRIVATE_KEY;
      const rpcUrl = process.env.ETH_RPC_URL;
      const contractAddress = process.env.CONTRACT_ADDRESS;

      if (!privateKey || !rpcUrl || !contractAddress) {
        console.warn('⚠️  Blockchain credentials not configured. Blockchain features disabled.');
        return;
      }

      // Connect to Ethereum network
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Create wallet from private key
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      
      // Connect to smart contract
      this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.wallet);
      
      this.isEnabled = true;
      console.log('✅ Blockchain service initialized');
      console.log('📍 Network:', rpcUrl.includes('sepolia') ? 'Sepolia Testnet' : 'Unknown');
      console.log('👛 Wallet:', process.env.WALLET_ADDRESS);
      console.log('📜 Contract:', contractAddress);
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Check if blockchain service is enabled
   */
  isBlockchainEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Record an issue on the blockchain
   */
  async recordIssue(
    issueId: string,
    title: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!this.isEnabled) {
      return { success: false, error: 'Blockchain service not enabled' };
    }

    try {
      console.log(`🔗 Recording issue on blockchain: ${issueId}`);
      // Send transaction to smart contract (only issueId and title)
      const tx = await this.contract.recordIssue(
        issueId,
        title.substring(0, 100)
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log(`✅ Issue recorded on blockchain. TX: ${receipt.hash}`);
      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error: any) {
      console.error('❌ Failed to record issue on blockchain:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Record a vote on the blockchain
   */
  async recordVote(
    issueId: string,
    voterAddress: string,
    isUpvote: boolean
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!this.isEnabled) {
      return { success: false, error: 'Blockchain service not enabled' };
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      
      console.log(`🔗 Recording vote on blockchain: ${issueId}`);
      
      // Send transaction to smart contract
      const tx = await this.contract.recordVote(
        issueId,
        voterAddress,
        isUpvote,
        timestamp
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      console.log(`✅ Vote recorded on blockchain. TX: ${receipt.hash}`);
      
      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error: any) {
      console.error('❌ Failed to record vote on blockchain:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(): Promise<string> {
    if (!this.isEnabled) return '0';
    
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      return '0';
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txHash: string): Promise<any> {
    if (!this.isEnabled) return null;
    
    try {
      const tx = await this.provider.getTransaction(txHash);
      return tx;
    } catch (error) {
      console.error('Failed to get transaction:', error);
      return null;
    }
  }

  /**
   * Get Etherscan link for transaction
   */
  getEtherscanLink(txHash: string): string {
    const network = process.env.ETH_RPC_URL?.includes('sepolia') ? 'sepolia' : 'mainnet';
    return `https://${network}.etherscan.io/tx/${txHash}`;
  }
}

// Export singleton instance
export default new BlockchainService();
