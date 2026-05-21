// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DonationVault {
    // tracks how many times each wallet has donated
    mapping(address => uint256) public donationCount;

    // stores every donation ever made
    struct Donation {
        address donor;
        string cause;
        uint256 timestamp;
    }

    Donation[] public donations;

    // THE MOST IMPORTANT LINE — agent listens for this event
    // when it fires, agent auto-mints a badge to the donor
    event DonationReceived(
        address indexed donor,
        string cause,
        uint256 timestamp
    );

    // user calls this function (gaslessly via UGF — no ETH needed)
    function donate(string memory cause) external {
        donationCount[msg.sender]++;

        // save the donation record on-chain forever
        donations.push(
            Donation({
                donor: msg.sender,
                cause: cause,
                timestamp: block.timestamp
            })
        );

        // emit event — this is what the agent watches for
        emit DonationReceived(msg.sender, cause, block.timestamp);
    }

    // how many total donations have been made
    function getTotalDonations() external view returns (uint256) {
        return donations.length;
    }

    // check if an address has donated before
    function hasDonated(address user) external view returns (bool) {
        return donationCount[user] > 0;
    }
}
