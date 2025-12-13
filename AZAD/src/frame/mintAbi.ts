export const mintToAbi = [
  {
    type: "function",
    name: "mintTo",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "uri", type: "string" }
    ],
    outputs: [{ name: "tokenId", type: "uint256" }]
  }
] as const;
