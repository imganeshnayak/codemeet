# 🔗 Blockchain Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CivicHub Platform                            │
│                    (Blockchain-Enabled Civic Engagement)             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌─────────────┐             ┌─────────────┐             ┌─────────────┐
│  Frontend   │             │   Backend   │             │ Blockchain  │
│   React     │◄───────────►│  Node.js    │◄───────────►│  Sepolia    │
│  TypeScript │   REST API  │  Express    │   ethers.js │  Testnet    │
└─────────────┘             └─────────────┘             └─────────────┘
       │                           │                           │
       │                           │                           │
       ▼                           ▼                           ▼
┌─────────────┐             ┌─────────────┐             ┌─────────────┐
│ Components  │             │  MongoDB    │             │   Smart     │
│ - Badge     │             │  Database   │             │  Contract   │
│ - Button    │             │             │             │             │
│ - Modal     │             │  Models:    │             │  Functions: │
│ - Dashboard │             │  - Issue    │             │  - record   │
└─────────────┘             │  - User     │             │  - vote     │
                            │  - Community│             │  - verify   │
                            └─────────────┘             └─────────────┘
```

## Data Flow: Recording an Issue on Blockchain

```
1. User Action
┌──────────────────────────────────────────────────────────┐
│ User clicks "Record on Blockchain" button                │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
2. Frontend Request
┌──────────────────────────────────────────────────────────┐
│ POST /api/blockchain/record-issue/:issueId               │
│ Headers: { Authorization: Bearer <JWT_TOKEN> }           │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
3. Backend Validation
┌──────────────────────────────────────────────────────────┐
│ ✓ Authenticate user (JWT)                                │
│ ✓ Find issue in MongoDB                                  │
│ ✓ Check if already recorded                              │
│ ✓ Verify user permission                                 │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
4. Blockchain Service
┌──────────────────────────────────────────────────────────┐
│ BlockchainService.recordIssue()                          │
│ - Connect to Sepolia via Infura                          │
│ - Sign transaction with private key                      │
│ - Call smart contract recordIssue(id, title)             │
│ - Wait for transaction confirmation                      │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
5. Ethereum Network
┌──────────────────────────────────────────────────────────┐
│ Sepolia Testnet                                          │
│ - Transaction broadcasted to network                     │
│ - Miners validate and include in block                   │
│ - Block confirmed (~10-30 seconds)                       │
│ - Event emitted: IssueRecorded                           │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
6. Update Database
┌──────────────────────────────────────────────────────────┐
│ MongoDB Issue Document:                                  │
│ {                                                         │
│   blockchainTxHash: "0x123...",                          │
│   blockchainVerified: true,                              │
│   blockchainTimestamp: "2025-10-13T..."                  │
│ }                                                         │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
7. Response to Frontend
┌──────────────────────────────────────────────────────────┐
│ {                                                         │
│   success: true,                                          │
│   data: {                                                 │
│     txHash: "0x123...",                                   │
│     etherscanLink: "https://sepolia.etherscan.io/..."    │
│   }                                                       │
│ }                                                         │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
8. UI Update
┌──────────────────────────────────────────────────────────┐
│ ✅ Success toast notification                            │
│ 🔵 Badge changes to "Blockchain Verified"                │
│ 🔗 Etherscan link becomes available                      │
│ 🔄 Issue data refreshed                                  │
└──────────────────────────────────────────────────────────┘
```

## Smart Contract Structure

```
CivicIssueTracker.sol
│
├── Structs
│   ├── Issue
│   │   ├── issueId (MongoDB ObjectId)
│   │   ├── title (string)
│   │   ├── reportedBy (address)
│   │   ├── timestamp (uint256)
│   │   ├── voteCount (uint256)
│   │   └── exists (bool)
│   │
│   └── Vote
│       ├── voter (address)
│       ├── issueId (string)
│       ├── timestamp (uint256)
│       └── support (bool)
│
├── Mappings
│   ├── issues (issueId => Issue)
│   ├── issueVotes (issueId => Vote[])
│   ├── userIssues (address => issueId[])
│   └── hasVoted (address => issueId => bool)
│
├── Functions
│   ├── recordIssue(issueId, title) → event IssueRecorded
│   ├── recordVote(issueId, support) → event VoteRecorded
│   ├── getIssue(issueId) → Issue details
│   ├── getVoteCount(issueId) → uint256
│   ├── getIssueVotes(issueId) → Vote[]
│   ├── getUserIssues(address) → issueId[]
│   ├── checkIfVoted(address, issueId) → bool
│   ├── getTotalIssues() → uint256
│   └── getAllIssues(offset, limit) → issueId[]
│
└── Events
    ├── IssueRecorded(issueId, title, reportedBy, timestamp)
    ├── VoteRecorded(issueId, voter, support, timestamp)
    └── IssueStatusUpdated(issueId, newStatus, timestamp)
```

## Backend Architecture

```
backend/
│
├── src/
│   ├── config/
│   │   └── blockchain.ts ──────────► BlockchainService (Singleton)
│   │                                 │
│   │                                 ├── provider (ethers.JsonRpcProvider)
│   │                                 ├── wallet (ethers.Wallet)
│   │                                 ├── contract (ethers.Contract)
│   │                                 │
│   │                                 └── Methods:
│   │                                     ├── recordIssue()
│   │                                     ├── recordVote()
│   │                                     ├── getBalance()
│   │                                     ├── getTransaction()
│   │                                     └── getEtherscanLink()
│   │
│   ├── controllers/
│   │   └── blockchainController.ts ─► API Handlers
│   │                                 │
│   │                                 ├── getBlockchainStatus()
│   │                                 ├── recordIssueOnBlockchain()
│   │                                 ├── verifyBlockchainTransaction()
│   │                                 └── getBlockchainVerifiedIssues()
│   │
│   ├── routes/
│   │   └── blockchain.routes.ts ────► Express Router
│   │                                 │
│   │                                 ├── GET  /status
│   │                                 ├── GET  /verified-issues
│   │                                 ├── GET  /verify/:txHash
│   │                                 └── POST /record-issue/:id
│   │
│   └── models/
│       └── Issue.ts ─────────────────► MongoDB Schema
│                                      │
│                                      └── New Fields:
│                                          ├── blockchainTxHash
│                                          ├── blockchainVerified
│                                          └── blockchainTimestamp
│
└── contracts/
    └── CivicIssueTracker.sol ────────► Smart Contract (Solidity)
```

## Frontend Component Hierarchy

```
App
│
├── Pages
│   ├── IssueDetail
│   │   ├── IssueHeader
│   │   ├── BlockchainVerification ◄─── NEW
│   │   ├── IssueContent
│   │   └── Comments
│   │
│   └── Admin
│       └── BlockchainDashboard ◄─── NEW
│           ├── StatusCards
│           ├── ContractInfo
│           └── VerifiedIssuesList
│
└── Components
    ├── BlockchainVerification.tsx
    │   ├── Badge (if verified)
    │   ├── RecordButton (if not verified)
    │   └── Dialog
    │       ├── TransactionHash
    │       ├── Timestamp
    │       ├── VerificationData
    │       └── EtherscanLink
    │
    └── BlockchainDashboard.tsx
        ├── Header + RefreshButton
        ├── StatusCards (4 cards)
        │   ├── Network
        │   ├── Balance
        │   ├── VerifiedCount
        │   └── ServiceStatus
        ├── ContractInfo
        │   ├── ContractAddress
        │   └── WalletAddress
        └── VerifiedIssues
            └── IssueCard[]
```

## API Endpoints Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     API Endpoints                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  GET /api/blockchain/status                                 │
│  ├─ Auth: None (Public)                                     │
│  ├─ Returns: Service status, balance, network info          │
│  └─ Used by: Dashboard, status checks                       │
│                                                             │
│  GET /api/blockchain/verified-issues                        │
│  ├─ Auth: None (Public)                                     │
│  ├─ Returns: Array of verified issues                       │
│  └─ Used by: Dashboard, public transparency                 │
│                                                             │
│  GET /api/blockchain/verify/:txHash                         │
│  ├─ Auth: None (Public)                                     │
│  ├─ Returns: Transaction details from blockchain            │
│  └─ Used by: Verification modal, audit                      │
│                                                             │
│  POST /api/blockchain/record-issue/:issueId                 │
│  ├─ Auth: Required (JWT)                                    │
│  ├─ Action: Records issue on blockchain                     │
│  ├─ Returns: Transaction hash, Etherscan link               │
│  └─ Used by: Record button, admin actions                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Security & Authentication Flow

```
Client Request
      │
      ▼
┌─────────────────────┐
│  Include JWT Token  │
│  in Authorization   │
│  header             │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  authenticate       │
│  middleware         │
│  (verifies token)   │
└──────────┬──────────┘
           │
      ✓ Valid?
           │
    ┌──────┴──────┐
    │             │
   YES           NO
    │             │
    ▼             ▼
┌────────┐   ┌─────────┐
│ Allow  │   │ Reject  │
│ Access │   │ 401     │
└────────┘   └─────────┘
```

## Environment Configuration

```
.env
├── Database
│   └── MONGODB_URI=mongodb://...
│
├── Authentication
│   ├── JWT_SECRET=...
│   └── JWT_EXPIRES_IN=7d
│
├── Blockchain ◄── NEW
│   ├── ETH_PRIVATE_KEY=11aec6...
│   ├── ETH_RPC_URL=https://sepolia.infura.io/...
│   ├── CONTRACT_ADDRESS=0xa3A5...
│   └── WALLET_ADDRESS=0x8b2A...
│
└── Other Services
    ├── CLOUDINARY_*
    └── HUGGINGFACE_API_KEY
```

## Network Topology

```
                    Internet
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Browser    │  │   Backend    │  │   Sepolia    │
│   (Client)   │  │   Server     │  │   Network    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       │ HTTPS           │ HTTPS           │ WebSocket
       │ Port 443        │ Port 443        │ (Infura)
       │                 │                 │
       ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ React App    │  │ Express.js   │  │ Ethereum     │
│ localhost:   │  │ localhost:   │  │ Nodes        │
│ 5173         │  │ 5000         │  │ Distributed  │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Transaction Lifecycle

```
1. Initiated
   ├─ User clicks button
   ├─ API call made
   └─ Backend receives request

2. Validation
   ├─ Auth checked
   ├─ Issue exists?
   └─ Already recorded?

3. Signing
   ├─ Transaction created
   ├─ Signed with private key
   └─ Gas estimated

4. Broadcasting
   ├─ Sent to Sepolia network
   ├─ Enters mempool
   └─ Pending confirmation

5. Mining
   ├─ Picked up by miner
   ├─ Included in block
   └─ Block sealed

6. Confirmation
   ├─ Block added to chain
   ├─ Transaction confirmed (1+ blocks)
   └─ Receipt generated

7. Verification
   ├─ Backend receives txHash
   ├─ Updates MongoDB
   └─ Returns to frontend

8. Display
   ├─ Badge shown
   ├─ Etherscan link active
   └─ Transaction verifiable
```

## Technology Stack

```
┌─────────────────────────────────────────────────────┐
│                   Frontend                          │
├─────────────────────────────────────────────────────┤
│  React 18  │  TypeScript  │  Vite  │  Tailwind CSS │
│  shadcn/ui  │  Lucide Icons  │  React Router       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                   Backend                           │
├─────────────────────────────────────────────────────┤
│  Node.js 20  │  Express 4  │  TypeScript  │  JWT   │
│  MongoDB  │  Mongoose  │  bcrypt  │  Cloudinary    │
│  ethers.js 6 ◄── NEW  │  web3 4 ◄── NEW            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                  Blockchain                         │
├─────────────────────────────────────────────────────┤
│  Ethereum  │  Sepolia Testnet  │  Solidity 0.8+    │
│  Smart Contract  │  Infura RPC  │  Etherscan        │
└─────────────────────────────────────────────────────┘
```

---

**Visual guides complete!** 🎨

All architecture and flow diagrams created to help understand the system.
