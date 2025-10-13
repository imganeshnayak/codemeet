import { useEffect, useState } from 'react';
import { Shield, TrendingUp, ExternalLink, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://codemeet-yaus.onrender.com/api';

interface BlockchainStatus {
  enabled: boolean;
  walletAddress: string;
  balance: string;
  network: string;
  contractAddress: string;
}

interface VerifiedIssue {
  _id: string;
  title: string;
  blockchainTxHash: string;
  blockchainTimestamp: string;
  etherscanLink: string;
  reportedBy: {
    name: string;
    email: string;
  };
}

export function BlockchainDashboard() {
  const [status, setStatus] = useState<BlockchainStatus | null>(null);
  const [verifiedIssues, setVerifiedIssues] = useState<VerifiedIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchBlockchainData = async () => {
    try {
      setIsLoading(true);

      // Fetch blockchain status
      const statusRes = await fetch(`${API_URL}/blockchain/status`);
      const statusData = await statusRes.json();
      if (statusData.success) {
        setStatus(statusData.data);
      }

      // Fetch verified issues
      const issuesRes = await fetch(`${API_URL}/blockchain/verified-issues`);
      const issuesData = await issuesRes.json();
      if (issuesData.success) {
        setVerifiedIssues(issuesData.data);
      }
    } catch (error) {
      console.error('Error fetching blockchain data:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to load blockchain data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockchainData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!status?.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Service Unavailable</CardTitle>
          <CardDescription>
            The blockchain service is currently disabled or not configured.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Blockchain Dashboard</h2>
          <p className="text-gray-600">Transparent and immutable civic issue tracking</p>
        </div>
        <Button onClick={fetchBlockchainData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.network}</div>
            <p className="text-xs text-gray-600 mt-1">Ethereum Testnet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.balance}</div>
            <p className="text-xs text-gray-600 mt-1">Available for transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Issues</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedIssues.length}</div>
            <p className="text-xs text-gray-600 mt-1">On blockchain</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-gray-600 mt-1">Service running</p>
          </CardContent>
        </Card>
      </div>

      {/* Contract Info */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Contract Information</CardTitle>
          <CardDescription>Deployed on Sepolia Testnet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Contract Address</p>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-gray-100 p-2 rounded flex-1 break-all">
                {status.contractAddress}
              </code>
              <a
                href={`https://sepolia.etherscan.io/address/${status.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Wallet Address</p>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-gray-100 p-2 rounded flex-1 break-all">
                {status.walletAddress}
              </code>
              <a
                href={`https://sepolia.etherscan.io/address/${status.walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verified Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Blockchain-Verified Issues</CardTitle>
          <CardDescription>
            Issues that have been permanently recorded on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verifiedIssues.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No verified issues yet</p>
              <p className="text-sm mt-1">Start recording issues on the blockchain</p>
            </div>
          ) : (
            <div className="space-y-3">
              {verifiedIssues.map((issue) => (
                <div
                  key={issue._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{issue.title}</h4>
                      <Badge className="bg-blue-600">Verified</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Reported by: {issue.reportedBy.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(issue.blockchainTimestamp).toLocaleString()}
                    </p>
                  </div>
                  <a
                    href={issue.etherscanLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Etherscan
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
