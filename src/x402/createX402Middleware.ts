import type { RequestHandler } from "express";
import { paymentMiddleware } from "x402-express";
import { getEnv } from "../config.js";

export function createX402Middleware(): RequestHandler {
  const env = getEnv();

  // The coinbase/x402 README shows:
  //   paymentMiddleware("0xYourAddress", { "/your-endpoint": "$0.03" })
  // We keep pricing configurable.
  const price = `$${env.X402_PRICE_USD}`;

  const config: Record<string, string> = {
    "/api/premium-random": price
  };

  // NOTE: keep the middleware call minimal for compatibility with x402-express typings.
  // If you need a custom facilitator later, we can re-add it with the right option shape
  // for your exact x402-express version.
  return paymentMiddleware(env.X402_PAY_TO_ADDRESS, config);
}
