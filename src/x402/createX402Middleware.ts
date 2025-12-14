import type { RequestHandler } from "express";
import { paymentMiddleware } from "x402-express";
import { getEnv } from "../config.js";

export function createX402Middleware(): RequestHandler {
  const env = getEnv();

  // The coinbase/x402 README shows:
  //   paymentMiddleware("0xYourAddress", { "/your-endpoint": "$0.01" })
  // We keep pricing configurable.
  const price = `$${env.X402_PRICE_USD}`;

  const config: Record<string, string> = {
    "/api/premium-random": price
  };

  // Some deployments may want to set a custom facilitator.
  // NOTE: keep the middleware call minimal for compatibility with x402-express typings.
  // If you need a custom facilitator later, wire it here against the exact x402-express version you're using.
  return paymentMiddleware(env.X402_PAY_TO_ADDRESS, config);
}
