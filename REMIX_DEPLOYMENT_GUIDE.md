# 🚀 Smart Contract Deployment Guide (Remix IDE)

## Prerequisites
- MetaMask wallet installed
- Some Sepolia ETH (get from faucet: https://sepoliafaucet.com/)
- Your wallet: `0x8b2A1FAb32fa90d6cD9CB0879765572aE03dD972`

## Step 1: Open Remix IDE
1. Go to: https://remix.ethereum.org/
2. You'll see the Remix IDE interface

## Step 2: Create the Contract
1. In the **File Explorer** (left sidebar), click the "+" icon to create a new file
2. Name it: `CivicIssueTracker.sol`
3. Copy the entire content from `backend/contracts/CivicIssueTracker.sol`
4. Paste it into Remix

## Step 3: Compile the Contract
1. Click on the **Solidity Compiler** icon (left sidebar, looks like "S")
2. Select compiler version: `0.8.0` or higher (e.g., 0.8.20)
3. Click **"Compile CivicIssueTracker.sol"** button
4. ✅ You should see a green checkmark when compilation succeeds

## Step 4: Connect MetaMask
1. Click on the **Deploy & Run Transactions** icon (left sidebar)
2. In the **ENVIRONMENT** dropdown, select **"Injected Provider - MetaMask"**
3. MetaMask will popup - click **"Connect"**
4. Make sure you're on **Sepolia Test Network** in MetaMask
   - If not, click MetaMask → Networks → Sepolia

## Step 5: Deploy the Contract
1. In the **CONTRACT** dropdown, select `CivicIssueTracker`
2. Click the orange **"Deploy"** button
3. MetaMask will popup asking you to confirm the transaction
4. Review the gas fee (should be free on testnet)
5. Click **"Confirm"**
6. Wait 10-30 seconds for the transaction to be mined

## Step 6: Get Your Contract Address
1. After deployment, look at the **Deployed Contracts** section (bottom left)
2. You'll see: `CIVICISSUETRACKER AT 0x...` (some address)
3. Click the **copy icon** next to the address
4. **SAVE THIS ADDRESS** - this is your new contract address!

## Step 7: Verify Contract on Etherscan (Optional but Recommended)
1. Go to: https://sepolia.etherscan.io/
2. Paste your contract address in the search bar
3. Click on the **"Contract"** tab
4. Click **"Verify and Publish"**
5. Follow the verification steps (Remix can help with this)

## Step 8: Update Backend Configuration

### Option A: Use New Contract Address
If you deployed a NEW contract, update your `.env`:

```env
CONTRACT_ADDRESS=0xYOUR_NEW_CONTRACT_ADDRESS_HERE
```

### Option B: Use Existing Contract (if already deployed)
If the contract is already deployed at `0xa3A55Fb7b4107CD6653ea8CE5dc1c87807e6A610`:
- Check if it exists: https://sepolia.etherscan.io/address/0xa3A55Fb7b4107CD6653ea8CE5dc1c87807e6A610
- If it exists and has the correct code, no changes needed!
- If it doesn't exist, deploy a new one and update `.env`

## Step 9: Test the Contract in Remix

### Test 1: Record an Issue
1. In **Deployed Contracts**, expand your contract
2. Find the `recordIssue` function
3. Enter test data:
   - `_issueId`: "test123"
   - `_title`: "Pothole on Main Street"
4. Click **"transact"**
5. Confirm in MetaMask
6. ✅ You should see the `IssueRecorded` event in the logs

### Test 2: Get Issue Details
1. Find the `getIssue` function
2. Enter: `_issueId`: "test123"
3. Click **"call"** (blue button - this is free, no gas)
4. ✅ You should see the issue details returned

### Test 3: Record a Vote
1. Find the `recordVote` function
2. Enter:
   - `_issueId`: "test123"
   - `_support`: true
3. Click **"transact"**
4. Confirm in MetaMask
5. ✅ Vote recorded!

### Test 4: Get Vote Count
1. Find the `getVoteCount` function
2. Enter: `_issueId`: "test123"
3. Click **"call"**
4. ✅ Should return 1

## Step 10: Update Backend Code (if contract address changed)

If you deployed a new contract, update `.env`:

```bash
cd C:\Users\User\Desktop\codemeet\backend
notepad .env
```

Change:
```env
CONTRACT_ADDRESS=0xYOUR_NEW_CONTRACT_ADDRESS
```

Then restart the backend:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

## Step 11: Test Backend Integration

### Test Blockchain Status
```bash
curl http://localhost:5000/api/blockchain/status
```

Expected response:
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "walletAddress": "0x8b2A1FAb32fa90d6cD9CB0879765572aE03dD972",
    "balance": "0.5 ETH",
    "network": "Sepolia Testnet",
    "contractAddress": "0xa3A55..."
  }
}
```

## Troubleshooting

### Error: "Insufficient funds"
- Go to Sepolia faucet: https://sepoliafaucet.com/
- Enter your wallet address: `0x8b2A1FAb32fa90d6cD9CB0879765572aE03dD972`
- Request test ETH
- Wait a few minutes and try again

### Error: "Wrong network"
- Open MetaMask
- Click network dropdown at the top
- Select "Sepolia Test Network"
- If not visible, go to Settings → Advanced → Show test networks

### Error: "Contract not deployed"
- Check Etherscan: https://sepolia.etherscan.io/address/YOUR_ADDRESS
- If no contract found, deploy again
- Make sure transaction was confirmed (green checkmark in MetaMask)

### Error: "Nonce too low"
- MetaMask → Settings → Advanced → Reset Account
- This will clear pending transactions

## Next Steps After Deployment

1. ✅ Update `.env` with new contract address (if changed)
2. ✅ Restart backend server
3. ✅ Test `GET /api/blockchain/status`
4. ✅ Create a test issue via your app
5. ✅ Record it on blockchain via `POST /api/blockchain/record-issue/:issueId`
6. ✅ Verify on Etherscan
7. ✅ Add frontend UI components (next step)

## Useful Links
- Remix IDE: https://remix.ethereum.org/
- Sepolia Etherscan: https://sepolia.etherscan.io/
- Sepolia Faucet: https://sepoliafaucet.com/
- Your Wallet: https://sepolia.etherscan.io/address/0x8b2A1FAb32fa90d6cD9CB0879765572aE03dD972
- MetaMask: https://metamask.io/

## Gas Cost Estimates (Sepolia - FREE)
- Deploy Contract: ~0.002 ETH (FREE on testnet)
- Record Issue: ~0.0005 ETH (FREE on testnet)
- Record Vote: ~0.0003 ETH (FREE on testnet)
- Read Operations: FREE (no gas needed)

## Security Notes
🔒 **IMPORTANT**: Never share your private key!
🔒 The contract is immutable once deployed
🔒 Test thoroughly before deploying to mainnet
🔒 Consider getting a security audit for production
