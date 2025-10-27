# BridgeFi

BridgeFi is a comprehensive decentralized finance platform that combines cross-chain swaps, on-chain credit scoring, and decentralized lending into a single, user-friendly ecosystem. Built on the Stacks blockchain with Clarity smart contracts, BridgeFi empowers users to seamlessly exchange assets, build credit history, and access fair lending opportunities.

## What is BridgeFi?

BridgeFi revolutionizes DeFi by integrating three powerful features:

### 🔄 Cross-Chain Swaps
Exchange STX tokens for EVM-compatible assets (like USDC) instantly and securely through audited smart contracts with low fees (0.5%).

### 📊 On-Chain Credit Scores
Build your decentralized credit score (300-850 range) based on transaction history, successful swaps, account activity, and loan repayment behavior.

### 💰 Decentralized Lending
Borrow STX tokens secured by collateral with fair 10% annual interest rates. Loan limits vary by credit score:
- **Low Score (300-499)**: Up to 10 STX
- **Medium Score (500-699)**: Up to 25 STX
- **High Score (700-850)**: Up to 50 STX

## Key Features

- **Fast & Secure**: Transactions complete in 10-60 seconds with audited contracts
- **Credit-Based Access**: Higher scores unlock better loan terms and limits
- **Cross-Chain Compatibility**: Seamlessly bridge between Stacks and EVM networks
- **Transparent Fees**: Clear pricing with no hidden costs
- **Non-Custodial**: Users maintain full control of their assets

## Tech Stack

- **Frontend**: SvelteKit with TypeScript
- **Backend**: Elysia.js with Bun runtime
- **Blockchain**: Stacks with Clarity smart contracts
- **Database**: MongoDB

## Project Structure

```
├── frontend/          # SvelteKit application
├── backend/           # Elysia.js API server
├── contracts/         # Clarity smart contracts
│   ├── cross-chain-swap/
│   └── lending-system/
└── README.md
```

## Installation

1. Clone the repository
2. Install dependencies for each component:

### Frontend
```bash
cd frontend
bun install
```

### Backend
```bash
cd backend
bun install
```

### Contracts
```bash
cd contracts/cross-chain-swap
npm install

cd ../lending-system
npm install
```

## Development

### Frontend
```bash
cd frontend
bun run dev
```
Open http://localhost:5173 to view the frontend.

### Backend
```bash
cd backend
bun run dev
```
The API server will run on http://localhost:3000.

### Contracts
Use Clarinet for contract development and testing.

## Building

### Frontend
```bash
cd frontend
bun run build
```

### Backend
```bash
cd backend
bun run build
```

## Environment Variables

Create `.env` files in the respective directories as needed. Here are the required environment variables for each component:

### Backend (.env)
```
PORT=4000
DB_NAME=bridgefi
MONGODB_URI=mongodb://localhost:27017
ALLOW_ORIGIN=https://bridgefi.coin0.xyz
CEREBRAS_API_KEY=your_cerebras_api_key (optional - for future AI integration)
ETN_PRIVATE_KEY=your_etn_private_key
```

### Frontend (.env)
```
# Stacks Network Configuration
VITE_STACKS_NETWORK=testnet
VITE_STACKS_API_URL=https://api.testnet.hiro.so

# Contract Addresses
VITE_CONTRACT_ADDRESS=ST23JSMGR5933QJ329PKPNNQJV6QG8Z9D33QBYDNX

# Swap Contract
VITE_SWAP_CONTRACT_NAME=escrow-swap-v2

# Lending Contract
VITE_LENDING_CONTRACT_NAME=lending-system-v10

# API Configuration
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_BACKEND_URL=http://localhost:4000
VITE_FRONTEND_URL=http://localhost:5173
```

### Contracts
Environment variables for contract deployment and testing should be configured in the respective contract directories.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

(Add your license here)
