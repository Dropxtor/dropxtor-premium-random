import express from "express";
import { createFrameRouter } from "./frame/routes.js";
import { createMiniappRouter } from "./miniapp/routes.js";
import { createApiRouter } from "./api/routes.js";
import { createNftRouter } from "./nft/routes.js";
import { createX402Middleware } from "./x402/createX402Middleware.js";

export function createApp() {
  const app = express();

  // x402 paywall for paid endpoints
  app.use(createX402Middleware());

  // Public routes
  app.use("/frames", createFrameRouter());
  app.use("/miniapp", createMiniappRouter());
  app.use("/api", createApiRouter());
  app.use("/nft", createNftRouter());

  app.get("/", (_req, res) => {
    res.status(302).setHeader("Location", "/frames").send("Redirecting");
  });

  return app;
}
