import { useState } from 'react';
import { Shield, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface BlockchainVerificationProps {
  issueId: string;
  blockchainTxHash?: string;
  blockchainVerified?: boolean;
  blockchainTimestamp?: string;
  onRecordSuccess?: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://codemeet-yaus.onrender.com/api';

export function BlockchainVerification({
  issueId,
  blockchainTxHash,
  blockchainVerified,
  blockchainTimestamp,
  onRecordSuccess,
}: BlockchainVerificationProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const { toast } = useToast();

  const recordOnBlockchain = async () => {
    try {
      setIsRecording(true);
      // Use admin token for blockchain recording
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${API_URL}/blockchain/record-issue/${issueId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '✅ Success!',
          description: 'Issue recorded on blockchain successfully',
        });
        if (onRecordSuccess) onRecordSuccess();
      } else {
        toast({
          title: '❌ Error',
          description: data.message || 'Failed to record on blockchain',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error recording on blockchain:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to connect to blockchain service',
        variant: 'destructive',
      });
    } finally {
      setIsRecording(false);
    }
  };

  const verifyTransaction = async () => {
    if (!blockchainTxHash) return;

    try {
      setIsVerifying(true);
      const response = await fetch(`${API_URL}/blockchain/verify/${blockchainTxHash}`);
      const data = await response.json();

      if (data.success) {
        setVerificationData(data.data);
      } else {
        toast({
          title: '❌ Error',
          description: 'Failed to verify transaction',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error verifying transaction:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to verify transaction',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getEtherscanLink = () => {
    if (!blockchainTxHash) return '#';
    return `https://sepolia.etherscan.io/tx/${blockchainTxHash}`;
  };

  // If already verified, show badge
  if (blockchainVerified && blockchainTxHash) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Badge
            className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
            onClick={verifyTransaction}
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
              This issue has been permanently recorded on the Ethereum blockchain
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Transaction Hash */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Transaction Hash</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-gray-100 p-2 rounded flex-1 break-all">
                  {blockchainTxHash}
                </code>
              </div>
            </div>

            {/* Timestamp */}
            {blockchainTimestamp && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Recorded On</p>
                <p className="text-sm text-gray-600">
                  {new Date(blockchainTimestamp).toLocaleString()}
                </p>
              </div>
            )}

            {/* Verification Data */}
            {isVerifying && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            )}

            {verificationData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800 mb-2">✅ Verified on Blockchain</p>
                <div className="space-y-1 text-xs text-green-700">
                  <p>Block: {verificationData.blockNumber}</p>
                  <p>From: {verificationData.from?.slice(0, 10)}...{verificationData.from?.slice(-8)}</p>
                  <p>Gas Used: {verificationData.gasUsed || 'N/A'}</p>
                </div>
              </div>
            )}

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
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If not yet recorded, show button to record
  return (
    <Button
      onClick={recordOnBlockchain}
      disabled={isRecording}
      variant="outline"
      size="sm"
      className="border-blue-600 text-blue-600 hover:bg-blue-50"
    >
      {isRecording ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Recording...
        </>
      ) : (
        <>
          <Shield className="w-4 h-4 mr-2" />
          Record on Blockchain
        </>
      )}
    </Button>
  );
}
