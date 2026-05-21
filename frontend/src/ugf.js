import {
  UGFClient,
  BASE_SEPOLIA_CHAIN_ID,
  BASE_SEPOLIA_CHAIN_TYPE,
  TYI_USD_PAYMENT_COIN,
} from "@tychilabs/ugf-testnet-js";

// ─────────────────────────────────────────────────────────────────────
// IMPORTANT GOTCHAS (from official docs):
// 1. tx_object must be JSON.stringify'd — never pass a raw object
// 2. wallet MUST have a provider attached
// 3. do NOT set gasLimit/gasPrice in buildTx — SDK handles it
// ─────────────────────────────────────────────────────────────────────

/**
 * Executes ANY transaction gaslessly via UGF.
 * User pays in TYI Mock USD. UGF pays ETH gas.
 *
 * @param {ethers.Signer} signer - wallet WITH provider attached
 * @param {string} toAddress - contract address to call
 * @param {string} encodedData - ABI-encoded function calldata
 * @returns {string} userTxHash - the confirmed transaction hash
 */
export async function executeGaslessly(signer, toAddress, encodedData) {
  const client = new UGFClient({
    baseUrl: "https://gateway.universalgasframework.com",
  });

  const signerAddress = await signer.getAddress();

  // Step 1 — Authenticate (prove wallet ownership to UGF)
  console.log("🔐 Step 1: Authenticating with UGF...");
  await client.auth.login(signer);

  // Step 2 — Quote (ask UGF: how much TYI will this cost?)
  // CRITICAL: tx_object must be JSON.stringify'd string, not an object
  console.log("💬 Step 2: Getting quote...");
  const quote = await client.quote.get({
    payment_coin: TYI_USD_PAYMENT_COIN,
    payer_address: signerAddress,
    payment_chain: BASE_SEPOLIA_CHAIN_ID,
    payment_chain_type: BASE_SEPOLIA_CHAIN_TYPE,
    tx_object: JSON.stringify({
      from: signerAddress,
      to: toAddress,
      data: encodedData,
      value: "0",
    }),
    dest_chain_id: BASE_SEPOLIA_CHAIN_ID,
    dest_chain_type: BASE_SEPOLIA_CHAIN_TYPE,
  });
  // quote.digest is the session key — ties all 4 steps together
  console.log("✅ Quote received. Cost:", quote.payment_amount, "TYI");

  // Step 3 — Settle (user signs ERC-3009 — no on-chain tx from user)
  // This is NOT a blockchain transaction — just a signature
  console.log("✍️  Step 3: Authorizing TYI payment...");
  await client.payment.x402.execute({ quote, signer });

  // Step 4 — Execute (UGF pays ETH gas, transaction happens on-chain)
  console.log("🚀 Step 4: Executing transaction...");
  const { userTxHash } = await client.chains.evm.sponsorAndExecute(
    quote.digest,
    signer,
    async () => ({
      to: toAddress,
      data: encodedData,
      value: 0n,
      // DO NOT add gasLimit, gasPrice, or type here — SDK sets these
    }),
    {
      maxAttempts: 40,
      intervalMs: 3000,
      onTick: (status, attempt) =>
        console.log(`  Waiting... attempt ${attempt} | status: ${status.status}`),
    }
  );

  console.log("🎉 Done! Tx hash:", userTxHash);
  return userTxHash;
}
