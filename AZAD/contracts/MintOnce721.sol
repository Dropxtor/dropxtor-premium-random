// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * MintOnce721
 *
 * Deployed-per-mint contract: on deployment it mints tokenId=1 to `to` and stores `tokenURI`.
 * This is intentionally minimal to keep deployment bytecode small.
 *
 * NOTE: Minimal ERC-721-ish surface (ownerOf/balanceOf/tokenURI). No transfers.
 */
contract MintOnce721 {
    string public constant name = "MintOnceVenice";
    string public constant symbol = "M1V";

    mapping(uint256 => address) private _ownerOf;
    mapping(address => uint256) private _balanceOf;
    string private _tokenURI;

    constructor(address to, string memory uri) {
        require(to != address(0), "ZERO_ADDRESS");
        _ownerOf[1] = to;
        _balanceOf[to] = 1;
        _tokenURI = uri;
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address o = _ownerOf[tokenId];
        require(o != address(0), "NOT_MINTED");
        return o;
    }

    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "ZERO_ADDRESS");
        return _balanceOf[owner];
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_ownerOf[tokenId] != address(0), "NOT_MINTED");
        return _tokenURI;
    }
}
