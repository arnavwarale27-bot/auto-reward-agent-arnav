import { useState } from "react";
import WalletConnect from "./components/WalletConnect";
import DonationForm from "./components/DonationForm";
import BadgeGallery from "./components/BadgeGallery";
import "./App.css";

export default function App() {
  const [signer, setSigner] = useState(null);       // the connected wallet
  const [userAddress, setUserAddress] = useState(null);
  const [donationCount, setDonationCount] = useState(0); // triggers gallery refresh

  function handleConnected(signer, address) {
    setSigner(signer);
    setUserAddress(address);
  }

  function handleDonated() {
    // increment to trigger useEffect in BadgeGallery
    setDonationCount((prev) => prev + 1);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">⚡ AutoReward</div>
        <p className="tagline">Donate on-chain. Get a badge. Zero ETH needed.</p>
        <WalletConnect onConnected={handleConnected} />
      </header>

      <main className="app-main">
        {!signer ? (
          <div className="hero">
            <h1>Web3 Giving, <span className="highlight">Without the Gas Pain</span></h1>
            <p>
              Connect your wallet and donate to a cause. Our agent automatically
              mints you an NFT badge — all without needing ETH for gas.
            </p>
            <p className="powered-by">Powered by UGF — Universal Gas Framework</p>
          </div>
        ) : (
          <div className="dashboard">
            <div className="left-panel">
              <DonationForm signer={signer} onDonated={handleDonated} />
            </div>
            <div className="right-panel">
              <BadgeGallery
                signer={signer}
                userAddress={userAddress}
                newDonationMade={donationCount}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Running on Base Sepolia Testnet • Gas powered by UGF</p>
      </footer>
    </div>
  );
}
