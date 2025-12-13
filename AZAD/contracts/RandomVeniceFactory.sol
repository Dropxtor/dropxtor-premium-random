// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { RandomVenice721 } from "./RandomVenice721.sol";

/**
 * Factory that deploys a fresh ERC-721 contract *per mint* and mints one token.
 * This matches the "deploy automatically at each mint" requirement.
 *
 * WARNING: This is a minimal demo. For production:
 * - Use OpenZeppelin ERC721 implementation
 * - Restrict minting (only factory / onlyOwner)
 * - Consider CREATE2 / minimal proxies (ERC-1167) for gas efficiency
 */
contract RandomVeniceFactory {
    event DeployedAndMinted(address indexed to, address indexed nft, uint256 indexed tokenId, string tokenURI);

    string public constant DEFAULT_NAME = "RandomVenice";
    string public constant DEFAULT_SYMBOL = "RVN";

    function deployAndMint(address to, string memory tokenURI) external returns (address nft, uint256 tokenId) {
        RandomVenice721 c = new RandomVenice721(DEFAULT_NAME, DEFAULT_SYMBOL);
        tokenId = c.mintTo(to, tokenURI);
        nft = address(c);
        emit DeployedAndMinted(to, nft, tokenId, tokenURI);
    }
}
