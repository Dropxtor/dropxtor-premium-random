export const deployAndMintAbi = [
  {
    type: "function",
    name: "deployAndMint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenURI", type: "string" }
    ],
    outputs: [
      { name: "nft", type: "address" },
      { name: "tokenId", type: "uint256" }
    ]
  }
] as const;
