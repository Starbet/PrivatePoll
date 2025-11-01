# PrivatePoll

**Fully Encrypted Voting Platform powered by Zama FHE**

🚀 **[Live Demo](#)** | 📖 [Documentation](#getting-started) | 🔗 [Smart Contract](#)

PrivatePoll is a decentralized polling platform where votes remain completely private through end-to-end encryption using Zama's Fully Homomorphic Encryption (FHE). Individual votes are encrypted on-chain and only revealed after the deadline - not even the blockchain can see how you voted.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [Smart Contract](#smart-contract)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

PrivatePoll enables users to:
- **Create Polls**: Host encrypted yes/no polls with custom deadlines
- **Cast Private Votes**: Submit votes encrypted on-chain - nobody can see how you voted
- **Reveal Results**: View aggregated results after the poll deadline
- **Track Participation**: Manage polls you've created and votes you've cast

Unlike traditional polling platforms, PrivatePoll ensures complete privacy through FHE encryption, making it ideal for:
- DAO governance decisions
- Anonymous community voting
- Private team polls
- Confidential surveys

---

## Key Features

### 🔐 End-to-End Encryption
- Votes encrypted using euint8 (FHE)
- Individual votes remain private until reveal
- Powered by Zama's FHE technology
- Zero-knowledge voting

### 👤 Privacy-First Design
- No public vote visibility
- Encrypted data stored on-chain
- Results revealed only after deadline
- Anonymous participation

### 📱 Modern User Experience
- Facebook-inspired UI design
- Real-time encryption progress
- Intuitive poll creation and voting
- Seamless wallet integration via RainbowKit
- Mobile-responsive with adaptive wallet display

### ⚡ Decentralized & Trustless
- Smart contracts on Ethereum Sepolia
- No central authority
- Transparent and verifiable
- Immutable encrypted votes

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Landing    │  │    Browse    │  │   My Polls   │  │
│  │     Page     │  │    Polls     │  │   Dashboard  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Zama FHE SDK & Relayer                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Encryption/Decryption Engine                     │  │
│  │  - Vote encryption (euint8)                       │  │
│  │  - Vote decryption (user only)                    │  │
│  │  - Key management & signatures                    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│           Smart Contract (Ethereum Sepolia)              │
│  ┌──────────────────────────────────────────────────┐  │
│  │  PrivatePoll.sol                                  │  │
│  │  - Poll management                                │  │
│  │  - Encrypted vote storage                         │  │
│  │  - Result revelation                              │  │
│  │  - Access control (FHE.allow)                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Poll Creation**: Creator sets question, description, and deadline
2. **Vote Casting**: User encrypts vote (yes/no) → stores encrypted data on-chain → vote remains private
3. **Vote Storage**: Encrypted votes accumulate until deadline
4. **Result Revelation**: After deadline → results revealed → show yes/no counts and percentages

---

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **date-fns** - Date formatting

### Blockchain
- **Solidity 0.8.24** - Smart contract language
- **Hardhat** - Development environment
- **Zama fhEVM** - FHE-enabled EVM (euint8 for votes)
- **Ethereum Sepolia** - Test network

### Web3 Integration
- **wagmi** - React hooks for Ethereum
- **viem** - TypeScript Ethereum library
- **RainbowKit** - Wallet connection UI
- **ethers.js** - Ethereum utilities

### Encryption
- **Zama FHE SDK** - Fully Homomorphic Encryption
- **fhEVM** - FHE operations on-chain (euint8 for boolean votes)
- **Relayer SDK** - Key management and decryption

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MetaMask or compatible Web3 wallet
- Sepolia ETH for gas fees
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/privateqa.git
cd privateqa
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Configuration

1. **Smart Contract Setup**

Create `.env` in the root directory:
```env
PRIVATE_KEY=your_wallet_private_key
INFURA_API_KEY=your_infura_api_key
```

2. **Frontend Setup**

Create `frontend/.env`:
```env
VITE_PRIVATEPOLL_CONTRACT_ADDRESS=0xYourDeployedContractAddress
VITE_INFURA_API_KEY=your_infura_api_key
```

### Running the Application

1. **Deploy Smart Contract** (if not already deployed)
```bash
npx hardhat run scripts/deployPrivatePoll.js --network sepolia
```

2. **Start Frontend Development Server**
```bash
cd frontend
npm run dev
```

3. **Access the application**
Open http://localhost:5173 in your browser

---

## Smart Contract

### PrivatePoll.sol

The core smart contract manages all encrypted voting operations.

**Key Functions:**

```solidity
// Create a new poll
function createPoll(
    string memory question,
    string memory description,
    uint256 duration
) external returns (uint256)

// Cast an encrypted vote
function castVote(
    uint256 pollId,
    externalEuint8 encryptedVote,
    bytes calldata inputProof
) external

// Request access to decrypt own vote
function requestVoteAccess(uint256 pollId) external

// Get encrypted vote (voter only)
function getEncryptedVote(uint256 pollId) 
    external view returns (euint8)

// Reveal results after deadline
function revealResults(uint256 pollId) external

// Close a poll early (creator only)
function closePoll(uint256 pollId) external

// Check if user has voted
function hasVoted(uint256 pollId, address voter) 
    external view returns (bool)
```

**Deployed Contract:**
- Network: Ethereum Sepolia
- Address: `Deploy your own contract`
- Use: `npx hardhat run scripts/deployPrivatePoll.js --network sepolia`

---

## How It Works

### 1. Creating a Poll

```typescript
// Creator creates a poll
const pollId = await createPoll(
  "Should we implement feature X?",
  "Vote on our next feature",
  24 // 24 hours
);
```

### 2. Casting a Vote

```typescript
// User encrypts and submits vote
await castVote(
  pollId,
  true, // true = YES, false = NO
  (step) => console.log(step) // Progress callback
);
```

**Encryption Process:**
1. Initialize FHE SDK
2. Convert boolean to number (1 = yes, 0 = no)
3. Encrypt using `euint8`
4. Generate input proof
5. Submit to blockchain
6. Vote stored encrypted on-chain

### 3. Revealing Results

```typescript
// Anyone can reveal results after deadline
await revealResults(pollId);
```

### 4. Viewing Your Vote

```typescript
// Decrypt your own vote
const myVote = await decryptOwnVote(pollId);
console.log(myVote ? "YES" : "NO");
```

**Decryption Process:**
1. Request access via smart contract
2. Generate keypair
3. Sign EIP-712 message
4. Fetch encrypted vote
5. Decrypt via Zama relayer
6. Convert to boolean

---

## Project Structure

```
privatepoll/
├── contracts/
│   ├── PrivatePoll.sol            # Main smart contract
│   └── PrivateQA.sol              # Legacy Q&A contract
├── scripts/
│   ├── deployPrivatePoll.js       # Poll deployment script
│   └── deployPrivateQA.js         # Legacy deployment
├── frontend/
│   ├── src/
│   │   ├── abi/
│   │   │   └── PrivatePoll.json   # Contract ABI
│   │   ├── components/
│   │   │   └── ChainGuard.tsx     # Network validation
│   │   ├── config/
│   │   │   └── wagmi.ts           # Web3 configuration
│   │   ├── hooks/
│   │   │   └── usePrivatePoll.ts  # Main React hook
│   │   ├── pages/
│   │   │   ├── PollLandingPage.tsx
│   │   │   ├── PollBrowsePage.tsx
│   │   │   ├── PollCreatePage.tsx
│   │   │   ├── PollDetailPage.tsx
│   │   │   └── MyPollsPage.tsx
│   │   ├── utils/
│   │   │   └── fhe.ts             # FHE utilities
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── hardhat.config.js
├── package.json
└── README.md
```

---

## Deployment

### Smart Contract Deployment

```bash
# Deploy to Sepolia
npx hardhat run scripts/deployPrivatePoll.js --network sepolia

# Verify contract
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

### Frontend Deployment

**Vercel (Recommended):**

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

**Manual Build:**

```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting provider
```

---

## Security

### Encryption Security
- **FHE Encryption**: Questions and answers encrypted with Zama's FHE
- **Access Control**: Smart contract enforces who can decrypt what
- **Zero-Knowledge**: Blockchain cannot read encrypted data

### Smart Contract Security
- **Access Modifiers**: Functions restricted to authorized users
- **Input Validation**: All inputs validated on-chain
- **Reentrancy Protection**: Standard security patterns applied

### Best Practices
- Never share private keys
- Always verify contract addresses
- Use hardware wallets for production
- Test on testnet first

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Zama](https://zama.ai/) - For FHE technology and fhEVM
- [Ethereum](https://ethereum.org/) - For the blockchain infrastructure
- [Hardhat](https://hardhat.org/) - For development tools
- [RainbowKit](https://www.rainbowkit.com/) - For wallet connection UI

---

## Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Join our community discussions

---

**Built with ❤️ using Zama FHE • Powered by Ethereum Sepolia**

---

## UI Design

PrivatePoll features a Facebook-inspired UI design:
- **Color Scheme**: Facebook Blue (#1877F2) with clean grays
- **Card-based Layout**: White cards with subtle shadows on gray background
- **Icon Navigation**: Bottom navigation bar with icons and active indicators
- **Wallet Display**: Rounded pill button showing balance and address
- **Responsive Design**: Mobile-first with adaptive layouts
- **Modal Popups**: Clean modals for wallet management and confirmations
- **Real-time Feedback**: Progress indicators and toast notifications
