import { useState, useEffect } from "react";
import { ethers } from "ethers";

// ABI for reading badge data from the contract
const BADGE_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function badgeCause(uint256 tokenId) view returns (string)",
  "event BadgeMinted(address indexed to, uint256 tokenId, string cause)",
];

const CAUSE_EMOJIS = {
  trees: "🌳",
  water: "💧",
  education: "📚",
  food: "🍱",
};

export default function BadgeGallery({ signer, userAddress, newDonationMade }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);

  // fetch badges whenever user connects or makes a new donation
  useEffect(() => {
    if (userAddress) fetchBadges();
  }, [userAddress, newDonationMade]);

  // also listen for real-time BadgeMinted events so gallery updates automatically
  useEffect(() => {
    if (!signer || !userAddress) return;

    const provider = signer.provider;
    const contract = new ethers.Contract(
      import.meta.env.VITE_BADGE_ADDRESS,
      BADGE_ABI,
      provider
    );

    // when agent mints a badge for THIS user, refresh the gallery
    const filter = contract.filters.BadgeMinted(userAddress);
    contract.on(filter, () => {
      console.log("🎖️ Badge minted event detected! Refreshing gallery...");
      setTimeout(fetchBadges, 2000); // small delay to let chain confirm
    });

    return () => contract.removeAllListeners(); // cleanup on unmount
  }, [signer, userAddress]);

  async function fetchBadges() {
    if (!signer || !userAddress) return;
    setLoading(true);

    try {
      const provider = signer.provider;
      const contract = new ethers.Contract(
        import.meta.env.VITE_BADGE_ADDRESS,
        BADGE_ABI,
        provider
      );

      // how many badges does this address own?
      const balance = await contract.balanceOf(userAddress);
      const count = Number(balance);

      const badgeList = [];
      for (let i = 0; i < count; i++) {
        // get each token ID owned by user
        const tokenId = await contract.tokenOfOwnerByIndex(userAddress, i);
        // get what cause that badge was for
        const cause = await contract.badgeCause(tokenId);
        badgeList.push({ tokenId: tokenId.toString(), cause });
      }

      setBadges(badgeList);
    } catch (err) {
      console.error("Failed to fetch badges:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="badge-gallery">
      <h2>Your Badges</h2>
      <p className="subtitle">Auto-minted by agent when you donate</p>

      {loading && <p className="loading">Checking your badges...</p>}

      {!loading && badges.length === 0 && (
        <div className="empty-state">
          <p>No badges yet. Make a donation to earn your first one! 🎖️</p>
        </div>
      )}

      <div className="badges-grid">
        {badges.map((badge) => (
          <div key={badge.tokenId} className="badge-card">
            <div className="badge-emoji">
              {CAUSE_EMOJIS[badge.cause] || "🏅"}
            </div>
            <div className="badge-info">
              <div className="badge-cause">{badge.cause}</div>
              <div className="badge-id">Badge #{badge.tokenId}</div>
            </div>
          </div>
        ))}
      </div>

      {badges.length > 0 && (
        <button className="btn-secondary" onClick={fetchBadges}>
          Refresh
        </button>
      )}
    </div>
  );
}
