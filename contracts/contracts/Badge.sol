// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// OpenZeppelin gives us the ERC-721 NFT standard for free
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Badge is ERC721, Ownable {
    // counts how many badges have been minted
    uint256 private _tokenIdCounter;

    // only this address (our agent wallet) is allowed to mint badges
    address public minterAgent;

    // stores what cause each badge was earned for
    mapping(uint256 => string) public badgeCause;

    // frontend listens for this to show the new badge
    event BadgeMinted(address indexed to, uint256 tokenId, string cause);

    constructor(address initialOwner)
        ERC721("AutoReward Badge", "ARB")
        Ownable(initialOwner)
    {}

    // owner calls this once after deploying, to set the agent wallet
    function setMinterAgent(address _agent) external onlyOwner {
        minterAgent = _agent;
    }

    // only the agent can call this — mints badge to the donor
    function mint(address to, string memory cause) external returns (uint256) {
        require(msg.sender == minterAgent, "Only agent can mint");
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        _mint(to, newTokenId);
        badgeCause[newTokenId] = cause; // remember what cause this badge is for
        emit BadgeMinted(to, newTokenId, cause);
        return newTokenId;
    }

    // returns how many badges exist total
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
}
