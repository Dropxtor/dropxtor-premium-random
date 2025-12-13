// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Minimal ERC-721 skeleton meant for demo/dev.
 * NOTE: This file is provided as a starting point; you can replace it with OpenZeppelin-based implementation.
 * For production, prefer OpenZeppelin ERC721 + Ownable + safeMint.
 */
contract RandomVenice721 {
    event Mint(address indexed to, uint256 indexed tokenId, string tokenURI);

    string public name;
    string public symbol;

    uint256 public totalSupply;

    mapping(uint256 => address) private _ownerOf;
    mapping(address => uint256) private _balanceOf;
    mapping(uint256 => string) private _tokenURI;

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
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
        return _tokenURI[tokenId];
    }

    // Recommended signature for Frames tx action.
    function mintTo(address to, string memory uri) external returns (uint256 tokenId) {
        require(to != address(0), "ZERO_ADDRESS");

        tokenId = ++totalSupply;
        _ownerOf[tokenId] = to;
        _balanceOf[to] += 1;
        _tokenURI[tokenId] = uri;

        emit Mint(to, tokenId, uri);
    }
}
