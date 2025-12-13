import type { Router } from "express";
import express from "express";
import { randomSeed } from "../frame/randomImage.js";

export function createApiRouter(): Router {
  const r = express.Router();

  r.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  r.get("/premium-random", (req, res) => {
    const seed = typeof req.query.seed === "string" && req.query.seed.length > 0 ? req.query.seed : randomSeed();

    // In a real app, this could be a paid inference, data call, etc.
    const premium = `premium-${seed}`;

    res.status(200).json({
      seed,
      premium
    });
  });

  return r;
}
