import type { Router } from "express";
import express from "express";
import { getEnv } from "../config.js";
import { getRequestBaseUrl } from "../http/baseUrl.js";

export function createNftRouter(): Router {
  const env = getEnv();
  const r = express.Router();

  // Basic ERC-721 metadata endpoint.
  r.get("/metadata", (req, res) => {
    const seed = typeof req.query.seed === "string" && req.query.seed.length > 0 ? req.query.seed : "";
    const baseUrl = getRequestBaseUrl(req, env.PUBLIC_BASE_URL);

    const imageUrl = new URL("/frames/image", baseUrl);
    if (seed) imageUrl.searchParams.set("seed", seed);

    res.status(200).json({
      name: seed ? `RandomVenice #${seed.slice(0, 8)}` : "RandomVenice",
      description: "Random Venice-generated image minted from a Farcaster Frame tx action.",
      image: imageUrl.toString()
    });
  });

  return r;
}
