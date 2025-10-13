# 🎨 Frontend Blockchain Integration Guide

## Components Created

### 1. BlockchainVerification Component
**File**: `frontend/src/components/BlockchainVerification.tsx`

Shows blockchain verification badge for issues and allows recording new issues.

**Usage in Issue Detail Page**:
```tsx
import { BlockchainVerification } from '@/components/BlockchainVerification';

// Inside your issue detail component
<BlockchainVerification
  issueId={issue._id}
  blockchainTxHash={issue.blockchainTxHash}
  blockchainVerified={issue.blockchainVerified}
  blockchainTimestamp={issue.blockchainTimestamp}
  onRecordSuccess={() => {
    // Refresh issue data
    fetchIssueDetails();
  }}
/>
```

### 2. BlockchainDashboard Component
**File**: `frontend/src/components/BlockchainDashboard.tsx`

Admin dashboard showing blockchain status and verified issues.

**Usage in Admin Panel**:
```tsx
import { BlockchainDashboard } from '@/components/BlockchainDashboard';

// In your admin routes
<Route path="/admin/blockchain" element={<BlockchainDashboard />} />
```

## Integration Steps

### Step 1: Update Issue Model Type
Add to `frontend/src/types/issue.ts` (or wherever your types are):

```typescript
export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  // ... other fields
  
  // Blockchain fields
  blockchainTxHash?: string;
  blockchainVerified?: boolean;
  blockchainTimestamp?: string;
}
```

### Step 2: Add to Issue Card Component
In your issue list/grid component:

```tsx
import { BlockchainVerification } from '@/components/BlockchainVerification';

// Inside the issue card
<div className="flex items-center gap-2 mt-2">
  <BlockchainVerification
    issueId={issue._id}
    blockchainTxHash={issue.blockchainTxHash}
    blockchainVerified={issue.blockchainVerified}
    blockchainTimestamp={issue.blockchainTimestamp}
  />
</div>
```

### Step 3: Add to Issue Detail Page
In your full issue detail view:

```tsx
import { BlockchainVerification } from '@/components/BlockchainVerification';

// Near the issue title or actions section
<div className="flex items-center justify-between mb-4">
  <h1>{issue.title}</h1>
  <BlockchainVerification
    issueId={issue._id}
    blockchainTxHash={issue.blockchainTxHash}
    blockchainVerified={issue.blockchainVerified}
    blockchainTimestamp={issue.blockchainTimestamp}
    onRecordSuccess={() => fetchIssueDetails()}
  />
</div>
```

### Step 4: Add Blockchain Dashboard to Admin Routes
In your `App.tsx` or routing file:

```tsx
import { BlockchainDashboard } from '@/components/BlockchainDashboard';

// Add to admin routes
<Route path="/admin">
  <Route path="dashboard" element={<AdminDashboard />} />
  <Route path="blockchain" element={<BlockchainDashboard />} />
  {/* other admin routes */}
</Route>
```

### Step 5: Add Navigation Link
In your admin sidebar/navigation:

```tsx
import { Shield } from 'lucide-react';

// Add to navigation items
<NavLink to="/admin/blockchain">
  <Shield className="w-5 h-5" />
  <span>Blockchain</span>
</NavLink>
```

## Example: Complete Issue Detail Page

```tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BlockchainVerification } from '@/components/BlockchainVerification';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export function IssueDetail() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);

  const fetchIssue = async () => {
    const response = await fetch(`/api/issues/${id}`);
    const data = await response.json();
    if (data.success) {
      setIssue(data.data);
    }
  };

  useEffect(() => {
    fetchIssue();
  }, [id]);

  if (!issue) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6">
        {/* Header with Blockchain Badge */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{issue.title}</h1>
            <div className="flex items-center gap-2">
              <Badge>{issue.status}</Badge>
              <Badge variant="outline">{issue.category}</Badge>
            </div>
          </div>
          
          {/* Blockchain Verification */}
          <BlockchainVerification
            issueId={issue._id}
            blockchainTxHash={issue.blockchainTxHash}
            blockchainVerified={issue.blockchainVerified}
            blockchainTimestamp={issue.blockchainTimestamp}
            onRecordSuccess={fetchIssue}
          />
        </div>

        {/* Issue Content */}
        <div className="prose max-w-none">
          <p>{issue.description}</p>
        </div>

        {/* Other issue details... */}
      </Card>
    </div>
  );
}
```

## Styling Notes

The components use:
- Tailwind CSS for styling
- shadcn/ui components (Button, Card, Badge, Dialog)
- Lucide React for icons
- Custom blue color scheme for blockchain elements

Colors:
- Primary: `bg-blue-600`, `text-blue-600`
- Success: `bg-green-600`
- Verified badge: `bg-blue-600`

## API Integration

All components automatically connect to your backend:

**Development**: `http://localhost:5000/api`
**Production**: Set `VITE_API_URL` in `.env`

Example `.env`:
```env
VITE_API_URL=https://your-api.com/api
```

## Features Included

✅ Record issue on blockchain (admin/owner only via auth token)
✅ Display verification badge for verified issues
✅ View transaction details modal
✅ Direct link to Etherscan
✅ Blockchain dashboard with status
✅ List of all verified issues
✅ Real-time blockchain status
✅ Wallet balance display
✅ Network information
✅ Loading states and error handling
✅ Toast notifications for user feedback

## Next Steps

1. **Deploy Smart Contract** using Remix IDE (see REMIX_DEPLOYMENT_GUIDE.md)
2. **Update CONTRACT_ADDRESS** in backend `.env` if you deploy a new contract
3. **Test the integration**:
   - Create a test issue
   - Click "Record on Blockchain"
   - Verify on Etherscan
4. **Add to existing pages** following the examples above
5. **Test with real users** on Sepolia testnet

## Testing Checklist

- [ ] Backend blockchain service initializes correctly
- [ ] GET /api/blockchain/status returns valid data
- [ ] POST /api/blockchain/record-issue/:id works with auth token
- [ ] Blockchain badge appears on verified issues
- [ ] Modal shows transaction details
- [ ] Etherscan links work correctly
- [ ] Dashboard displays status and verified issues
- [ ] Record button works and shows loading state
- [ ] Error handling works (no token, network issues, etc.)
- [ ] Toast notifications appear for success/error

## Troubleshooting

### "Blockchain service unavailable"
- Check backend logs for blockchain initialization errors
- Verify `.env` has all blockchain credentials
- Ensure wallet has Sepolia ETH

### "Failed to record on blockchain"
- Check user is authenticated (has valid JWT token)
- Verify wallet has enough Sepolia ETH
- Check backend logs for specific error

### Badge not showing
- Verify issue has `blockchainVerified: true` in database
- Check API response includes blockchain fields
- Inspect browser console for errors

### Etherscan link not working
- Ensure using Sepolia testnet links
- Verify transaction hash format is correct
- Check transaction was confirmed on blockchain
