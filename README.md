# ⚡ AutoReward Agent

> Donate on-chain. Get a badge. Zero ETH needed.

Users donate to a cause via UGF (no ETH required). An AI agent detects the donation and automatically mints an NFT badge to the donor's wallet — also gaslessly via UGF.

## How It Works

```
User donates (UGF pays gas in Mock USD)
        ↓
DonationVault emits DonationReceived event
        ↓
Agent detects event
        ↓
Agent mints NFT badge to donor (UGF pays gas in Mock USD)
        ↓
Badge appears in donor's wallet 🎖️
```

## Project Structure

```
autoreward-agent/
├── contracts/   → Solidity smart contracts + deployment
├── frontend/    → React app (wallet connect + donation + badge gallery)
└── agent/       → Node.js agent (watches events, mints badges)
```

---

## Setup — Step by Step

### Step 0: Prerequisites

- Node.js 18+
- MetaMask browser extension
- 2 wallets: one for deploying, one for the agent

### Step 1: Get Mock USD (TYI)

Go to: https://universalgasframework.com/faucets

Get TYI Mock USD for BOTH wallets (deployer + agent).

### Step 2: Deploy Contracts

```bash
cd contracts
npm install
cp ../.env.example .env
# fill in DEPLOYER_PRIVATE_KEY in .env

npm run deploy
# copy the output addresses into .env
```

### Step 3: Set Agent as Minter

After deploying, call `setMinterAgent` on the Badge contract with your agent wallet address.
You can do this in Hardhat console or write a quick script.

### Step 4: Start the Agent

```bash
cd agent
npm install
cp ../.env.example .env
# fill in AGENT_PRIVATE_KEY, DONATION_VAULT_ADDRESS, BADGE_ADDRESS

npm start
```

### Step 5: Run the Frontend

```bash
cd frontend
npm install
cp ../.env.example .env
# fill in VITE_DONATION_VAULT_ADDRESS, VITE_BADGE_ADDRESS

npm run dev
# open http://localhost:5173
```

---

## Demo Flow

1. Open frontend → connect MetaMask
2. Pick a cause → click "Donate (No ETH Required)"
3. UGF handles 4 steps: auth → quote → settle → execute
4. Donation confirmed on Base Sepolia
5. Agent detects the event within seconds
6. Agent mints badge to your wallet (also gaslessly)
7. Badge appears in "Your Badges" gallery automatically

**No ETH touched. Ever.**

---

## Tech Stack

| Layer | Tech |
|---|---|
| Blockchain | Base Sepolia (testnet) |
| Gas payment | UGF SDK (`@tychilabs/ugf-testnet-js`) |
| Smart contracts | Solidity + OpenZeppelin |
| Deployment | Hardhat |
| Frontend | React + Vite |
| Agent | Node.js + ethers.js |
