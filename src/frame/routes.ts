import type { Router } from "express";
import express from "express";
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { encodeAbiParameters, encodeFunctionData, keccak256, stringToHex } from "viem";

import { getEnv } from "../config.js";
import { getRequestBaseUrl } from "../http/baseUrl.js";

import { randomSeed } from "./randomImage.js";
import { renderFrameHtml } from "./renderFrameHtml.js";
import { placeholderPngBuffer } from "./placeholderPng.js";
import { mintToAbi } from "./mintAbi.js";
import { deployAndMintAbi } from "./factoryAbi.js";
import { getOrGenerateVenicePng } from "../venice/generateImage.js";
import { MINT_ONCE_721_BYTECODE } from "../bytecode/mintOnce721Bytecode.js";

const BASE_CREATE2_DEPLOYER_ADDRESS = "0x4e59b44847b379578588920ca78fbf26c0b4956c" as const;

const create2DeployerAbi = [
  {
    type: "function",
    name: "deploy",
    stateMutability: "nonpayable",
    inputs: [
      { name: "code", type: "bytes" },
      { name: "salt", type: "bytes32" }
    ],
    outputs: [{ name: "addr", type: "address" }]
  }
] as const;

type FrameState = {
  seed: string;
};

function buildFrame(seed: string, baseUrl: string) {
  const imageUrl = new URL("/frames/image", baseUrl);
  imageUrl.searchParams.set("seed", seed);

  const postUrl = new URL("/frames/action", baseUrl);

  const txTarget = new URL("/frames/tx", baseUrl);
  txTarget.searchParams.set("seed", seed);

  const txCallback = new URL("/frames/tx/callback", baseUrl);
  txCallback.searchParams.set("seed", seed);

  return renderFrameHtml({
    title: "Random Frame",
    imageUrl: imageUrl.toString(),
    postUrl: postUrl.toString(),
    buttons: [
      { label: "Random", action: "post" },
      { label: "Mint", action: "tx", target: txTarget.toString(), postUrl: txCallback.toString() },
      {
        label: "Premium (x402)",
        action: "post_redirect",
        target: new URL(`/miniapp?seed=${encodeURIComponent(seed)}`, baseUrl).toString()
      }
    ],
    state: { seed } satisfies FrameState
  });
}

export function createFrameRouter(): Router {
  const env = getEnv();

  const client = new NeynarAPIClient(
    new Configuration({
      apiKey: env.NEYNAR_API_KEY
    })
  );

  const r = express.Router();

  r.get("/", (req, res) => {
    const baseUrl = getRequestBaseUrl(req, env.PUBLIC_BASE_URL);
    const seed = typeof req.query.seed === "string" && req.query.seed.length > 0 ? req.query.seed : randomSeed();

    res.status(200).type("html").send(buildFrame(seed, baseUrl));
  });

  // Frames spec: images MUST be png/jpg/gif (svg is not allowed).
  r.get("/image", async (req, res) => {
    const seed = typeof req.query.seed === "string" && req.query.seed.length > 0 ? req.query.seed : randomSeed();

    try {
      const prompt = `abstract colorful artwork, random seed ${seed}, high contrast, minimal, no text`;
      const png = await getOrGenerateVenicePng({
        seed,
        prompt,
        width: 955,
        height: 500,
        model: "z-image-turbo"
      });

      res.status(200).type("image/png").send(png);
    } catch (e) {
      // If Venice fails (rate limit, missing key), fall back to a tiny placeholder.
      res.status(200).type("image/png").send(placeholderPngBuffer());
    }
  });

  // Action endpoint for "post" buttons.
  r.post("/action", express.json({ limit: "1mb" }), async (req, res) => {
    const baseUrl = getRequestBaseUrl(req, env.PUBLIC_BASE_URL);
    const body: any = req.body;

    const messageBytesInHex = body?.trustedData?.messageBytes;
    if (typeof messageBytesInHex !== "string" || messageBytesInHex.length < 10) {
      res.status(400).json({ error: "Missing trustedData.messageBytes" });
      return;
    }

    const validation = await client.validateFrameAction({ messageBytesInHex });
    if (!validation.valid) {
      res.status(401).json({ error: "Invalid frame action" });
      return;
    }

    // New random seed on each interaction.
    const seed = randomSeed();
    res.status(200).type("html").send(buildFrame(seed, baseUrl));
  });

  // Tx action target (spec: POST).
  r.post("/tx", express.json({ limit: "1mb" }), async (req, res) => {
    const baseUrl = getRequestBaseUrl(req, env.PUBLIC_BASE_URL);
    const seed = typeof req.query.seed === "string" && req.query.seed.length > 0 ? req.query.seed : randomSeed();

    // mint target depends on the chosen strategy
    const to =
      env.MINT_MODE === "factory"
        ? env.MINT_FACTORY_ADDRESS
        : env.MINT_MODE === "contract"
          ? env.MINT_CONTRACT_ADDRESS
          : BASE_CREATE2_DEPLOYER_ADDRESS;

    const body: any = req.body;
    const messageBytesInHex = body?.trustedData?.messageBytes;
    if (typeof messageBytesInHex !== "string" || messageBytesInHex.length < 10) {
      res.status(400).json({ error: "Missing trustedData.messageBytes" });
      return;
    }

    const validation = await client.validateFrameAction({ messageBytesInHex });
    if (!validation.valid) {
      res.status(401).json({ error: "Invalid tx action" });
      return;
    }

    // Wallet address is present in the signature packet (untrustedData) for tx actions.
    // We still validate messageBytes with Neynar.
    const address = body?.untrustedData?.address;
    if (typeof address !== "string" || !address.startsWith("0x") || address.length !== 42) {
      res.status(400).json({ error: "Missing/invalid untrustedData.address" });
      return;
    }

    const tokenUri = new URL("/nft/metadata", baseUrl);
    tokenUri.searchParams.set("seed", seed);

    if (env.MINT_MODE === "create2") {
      if (!MINT_ONCE_721_BYTECODE || MINT_ONCE_721_BYTECODE.length <= 2) {
        res.status(500).json({
          error: "MintOnce721 bytecode missing",
          hint: "Run npm run build (it runs scripts/compile-contracts.cjs)"
        });
        return;
      }

      const constructorArgs = encodeAbiParameters(
        [{ type: "address" }, { type: "string" }],
        [address as `0x${string}`, tokenUri.toString()]
      );

      const creationCode = (MINT_ONCE_721_BYTECODE + constructorArgs.slice(2)) as `0x${string}`;

      const salt = keccak256(stringToHex(`${address}:${seed}`));

      const data = encodeFunctionData({
        abi: create2DeployerAbi,
        functionName: "deploy",
        args: [creationCode, salt]
      });

      res.status(200).json({
        chainId: `eip155:${env.BASE_CHAIN_ID}`,
        method: "eth_sendTransaction",
        params: {
          abi: create2DeployerAbi,
          to,
          data,
          value: "0"
        }
      });
      return;
    }

    if (!to || to.length === 0) {
      res.status(501).json({
        error: "Mint target is not configured",
        details: {
          mintMode: env.MINT_MODE,
          requiredEnv: env.MINT_MODE === "factory" ? "MINT_FACTORY_ADDRESS" : "MINT_CONTRACT_ADDRESS"
        }
      });
      return;
    }

    if (env.MINT_MODE === "factory") {
      const data = encodeFunctionData({
        abi: deployAndMintAbi,
        functionName: "deployAndMint",
        args: [address as `0x${string}`, tokenUri.toString()]
      });

      res.status(200).json({
        chainId: `eip155:${env.BASE_CHAIN_ID}`,
        method: "eth_sendTransaction",
        params: {
          abi: deployAndMintAbi,
          to,
          data,
          value: "0"
        }
      });
      return;
    }

    const data = encodeFunctionData({
      abi: mintToAbi,
      functionName: "mintTo",
      args: [address as `0x${string}`, tokenUri.toString()]
    });

    res.status(200).json({
      chainId: `eip155:${env.BASE_CHAIN_ID}`,
      method: "eth_sendTransaction",
      params: {
        abi: mintToAbi,
        to,
        data,
        value: "0"
      }
    });
  });

  // Tx callback (spec: POST) - show a confirmation frame.
  r.post("/tx/callback", express.json({ limit: "1mb" }), async (req, res) => {
    const baseUrl = getRequestBaseUrl(req, env.PUBLIC_BASE_URL);
    const seed = typeof req.query.seed === "string" && req.query.seed.length > 0 ? req.query.seed : randomSeed();

    const body: any = req.body;
    const messageBytesInHex = body?.trustedData?.messageBytes;
    if (typeof messageBytesInHex !== "string" || messageBytesInHex.length < 10) {
      res.status(400).json({ error: "Missing trustedData.messageBytes" });
      return;
    }

    const validation = await client.validateFrameAction({ messageBytesInHex });
    if (!validation.valid) {
      res.status(401).json({ error: "Invalid tx callback" });
      return;
    }

    // Show a new frame (could also show tx hash if provided by client).
    res.status(200).type("html").send(buildFrame(seed, baseUrl));
  });

  return r;
}

