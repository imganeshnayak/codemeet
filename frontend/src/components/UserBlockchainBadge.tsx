import { Shield, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface UserBlockchainBadgeProps {
  blockchainTxHash?: string;
  blockchainVerified?: boolean;
  blockchainTimestamp?: string;
  compact?: boolean; // For use in list cards
}

export function UserBlockchainBadge({
  blockchainTxHash,
  blockchainVerified,
  blockchainTimestamp,
  compact = false,
}: UserBlockchainBadgeProps) {
  // Debug logging
  console.log('UserBlockchainBadge props:', {
    blockchainTxHash,
    blockchainVerified,
    blockchainTimestamp,
    compact
  });

  // Don't show anything if not blockchain verified
  if (!blockchainVerified || !blockchainTxHash) {
    console.log('❌ Badge hidden - not verified or no txHash');
    return null;
  }

  console.log('✅ Badge will be shown');

  const getEtherscanLink = () => {
    return `https://sepolia.etherscan.io/tx/${blockchainTxHash}`;
  };

  // Compact version for list cards
  if (compact) {
    return (
      <Badge 
        className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white"
        title="Verified on Blockchain"
      >
        <Shield className="w-3 h-3 mr-1" />
        Verified
      </Badge>
    );
  }

  // Full version with dialog
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Badge 
          className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white"
        >
          <Shield className="w-3 h-3 mr-1" />
          Blockchain Verified
        </Badge>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Blockchain Verification
          </DialogTitle>
          <DialogDescription>
            This issue has been permanently recorded on the Ethereum blockchain for transparency and immutability.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* What is blockchain verification */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">
              ✨ Why is this important?
            </p>
            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
              <li>Cannot be altered or deleted</li>
              <li>Publicly verifiable on Ethereum network</li>
              <li>Timestamp is permanently recorded</li>
              <li>Ensures accountability and transparency</li>
            </ul>
          </div>

          {/* Transaction Hash */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Transaction Hash</p>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-gray-100 p-2 rounded flex-1 break-all font-mono">
                {blockchainTxHash}
              </code>
            </div>
          </div>

          {/* Timestamp */}
          {blockchainTimestamp && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Recorded On Blockchain</p>
              <p className="text-sm text-gray-600">
                {new Date(blockchainTimestamp).toLocaleString()}
              </p>
            </div>
          )}

          {/* Network Info */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Network</p>
            <p className="text-sm text-gray-600">Ethereum Sepolia Testnet</p>
          </div>

          {/* View on Etherscan */}
          <a
            href={getEtherscanLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View on Etherscan
            <ExternalLink className="w-4 h-4" />
          </a>

          <p className="text-xs text-gray-500 text-center">
            Click above to verify this record on the Ethereum blockchain explorer
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
