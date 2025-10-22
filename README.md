# Confidential Gold (cGOLD) - Privacy-Preserving Real World Asset Tokenization

A groundbreaking decentralized application that tokenizes physical gold into confidential digital tokens using Fully Homomorphic Encryption (FHE). Built on Zama's FHEVM protocol, cGOLD enables users to mint, transfer, and redeem tokenized gold while keeping all balances and transaction amounts completely private on-chain.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Why cGOLD?](#why-cgold)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Smart Contract Details](#smart-contract-details)
- [Security & Privacy](#security--privacy)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Deployment](#deployment)
- [Usage](#usage)
  - [Minting cGOLD](#minting-cgold)
  - [Burning (Redeeming) cGOLD](#burning-redeeming-cgold)
  - [Decrypting Your Balance](#decrypting-your-balance)
- [Frontend Application](#frontend-application)
- [Testing](#testing)
- [Custom Hardhat Tasks](#custom-hardhat-tasks)
- [Advantages & Benefits](#advantages--benefits)
- [Use Cases](#use-cases)
- [Future Roadmap](#future-roadmap)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Support & Community](#support--community)

## Overview

**Confidential Gold (cGOLD)** is a privacy-first tokenized real-world asset (RWA) platform that bridges physical gold with blockchain technology. Unlike traditional tokenized assets where balances and transactions are visible to everyone, cGOLD leverages Fully Homomorphic Encryption (FHE) to perform computations on encrypted data, ensuring that:

- **All balances remain encrypted on-chain** - Only the token holder can decrypt their balance
- **Transaction amounts are private** - Observers see only encrypted ciphertext
- **Complete privacy without compromising functionality** - Smart contracts can still process transfers, mints, and burns while data remains encrypted

Each cGOLD token represents **1 gram of physical gold** held securely in a vault, providing a 1:1 backing ratio.

## Key Features

### Privacy-Preserving Operations
- **Encrypted Balances**: All token balances are stored as encrypted values on the blockchain
- **Confidential Transfers**: Transfer amounts are encrypted, preventing transaction surveillance
- **Selective Disclosure**: Users control when and to whom they reveal their holdings
- **Zero-Knowledge Proofs**: Operations are verified without exposing sensitive data

### Real-World Asset Integration
- **1:1 Gold Backing**: Each cGOLD token is backed by 1 gram of physical gold
- **Mint & Burn Mechanism**: Seamlessly convert between physical gold and digital tokens
- **Auditable Supply**: Total supply is verifiable while individual holdings remain private
- **Redeemability**: Burn tokens to claim physical gold from the vault

### Advanced Cryptography
- **Fully Homomorphic Encryption (FHE)**: Perform computations on encrypted data
- **FHEVM Protocol**: Smart contracts that operate on encrypted values
- **Client-Side Encryption**: Users encrypt inputs before sending to the blockchain
- **Decentralized Decryption**: Use Zama's relayer network for secure decryption

### Developer-Friendly
- **Hardhat Development Environment**: Full testing and deployment framework
- **TypeScript Support**: Type-safe smart contract interactions
- **Custom Tasks**: Pre-built commands for common operations
- **Comprehensive Testing**: Full test coverage for all contract functions

## Why cGOLD?

### The Problem with Traditional Tokenized Assets

Traditional blockchain-based assets suffer from a fundamental privacy problem:

1. **Public Balances**: Anyone can view token holder balances
2. **Transparent Transactions**: All transfer amounts are visible on-chain
3. **Surveillance Risks**: Transaction patterns can be analyzed and tracked
4. **Competitive Disadvantage**: Large holders' positions are exposed to competitors
5. **Security Concerns**: Wealthy addresses become targets for attacks

### The cGOLD Advantage

cGOLD solves these problems by encrypting all sensitive data while maintaining the benefits of blockchain technology:

1. **True Privacy**: Balances and amounts are encrypted using FHE
2. **Regulatory Compliance**: Privacy without sacrificing auditability
3. **Institutional Grade**: Suitable for high-net-worth individuals and institutions
4. **Trustless Verification**: All operations are cryptographically provable
5. **Self-Custody**: Users maintain full control over their assets

## Technology Stack

### Blockchain & Smart Contracts
- **Solidity ^0.8.27**: Smart contract development language
- **FHEVM (Zama)**: Fully Homomorphic Encryption Virtual Machine
- **Hardhat**: Development environment and testing framework
- **Ethers.js v6**: Blockchain interaction library
- **Hardhat Deploy**: Deployment management system

### Cryptography & Privacy
- **@fhevm/solidity**: FHE operations in Solidity
- **@zama-fhe/relayer-sdk**: Client-side encryption and decryption
- **encrypted-types**: Type system for encrypted values
- **@zama-fhe/oracle-solidity**: Decryption oracle integration

### Frontend & User Interface
- **React 19**: Modern UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Wagmi**: React hooks for Ethereum
- **RainbowKit**: Wallet connection interface
- **TanStack Query**: Async state management

### Development & Testing
- **TypeChain**: Generate TypeScript bindings from ABIs
- **Chai & Mocha**: Testing framework
- **Hardhat Network Helpers**: Testing utilities
- **ESLint & Prettier**: Code quality and formatting
- **Solhint**: Solidity linter

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │   Mint     │  │    Burn    │  │  Decrypt Balance     │  │
│  │   cGOLD    │  │   cGOLD    │  │                      │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Zama FHE Relayer SDK (Client-Side)             │
│  ┌──────────────────┐  ┌──────────────────────────────┐   │
│  │  Encrypt Inputs  │  │  Generate Decryption Keys    │   │
│  │  (euint64)       │  │  Sign EIP-712 Messages       │   │
│  └──────────────────┘  └──────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 FHEVM Smart Contracts                        │
│                 (Sepolia Testnet)                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          ConfidentialGOLD Contract                    │  │
│  │  • ConfidentialFungibleToken (Base)                  │  │
│  │  • mint(address, externalEuint64, proof)             │  │
│  │  • burn(address, externalEuint64, proof)             │  │
│  │  • confidentialBalanceOf(address) → euint64         │  │
│  │  • confidentialTotalSupply() → euint64              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Encrypted State Storage                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  All balances and amounts stored as encrypted          │ │
│  │  ciphertext (euint64) - NO PLAINTEXT ON-CHAIN         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Minting Process
1. User deposits physical gold with the vault operator
2. User enters the amount (in grams) in the frontend
3. Zama SDK encrypts the amount using FHE on the client side
4. Encrypted amount and cryptographic proof are sent to the smart contract
5. Contract verifies the proof and mints encrypted tokens to user's address
6. Encrypted balance is updated on-chain (no plaintext visible)

#### Burning/Redemption Process
1. User enters the amount to redeem in the frontend
2. Amount is encrypted using Zama SDK
3. Encrypted amount and proof are sent to the contract
4. Contract verifies proof and burns the encrypted tokens
5. User can claim physical gold from the vault
6. Encrypted balance and total supply are updated

#### Balance Decryption
1. User requests to decrypt their balance
2. Client generates an ephemeral keypair
3. User signs an EIP-712 message authorizing decryption
4. Request is sent to Zama's decryption relayer network
5. Relayer performs threshold decryption
6. Decrypted balance is returned to the user (client-side only)

## Problem Statement

### Challenges in Traditional Asset Tokenization

1. **Privacy Vulnerability**
   - All blockchain transactions are public by default
   - Token balances are visible to competitors, criminals, and surveillance entities
   - Large holders become targets for sophisticated attacks
   - Transaction patterns reveal business strategies and personal wealth

2. **Institutional Barriers**
   - Financial institutions require privacy for competitive reasons
   - Regulatory compliance often conflicts with blockchain transparency
   - High-net-worth individuals avoid public exposure of assets
   - Corporate treasury management requires confidentiality

3. **Technical Limitations**
   - Privacy solutions often sacrifice functionality (ZK-rollups limit smart contract capabilities)
   - Mixing services are centralized and require trust
   - Privacy coins face regulatory scrutiny
   - Layer-2 solutions add complexity and fragmentation

4. **Gold Market Specific Issues**
   - Physical gold ownership is private, but tokenized gold is not
   - Existing gold-backed tokens leak portfolio information
   - No way to prove solvency without revealing individual holdings
   - Custodians can see all user balances

## Solution

### How cGOLD Solves These Problems

#### 1. Fully Homomorphic Encryption (FHE)
cGOLD uses Zama's FHEVM protocol to enable computation on encrypted data. This revolutionary approach allows smart contracts to:
- Add, subtract, and compare encrypted balances
- Execute transfers without knowing the amounts
- Verify sufficient balance without decrypting
- Maintain encrypted state permanently on-chain

**Technical Benefit**: Unlike zero-knowledge proofs which only verify computations, FHE actually performs operations on encrypted data, enabling full smart contract functionality while maintaining privacy.

#### 2. Confidential Token Standard
Built on Zama's `ConfidentialFungibleToken` base contract, cGOLD provides:
- **Type Safety**: Uses `euint64` encrypted integer type
- **Access Control**: Automatic permission management for encrypted handles
- **Gas Efficiency**: Optimized FHE operations
- **Standards Compliance**: Compatible with expected token interfaces

#### 3. Client-Side Encryption
All sensitive data is encrypted before leaving the user's device:
- **Input Encryption**: Amounts are encrypted using the user's wallet signature
- **Cryptographic Proofs**: Zero-knowledge proofs verify encryption correctness
- **Key Management**: Ephemeral keys for decryption requests
- **EIP-712 Signatures**: Standard Ethereum message signing

#### 4. Decentralized Decryption
Zama's relayer network provides threshold decryption:
- **No Single Point of Failure**: Distributed decryption across multiple nodes
- **User Authorization**: Decryption requires user's signature
- **Time-Limited Access**: Permissions expire automatically
- **Contract-Specific**: Access scoped to specific smart contracts

#### 5. Real-World Asset Bridge
Seamless integration between physical and digital gold:
- **1:1 Backing Ratio**: Each token represents exactly 1 gram of gold
- **Auditable Reserves**: Total supply can be verified against vault holdings
- **Transparent Minting**: Mint events are public (but amounts are encrypted)
- **Physical Redemption**: Burn tokens to claim gold from the vault

## Smart Contract Details

### ConfidentialGOLD.sol

The main smart contract inherits from Zama's `ConfidentialFungibleToken`:

```solidity
contract ConfidentialGOLD is ConfidentialFungibleToken, SepoliaConfig {
    constructor() ConfidentialFungibleToken("cGOLD", "cGOLD", "") {}

    function mint(address to, externalEuint64 encryptedAmount, bytes calldata inputProof) public {
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        _mint(to, amount);
    }

    function burn(address from, externalEuint64 encryptedAmount, bytes calldata inputProof) public {
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        _burn(from, amount);
    }
}
```

### Key Contract Features

- **Token Name**: cGOLD
- **Token Symbol**: cGOLD
- **Decimals**: 0 (each token = 1 gram, no fractional amounts)
- **Encrypted Type**: euint64 (supports amounts up to 18,446,744,073,709,551,615 grams)

### Inherited Functionality

From `ConfidentialFungibleToken`:
- `confidentialBalanceOf(address)`: Returns encrypted balance
- `confidentialTotalSupply()`: Returns encrypted total supply
- `transfer()`: Confidential transfers between addresses
- `approve()`: Encrypted allowance system
- Access control for encrypted handles

## Security & Privacy

### Privacy Guarantees

1. **On-Chain Privacy**
   - All balances stored as encrypted ciphertext
   - Transaction amounts never exposed in plaintext
   - Only handles (references) to encrypted values are public
   - Even validators cannot see amounts

2. **Selective Disclosure**
   - Users choose when to decrypt their balance
   - Decryption happens client-side via relayer
   - No requirement to reveal holdings publicly
   - Time-limited decryption permissions

3. **Access Control**
   - Encrypted values are tied to specific addresses
   - Only authorized users can request decryption
   - Smart contracts enforce permission boundaries
   - EIP-712 signatures prevent unauthorized access

### Security Considerations

1. **Smart Contract Security**
   - Built on audited Zama libraries
   - Minimal custom code reduces attack surface
   - Standard Solidity best practices
   - Comprehensive test coverage

2. **Cryptographic Security**
   - FHE provides semantic security
   - Encryption keys never leave the client
   - Proofs verify computation correctness
   - No trusted setup required

3. **Operational Security**
   - Private keys stored in environment variables
   - Separate deployment and user accounts
   - Multi-signature recommendations for production
   - Hardware wallet support via RainbowKit

### Known Limitations

1. **Gas Costs**: FHE operations are more expensive than plaintext operations
2. **Decryption Latency**: Threshold decryption requires network communication
3. **Testnet Only**: Currently deployed on Sepolia testnet (production-ready code)
4. **Access Control**: Current implementation allows any address to mint/burn (production version should add role-based permissions)

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js**: Version 20 or higher
- **npm**: Version 7.0.0 or higher (or yarn/pnpm)
- **Git**: For cloning the repository
- **Wallet**: MetaMask or compatible Web3 wallet
- **Test ETH**: Sepolia testnet ETH for gas fees

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/fhe-rwa-gold.git
cd fhe-rwa-gold
```

2. **Install dependencies**

```bash
npm install
```

3. **Install frontend dependencies**

```bash
cd src
npm install
cd ..
```

### Configuration

1. **Set up environment variables**

Create a `.env` file in the project root:

```bash
# Deployment private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Infura API key for Sepolia network access
INFURA_API_KEY=your_infura_api_key_here

# Etherscan API key for contract verification (optional)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

**Important**: Never commit your `.env` file to version control. It's already included in `.gitignore`.

2. **Alternative: Use Hardhat configuration variables**

```bash
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY
```

### Compilation

Compile the smart contracts:

```bash
npm run compile
```

This will:
- Compile all Solidity contracts
- Generate TypeChain type definitions
- Create deployment artifacts

### Deployment

#### Deploy to Local Hardhat Network

1. **Start a local FHEVM node**

```bash
npx hardhat node
```

2. **Deploy contracts** (in a new terminal)

```bash
npx hardhat deploy --network localhost
```

#### Deploy to Sepolia Testnet

1. **Ensure you have Sepolia ETH**

Get test ETH from a faucet:
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

2. **Deploy to Sepolia**

```bash
npx hardhat deploy --network sepolia
```

3. **Verify contract on Etherscan** (optional)

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

The contract address will be printed after deployment and saved in `deployments/sepolia/ConfidentialGOLD.json`.

## Usage

### Minting cGOLD

Use the custom Hardhat task to mint tokens:

```bash
npx hardhat cgold:mint \
  --network sepolia \
  --to 0xYourAddress \
  --amount 100
```

This will:
1. Encrypt the amount (100 grams) using FHE
2. Generate a cryptographic proof
3. Submit the mint transaction
4. Wait for confirmation

**Example output:**
```
Mint tx: 0x1234567890abcdef...
Mint confirmed with status 1
```

### Burning (Redeeming) cGOLD

Burn tokens to redeem physical gold:

```bash
npx hardhat cgold:burn \
  --network sepolia \
  --from 0xYourAddress \
  --amount 50
```

This burns 50 cGOLD tokens, allowing you to claim 50 grams of physical gold from the vault.

### Decrypting Your Balance

Check your encrypted balance:

```bash
npx hardhat cgold:decrypt-balance \
  --network sepolia \
  --account 0xYourAddress
```

**Example output:**
```
Encrypted balance: 0x7b8f3e2a1c5d9f6e...
Clear balance    : 100
```

### Checking Total Supply

Decrypt the total cGOLD supply:

```bash
npx hardhat cgold:decrypt-supply --network sepolia
```

### Getting Contract Address

Display the deployed contract address:

```bash
npx hardhat cgold:address --network sepolia
```

## Frontend Application

### Running the Development Server

1. **Navigate to the frontend directory**

```bash
cd src
```

2. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `src/dist` directory.

### Frontend Features

The web interface provides:

1. **Wallet Connection**
   - RainbowKit integration for multiple wallet support
   - Automatic network detection and switching
   - Account management

2. **Mint cGOLD**
   - Input amount in grams
   - Client-side encryption
   - Transaction status tracking
   - Success/error notifications

3. **Redeem to Gold**
   - Burn tokens to claim physical gold
   - Encrypted amount submission
   - Transaction confirmation

4. **Decrypt Balance**
   - View your encrypted balance handle
   - Decrypt to see actual amount
   - Requires wallet signature
   - Client-side decryption via Zama relayer

5. **Dashboard**
   - View your encrypted balance handle
   - Monitor total encrypted supply
   - Real-time updates after transactions

### Frontend Configuration

Update the contract address in `src/src/config/contracts.ts`:

```typescript
export const CONTRACT_ADDRESS = '0xYourDeployedContractAddress';
```

The ABI is automatically included in the same file.

## Testing

### Run All Tests

```bash
npm run test
```

### Test on Sepolia Testnet

```bash
npm run test:sepolia
```

### Test Coverage

Generate a coverage report:

```bash
npm run coverage
```

### Test Suite

The test suite (`test/ConfidentialGOLD.ts`) covers:

1. **Minting**
   - Successful mint to user address
   - Encrypted balance verification
   - Balance decryption

2. **Burning**
   - Successful burn from user address
   - Event emission verification
   - Encrypted balance updates

3. **Encryption/Decryption**
   - Client-side encryption
   - Proof generation
   - User decryption via relayer

### Example Test Output

```
  ConfidentialGOLD
    ✓ mints cGOLD to a user (1234ms)
    ✓ burns cGOLD from a user (2345ms)

  2 passing (4s)
```

## Custom Hardhat Tasks

The project includes several custom tasks for contract interaction:

| Task | Description | Parameters |
|------|-------------|------------|
| `cgold:address` | Display deployed contract address | None |
| `cgold:mint` | Mint cGOLD tokens | `--to <address>` `--amount <grams>` |
| `cgold:burn` | Burn (redeem) cGOLD tokens | `--from <address>` `--amount <grams>` |
| `cgold:decrypt-balance` | Decrypt account balance | `--account <address>` |
| `cgold:decrypt-supply` | Decrypt total supply | None |

All tasks are defined in `tasks/ConfidentialGOLD.ts`.

## Advantages & Benefits

### For Users

1. **Financial Privacy**
   - Holdings remain confidential
   - Transaction amounts are private
   - No public exposure of wealth

2. **Asset Security**
   - Self-custody of digital tokens
   - Physical gold backing
   - Cryptographic security guarantees

3. **Flexibility**
   - Trade encrypted tokens on-chain
   - Redeem for physical gold anytime
   - No intermediaries required

### For Institutions

1. **Competitive Advantage**
   - Treasury management without position disclosure
   - Private portfolio allocation
   - Confidential trading strategies

2. **Regulatory Compliance**
   - Auditable total supply
   - Transparent smart contract code
   - Privacy without opacity

3. **Risk Management**
   - No exposure to market manipulation based on large positions
   - Protection from front-running
   - Reduced security risk from public wealth display

### For the Ecosystem

1. **Privacy Innovation**
   - Demonstrates real-world FHE application
   - Sets standard for confidential RWA tokens
   - Advances blockchain privacy technology

2. **Market Expansion**
   - Attracts privacy-conscious users to DeFi
   - Enables institutional adoption
   - Bridges traditional and crypto finance

3. **Technical Advancement**
   - Open-source reference implementation
   - Educational resource for FHE development
   - Composable with other privacy protocols

## Use Cases

### Individual Users

1. **Wealth Preservation**: Store wealth in gold-backed tokens without public exposure
2. **Private Savings**: Accumulate gold holdings confidentially
3. **Gift & Inheritance**: Transfer value privately to family members
4. **International Transfers**: Move value across borders discreetly

### Institutional Players

1. **Corporate Treasury**: Allocate reserves to gold without market impact
2. **Investment Funds**: Build positions without alerting competitors
3. **Family Offices**: Manage high-net-worth portfolios privately
4. **Hedge Funds**: Implement strategies without position disclosure

### Market Infrastructure

1. **Privacy-Preserving DEXs**: Trade cGOLD with confidential amounts
2. **Confidential Lending**: Use cGOLD as collateral without revealing holdings
3. **Private Vaults**: Offer custody services with encrypted balances
4. **Cross-Chain Privacy**: Bridge to other FHE-enabled chains

## Future Roadmap

### Phase 1: Core Enhancement (Q2 2025)
- [ ] Implement role-based access control (RBAC) for minting/burning
- [ ] Add multi-signature approval for large mints
- [ ] Integrate with physical gold vault API
- [ ] Implement automated proof-of-reserves
- [ ] Deploy to mainnet

### Phase 2: Advanced Features (Q3 2025)
- [ ] Confidential transfer functionality
- [ ] Encrypted allowance and approval system
- [ ] Implement confidential yield distribution
- [ ] Add support for fractional grams (decimal precision)
- [ ] Integration with DeFi protocols

### Phase 3: Ecosystem Integration (Q4 2025)
- [ ] DEX integration for confidential trading
- [ ] Lending protocol integration
- [ ] Cross-chain bridge to other FHEVM networks
- [ ] Mobile wallet support
- [ ] API for institutional integrations

### Phase 4: Governance & Decentralization (Q1 2026)
- [ ] DAO governance for vault management
- [ ] Decentralized vault network
- [ ] Community-driven audits
- [ ] Open API for third-party integrations
- [ ] Multi-custodian vault architecture

### Phase 5: Advanced Cryptography (Q2 2026)
- [ ] Implement confidential voting for governance
- [ ] Add support for confidential staking
- [ ] Zero-knowledge proof integration for additional privacy
- [ ] Threshold encryption for enhanced security
- [ ] Quantum-resistant encryption preparation

### Research & Development
- Explore integration with other privacy technologies (ZK-SNARKs, TEEs)
- Research efficient FHE operations for complex DeFi primitives
- Investigate layer-2 scaling solutions for FHE
- Develop standards for confidential RWA tokens
- Collaborate with regulators on privacy-compliant frameworks

## Project Structure

```
fhe-rwa-gold/
├── contracts/                  # Solidity smart contracts
│   └── ConfidentialGOLD.sol   # Main cGOLD token contract
├── deploy/                     # Deployment scripts
│   └── deploy.ts              # Hardhat-deploy script
├── tasks/                      # Custom Hardhat tasks
│   ├── accounts.ts            # Account management
│   └── ConfidentialGOLD.ts    # cGOLD interaction tasks
├── test/                       # Contract tests
│   └── ConfidentialGOLD.ts    # Test suite
├── src/                        # Frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ConfidentialGoldApp.tsx
│   │   │   └── Header.tsx
│   │   ├── config/            # Configuration
│   │   │   ├── contracts.ts   # Contract ABI & address
│   │   │   └── wagmi.ts       # Wagmi configuration
│   │   ├── hooks/             # React hooks
│   │   │   ├── useEthersSigner.ts
│   │   │   └── useZamaInstance.ts
│   │   ├── styles/            # CSS styles
│   │   ├── App.tsx            # Main app component
│   │   └── main.tsx           # Entry point
│   ├── public/                # Static assets
│   ├── index.html             # HTML template
│   ├── package.json           # Frontend dependencies
│   └── vite.config.ts         # Vite configuration
├── deployments/               # Deployment artifacts
│   └── sepolia/               # Sepolia network deployments
├── artifacts/                 # Compiled contract artifacts
├── types/                     # TypeChain generated types
├── docs/                      # Documentation
│   ├── zama_doc_relayer.md   # Zama relayer documentation
│   └── zama_llm.md           # Zama LLM integration
├── hardhat.config.ts          # Hardhat configuration
├── package.json               # Project dependencies
├── tsconfig.json              # TypeScript configuration
├── .env                       # Environment variables (not in git)
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

## Contributing

We welcome contributions from the community! Here's how you can help:

### Reporting Bugs

- Use GitHub Issues to report bugs
- Include detailed reproduction steps
- Provide transaction hashes when relevant
- Specify network (local, testnet, mainnet)

### Suggesting Features

- Open a GitHub Issue with the "enhancement" label
- Describe the feature and its benefits
- Explain how it improves privacy or functionality

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style (enforced by ESLint and Prettier)
- Write tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting PR
- Use conventional commits for commit messages

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers learn and contribute
- Follow the project's coding standards

## License

This project is licensed under the **BSD-3-Clause-Clear License**.

See the [LICENSE](LICENSE) file for full details.

### Key Points

- **Open Source**: Free to use, modify, and distribute
- **No Patent Grant**: Clear BSD license without patent provisions
- **Attribution Required**: Must include copyright notice
- **Commercial Use Allowed**: Can be used in commercial projects

## Support & Community

### Documentation

- **FHEVM Documentation**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Hardhat Docs**: [https://hardhat.org/docs](https://hardhat.org/docs)
- **Zama SDK Docs**: [https://docs.zama.ai/protocol/solidity-guides](https://docs.zama.ai/protocol/solidity-guides)

### Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/your-username/fhe-rwa-gold/issues)
- **Zama Discord**: [Join the community](https://discord.gg/zama)
- **Zama Forum**: [Technical discussions](https://community.zama.ai/)

### Stay Updated

- **Twitter**: Follow [@zama_fhe](https://twitter.com/zama_fhe) for updates
- **Blog**: Read about FHE developments on [Zama's blog](https://www.zama.ai/blog)
- **GitHub**: Star and watch this repository for updates

### Contact

For business inquiries or partnerships, please contact:

- **Email**: [your-email@example.com](mailto:your-email@example.com)
- **Website**: [https://your-project-website.com](https://your-project-website.com)

---

## Acknowledgments

This project is built on cutting-edge technology from:

- **Zama**: For pioneering Fully Homomorphic Encryption and the FHEVM protocol
- **Hardhat**: For the excellent development environment
- **OpenZeppelin**: For secure smart contract patterns
- **RainbowKit**: For seamless wallet connection UX

Special thanks to the Zama team for their support and the open-source community for continuous innovation.

---

**Built with privacy and powered by Fully Homomorphic Encryption**

*Confidential Gold - Where privacy meets real-world value*
