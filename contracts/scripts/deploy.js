const { ethers } = require("hardhat");

async function main() {
  // get the deployer wallet from hardhat config
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with wallet:", deployer.address);

  // ── Deploy DonationVault ──────────────────────────────────────────
  const DonationVault = await ethers.getContractFactory("DonationVault");
  const vault = await DonationVault.deploy();
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("✅ DonationVault deployed to:", vaultAddress);

  // ── Deploy Badge ──────────────────────────────────────────────────
  // deployer becomes the owner — they can later set the agent address
  const Badge = await ethers.getContractFactory("Badge");
  const badge = await Badge.deploy(deployer.address);
  await badge.waitForDeployment();
  const badgeAddress = await badge.getAddress();
  console.log("✅ Badge deployed to:", badgeAddress);

  // ── Print next steps ──────────────────────────────────────────────
  console.log("\n📋 Copy these into your .env files:");
  console.log(`VITE_DONATION_VAULT_ADDRESS=${vaultAddress}`);
  console.log(`BADGE_ADDRESS=${badgeAddress}`);
  console.log("\n⚠️  After deploying, run setMinterAgent:");
  console.log("   badge.setMinterAgent(YOUR_AGENT_WALLET_ADDRESS)");
  console.log("   (Do this from the deployer wallet)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
